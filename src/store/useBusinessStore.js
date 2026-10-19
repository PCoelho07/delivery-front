import { create } from 'zustand'
import { businessService } from '../services/businessService'

export const useBusinessStore = create((set, get) => ({
  businesses: [],
  currentBusiness: null,
  healthStatus: null,
  isLoading: false,
  error: null,

  /**
   * Testa a conexão com GET /health
   */
  checkApiHealth: async () => {
    try {
      const data = await businessService.checkHealth()
      set({ healthStatus: data?.message || 'Online', error: null })
      return data
    } catch (err) {
      set({
        healthStatus: 'Offline',
        error: err.response?.data?.message || 'Não foi possível conectar à API (:8080)',
      })
      return null
    }
  },

  /**
   * Busca todos os estabelecimentos em GET /business
   */
  fetchBusinesses: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await businessService.listAll()
      const list = Array.isArray(data) ? data : []
      set({ businesses: list, isLoading: false })
      return list
    } catch (err) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Erro ao buscar estabelecimentos',
      })
      return []
    }
  },

  /**
   * Cria um novo estabelecimento via POST /business
   */
  createBusiness: async ({ name, phone, email, cnpj }) => {
    set({ isLoading: true, error: null })
    try {
      const created = await businessService.create({ name, phone, email, cnpj })
      set((state) => ({
        businesses: [...state.businesses, created],
        currentBusiness: created,
        isLoading: false,
      }))
      return created
    } catch (err) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Erro ao cadastrar estabelecimento',
      })
      throw err
    }
  },

  /**
   * Seleciona o estabelecimento atual com base nos dados carregados
   */
  selectBusinessByName: (nameParam) => {
    const { businesses } = get()
    if (!nameParam) {
      set({ currentBusiness: null })
      return null
    }
    const normalizedParam = decodeURIComponent(nameParam).toLowerCase().trim()
    const found = businesses.find(
      (b) =>
        b.name?.toLowerCase().trim() === normalizedParam ||
        b.name?.toLowerCase().replace(/\s+/g, '-') === normalizedParam
    )
    set({ currentBusiness: found || null })
    return found || null
  },
}))

