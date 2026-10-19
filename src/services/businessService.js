import { api } from './api'

/**
 * Serviços espelhando exatamente os endpoints existentes no backend Go:
 * - GET  /health
 * - GET  /business
 * - POST /business
 */
export const businessService = {
  /**
   * Verifica o status da API
   * Endpoint: GET /health
   * Retorno esperado: { message: "I'm alive" }
   */
  async checkHealth() {
    const response = await api.get('/health')
    return response.data
  },

  /**
   * Lista todos os estabelecimentos cadastrados
   * Endpoint: GET /business
   * Retorno esperado: Array<{ id: number, name: string, phone: string, email: string, cnpj: string }>
   */
  async listAll() {
    const response = await api.get('/business')
    return response.data
  },

  /**
   * Cadastra um novo estabelecimento
   * Endpoint: POST /business
   * Payload: { name: string, phone: string, email: string, cnpj: string }
   * Retorno esperado: { id: number, name: string, phone: string, email: string, cnpj: string }
   */
  async create({ name, phone, email, cnpj }) {
    const response = await api.post('/business', {
      name,
      phone,
      email,
      cnpj,
    })
    return response.data
  },
}

