import { useEffect } from 'react'
import { toast } from 'sonner'
import { ordersWebSocket } from '../services/ordersWebSocket'
import { useCustomerStore } from '../store/useCustomerStore'
import { playOrderChime } from '../utils/audio'

/**
 * Hook para sincronização em tempo real do lado do Cliente (Cardápio & Acompanhamento de Pedido)
 *
 * Conecta via WebSocket ao backend em Go e escuta:
 * 1. Mudanças de status de pedidos feitos pelo cliente (Em preparo, Saiu p/ entrega, Concluído)
 * 2. Mudanças de status da loja (Aberta / Fechada / Pausada temporariamente)
 */
export function useCustomerOrdersRealtime() {
  useEffect(() => {
    // 1. Inicia conexão WebSocket no cardápio
    ordersWebSocket.connect()

    // 2. Escuta atualizações de status emitidas pelo Lojista no Kanban
    const unsubscribeStatus = ordersWebSocket.on('ORDER_STATUS_UPDATED', (data) => {
      const orderId = data?.orderId
      const status = data?.status
      if (!orderId || !status) return

      const cleanId = String(orderId).replace(/^#/, '')
      const myOrders = useCustomerStore.getState().orders
      const isMyOrder = myOrders.some((o) => String(o.orderId).replace(/^#/, '') === cleanId)

      // Apenas notifica se o pedido pertencer ao histórico deste cliente
      if (isMyOrder) {
        if (status === 'preparo') {
          toast.info(`👨‍🍳 Pedido #${cleanId} em preparo!`, {
            description: 'A cozinha começou a montar seu pedido.',
            duration: 6000,
          })
        } else if (status === 'entrega') {
          playOrderChime()
          toast.success(`🛵 Pedido #${cleanId} saiu para entrega!`, {
            description: 'O entregador já está a caminho do seu endereço.',
            duration: 9000,
          })
        } else if (status === 'concluido') {
          toast.success(`🎉 Pedido #${cleanId} concluído/entregue!`, {
            description: 'Agradecemos pela preferência. Bom apetite!',
            duration: 7000,
          })
        } else if (status === 'cancelado' || status === 'recusado') {
          toast.error(`❌ Pedido #${cleanId} cancelado pela loja.`, {
            description: data?.payload?.cancellationReason || 'Consulte o restaurante para mais detalhes.',
            duration: 8000,
          })
        }
      }
    })

    // 3. Escuta alterações em tempo real do status de funcionamento da loja
    const unsubscribeStoreStatus = ordersWebSocket.on('STORE_STATUS_UPDATED', (data) => {
      const mode = data?.mode
      if (mode === 'paused') {
        toast.warning('Aviso: O restaurante pausou temporariamente o recebimento de novos pedidos.')
      }
    })

    return () => {
      unsubscribeStatus()
      unsubscribeStoreStatus()
    }
  }, [])
}

