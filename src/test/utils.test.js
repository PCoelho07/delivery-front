import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPhoneMask,
  formatCpfMask,
  formatCnpjMask,
  formatBirthdayMask,
} from '../lib/utils'

describe('Utilitários de Formatação e Máscaras (utils.js)', () => {
  describe('formatCurrency', () => {
    it('formata valores numéricos para moeda Real (BRL)', () => {
      const formatted = formatCurrency(34.9)
      // Normaliza espaços inquebráveis do Intl (ex: \u00a0 ou \u202f)
      expect(formatted.replace(/\s/g, ' ')).toBe('R$ 34,90')
    })

    it('retorna string vazia para valores nulos ou indefinidos', () => {
      expect(formatCurrency(null)).toBe('')
      expect(formatCurrency(undefined)).toBe('')
      expect(formatCurrency('')).toBe('')
    })
  })

  describe('formatPhoneMask', () => {
    it('aplica máscara para celular brasileiro com 11 dígitos', () => {
      expect(formatPhoneMask('84998765432')).toBe('(84) 99876-5432')
    })

    it('aplica máscara para telefone fixo com 10 dígitos', () => {
      expect(formatPhoneMask('8433221100')).toBe('(84) 3322-1100')
    })

    it('ignora caracteres não numéricos', () => {
      expect(formatPhoneMask('abc84def99876-5432')).toBe('(84) 99876-5432')
    })
  })

  describe('formatBirthdayMask', () => {
    it('formata dia e mês válidos no padrão DD/MM', () => {
      expect(formatBirthdayMask('1508')).toBe('15/08')
      expect(formatBirthdayMask('0101')).toBe('01/01')
    })

    it('ajusta dias acima de 31 para o limite 31', () => {
      expect(formatBirthdayMask('3508')).toBe('31/08')
    })

    it('ajusta meses acima de 12 para o limite 12', () => {
      expect(formatBirthdayMask('1514')).toBe('15/12')
    })

    it('retorna apenas os dígitos iniciais enquanto o usuário digita', () => {
      expect(formatBirthdayMask('1')).toBe('1')
      expect(formatBirthdayMask('15')).toBe('15')
    })
  })

  describe('formatCpfMask', () => {
    it('formata CPF com 11 dígitos corretamente', () => {
      expect(formatCpfMask('12345678901')).toBe('123.456.789-01')
    })
  })

  describe('formatCnpjMask', () => {
    it('formata CNPJ com 14 dígitos corretamente', () => {
      expect(formatCnpjMask('00000000000100')).toBe('00.000.000/0001-00')
    })
  })
})

