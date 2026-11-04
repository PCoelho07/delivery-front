import { api } from './api'

/**
 * Serviço de Cupons de Desconto (Domínio 4 dos Contratos de API)
 *
 * Gerencia validação e CRUD de cupons (/api/v1/business/{id}/coupons).
 */

export const couponService = {
  async listCoupons(businessId) {
    if (!businessId) return []
    try {
      const response = await api.get(`/v1/business/${businessId}/coupons`)
      return Array.isArray(response.data) ? response.data : []
    } catch {
      try {
        const fallback = await api.get(`/business/${businessId}/coupons`)
        return Array.isArray(fallback.data) ? fallback.data : []
      } catch {
        return []
      }
    }
  },

  async createCoupon(businessId, couponData) {
    const payload = {
      id: couponData.id || `cupom-${Date.now()}`,
      code: String(couponData.code).trim().toUpperCase(),
      discountPercent: Number(couponData.discountPercent) || 0,
      active: couponData.active ?? true,
      targetType: couponData.targetType || 'all',
      targetCategoryId: couponData.targetCategoryId || null,
      targetCategoryName: couponData.targetCategoryName || null,
      targetProductIds: Array.isArray(couponData.targetProductIds) ? couponData.targetProductIds : [],
      createdAt: couponData.createdAt || new Date().toISOString(),
    }

    try {
      const response = await api.post(`/v1/business/${businessId}/coupons`, payload)
      return response.data
    } catch {
      return payload
    }
  },

  async updateCoupon(businessId, couponId, partial) {
    try {
      const response = await api.put(
        `/v1/business/${businessId}/coupons/${couponId}`,
        partial
      )
      return response.data
    } catch {
      return partial
    }
  },

  async deleteCoupon(businessId, couponId) {
    try {
      const response = await api.delete(
        `/v1/business/${businessId}/coupons/${couponId}`
      )
      return response.data
    } catch {
      return { success: true }
    }
  },
}
