import { api } from './api'
import { ordersWebSocket } from './ordersWebSocket'

/**
 * Serviço de Pedidos & Tempo Real (Domínio 5 dos Contratos de API)
 *
 * Integra a criação de pedidos (REST POST /api/v1/orders) com o WebSocket
 * do Gestor de Pedidos do Lojista.
 */

export const orderService = {
  /**
   * Envia o pedido criado pelo cliente para a API Go
   * @param {object} orderData
   */
  async createOrder(orderData) {
    const payload = {
      orderId: orderData.orderId,
      businessId: Number(orderData.businessId) || 1,
      deliveryMethod: orderData.deliveryMethod || 'delivery',
      customer: {
        name: orderData.customer?.name || 'Cliente',
        phone: orderData.customer?.phone || '',
      },
      address: orderData.address
        ? {
            street: orderData.address.street || '',
            number: orderData.address.number || '',
            neighborhoodName: orderData.address.neighborhoodName || '',
            complement: orderData.address.complement || '',
            reference: orderData.address.reference || '',
          }
        : null,
      payment: {
        method: orderData.paymentMethod || orderData.payment?.method || 'pix',
        changeFor: orderData.changeFor ?? orderData.payment?.changeFor ?? null,
      },
      couponCode: orderData.coupon?.code || orderData.couponCode || null,
      items: (orderData.items || []).map((it) => ({
        productId: it.productId || it.id,
        name: it.name,
        quantity: Number(it.quantity) || 1,
        price: Number(it.unitPrice ?? it.price) || 0,
        totalPrice: Number(it.totalPrice) || (Number(it.unitPrice ?? it.price) * (it.quantity || 1)),
        options: Array.isArray(it.options) ? it.options : [],
        notes: it.notes || it.observation || '',
      })),
      subtotal: Number(orderData.subtotal) || 0,
      deliveryFee: Number(orderData.deliveryFee) || 0,
      discount: Number(orderData.discount || orderData.discountAmount) || 0,
      total: Number(orderData.total) || 0,
      createdAt: orderData.createdAt || 'Agora mesmo',
    }

    try {
      const response = await api.post('/v1/orders', payload)
      // Dispara também via WebSocket para sincronização em tempo real
      ordersWebSocket.createOrder(response.data || orderData)
      return response.data || orderData
    } catch {
      // Fallback: se o backend Go ainda estiver inicializando ou offline,
      // propaga localmente via WebSocket / BroadcastChannel sem bloquear o cliente
      ordersWebSocket.createOrder(orderData)
      return orderData
    }
  },

  /**
   * Consulta os dados de um pedido por ID
   * @param {string|number} orderId
   */
  async getOrderById(orderId) {
    if (!orderId) return null
    try {
      const cleanId = String(orderId).replace('#', '')
      const response = await api.get(`/v1/orders/${cleanId}`)
      return response.data
    } catch {
      return null
    }
  },

  /**
   * Lista todos os pedidos de um estabelecimento para o Kanban
   * @param {number|string} businessId
   */
  async listOrdersByBusiness(businessId) {
    if (!businessId) return []
    try {
      const response = await api.get(`/v1/business/${businessId}/orders`)
      return Array.isArray(response.data) ? response.data : []
    } catch {
      try {
        const fallback = await api.get(`/business/${businessId}/orders`)
        return Array.isArray(fallback.data) ? fallback.data : []
      } catch {
        return []
      }
    }
  },

  /**
   * Atualiza a etapa do pedido no Kanban (/api/v1/orders/{orderId}/status)
   * @param {string|number} orderId
   * @param {string} status
   */
  async updateOrderStatus(orderId, status) {
    const cleanId = String(orderId).replace('#', '')

    // 1. Notifica via WebSocket imediatamente
    ordersWebSocket.updateOrderStatus(orderId, status)

    // 2. Persiste na API REST em background
    try {
      const response = await api.patch(`/v1/orders/${cleanId}/status`, { status })
      return response.data
    } catch {
      return { orderId, status }
    }
  },
}
