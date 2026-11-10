import { describe, it, expect } from 'vitest'
import {
  SYSTEM_PLANS,
  getPlanById,
  calculateCompanyPlanUsage,
} from '../utils/planRules'

describe('Regras de Planos e Excedentes (planRules)', () => {
  it('deve disponibilizar exatamente os 3 planos oficiais', () => {
    expect(SYSTEM_PLANS).toHaveLength(3)
    expect(SYSTEM_PLANS.map((p) => p.id)).toEqual(['free', 'crescimento', 'escala'])
  })

  it('deve localizar plano por id ou nome com fallback para free', () => {
    expect(getPlanById('free').id).toBe('free')
    expect(getPlanById('crescimento').id).toBe('crescimento')
    expect(getPlanById('escala').id).toBe('escala')
    expect(getPlanById('invalido').id).toBe('free')
  })

  describe('Plano Start (Free)', () => {
    it('deve calcular consumo normal sem alertas', () => {
      const usage = calculateCompanyPlanUsage({
        planId: 'free',
        currentBilling: 1500,
        currentOrdersCount: 40,
        exceededOrdersCount: 0,
      })

      expect(usage.metricType).toBe('currency')
      expect(usage.percentage).toBe(60)
      expect(usage.isWarning).toBe(false)
      expect(usage.isExceeded).toBe(false)
      expect(usage.remainingValue).toBe(1000)
      expect(usage.extraAmount).toBe(0)
      expect(usage.totalAmount).toBe(0)
    })

    it('deve disparar alerta quando faltar R$ 100 ou menos para o teto de R$ 2.500', () => {
      const usage = calculateCompanyPlanUsage({
        planId: 'free',
        currentBilling: 2420,
        currentOrdersCount: 80,
      })

      expect(usage.isWarning).toBe(true)
      expect(usage.isExceeded).toBe(false)
      expect(usage.remainingValue).toBe(80)
      expect(usage.totalAmount).toBe(0)
    })

    it('deve calcular taxa de R$ 1,00 por pedido excedente após bater o teto', () => {
      const usage = calculateCompanyPlanUsage({
        planId: 'free',
        currentBilling: 2650,
        currentOrdersCount: 95,
        exceededOrdersCount: 12,
      })

      expect(usage.isExceeded).toBe(true)
      expect(usage.extraOrders).toBe(12)
      expect(usage.extraAmount).toBe(12.0)
      expect(usage.totalAmount).toBe(12.0) // 0 base + 12 excedente
    })
  })

  describe('Plano Express', () => {
    it('deve disparar alerta quando faltar R$ 100 para R$ 6.000', () => {
      const usage = calculateCompanyPlanUsage({
        planId: 'crescimento',
        currentBilling: 5930,
        currentOrdersCount: 160,
      })

      expect(usage.isWarning).toBe(true)
      expect(usage.isExceeded).toBe(false)
      expect(usage.remainingValue).toBe(70)
      expect(usage.totalAmount).toBe(49.9)
    })

    it('deve cobrar R$ 0,50 por pedido excedente acima de R$ 6.000', () => {
      const usage = calculateCompanyPlanUsage({
        planId: 'crescimento',
        currentBilling: 6400,
        currentOrdersCount: 180,
        exceededOrdersCount: 20,
      })

      expect(usage.isExceeded).toBe(true)
      expect(usage.extraOrders).toBe(20)
      expect(usage.extraAmount).toBe(10.0) // 20 * 0.50
      expect(usage.totalAmount).toBe(59.9) // 49.90 + 10.00
    })
  })

  describe('Plano Turbo (WhatsApp até 600 pedidos)', () => {
    it('deve calcular consumo normal por pedidos', () => {
      const usage = calculateCompanyPlanUsage({
        planId: 'escala',
        currentBilling: 18000,
        currentOrdersCount: 400,
      })

      expect(usage.metricType).toBe('orders')
      expect(usage.limitValue).toBe(600)
      expect(usage.percentage).toBe(67)
      expect(usage.isWarning).toBe(false)
      expect(usage.isExceeded).toBe(false)
      expect(usage.remainingValue).toBe(200)
      expect(usage.totalAmount).toBe(89.9)
    })

    it('deve disparar alerta quando faltar 50 pedidos (a partir de 550 pedidos)', () => {
      const usage = calculateCompanyPlanUsage({
        planId: 'escala',
        currentBilling: 22000,
        currentOrdersCount: 560,
      })

      expect(usage.isWarning).toBe(true)
      expect(usage.isExceeded).toBe(false)
      expect(usage.remainingValue).toBe(40)
      expect(usage.totalAmount).toBe(89.9)
    })

    it('deve cobrar R$ 0,32 por pedido excedente acima de 600 pedidos', () => {
      const usage = calculateCompanyPlanUsage({
        planId: 'escala',
        currentBilling: 35000,
        currentOrdersCount: 650, // 50 pedidos acima
      })

      expect(usage.isExceeded).toBe(true)
      expect(usage.extraOrders).toBe(50)
      expect(usage.extraAmount).toBe(16.0) // 50 * 0.32
      expect(usage.totalAmount).toBe(105.9) // 89.90 + 16.00
    })
  })
})
