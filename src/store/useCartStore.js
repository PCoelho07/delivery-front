import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store de Carrinho com Arquitetura Multi-Tenant Independente por Restaurante (Multi-Cart).
 *
 * Características:
 * - Cada restaurante (identificado pelo seu slug ou id) possui sua própria sacola isolada.
 * - Ao navegar da Loja A para a Loja B:
 *   - A sacola da Loja A é preservada intacta na memória/localStorage.
 *   - A Loja B abre com seu próprio carrinho (se vazio, não exibe barra de sacola).
 * - Ao retornar para a Loja A, todos os lanches adicionados anteriormente reaparecem automaticamente.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      currentStoreSlug: 'brasa-burger',
      // Dicionário de carrinhos indexados por loja: { [slug]: { items: [], appliedCoupon: null } }
      cartsByStore: {},
      items: [],
      appliedCoupon: null,

      /**
       * Alterna o contexto ativo para o restaurante especificado.
       * Salva o carrinho da loja anterior e restaura o carrinho independente da nova loja.
       */
      setStoreSlug: (slug) => {
        if (!slug) return
        const prevSlug = get().currentStoreSlug
        if (prevSlug === slug) return

        // 1. Salva o carrinho da loja anterior no dicionário
        const prevItems = get().items || []
        const prevCoupon = get().appliedCoupon || null
        const updatedCarts = {
          ...get().cartsByStore,
          [prevSlug]: {
            items: prevItems,
            appliedCoupon: prevCoupon,
          },
        }

        // 2. Recupera o carrinho da nova loja (ou inicia vazio)
        const targetCart = updatedCarts[slug] || { items: [], appliedCoupon: null }

        set({
          currentStoreSlug: slug,
          cartsByStore: updatedCarts,
          items: targetCart.items || [],
          appliedCoupon: targetCart.appliedCoupon || null,
        })
      },

      setAppliedCoupon: (coupon) => {
        const slug = get().currentStoreSlug
        set((state) => {
          const updatedCarts = {
            ...state.cartsByStore,
            [slug]: {
              items: state.items,
              appliedCoupon: coupon,
            },
          }
          return {
            appliedCoupon: coupon,
            cartsByStore: updatedCarts,
          }
        })
      },

      removeAppliedCoupon: () => {
        const slug = get().currentStoreSlug
        set((state) => {
          const updatedCarts = {
            ...state.cartsByStore,
            [slug]: {
              items: state.items,
              appliedCoupon: null,
            },
          }
          return {
            appliedCoupon: null,
            cartsByStore: updatedCarts,
          }
        })
      },

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

        const nextItems = [...get().items, newItem]
        const slug = get().currentStoreSlug

        set((state) => ({
          items: nextItems,
          cartsByStore: {
            ...state.cartsByStore,
            [slug]: {
              items: nextItems,
              appliedCoupon: state.appliedCoupon,
            },
          },
        }))

        return newItem
      },

      replaceCartWithOrderItems: (orderItems = []) => {
        const cloned = orderItems.map((item, idx) => ({
          ...item,
          cartItemId: `${item.product?.id || idx}-${Date.now()}-${idx}`,
        }))
        const slug = get().currentStoreSlug

        set((state) => ({
          items: cloned,
          cartsByStore: {
            ...state.cartsByStore,
            [slug]: {
              items: cloned,
              appliedCoupon: state.appliedCoupon,
            },
          },
        }))
      },

      updateQuantity: (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
          get().removeItem(cartItemId)
          return
        }

        const nextItems = get().items.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: item.unitPrice * newQuantity,
              }
            : item
        )
        const slug = get().currentStoreSlug

        set((state) => ({
          items: nextItems,
          cartsByStore: {
            ...state.cartsByStore,
            [slug]: {
              items: nextItems,
              appliedCoupon: state.appliedCoupon,
            },
          },
        }))
      },

      removeItem: (cartItemId) => {
        const nextItems = get().items.filter((i) => i.cartItemId !== cartItemId)
        const slug = get().currentStoreSlug

        set((state) => ({
          items: nextItems,
          cartsByStore: {
            ...state.cartsByStore,
            [slug]: {
              items: nextItems,
              appliedCoupon: state.appliedCoupon,
            },
          },
        }))
      },

      clearCart: () => {
        const slug = get().currentStoreSlug
        set((state) => ({
          items: [],
          appliedCoupon: null,
          cartsByStore: {
            ...state.cartsByStore,
            [slug]: {
              items: [],
              appliedCoupon: null,
            },
          },
        }))
      },
    }),
    {
      name: 'delivery-cart-multi-store-v1',
      partialize: (state) => ({
        currentStoreSlug: state.currentStoreSlug,
        cartsByStore: state.cartsByStore,
        items: state.items,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
)
