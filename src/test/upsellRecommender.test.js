import { describe, it, assert } from 'vitest'
import { getUpsellRecommendations } from '../utils/upsellRecommender.js'

describe('Algoritmo de Upsell e Cross-sell (upsellRecommender)', () => {
  const mockCategories = [
    { id: 'cat-lanches', name: 'Lanches Artesanais' },
    { id: 'cat-bebidas', name: 'Bebidas & Refrigerantes' },
    { id: 'cat-sobremesas', name: 'Sobremesas Deliciosas' },
    { id: 'cat-porcoes', name: 'Porções & Entradas' },
  ]

  const mockProducts = [
    { id: 1, name: 'X-Burger Clássico', categoryId: 'cat-lanches', price: 28, available: true },
    { id: 2, name: 'X-Bacon Supremo', categoryId: 'cat-lanches', price: 32, available: true },
    { id: 3, name: 'Coca-Cola Lata 350ml', categoryId: 'cat-bebidas', price: 6, available: true, isUpsell: true },
    { id: 4, name: 'Batata Frita Palito', categoryId: 'cat-porcoes', price: 15, available: true, isUpsell: true },
    { id: 5, name: 'Pudim de Leite', categoryId: 'cat-sobremesas', price: 12, available: true, isUpsell: true },
    { id: 6, name: 'Brownie com Sorvete', categoryId: 'cat-sobremesas', price: 18, available: true },
    { id: 7, name: 'Guaraná Lata 350ml', categoryId: 'cat-bebidas', price: 6, available: true },
    { id: 8, name: 'Item Esgotado', categoryId: 'cat-bebidas', price: 5, available: false, isUpsell: true },
  ]

  it('deve priorizar os 3 itens marcados pelo lojista (isUpsell: true)', () => {
    const recs = getUpsellRecommendations({
      allProducts: mockProducts,
      categories: mockCategories,
      cartItems: [{ id: 1, name: 'X-Burger Clássico', quantity: 1 }],
      orders: [],
      maxSuggestions: 3,
    })

    assert.equal(recs.length, 3)
    const recIds = recs.map((r) => r.id)
    assert.ok(recIds.includes(3)) // Coca-Cola
    assert.ok(recIds.includes(4)) // Batata Frita
    assert.ok(recIds.includes(5)) // Pudim
  })

  it('nunca deve sugerir itens indisponíveis ou esgotados', () => {
    const recs = getUpsellRecommendations({
      allProducts: mockProducts,
      categories: mockCategories,
      cartItems: [],
      orders: [],
      maxSuggestions: 5,
    })

    const recIds = recs.map((r) => r.id)
    assert.ok(!recIds.includes(8)) // Item Esgotado
  })

  it('nunca deve sugerir um item que o cliente já adicionou à sacola', () => {
    // Cliente já colocou a Coca-Cola (id 3) no carrinho
    const recs = getUpsellRecommendations({
      allProducts: mockProducts,
      categories: mockCategories,
      cartItems: [{ id: 3, name: 'Coca-Cola Lata 350ml', quantity: 1 }],
      orders: [],
      maxSuggestions: 3,
    })

    const recIds = recs.map((r) => r.id)
    assert.ok(!recIds.includes(3)) // Não pode sugerir o que já está na sacola
    assert.ok(recIds.includes(4)) // Batata
    assert.ok(recIds.includes(5)) // Pudim
  })

  it('deve preencher vagas com categorias de impulso quando o lojista marcar menos de 3', () => {
    // Apenas 1 produto marcado pelo lojista
    const singleUpsellList = mockProducts.map((p) => ({
      ...p,
      isUpsell: p.id === 4, // Apenas batata frita
    }))

    const recs = getUpsellRecommendations({
      allProducts: singleUpsellList,
      categories: mockCategories,
      cartItems: [{ id: 1, name: 'X-Burger Clássico', quantity: 1 }],
      orders: [],
      maxSuggestions: 3,
    })

    assert.equal(recs.length, 3)
    assert.equal(recs[0].id, 4) // Batata (escolha do lojista vem em primeiro)
  })

  it('deve priorizar itens mais vendidos do histórico nos fallbacks automáticos', () => {
    const noUpsellList = mockProducts.map((p) => ({ ...p, isUpsell: false }))
    const mockOrders = [
      { items: [{ id: 7, name: 'Guaraná Lata 350ml', quantity: 5 }] },
      { items: [{ id: 7, name: 'Guaraná Lata 350ml', quantity: 3 }] },
    ]

    const recs = getUpsellRecommendations({
      allProducts: noUpsellList,
      categories: mockCategories,
      cartItems: [{ id: 1, name: 'X-Burger Clássico', quantity: 1 }],
      orders: mockOrders,
      maxSuggestions: 3,
    })

    const recIds = recs.map((r) => r.id)
    // Guaraná teve 8 vendas, logo deve estar entre as sugestões de impulso
    assert.ok(recIds.includes(7))
  })
})
