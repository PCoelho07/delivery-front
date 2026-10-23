import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCustomerStore = create(
  persist(
    (set) => ({
      profile: {
        name: '',
        phone: '',
        cpf: '',
      },
      address: {
        street: '',
        number: '',
        neighborhoodId: '',
        complement: '',
      },
      savedAddresses: [],
      orders: [],

      saveProfile: (profileData) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...profileData,
          },
        })),

      clearProfile: () =>
        set({
          profile: { name: '', phone: '', cpf: '' },
        }),

      clearOrders: () =>
        set({
          orders: [],
        }),

      setOrders: (ordersList) =>
        set({
          orders: ordersList,
        }),

      saveAddress: (addressData) =>
        set((state) => {
          const updated = { ...state.address, ...addressData }
          const exists = state.savedAddresses.some(
            (a) =>
              a.street.toLowerCase() === updated.street.toLowerCase() &&
              a.number === updated.number &&
              a.neighborhoodId === updated.neighborhoodId
          )
          const savedAddresses =
            updated.street && updated.neighborhoodId && !exists
              ? [
                  {
                    id: `addr-${Date.now()}`,
                    ...updated,
                  },
                  ...state.savedAddresses,
                ].slice(0, 5)
              : state.savedAddresses

          return {
            address: updated,
            savedAddresses,
          }
        }),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId ? { ...o, status } : o
          ),
        })),

      rateOrder: (orderId, rating) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId ? { ...o, rating } : o
          ),
        })),

      rateOrderItem: (orderId, cartItemId, itemRating) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId
              ? {
                  ...o,
                  items: (o.items || []).map((it) =>
                    it.cartItemId === cartItemId
                      ? { ...it, rating: itemRating }
                      : it
                  ),
                }
              : o
          ),
        })),
    }),
    {
      name: 'delivery-customer-cache-v1',
    }
  )
)
