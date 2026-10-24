import { useCustomerStore } from '../store/useCustomerStore'

/**
 * Serviço de WebSocket Nativo RFC 6455 para integração em tempo real com o backend em Go.
 *
 * Características:
 * - 100% nativo (sem dependências como socket.io, compatível com gorilla/websocket ou nhooyr/websocket do Go)
 * - Reconexão automática com backoff exponencial
 * - Heartbeat (Ping/Pong) a cada 25 segundos para manter conexões ativas através de proxies/reverse proxies
 * - Tolerância a falhas quando o backend Go ainda estiver inicializando ou offline em dev
 * - Normalização de envelopes JSON: aceita formatos { type, payload } ou { event, data }
 */

class OrdersWebSocketService {
  constructor() {
    this.ws = null
    this.status = 'DISCONNECTED' // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING'
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 20
    this.baseReconnectDelay = 2000
    this.maxReconnectDelay = 15000
    this.reconnectTimer = null
    this.pingTimer = null
    this.listeners = new Map()
    this.statusListeners = new Set()
    this.shouldReconnect = true
  }

  /**
   * Obtém a URL do WebSocket a partir de variáveis de ambiente ou da origem da página
   */
  getUrl() {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL
    }
    if (typeof window === 'undefined') {
      return 'ws://localhost:8080/ws/orders'
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    // Em dev com Vite proxy (/ws) ou na mesma porta do servidor:
    return `${protocol}//${window.location.host}/ws/orders`
  }

