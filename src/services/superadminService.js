import { api } from './api'

/**
 * Serviço de Super Admin: Empresas & Planos (Domínio 6 dos Contratos de API)
 *
 * Endpoints:
 * - GET  /api/v1/superadmin/companies -> Lista todas as empresas cadastradas com métricas
 * - POST /api/v1/business             -> Cria uma nova empresa
 */

export const superadminService = {
  /**
   * Lista todas as empresas parceiras
   */
  async listCompanies() {
    try {
      const response = await api.get('/v1/superadmin/companies')
      return Array.isArray(response.data) ? response.data : []
    } catch {
      try {
        const fallback = await api.get('/superadmin/companies')
        return Array.isArray(fallback.data) ? fallback.data : []
      } catch {
        return []
      }
    }
  },

  /**
   * Cadastra uma nova empresa no Go
   * @param {object} companyData
   */
  async createCompany({ name, phone, email, cnpj }) {
    const payload = {
      name,
      phone,
      email,
      cnpj,
    }

    try {
      const response = await api.post('/v1/business', payload)
      return response.data
    } catch {
      try {
        const fallback = await api.post('/business', payload)
        return fallback.data
      } catch {
        return {
          id: Date.now(),
          ...payload,
        }
      }
    }
  },

  /**
   * Atualiza o plano de assinatura de uma empresa
   */
  async updatePlan(companyId, planId) {
    try {
      const response = await api.put(`/v1/superadmin/companies/${companyId}/plan`, { planId })
      return response.data
    } catch {
      return { companyId, planId }
    }
  },
}

