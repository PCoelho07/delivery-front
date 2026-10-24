import { useEffect, useState, useCallback, useRef } from 'react'
import { ordersWebSocket } from '../services/ordersWebSocket'

/**
 * Hook React para gerenciar conexão WebSocket nativa com o backend Go
 *
 * @param {Object} options
 * @param {boolean} [options.enabled=true] - Se a conexão deve ser iniciada
 * @param {Function} [options.onNewOrder] - Callback disparado quando um novo pedido chega via WS
 * @param {Function} [options.onStatusUpdate] - Callback disparado quando um pedido tem status atualizado via WS
 *
 * @returns {Object} { status, isConnected, isReconnecting, reconnect, send, updateOrderStatus, simulateOrder }
 */
export function useOrdersWebSocket(options = {}) {
  const { enabled = true, onNewOrder, onStatusUpdate } = options

  const [status, setStatus] = useState(ordersWebSocket.getStatus())
  const onNewOrderRef = useRef(onNewOrder)
  const onStatusUpdateRef = useRef(onStatusUpdate)

  // Mantém refs atualizadas sem disparar re-inscrições desnecessárias
  useEffect(() => {
    onNewOrderRef.current = onNewOrder
  }, [onNewOrder])

  useEffect(() => {
    onStatusUpdateRef.current = onStatusUpdate
  }, [onStatusUpdate])

  useEffect(() => {
    if (!enabled) return

    // Conecta ao servidor Go
    ordersWebSocket.connect()

    // Escuta mudanças de status de conexão
    const unsubscribeStatus = ordersWebSocket.onStatusChange((newStatus) => {
      setStatus(newStatus)
    })

    // Escuta novos pedidos
    const unsubscribeNewOrder = ordersWebSocket.on('ORDER_CREATED', (order) => {
      if (onNewOrderRef.current) {
        onNewOrderRef.current(order)
      }
    })

    // Escuta atualizações de status
    const unsubscribeStatusUpdate = ordersWebSocket.on('ORDER_STATUS_UPDATED', (payload) => {
      if (onStatusUpdateRef.current) {
        onStatusUpdateRef.current(payload)
      }
    })

    return () => {
      unsubscribeStatus()
      unsubscribeNewOrder()
      unsubscribeStatusUpdate()
    }
  }, [enabled])

  const reconnect = useCallback(() => {
    ordersWebSocket.reconnect()
  }, [])

  const send = useCallback((type, payload) => {
    return ordersWebSocket.send(type, payload)
  }, [])

  const updateOrderStatus = useCallback((orderId, nextStatus) => {
    return ordersWebSocket.updateOrderStatus(orderId, nextStatus)
  }, [])

  const simulateIncomingMessage = useCallback((type, payload) => {
    ordersWebSocket.simulateIncomingMessage(type, payload)
  }, [])

  return {
    status,
    isConnected: status === 'CONNECTED',
    isConnecting: status === 'CONNECTING',
    isReconnecting: status === 'RECONNECTING',
    isDisconnected: status === 'DISCONNECTED',
    reconnect,
    send,
    updateOrderStatus,
    simulateIncomingMessage,
  }
}

