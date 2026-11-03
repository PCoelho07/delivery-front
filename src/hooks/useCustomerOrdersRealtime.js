import { useEffect } from 'react'
import { toast } from 'sonner'
import { ordersWebSocket } from '../services/ordersWebSocket'
import { useCustomerStore } from '../store/useCustomerStore'
import { useCartStore } from '../store/useCartStore'
import { playOrderStatusSound } from '../utils/audio'

/**
 * Hook para sincronização em tempo real do lado do Cliente (Cardápio & Acompanhamento de Pedido)
 *
 * Conecta via WebSocket ao backend em Go e escuta:
 * 1. Mudanças de status de pedidos do cliente (Preparo, Saiu p/ entrega, Concluído)
 *    com feedback sonoro contextual discreto.
 * 2. Atualizações no cardápio (Itens criados, pausados/esgotados ou excluídos).
 * 3. Mudanças no status de funcionamento da loja (Aberta / Fechada / Pausada).
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
      const isMyOrder = myOrders.some(
        (o) => String(o.orderId).replace(/^#/, '') === cleanId
      )

      // Apenas notifica e toca som se o pedido pertencer ao histórico deste cliente
      if (isMyOrder) {
        // Toca o som discreto apropriado para a etapa
        playOrderStatusSound(status)

        if (status === 'preparo') {
          toast.info(`👨‍🍳 Pedido #${cleanId} em preparo!`, {
            description: 'A cozinha começou a montar seu pedido.',
            duration: 6000,
          })
        } else if (status === 'entrega') {
          toast.success(`🛵 Pedido #${cleanId} saiu para entrega!`, {
            description: 'O entregador já está a caminho do seu endereço.',
            duration: 8000,
          })
        } else if (status === 'concluido') {
          toast.success(`🎉 Pedido #${cleanId} entregue com sucesso!`, {
            description: 'Bom apetite! Não se esqueça de avaliar o pedido.',
            duration: 8000,
          })
        } else if (status === 'cancelado' || status === 'recusado') {
          toast.error(`❌ Pedido #${cleanId} cancelado pelo restaurante.`, {
            description:
              data?.payload?.cancellationReason ||
              'Entre em contato com o restaurante para mais informações.',
            duration: 8000,
          })
        }
      }
    })

    // 3. Escuta alterações em tempo real do status de funcionamento da loja
    const unsubscribeStoreStatus = ordersWebSocket.on('STORE_STATUS_UPDATED', (data) => {
      const mode = data?.mode
      if (mode === 'paused') {
        toast.warning(
          'Aviso: O restaurante pausou temporariamente o recebimento de novos pedidos.'
        )
      } else if (mode === 'auto' || mode === 'forced_open') {
        toast.info('Restaurante aceitando pedidos normalmente!')
      }
    })

    // 4. Escuta exclusão de produtos em tempo real (alerta se o cliente tiver o item na sacola)
    const unsubscribeItemDeleted = ordersWebSocket.on('MENU_ITEM_DELETED', (data) => {
      const cartItems = useCartStore.getState().items
      const affectedItem = cartItems.find(
        (it) => String(it.product?.id) === String(data?.productId)
      )
      if (affectedItem) {
        toast.warning(
          `O produto "${affectedItem.product?.name || 'Item'}" foi removido do cardápio pelo restaurante.`,
          {
            description: 'Ele foi sinalizado como indisponível na sua sacola.',
            duration: 7000,
          }
        )
      }
    })

    // 5. Escuta quando um item é pausado/esgotado em tempo real
    const unsubscribeItemUpdated = ordersWebSocket.on('MENU_ITEM_UPDATED', (prod) => {
      if (prod?.available === false) {
        const cartItems = useCartStore.getState().items
        const affectedItem = cartItems.find(
          (it) => String(it.product?.id) === String(prod.id)
        )
        if (affectedItem) {
          toast.info(
            `O item "${affectedItem.product?.name}" esgotou no momento.`,
            {
              description: 'Ele foi marcado como indisponível na sua sacola.',
              duration: 6000,
            }
          )
        }
      }
    })

    return () => {
      unsubscribeStatus()
      unsubscribeStoreStatus()
      unsubscribeItemDeleted()
      unsubscribeItemUpdated()
    }
  }, [])
}
