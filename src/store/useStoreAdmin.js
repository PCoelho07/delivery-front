import { create } from 'zustand'
import { formatTitleCase } from '../utils/textUtils'

const STORAGE_KEY = 'delivery_admin_store_v3'

const DEFAULT_CATEGORIES = []

const DEFAULT_TEMPLATES = [
  {
    id: 'tmpl-burger',
    name: '🍔 Template Hambúrguer',
    desc: 'Ponto da carne, adicionais pagos e preferências sem ingrediente',
    groupsCount: 3,
  },
  {
    id: 'tmpl-pizza',
    name: '🍕 Template Pizza',
    desc: 'Bordas recheadas e tipo de massa',
    groupsCount: 2,
  },
  {
    id: 'tmpl-acai',
    name: '🍧 Template Açaí',
    desc: 'Tamanho e acompanhamentos grátis',
    groupsCount: 2,
  },
  {
    id: 'tmpl-none',
    name: '🚫 Nenhum (Item Simples / Bebida)',
    desc: 'Sem adicionais, vai direto para a sacola',
    groupsCount: 0,
  },
]

const DEFAULT_PRODUCTS = []

const loadInitialState = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.warn('Erro ao carregar dados administrativos do localStorage:', error)
  }

  return {
    isStoreOpen: true,
    soundEnabled: true,
    storeInfo: {
      name: 'Brasa Burger',
      slug: 'brasa-burger',
      phone: '(00) 00000-0000',
      whatsapp: '5500000000000',
      instagram: '@brasaburger',
      minOrder: 25.00,
      estimatedDelivery: '40 - 50 min',
      estimatedPickup: '20 - 30 min',
    },
    categories: DEFAULT_CATEGORIES,
    templates: DEFAULT_TEMPLATES,
    products: DEFAULT_PRODUCTS,
  }
}

const initial = loadInitialState()

