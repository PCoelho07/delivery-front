import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getNotificationPermission, requestNotificationPermission } from '../utils/notifications'

export const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [
        {
          id: 'initial-system-1',
          type: 'system',
          title: 'Central de Notificações Pronta',
          message: 'Seus alertas sonoros e de novos pedidos estão sincronizados em tempo real.',
          read: true,
          timestamp: 'Agora',
          createdAt: Date.now(),
        },
      ],
      desktopPermission: getNotificationPermission(),

      /**
       * Adiciona uma nova notificação no topo da lista
       */
      addNotification: ({ type = 'order', title, message, orderId = null, data = null }) => {
        const now = new Date()
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

        const newNotif = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type,
          title,
          message,
          orderId,
          read: false,
          timestamp: timeStr,
          createdAt: Date.now(),
          data,
        }

        set((state) => {
          const updated = [newNotif, ...state.notifications].slice(0, 40)
          return { notifications: updated }
        })

        return newNotif
      },

      /**
       * Marca uma notificação específica como lida
       */
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },

      /**
       * Marca todas as notificações como lidas
       */
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }))
      },

      /**
       * Limpa o histórico de notificações
       */
      clearAll: () => {
        set({ notifications: [] })
      },

      /**
       * Atualiza status da permissão de notificações do navegador
       */
      refreshPermission: () => {
        set({ desktopPermission: getNotificationPermission() })
      },

      /**
       * Solicita permissão de notificações nativas
       */
      requestPermission: async () => {
        const perm = await requestNotificationPermission()
        set({ desktopPermission: perm })
        return perm
      },
    }),
    {
      name: 'delivery-notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
)

/**
 * Hook selector para obter a contagem de não lidas de forma reativa
 */
export function useUnreadNotificationsCount() {
  return useNotificationStore((state) =>
    state.notifications.filter((n) => !n.read).length
  )
}
