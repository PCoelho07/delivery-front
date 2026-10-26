import { useCustomerStore } from '../store/useCustomerStore'
import { useStoreAdmin } from '../store/useStoreAdmin'

/**
 * Serviço de WebSocket Nativo RFC 6455 para integração em tempo real com o backend em Go.
 *
 * Características:
 * - 100% nativo (sem dependências como socket.io, compatível com gorilla/websocket ou nhooyr/websocket do Go)
 * - Reconexão automática com backoff exponencial
 * - Heartbeat (Ping/Pong) a cada 25 segundos para manter conexões ativas através de proxies/reverse proxies
 * - Tolerância a falhas quando o backend Go ainda estiver inicializando ou offline em dev
 * - Normalização de envelopes JSON: aceita formatos { type, payload } ou { event, data }
 * - BroadcastChannel nativo do navegador para sincronização cruzada imediata entre abas (Cliente <-> Lojista)
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

    // Identificador único desta aba para evitar loops de eco no BroadcastChannel
    this.clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    this.broadcastChannel = null

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('delivery_orders_sync')
        this.broadcastChannel.onmessage = (event) => {
          const data = event.data
          if (data && data._senderId !== this.clientId) {
            this.handleMessage(data)
          }
        }
      } catch (err) {
        console.warn('[WebSocket] BroadcastChannel não disponível:', err)
      }
    }
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

        // Notifica o backend Go que o terminal está online
        this.send('JOIN_STORE', {
          client: 'delivery-front',
          clientId: this.clientId,
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
   * Dispara mensagem entre abas locais abertas no mesmo navegador
   */
  broadcastLocal(type, payload) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type,
          payload,
          _senderId: this.clientId,
          timestamp: new Date().toISOString(),
        })
      } catch {
        // ignorar
      }
    }
  }

  /**
   * Processa mensagens brutas recebidas do servidor Go ou de abas irmãs
   */
  handleMessage(rawData) {
    if (!rawData) return

    let data
    try {
      data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData
    } catch {
      // Ignora frames não-JSON
      return
    }

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

    // 1. Novo Pedido Criado no Backend Go ou pelo Cliente no Cardápio
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

        // Adiciona à lista de pedidos caso ainda não esteja presente
        const currentOrders = useCustomerStore.getState().orders
        const exists = currentOrders.some((o) => o.orderId === normalizedOrder.orderId)
        if (!exists) {
          useCustomerStore.getState().addOrder(normalizedOrder)
        }

        this.emit('ORDER_CREATED', normalizedOrder)
      }
      return
    }

    // 2. Atualização de Status de Pedido pelo Lojista no Kanban
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

    // 3. Atualização de Status da Loja (Aberto / Fechado / Pausado)
    if (
      type === 'STORE_STATUS_UPDATED' ||
      type === 'STORE:STATUS_UPDATED' ||
      type === 'STORE_STATUS'
    ) {
      const mode = payload.mode || payload.statusMode || payload.status
      if (mode) {
        useStoreAdmin.getState().setStoreStatusMode(mode)
        this.emit('STORE_STATUS_UPDATED', { mode, payload })
      }
      return
    }

    // 4. Sincronização em Massa (Go envia pedidos ativos ao conectar)
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
        clientId: this.clientId,
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
   * Notifica a rede e abas irmãs que um cliente gerou um novo pedido no cardápio
   */
  createOrder(order) {
    if (!order) return false
    const normalizedOrder = {
      ...order,
      orderId: order.orderId || order.id || `#${Math.floor(1000 + Math.random() * 9000)}`,
      status: order.status || 'aceito',
      createdAt: order.createdAt || 'Agora mesmo',
    }

    // 1. Envia via rede WebSocket para o backend Go (que faz broadcast para todos os lojistas)
    this.send('CREATE_ORDER', normalizedOrder)

    // 2. Dispara no canal BroadcastChannel local (sincronização imediata entre abas no mesmo computador)
    this.broadcastLocal('ORDER_CREATED', normalizedOrder)

    return true
  }

  /**
   * Notifica o backend Go e o cliente que o operador alterou o status no Kanban
   */
  updateOrderStatus(orderId, nextStatus) {
    const payload = {
      orderId,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    }

    // 1. Envia ao backend Go via WebSocket
    this.send('UPDATE_ORDER_STATUS', payload)

    // 2. Notifica abas irmãs locais (ex: tela do cliente aberta no mesmo navegador)
    this.broadcastLocal('ORDER_STATUS_UPDATED', payload)

    return true
  }

  /**
   * Notifica que a loja foi pausada, reaberta ou colocada em automático
   */
  updateStoreStatus(mode) {
    const payload = {
      mode,
      updatedAt: new Date().toISOString(),
    }

    this.send('UPDATE_STORE_STATUS', payload)
    this.broadcastLocal('STORE_STATUS_UPDATED', payload)

    return true
  }

  /**
   * Simula um evento de WebSocket recebido (ótimo para testes e homologação local sem o Go rodando)
   */
  simulateIncomingMessage(type, payload) {
    this.handleMessage(JSON.stringify({ type, payload }))
    this.broadcastLocal(type, payload)
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