export const useStoreAdmin = create((set, get) => ({
  activeTab: 'cardapio',
  isMobileSidebarOpen: false,
  isStoreOpen: initial.isStoreOpen ?? true,
  soundEnabled: initial.soundEnabled ?? true,
  storeInfo: initial.storeInfo,
  categories: initial.categories || DEFAULT_CATEGORIES,
  templates: initial.templates || DEFAULT_TEMPLATES,
  products: initial.products || DEFAULT_PRODUCTS,

  // Navegação
  setActiveTab: (tab) => set({ activeTab: tab, isMobileSidebarOpen: false }),
  setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),

  // Status da Loja
  toggleStoreOpen: () => {
    const next = !get().isStoreOpen
    set({ isStoreOpen: next })
    get().persist()
  },
  setStoreOpen: (isOpen) => {
    set({ isStoreOpen: isOpen })
    get().persist()
  },
  toggleSound: () => {
    const next = !get().soundEnabled
    set({ soundEnabled: next })
    get().persist()
  },

  // Dados da Loja
  updateStoreInfo: (partial) => {
    set((state) => ({
      storeInfo: { ...state.storeInfo, ...partial },
    }))
    get().persist()
  },

  // Gestão de Categorias
  addCategory: ({ name, order, status }) => {
    const existing = [...get().categories].sort(
      (a, b) => (a.order !== b.order ? a.order - b.order : a.id - b.id)
    )
    const requestedOrder = Math.max(1, Number(order) || existing.length + 1)
    const insertIndex = Math.min(requestedOrder - 1, existing.length)

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: formatTitleCase(name),
      order: requestedOrder,
      status: status || 'active',
    }

    // Empurra a categoria existente para frente caso a ordem já esteja ocupada
    existing.splice(insertIndex, 0, newCategory)
    existing.forEach((c, idx) => {
      c.order = idx + 1
    })

    set({ categories: existing })
    get().persist()
    return newCategory
  },

  updateCategory: (id, partial) => {
    const currentCat = get().categories.find((c) => c.id === id)
    if (!currentCat) return

    const existing = get()
      .categories.filter((c) => c.id !== id)
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.id - b.id))

    const updatedCat = {
      ...currentCat,
      ...partial,
      name:
        partial.name !== undefined
          ? formatTitleCase(partial.name)
          : currentCat.name,
    }
    const requestedOrder = Math.max(
      1,
      Number(partial.order ?? currentCat.order) || existing.length + 1
    )
    const insertIndex = Math.min(requestedOrder - 1, existing.length)

    existing.splice(insertIndex, 0, updatedCat)
    existing.forEach((c, idx) => {
      c.order = idx + 1
    })

    set({ categories: existing })
    get().persist()
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      // Move produtos da categoria excluída para a primeira categoria restante
      products: state.products.map((p) =>
        p.categoryId === id ? { ...p, categoryId: state.categories[0]?.id || '' } : p
      ),
    }))
    get().persist()
  },

  toggleCategoryStatus: (id) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
          : c
      ),
    }))
    get().persist()
  },

  reorderCategory: (id, direction) => {
    const list = [...get().categories].sort((a, b) => a.order - b.order)
    const index = list.findIndex((c) => c.id === id)
    const targetIndex = index + direction
    if (targetIndex >= 0 && targetIndex < list.length) {
      const current = list[index]
      const target = list[targetIndex]
      const tempOrder = current.order
      current.order = target.order
      target.order = tempOrder

      set({ categories: [...list] })
      get().persist()
    }
  },

  // Gestão de Produtos
  addProduct: (productData) => {
    const existingInCat = get()
      .products.filter((p) => p.categoryId === productData.categoryId)
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.id - b.id))

    const requestedOrder = Math.max(
      1,
      Number(productData.order) || existingInCat.length + 1
    )
    const insertIndex = Math.min(requestedOrder - 1, existingInCat.length)

    const newProduct = {
      id: Date.now(),
      name: formatTitleCase(productData.name),
      categoryId: productData.categoryId,
      templateId: productData.templateId || 'tmpl-none',
      price: Number(productData.price) || 0,
      oldPrice: null,
      desc: productData.desc?.trim() || '',
      image:
        productData.image?.trim() ||
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      available: productData.available ?? true,
      order: requestedOrder,
      badge: productData.badge || null,
    }

    // Insere na posição desejada (empurra os itens posteriores para a próxima posição)
    existingInCat.splice(insertIndex, 0, newProduct)

    // Reindexa 1, 2, 3...
    existingInCat.forEach((p, idx) => {
      p.order = idx + 1
    })

    const otherProducts = get().products.filter(
      (p) => p.categoryId !== productData.categoryId
    )

    set({
      products: [...otherProducts, ...existingInCat],
    })
    get().persist()
    return newProduct
  },

  updateProduct: (id, partial) => {
    const currentProd = get().products.find((p) => p.id === id)
    if (!currentProd) return

    const targetCategoryId = partial.categoryId || currentProd.categoryId

    const updatedProd = {
      ...currentProd,
      ...partial,
      name:
        partial.name !== undefined
          ? formatTitleCase(partial.name)
          : currentProd.name,
      price:
        partial.price !== undefined ? Number(partial.price) : currentProd.price,
    }

    const catProds = get()
      .products.filter((p) => p.categoryId === targetCategoryId && p.id !== id)
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.id - b.id))

    const requestedOrder = Math.max(
      1,
      Number(partial.order ?? currentProd.order) || catProds.length + 1
    )
    const insertIndex = Math.min(requestedOrder - 1, catProds.length)

    catProds.splice(insertIndex, 0, updatedProd)
    catProds.forEach((p, idx) => {
      p.order = idx + 1
    })

    const otherProducts = get().products.filter(
      (p) => p.categoryId !== targetCategoryId && p.id !== id
    )

    set({
      products: [...otherProducts, ...catProds],
    })
    get().persist()
  },

  deleteProduct: (id) => {
    const prodToDelete = get().products.find((p) => p.id === id)
    set((state) => {
      const remaining = state.products.filter((p) => p.id !== id)
      if (!prodToDelete) return { products: remaining }

      // Renormaliza a ordem dos produtos restantes desta categoria (1, 2, 3...)
      const catProds = remaining
        .filter((p) => p.categoryId === prodToDelete.categoryId)
        .sort((a, b) => a.order - b.order)
      catProds.forEach((p, idx) => {
        p.order = idx + 1
      })

      return {
        products: remaining.map((p) => {
          const match = catProds.find((cp) => cp.id === p.id)
          return match ? { ...p, order: match.order } : p
        }),
      }
    })
    get().persist()
  },

  toggleProductAvailability: (id) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, available: !p.available } : p
      ),
    }))
    get().persist()
  },

  reorderProduct: (id, direction) => {
    const allProducts = get().products
    const prod = allProducts.find((p) => p.id === id)
    if (!prod) return

    // Lista ordenada dos produtos desta categoria
    const catProds = allProducts
      .filter((p) => p.categoryId === prod.categoryId)
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.id - b.id))

    // Garante que a sequência seja estritamente 1, 2, 3... (corrige duplicidades)
    catProds.forEach((p, idx) => {
      p.order = idx + 1
    })

    const currentIndex = catProds.findIndex((p) => p.id === id)
    const targetIndex = currentIndex + direction

    if (targetIndex >= 0 && targetIndex < catProds.length) {
      // Troca os números de ordem
      catProds[currentIndex].order = targetIndex + 1
      catProds[targetIndex].order = currentIndex + 1

      set((state) => ({
        products: state.products.map((p) => {
          const updated = catProds.find((cp) => cp.id === p.id)
          return updated ? { ...p, order: updated.order } : p
        }),
      }))
      get().persist()
    }
  },

  persist: () => {
    try {
      const state = get()
      const toSave = {
        isStoreOpen: state.isStoreOpen,
        soundEnabled: state.soundEnabled,
        storeInfo: state.storeInfo,
        categories: state.categories,
        templates: state.templates,
        products: state.products,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      console.warn('Falha ao persistir dados administrativos:', e)
    }
  },
}))
