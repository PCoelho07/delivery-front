import { describe, it, expect } from 'vitest'
import { evaluateCoupon } from '../utils/couponCalculator'

describe('Calculadora de Cupons (couponCalculator.js)', () => {
  const mockCartItems = [
    {
      id: 'item-1',
      product: { id: 'prod-1', categoryId: 'cat-burgers' },
      totalPrice: 40.0,
      quantity: 1,
    },
    {
      id: 'item-2',
      product: { id: 'prod-2', categoryId: 'cat-bebidas' },
      totalPrice: 10.0,
      quantity: 1,
    },
  ]

  it('retorna inválido se a sacola estiver vazia', () => {
    const coupon = { code: 'PROMO10', discountPercent: 10, targetType: 'all' }
    const result = evaluateCoupon(coupon, [])
    expect(result.isValid).toBe(false)
    expect(result.isEligible).toBe(false)
    expect(result.discountAmount).toBe(0)
  })

  it('calcula desconto percentual em todo o cardápio (targetType: all)', () => {
    const coupon = { code: 'PROMO10', discountPercent: 10, targetType: 'all' }
    // Total da sacola = 50.0. 10% de 50.0 = 5.0
    const result = evaluateCoupon(coupon, mockCartItems)
    expect(result.isValid).toBe(true)
    expect(result.isEligible).toBe(true)
    expect(result.discountAmount).toBe(5.0)
    expect(result.discountPercent).toBe(10)
  })

  it('aplica desconto apenas nos itens da categoria especificada (targetType: category)', () => {
    const coupon = {
      code: 'BURGER20',
      discountPercent: 20,
      targetType: 'category',
      targetCategoryId: 'cat-burgers',
      targetCategoryName: 'Hambúrgueres',
    }
    // Apenas item-1 é da categoria 'cat-burgers' (R$ 40,00). 20% de 40.0 = 8.0
    const result = evaluateCoupon(coupon, mockCartItems)
    expect(result.isEligible).toBe(true)
    expect(result.discountAmount).toBe(8.0)
    expect(result.eligibleItemsCount).toBe(1)
  })

  it('avalia como não elegível se não houver produtos participantes na sacola', () => {
    const coupon = {
      code: 'SOBREMESA',
      discountPercent: 15,
      targetType: 'category',
      targetCategoryId: 'cat-sobremesas',
    }
    const result = evaluateCoupon(coupon, mockCartItems)
    expect(result.isValid).toBe(true)
    expect(result.isEligible).toBe(false)
    expect(result.discountAmount).toBe(0)
  })
})
