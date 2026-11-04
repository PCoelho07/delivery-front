import { api } from './api'
import { menuService } from './menuService'

/**
 * Serviço de comunicação com os endpoints de Produtos da API Go (:8080)
 *
 * Contratos suportados:
 * - GET    /api/v1/business/{id}/products
 * - POST   /api/v1/business/{id}/products
 * - PUT    /api/v1/business/{id}/products/{productId}
 * - DELETE /api/v1/business/{id}/products/{productId}
 * - PATCH  /api/v1/business/{id}/products/{productId}/availability
 */
export const productService = {
  /**
   * Lista todos os produtos de um estabelecimento pelo seu ID
   * @param {number|string} businessId
   */
  async listByBusiness(businessId) {
    if (!businessId) return []
    try {
      const response = await api.get(`/v1/business/${businessId}/products`)
      return Array.isArray(response.data) ? response.data : []
    } catch {
      try {
        const fallback = await api.get(`/business/${businessId}/products`)
        return Array.isArray(fallback.data) ? fallback.data : []
      } catch {
        return []
      }
    }
  },

  create: (businessId, productData) => menuService.createProduct(businessId, productData),
  update: (businessId, productId, data) => menuService.updateProduct(businessId, productId, data),
  delete: (businessId, productId) => menuService.deleteProduct(businessId, productId),
  setAvailability: (businessId, productId, available) =>
    menuService.setProductAvailability(businessId, productId, available),
}
