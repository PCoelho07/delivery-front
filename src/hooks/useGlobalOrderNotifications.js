import { useEffect } from 'react'
import { toast } from 'sonner'
import { ordersWebSocket } from '../services/ordersWebSocket'
import { useStoreAdmin } from '../store/useStoreAdmin'
import { useNotificationStore } from '../store/useNotificationStore'
import { playOrderChime, unlockAudio } from '../utils/audio'
import { sendDesktopNotification, startTitleBlink } from '../utils/notifications'

/**
 * Hook global de escuta de pedidos e orquestração de notificações
 * Deve ser montado no nível do Backoffice (ex: LojistaPage) para garantir que
 * novos pedidos toquem o alerta sonoro e notifiquem o lojista em QUALQUER aba
 * (Cardápio, Financeiro, Horários, etc.) ou com o navegador em segundo plano.
 */
export function useGlobalOrderNotifications() {
  useEffect(() => {
    // 1. Inicia conexão WebSocket com o backend em Go
    ordersWebSocket.connect()

    // 2. Desbloqueia áudio preventivamente na primeira interação
    unlockAudio()

    // 3. Listener de Novo Pedido Criado
    const unsubscribeNewOrder = ordersWebSocket.on('ORDER_CREATED', (order) => {
      const orderNum = String(order.orderId || order.id || '').replace(/^#/, '')
      const customerName = order.customer?.name || 'Cliente'
      const totalNum = Number(order.total) || 0
      const totalFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(totalNum)

      // A. Alerta Sonoro Unificado (respeita configuração global de som da loja)
      const soundActive = useStoreAdmin.getState().soundEnabled
      if (soundActive) {
        playOrderChime()
      }

      // B. Registra na Central de Notificações
      useNotificationStore.getState().addNotification({
        type: 'order',
        title: `Novo Pedido #${orderNum}`,
        message: `${customerName} • ${totalFormatted} (${order.deliveryMethod === 'delivery' ? 'Entrega' : 'Retirada'})`,
        orderId: `#${orderNum}`,
        data: order,
      })

      // C. Toast Visual na Interface
      toast.success(`Novo pedido #${orderNum} recebido!`, {
        description: `${customerName} enviou um pedido de ${totalFormatted}.`,
        duration: 6000,
        action: {
          label: 'Ver Pedido',
          onClick: () => {
            useStoreAdmin.getState().setActiveTab('pedidos')
          },
        },
      })

      // D. Notificação Nativa do Sistema Operacional (Windows/Mac/Celular)
      // Dispara se a janela estiver minimizada ou em segundo plano
      if (typeof document !== 'undefined' && document.hidden) {
        sendDesktopNotification({
          title: `🔔 Novo Pedido #${orderNum}!`,
          body: `${customerName} - ${totalFormatted}\nClique para visualizar no Kanban.`,
          tag: `order-${orderNum}`,
          onClick: () => {
            useStoreAdmin.getState().setActiveTab('pedidos')
          },
        })

        // Alerta visual no título da aba
        startTitleBlink(`🔔 (${orderNum}) NOVO PEDIDO!`)
      }
    })

    // 4. Listener de Atualização de Status
    const unsubscribeStatusUpdate = ordersWebSocket.on('ORDER_STATUS_UPDATED', (payload) => {
      const orderId = payload.orderId || payload.id
      const status = payload.status
      if (!orderId || !status) return

      const cleanId = String(orderId).replace(/^#/, '')

      if (status === 'cancelado' || status === 'recusado') {
        useNotificationStore.getState().addNotification({
          type: 'alert',
          title: `Pedido #${cleanId} Cancelado`,
          message: 'O pedido foi recusado ou cancelado no sistema.',
          orderId: `#${cleanId}`,
        })
      }
    })

    return () => {
      unsubscribeNewOrder()
      unsubscribeStatusUpdate()
    }
  }, [])
}

