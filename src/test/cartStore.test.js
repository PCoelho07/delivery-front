import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '../store/useCartStore'

describe('Store do Carrinho e Sacola (useCartStore.js)', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
    useCartStore.getState().setStoreSlug('brasa-burger')
  })

  it('adiciona um produto simples à sacola e calcula o preço corretamente', () => {
    const product = {
      id: 'prod-brasa-1',
      name: 'Brasa da Casa',
      price: 34.9,
    }

    useCartStore.getState().addItem({
      product,
      quantity: 1,
      addons: [],
      preferences: [],
      observation: '',
    })

    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].product.name).toBe('Brasa da Casa')
    expect(items[0].quantity).toBe(1)
    expect(items[0].unitPrice).toBe(34.9)
    expect(items[0].totalPrice).toBe(34.9)
  })

  it('calcula o valor unitário e total somando adicionais (ex: cheddar extra)', () => {
    const product = {
      id: 'prod-brasa-1',
      name: 'Brasa da Casa',
      price: 34.9,
    }
    const addons = [
      { id: 'add-cheddar', name: 'Cheddar extra', price: 4.0 },
      { id: 'add-bacon', name: 'Bacon crocante', price: 6.0 },
    ]

    useCartStore.getState().addItem({
      product,
      quantity: 2,
      addons,
      preferences: [],
      observation: 'Sem cebola',
    })

    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    // Preço unitário: 34.90 + 4.00 + 6.00 = 44.90
    expect(items[0].unitPrice).toBe(44.9)
    // Preço total para 2 unidades: 44.90 * 2 = 89.80
    expect(items[0].totalPrice).toBe(89.8)
    expect(items[0].observation).toBe('Sem cebola')
  })

  it('atualiza a quantidade e recalcula o valor total do item', () => {
    const product = { id: 'prod-coca', name: 'Coca-Cola', price: 6.0 }
    const addedItem = useCartStore.getState().addItem({
      product,
      quantity: 1,
    })

    useCartStore.getState().updateQuantity(addedItem.cartItemId, 3)

    const items = useCartStore.getState().items
    expect(items[0].quantity).toBe(3)
    expect(items[0].totalPrice).toBe(18.0)
  })

  it('remove o item da sacola se a quantidade for atualizada para 0', () => {
    const product = { id: 'prod-coca', name: 'Coca-Cola', price: 6.0 }
    const addedItem = useCartStore.getState().addItem({
      product,
      quantity: 1,
    })

    useCartStore.getState().updateQuantity(addedItem.cartItemId, 0)

    const items = useCartStore.getState().items
    expect(items).toHaveLength(0)
  })

  it('limpa toda a sacola com clearCart', () => {
    useCartStore.getState().addItem({ product: { id: '1', price: 10 }, quantity: 1 })
    useCartStore.getState().addItem({ product: { id: '2', price: 20 }, quantity: 1 })

    expect(useCartStore.getState().items).toHaveLength(2)

    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

