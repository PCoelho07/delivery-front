import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: ({
    product,
    quantity = 1,
    addons = [],
    preferences = [],
    observation = '',
  }) => {
    const addonsTotal = addons.reduce(
      (acc, addon) => acc + (Number(addon.price) || 0),
      0
    )
    const unitPrice = (Number(product.price) || 0) + addonsTotal
    const totalPrice = unitPrice * quantity

    const newItem = {
      cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      product,
      quantity,
      addons,
      preferences,
      observation: observation.trim(),
      unitPrice,
      totalPrice,
    }

    set((state) => ({
      items: [...state.items, newItem],
    }))

    return newItem
  },

  replaceCartWithOrderItems: (orderItems = []) => {
    const cloned = orderItems.map((item, idx) => ({
      ...item,
      cartItemId: `${item.product?.id || idx}-${Date.now()}-${idx}`,
    }))
    set({ items: cloned })
  },

  updateQuantity: (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      get().removeItem(cartItemId)
      return
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: item.unitPrice * newQuantity,
            }
          : item
      ),
    }))
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.cartItemId !== cartItemId),
    }))
  },

  clearCart: () => set({ items: [] }),
}))
