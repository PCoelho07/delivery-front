import { create } from 'zustand'
import { businessService } from '../services/businessService'
import { productService } from '../services/productService'

export const useBusinessStore = create((set, get) => ({
  businesses: [],
  currentBusiness: null,
  products: [],
  productsByBusinessId: {},
  healthStatus: null,
  isLoading: false,
  isLoadingProducts: false,
  error: null,
  productsError: null,

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
   * Busca um estabelecimento por ID em GET /business/{id}
   */
  fetchBusinessById: async (id) => {
    if (!id) return null
    set({ isLoading: true, error: null })
    try {
      const b = await businessService.getById(id)
      if (b) {
        set({ currentBusiness: b, isLoading: false })
        get().fetchBusinessProducts(b.id)
      }
      return b
    } catch (err) {
      set({
        isLoading: false,
        error: err.response?.data?.message || `Erro ao buscar estabelecimento #${id}`,
      })
      return null
    }
  },

  /**
   * Busca os produtos de um estabelecimento em GET /business/{id}/products
   */
  fetchBusinessProducts: async (businessId) => {
    if (!businessId) {
      set({ products: [], isLoadingProducts: false })
      return []
    }

    set({ isLoadingProducts: true, productsError: null })
    try {
      const raw = await productService.listByBusiness(businessId)
      const normalized = (Array.isArray(raw) ? raw : []).map((p) => ({
        id: p.id,
        businessId: p.business_id || p.businessId || businessId,
        name: p.name || 'Produto sem nome',
        description: p.description || '',
        price: Number(p.price) || 0,
        imageUrl: p.image_url || p.imageUrl || '',
        image_url: p.image_url || p.imageUrl || '',
      }))

      set((state) => ({
        products: normalized,
        productsByBusinessId: {
          ...state.productsByBusinessId,
          [businessId]: normalized,
        },
        isLoadingProducts: false,
      }))

      return normalized
    } catch (err) {
      set({
        isLoadingProducts: false,
        productsError:
          err.response?.data?.message || 'Erro ao carregar produtos do estabelecimento',
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
      set({ currentBusiness: null, products: [] })
      return null
    }
    const normalizedParam = decodeURIComponent(nameParam).toLowerCase().trim()
    const found = businesses.find(
      (b) =>
        b.name?.toLowerCase().trim() === normalizedParam ||
        b.name?.toLowerCase().replace(/\s+/g, '-') === normalizedParam
    )
    set({ currentBusiness: found || null })

    if (found?.id) {
      get().fetchBusinessProducts(found.id)
    }

    return found || null
  },
}))
