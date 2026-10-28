import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCustomerStore = create(
  persist(
    (set) => ({
      profile: {
        name: '',
        phone: '',
        cpf: '',
        birthday: '',
      },
      address: {
        street: '',
        number: '',
        neighborhoodId: '',
        complement: '',
      },
      savedAddresses: [],
      orders: [],
      reviews: [],

      saveProfile: (profileData) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...profileData,
          },
        })),

      clearProfile: () =>
        set({
          profile: { name: '', phone: '', cpf: '', birthday: '' },
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

      updateOrderStatus: (orderId, status, extraData = {}) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId ? { ...o, status, ...extraData } : o
          ),
        })),

      rateOrder: (orderId, ratingOrReview) =>
        set((state) => {
          const isDetailed =
            typeof ratingOrReview === 'object' && ratingOrReview !== null

          const numericRating = isDetailed
            ? Number(ratingOrReview.overallRating)
            : Number(ratingOrReview)

          const nowFormatted = new Date().toLocaleDateString('pt-BR')

          const reviewEntry = isDetailed
            ? {
                id: `rev-ord-${orderId}`,
                orderId,
                userName:
                  ratingOrReview.userName ||
                  state.profile?.name ||
                  'Cliente Verificado',
                date: ratingOrReview.date || nowFormatted,
                deliveryRating: Number(ratingOrReview.deliveryRating ?? 5),
                qualityRating: Number(ratingOrReview.qualityRating ?? 5),
                serviceRating: Number(ratingOrReview.serviceRating ?? 5),
                overallRating: Number(
                  (
                    (Number(ratingOrReview.deliveryRating ?? 5) +
                      Number(ratingOrReview.qualityRating ?? 5) +
                      Number(ratingOrReview.serviceRating ?? 5)) /
                    3
                  ).toFixed(1)
                ),
                comment: (ratingOrReview.comment || '').trim(),
              }
            : null

          const updatedOrders = state.orders.map((o) =>
            o.orderId === orderId
              ? {
                  ...o,
                  rating: reviewEntry ? reviewEntry.overallRating : numericRating,
                  review: reviewEntry || o.review || null,
                }
              : o
          )

          let updatedReviews = state.reviews || []
          if (reviewEntry) {
            const existsIdx = updatedReviews.findIndex(
              (r) => r.orderId === orderId || r.id === reviewEntry.id
            )
            if (existsIdx >= 0) {
              updatedReviews = updatedReviews.map((r, i) =>
                i === existsIdx ? reviewEntry : r
              )
            } else {
              updatedReviews = [reviewEntry, ...updatedReviews]
            }
          }

          return {
            orders: updatedOrders,
            reviews: updatedReviews,
          }
        }),

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
