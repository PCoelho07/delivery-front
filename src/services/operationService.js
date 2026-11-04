import { api } from './api'

/**
 * Serviço de Operação (Domínio 3 dos Contratos de API)
 *
 * Gerencia Horários de Funcionamento, Taxas de Entrega/Bairros e Métodos de Pagamento.
 */

export const operationService = {
  // ==========================================
  // HORÁRIOS (/api/v1/business/{id}/schedule)
  // ==========================================

  async getSchedule(businessId) {
    if (!businessId) return null
    try {
      const response = await api.get(`/v1/business/${businessId}/schedule`)
      return response.data
    } catch {
      try {
        const fallback = await api.get(`/business/${businessId}/schedule`)
        return fallback.data
      } catch {
        return null
      }
    }
  },

  async updateSchedule(businessId, scheduleData) {
    if (!businessId) return scheduleData
    const payload = {
      timezone: scheduleData.timezone || 'America/Sao_Paulo',
      statusMode: scheduleData.statusMode || 'auto',
      days: scheduleData.days || scheduleData,
    }

    try {
      const response = await api.put(`/v1/business/${businessId}/schedule`, payload)
      return response.data
    } catch {
      return payload
    }
  },

  // ==========================================
  // ENTREGAS & BAIRROS (/api/v1/business/{id}/delivery)
  // ==========================================

  async getDeliveryConfig(businessId) {
    if (!businessId) return null
    try {
      const response = await api.get(`/v1/business/${businessId}/delivery`)
      return response.data
    } catch {
      try {
        const fallback = await api.get(`/business/${businessId}/delivery`)
        return fallback.data
      } catch {
        return null
      }
    }
  },

  async updateDeliveryConfig(businessId, deliveryData) {
    if (!businessId) return deliveryData
    const payload = {
      allowDelivery: deliveryData.allowDelivery ?? true,
      allowPickup: deliveryData.allowPickup ?? true,
      pricingMode: deliveryData.pricingMode || 'by_neighborhood',
      fixedFee: Number(deliveryData.fixedFee) || 0,
      estimatedDelivery: deliveryData.estimatedDelivery || '40 - 50 min',
      estimatedPickup: deliveryData.estimatedPickup || '20 - 30 min',
      neighborhoods: deliveryData.neighborhoods || [],
    }

    try {
      const response = await api.put(`/v1/business/${businessId}/delivery`, payload)
      return response.data
    } catch {
      return payload
    }
  },

  // ==========================================
  // PAGAMENTOS (/api/v1/business/{id}/payments)
  // ==========================================

  async getPaymentConfig(businessId) {
    if (!businessId) return null
    try {
      const response = await api.get(`/v1/business/${businessId}/payments`)
      return response.data
    } catch {
      try {
        const fallback = await api.get(`/business/${businessId}/payments`)
        return fallback.data
      } catch {
        return null
      }
    }
  },

  async updatePaymentConfig(businessId, paymentData) {
    if (!businessId) return paymentData
    const payload = {
      pix: paymentData.pix || { enabled: true, keyType: 'cnpj', key: '' },
      cash: paymentData.cash || { enabled: true, allowChange: true },
      cardOnDelivery: paymentData.cardOnDelivery || { enabled: true, credit: true, debit: true },
    }

    try {
      const response = await api.put(`/v1/business/${businessId}/payments`, payload)
      return response.data
    } catch {
      return payload
    }
  },
}
