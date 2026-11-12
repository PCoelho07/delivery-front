import { api } from './api'
import { menuService } from './menuService'

/**
 * Normaliza o preço para reais (ex: 28.90).
 * Compatível tanto com centavos da API Go (price_cents / price inteiro) quanto com decimais de mock.
 */
function normalizePrice(val) {
  if (val === null || val === undefined || val === '') return 0
  const num = Number(val)
  if (isNaN(num)) return 0
  // Se for inteiro e maior que 100 (ex: 2890 centavos da API Go), converte para 28.90
  if (Number.isInteger(num) && num >= 100) {
    return num / 100
  }
  return num
}

/**
 * Normaliza a estrutura de um produto vindo do Go (snake_case/centavos) para o padrão do front
 */
export function normalizeProduct(p) {
  if (!p) return null

  const rawPrice = p.price_cents !== undefined ? p.price_cents : p.price

  return {
    id: p.id,
    businessId: p.business_id || p.businessId || 1,
    name: p.name || 'Produto sem nome',
    description: p.description || p.desc || '',
    price: normalizePrice(rawPrice),
    priceCents: p.price_cents !== undefined ? p.price_cents : Math.round(normalizePrice(rawPrice) * 100),
    imageUrl: p.image_url || p.imageUrl || p.image || '',
    image_url: p.image_url || p.imageUrl || p.image || '',
    complementGroupIds: p.complement_group_ids || p.complementGroupIds || [],
  }
}

/**
 * Normaliza um grupo de complementos e seus adicionais (GET /products/{id}/complement-groups)
 */
export function normalizeComplementGroup(g) {
  if (!g) return null

  return {
    id: g.id,
    name: g.name || 'Adicionais',
    description: g.description || '',
    min: Number(g.min) || 0,
    max: Number(g.max) || 1,
    complements: (Array.isArray(g.complements) ? g.complements : []).map((c) => ({
      id: c.id,
      name: c.name || 'Item adicional',
      description: c.description || '',
      price: normalizePrice(c.price_cents !== undefined ? c.price_cents : c.price),
      priceCents: c.price_cents !== undefined ? c.price_cents : Math.round(normalizePrice(c.price) * 100),
    })),
  }
}

/**
 * Serviço de comunicação com os endpoints de Produtos da API Go (:8080)
 *
 * Contratos suportados:
 * - GET    /business/{id}/products
 * - GET    /products/{id}
 * - GET    /products/{id}/complement-groups
 * - POST   /business/{id}/products
 * - PUT    /business/{id}/products/{productId}
 * - DELETE /business/{id}/products/{productId}
 * - PATCH  /business/{id}/products/{productId}/availability
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
      const list = Array.isArray(response.data) ? response.data : []
      return list.map(normalizeProduct)
    } catch {
      try {
        const fallback = await api.get(`/business/${businessId}/products`)
        const list = Array.isArray(fallback.data) ? fallback.data : []
        return list.map(normalizeProduct)
      } catch {
        return []
      }
    }
  },

  /**
   * Busca um produto individual pelo ID (GET /products/{id})
   * @param {number|string} productId
   */
  async getById(productId) {
    if (!productId) return null
    try {
      const response = await api.get(`/products/${productId}`)
      return normalizeProduct(response.data)
    } catch {
      return null
    }
  },

  /**
   * Lista os grupos de complementos e adicionais de um produto (GET /products/{id}/complement-groups)
   * @param {number|string} productId
   */
  async getComplementGroups(productId) {
    if (!productId) return []
    try {
      const response = await api.get(`/products/${productId}/complement-groups`)
      const list = Array.isArray(response.data) ? response.data : []
      return list.map(normalizeComplementGroup)
    } catch {
      return []
    }
  },

  create: (businessId, productData) => menuService.createProduct(businessId, productData),
  update: (businessId, productId, data) => menuService.updateProduct(businessId, productId, data),
  delete: (businessId, productId) => menuService.deleteProduct(businessId, productId),
  setAvailability: (businessId, productId, available) =>
    menuService.setProductAvailability(businessId, productId, available),
}
