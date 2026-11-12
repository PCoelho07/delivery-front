import { describe, it, expect } from 'vitest'
import { normalizeProduct, normalizeComplementGroup } from '../services/productService.js'

describe('Adaptador de Produtos & Complementos da API Go (productService)', () => {
  it('deve converter centavos (price_cents) da API Go em reais decimais', () => {
    const rawGoProduct = {
      id: 1,
      business_id: 10,
      name: 'Burger Smash',
      description: 'Pão brioche e blend 160g',
      price: 2890, // vindo em centavos da API Go
      image_url: 'https://cdn.exemplo.com/burger.jpg',
      complement_group_ids: [1, 2],
    }

    const normalized = normalizeProduct(rawGoProduct)

    expect(normalized.id).toBe(1)
    expect(normalized.businessId).toBe(10)
    expect(normalized.price).toBe(28.9)
    expect(normalized.priceCents).toBe(2890)
    expect(normalized.imageUrl).toBe('https://cdn.exemplo.com/burger.jpg')
    expect(normalized.complementGroupIds).toEqual([1, 2])
  })

  it('deve manter preços decimais já formatados (retrocompatibilidade com mocks)', () => {
    const mockProduct = {
      id: 2,
      businessId: 10,
      name: 'Batata Frita',
      price: 15.5,
    }

    const normalized = normalizeProduct(mockProduct)

    expect(normalized.price).toBe(15.5)
    expect(normalized.priceCents).toBe(1550)
  })

  it('deve normalizar grupos de complementos e preços dos adicionais (GET /products/{id}/complement-groups)', () => {
    const rawGoComplementGroup = {
      id: 1,
      name: 'Adicionais Especiais',
      description: 'Turbine seu pedido',
      min: 0,
      max: 3,
      complements: [
        { id: 101, name: 'Bacon Crocante', price_cents: 450 },
        { id: 102, name: 'Queijo Cheddar', price_cents: 350 },
        { id: 103, name: 'Molho Verde', price_cents: 0 },
      ],
    }

    const normalized = normalizeComplementGroup(rawGoComplementGroup)

    expect(normalized.id).toBe(1)
    expect(normalized.min).toBe(0)
    expect(normalized.max).toBe(3)
    expect(normalized.complements.length).toBe(3)

    // Verifica conversão dos centavos de cada adicional
    expect(normalized.complements[0].price).toBe(4.5)
    expect(normalized.complements[1].price).toBe(3.5)
    expect(normalized.complements[2].price).toBe(0)
  })
})