  /**
   * Inicia a conexão com o servidor WebSocket em Go
   */
  connect() {
    if (typeof window === 'undefined') return
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.shouldReconnect = true
    this.updateStatus(this.reconnectAttempts === 0 ? 'CONNECTING' : 'RECONNECTING')

    const url = this.getUrl()

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.updateStatus('CONNECTED')
        this.startHeartbeat()

        // Notifica o backend Go que o terminal do gestor está online
        this.send('JOIN_STORE', {
          client: 'delivery-front-backoffice',
          timestamp: new Date().toISOString(),
        })
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.ws.onerror = () => {
        // Erro silencioso em dev quando o Go backend ainda não foi iniciado
        if (this.status !== 'RECONNECTING') {
          this.updateStatus('DISCONNECTED')
        }
      }

      this.ws.onclose = () => {
        this.stopHeartbeat()
        this.ws = null

        if (this.shouldReconnect) {
          this.scheduleReconnect()
        } else {
          this.updateStatus('DISCONNECTED')
        }
      }
    } catch {
      this.scheduleReconnect()
    }
  }

  /**
   * Encerra conscientemente a conexão e cancela tentativas de reconexão
   */
  disconnect() {
    this.shouldReconnect = false
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      try {
        this.ws.close()
      } catch {
        // ignorar
      }
      this.ws = null
    }
    this.updateStatus('DISCONNECTED')
  }

  /**
   * Força reconexão imediata
   */
  reconnect() {
    this.disconnect()
    this.reconnectAttempts = 0
    this.connect()
  }

  /**
   * Agenda reconexão com backoff exponencial
   */
  scheduleReconnect() {
    if (this.reconnectTimer) return
    this.updateStatus('RECONNECTING')

    this.reconnectAttempts += 1
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(1.5, Math.min(this.reconnectAttempts, 8)),
      this.maxReconnectDelay
    )

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  /**
   * Inicia ping periódico para manter viva a conexão contra timeouts de proxies
   */
  startHeartbeat() {
    this.stopHeartbeat()
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('PING', { t: Date.now() })
      }
    }, 25000)
  }

  stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  /**
   * Processa mensagens brutas recebidas do servidor Go
   */
  handleMessage(rawData) {
    if (!rawData) return

    let data
    try {
      data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData
    } catch {
      // Ignora frames não-JSON (ou ping de texto plano)
      return
    }

    // Normaliza variações comuns de envelopes emitidos por Go:
    // { type: 'ORDER_CREATED', payload: { ... } }
    // { event: 'order:created', data: { ... } }
    // { action: 'NEW_ORDER', ... }
    const rawType = data.type || data.event || data.action || ''
    const type = String(rawType).toUpperCase()
    const payload = data.payload || data.data || data.order || data

    // Resposta de Ping/Pong
    if (type === 'PING') {
      this.send('PONG', { t: Date.now() })
      return
    }
    if (type === 'PONG') {
      return
    }

    // 1. Novo Pedido Criado no Backend Go
    if (
      type === 'ORDER_CREATED' ||
      type === 'ORDER:CREATED' ||
      type === 'ORDER:NEW' ||
      type === 'NEW_ORDER'
    ) {
      if (payload && (payload.orderId || payload.id)) {
        const normalizedOrder = {
          ...payload,
          orderId: payload.orderId || payload.id,
          status: payload.status || 'aceito',
          createdAt: payload.createdAt || 'Agora mesmo',
        }
        useCustomerStore.getState().addOrder(normalizedOrder)
        this.emit('ORDER_CREATED', normalizedOrder)
      }
      return
    }

    // 2. Atualização de Status de Pedido pelo Backend Go
    if (
      type === 'ORDER_STATUS_UPDATED' ||
      type === 'ORDER_UPDATED' ||
      type === 'ORDER:STATUS_UPDATED' ||
      type === 'ORDER:UPDATED'
    ) {
      const orderId = payload.orderId || payload.id
      const nextStatus = payload.status
      if (orderId && nextStatus) {
        useCustomerStore.getState().updateOrderStatus(orderId, nextStatus)
        this.emit('ORDER_STATUS_UPDATED', { orderId, status: nextStatus, payload })
      }
      return
    }

    // 3. Sincronização em Massa (Go envia pedidos ativos ao conectar)
    if (
      type === 'SYNC_ORDERS' ||
      type === 'ORDERS_LIST' ||
      type === 'ORDER:LIST'
    ) {
      if (Array.isArray(payload)) {
        useCustomerStore.getState().setOrders(payload)
        this.emit('SYNC_ORDERS', payload)
      }
      return
    }

    // Dispara listener genérico para qualquer outro tipo customizado do backend
    this.emit(type, payload)
  }

  /**
   * Envia uma mensagem no formato Go JSON para o servidor
   *
   * @param {string} type - Tipo de evento, ex: 'UPDATE_ORDER_STATUS'
   * @param {any} payload - Dados anexados
   * @returns {boolean} Se foi enviado com sucesso
   */
  send(type, payload = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false
    }

    try {
      const message = JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString(),
      })
      this.ws.send(message)
      return true
    } catch (err) {
      console.warn('[WebSocket] Falha ao enviar mensagem:', err)
      return false
    }
  }

  /**
   * Notifica o backend Go que o operador alterou o status no Kanban
   */
  updateOrderStatus(orderId, nextStatus) {
    return this.send('UPDATE_ORDER_STATUS', {
      orderId,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    })
  }

  /**
   * Simula um evento de WebSocket recebido (ótimo para testes e homologação local sem o Go rodando)
   */
  simulateIncomingMessage(type, payload) {
    this.handleMessage(JSON.stringify({ type, payload }))
  }

  /**
   * Sistema de subscrição de eventos
   */
  on(event, callback) {
    const key = String(event).toUpperCase()
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key).add(callback)
    return () => this.off(key, callback)
  }

  off(event, callback) {
    const key = String(event).toUpperCase()
    if (this.listeners.has(key)) {
      this.listeners.get(key).delete(callback)
    }
  }

  emit(event, data) {
    const key = String(event).toUpperCase()
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach((cb) => {
        try {
          cb(data)
        } catch (err) {
          console.error(`[WebSocket] Erro no listener ${key}:`, err)
        }
      })
    }
  }

  /**
   * Notificação de mudança de status da conexão
   */
  onStatusChange(callback) {
    this.statusListeners.add(callback)
    callback(this.status)
    return () => this.statusListeners.delete(callback)
  }

  updateStatus(newStatus) {
    if (this.status === newStatus) return
    this.status = newStatus
    this.statusListeners.forEach((cb) => {
      try {
        cb(newStatus)
      } catch (err) {
        console.error('[WebSocket] Erro no statusListener:', err)
      }
    })
  }

  getStatus() {
    return this.status
  }
}

export const ordersWebSocket = new OrdersWebSocketService()

