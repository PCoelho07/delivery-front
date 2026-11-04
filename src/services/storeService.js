import { api } from './api'

/**
 * Serviço de Loja & Perfil (Domínio 1 dos Contratos de API)
 *
 * Endpoints:
 * - GET /api/v1/store/{slug}       -> Busca loja pelo slug (Cardápio do cliente)
 * - GET /api/v1/business/{id}     -> Busca dados cadastrais do restaurante (Lojista)
 * - PUT /api/v1/business/{id}     -> Atualiza perfil da empresa
 */

export const storeService = {
  /**
   * Busca os dados públicos da loja e cardápio pelo slug (ex: 'brasa-burger')
   * @param {string} slug
   */
  async getBySlug(slug) {
    if (!slug) return null
    try {
      const response = await api.get(`/v1/store/${slug}`)
      return response.data
    } catch {
      // Se a rota v1 ainda não existir, tenta compatibilidade sem o prefixo v1
      try {
        const fallback = await api.get(`/store/${slug}`)
        return fallback.data
      } catch {
        // Retorna null para o caller usar o cache local / preview
        return null
      }
    }
  },

  /**
   * Busca perfil administrativo do restaurante por ID
   * @param {number|string} businessId
   */
  async getBusinessProfile(businessId) {
    if (!businessId) return null
    try {
      const response = await api.get(`/v1/business/${businessId}`)
      return response.data
    } catch {
      try {
        const fallback = await api.get(`/business/${businessId}`)
        return fallback.data
      } catch {
        return null
      }
    }
  },

  /**
   * Atualiza dados cadastrais do restaurante
   * @param {number|string} businessId
   * @param {object} data
   */
  async updateBusinessProfile(businessId, data) {
    if (!businessId) return null
    const payload = {
      name: data.name,
      corporateName: data.corporateName || data.name,
      cnpj: data.cnpj,
      phone: data.phone,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      address: data.address,
      logoUrl: data.logoUrl || data.logo,
      bannerUrl: data.bannerUrl || data.banner,
      minOrder: Number(data.minOrder) || 0,
      estimatedDelivery: data.estimatedDelivery,
      estimatedPickup: data.estimatedPickup,
      statusMode: data.statusMode || 'auto',
      timezone: data.timezone || 'America/Sao_Paulo',
    }

    try {
      const response = await api.put(`/v1/business/${businessId}`, payload)
      return response.data
    } catch {
      try {
        const fallback = await api.put(`/business/${businessId}`, payload)
        return fallback.data
      } catch {
        return null
      }
    }
  },
}
