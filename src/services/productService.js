import { api } from './api'

/**
 * Serviço de comunicação com os endpoints de Produtos da API Go (:8080)
 * Endpoints implementados na delivery-api:
 * - GET /business/{id}/products: Lista todos os produtos vinculados a um estabelecimento
 */
export const productService = {
  /**
   * Lista todos os produtos de um estabelecimento pelo seu ID
   * @param {number|string} businessId
   * @returns {Promise<Array<{ id: number, business_id: number, name: string, description: string, image_url: string, price: number }>>}
   */
  async listByBusiness(businessId) {
    if (!businessId) return []
    const response = await api.get(`/business/${businessId}/products`)
    return Array.isArray(response.data) ? response.data : []
  },
}

