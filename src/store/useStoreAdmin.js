import { create } from 'zustand'
import { formatTitleCase } from '../utils/textUtils'

const STORAGE_KEY = 'delivery_admin_store_v3'

const DEFAULT_CATEGORIES = []

const DEFAULT_TEMPLATES = [
  {
    id: 'tmpl-burger',
    name: '🍔 Template Hambúrguer',
    desc: 'Ponto da carne, adicionais pagos e preferências',
    groups: [
      {
        id: 'grp-1',
        name: 'Ponto da Carne',
        required: true,
        min: 1,
        max: 1,
        items: [
          { id: 'it-1', name: 'Ao Ponto (Rosado e Suculento)', price: 0 },
          { id: 'it-2', name: 'Bem Passado', price: 0 },
          { id: 'it-3', name: 'Mal Passado', price: 0 },
        ],
      },
      {
        id: 'grp-2',
        name: 'Turbine seu Hambúrguer (Adicionais)',
        required: false,
        min: 0,
        max: 5,
        items: [
          { id: 'it-4', name: 'Bacon em Fatias Crocantes', price: 5.0 },
          { id: 'it-5', name: 'Queijo Cheddar Inglês Fatiado', price: 4.0 },
          { id: 'it-6', name: 'Hambúrguer Extra 160g', price: 12.0 },
        ],
      },
    ],
  },
  {
    id: 'tmpl-pizza',
    name: '🍕 Template Pizza',
    desc: 'Bordas recheadas e tipo de massa',
    groups: [
      {
        id: 'grp-p1',
        name: 'Borda Recheada',
        required: false,
        min: 0,
        max: 1,
        items: [
          { id: 'it-p1', name: 'Sem Borda Recheada', price: 0 },
          { id: 'it-p2', name: 'Borda de Catupiry Original', price: 10.0 },
          { id: 'it-p3', name: 'Borda de Cheddar Cremoso', price: 10.0 },
          { id: 'it-p4', name: 'Borda Vulcão 4 Queijos', price: 14.0 },
        ],
      },
    ],
  },
  {
    id: 'tmpl-acai',
    name: '🍧 Template Açaí',
    desc: 'Tamanho e acompanhamentos grátis',
    groups: [
      {
        id: 'grp-a1',
        name: 'Acompanhamentos Grátis (Escolha até 3)',
        required: false,
        min: 0,
        max: 3,
        items: [
          { id: 'it-a1', name: 'Leite Ninho', price: 0 },
          { id: 'it-a2', name: 'Granola Crocante', price: 0 },
          { id: 'it-a3', name: 'Banana Fatiada', price: 0 },
          { id: 'it-a4', name: 'Morango Fresco', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'tmpl-none',
    name: '🚫 Nenhum (Item Simples / Bebida)',
    desc: 'Sem adicionais, vai direto para a sacola',
    groups: [],
  },
]

const DEFAULT_PRODUCTS = []

const DEFAULT_SCHEDULE = [
  { id: 'seg', name: 'Segunda-feira', shortName: 'Seg', open: true, start: '18:00', end: '23:30' },
  { id: 'ter', name: 'Terça-feira', shortName: 'Ter', open: true, start: '18:00', end: '23:30' },
  { id: 'qua', name: 'Quarta-feira', shortName: 'Qua', open: true, start: '18:00', end: '23:30' },
  { id: 'qui', name: 'Quinta-feira', shortName: 'Qui', open: true, start: '18:00', end: '23:30' },
  { id: 'sex', name: 'Sexta-feira', shortName: 'Sex', open: true, start: '18:00', end: '00:00' },
  { id: 'sab', name: 'Sábado', shortName: 'Sáb', open: true, start: '18:00', end: '00:30' },
  { id: 'dom', name: 'Domingo', shortName: 'Dom', open: true, start: '18:00', end: '23:30' },
]

/**
 * Calcula o status real de atendimento da loja (automático vs pausas manuais)
 */
export function calculateStoreLiveStatus(schedule = [], timezone = 'America/Sao_Paulo', statusMode = 'auto') {
  if (statusMode === 'paused') {
    return {
      isOpen: false,
      mode: 'paused',
      badge: 'Pausa Temporária',
      label: 'Fechado Temporariamente',
      subtext: 'Pausa acionada manualmente no painel',
      clientTag: 'Fechado temporariamente',
      variant: 'paused',
    }
  }

  if (statusMode === 'forced_open') {
    return {
      isOpen: true,
      mode: 'forced_open',
      badge: 'Aberto (Manual)',
      label: 'Aberto Agora',
      subtext: 'Abertura manual fora do horário programado',
      clientTag: 'Aberto',
      variant: 'open',
    }
  }

  // Modo Automático: calcula com base no fuso horário e na grade da semana
  try {
    const dayMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const parts = formatter.formatToParts(now)
    const hourPart = parts.find((p) => p.type === 'hour')?.value || '00'
    const minutePart = parts.find((p) => p.type === 'minute')?.value || '00'
    const currentClock = `${hourPart}:${minutePart}`
    const todayIndex = now.getDay()
    const todayId = dayMap[todayIndex]
    const todaySchedule = schedule.find((d) => d.id === todayId)

    if (!todaySchedule || !todaySchedule.open) {
      return {
        isOpen: false,
        mode: 'auto',
        badge: 'Fechado Hoje',
        label: 'Fechado Hoje',
        subtext: 'Sem expediente programado para hoje',
        clientTag: 'Fechado',
        variant: 'closed',
      }
    }

    const start = todaySchedule.start || '18:00'
    const end = todaySchedule.end || '23:30'

    // Lógica para horário convencional vs madrugada (ex: 18:00 às 00:30)
    let inWindow = false
    if (start <= end) {
      inWindow = currentClock >= start && currentClock <= end
    } else {
      inWindow = currentClock >= start || currentClock <= end
    }

    if (inWindow) {
      return {
        isOpen: true,
        mode: 'auto',
        badge: 'Aberto Agora',
        label: 'Aberto (Automático)',
        subtext: `Atendimento hoje até às ${end}`,
        clientTag: 'Aberto',
        variant: 'open',
      }
    } else {
      return {
        isOpen: false,
        mode: 'auto',
        badge: 'Fechado',
        label: `Abre às ${start}`,
        subtext: `Fechado no momento (abre hoje às ${start})`,
        clientTag: 'Fechado',
        variant: 'closed',
      }
    }
  } catch (err) {
    console.warn('Erro ao calcular status ao vivo da loja:', err)
    return {
      isOpen: true,
      mode: 'auto',
      badge: 'Aberto',
      label: 'Aberto',
      subtext: 'Expediente programado',
      clientTag: 'Aberto',
      variant: 'open',
    }
  }
}

const loadInitialState = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed.templates)) {
        parsed.templates = parsed.templates.map((t) => {
          if (!Array.isArray(t.groups)) {
            const def = DEFAULT_TEMPLATES.find((dt) => dt.id === t.id)
            return def ? { ...def, ...t, groups: def.groups } : { ...t, groups: [] }
          }
          return t
        })
      }
      if (!Array.isArray(parsed.schedule) || parsed.schedule.length === 0) {
        parsed.schedule = DEFAULT_SCHEDULE
      }
      if (!parsed.timezone) {
        parsed.timezone = 'America/Sao_Paulo'
      }
      if (!parsed.storeStatusMode) {
        parsed.storeStatusMode = 'auto'
      }
      return parsed
    }
  } catch (error) {
    console.warn('Erro ao carregar dados administrativos do localStorage:', error)
  }

  return {
    isStoreOpen: true,
    storeStatusMode: 'auto',
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
    schedule: DEFAULT_SCHEDULE,
    timezone: 'America/Sao_Paulo',
  }
}

const initial = loadInitialState()

export const useStoreAdmin = create((set, get) => ({
  activeTab: 'cardapio',
  isMobileSidebarOpen: false,
  isStoreOpen: initial.isStoreOpen ?? true,
  storeStatusMode: initial.storeStatusMode || 'auto',
  soundEnabled: initial.soundEnabled ?? true,
  storeInfo: initial.storeInfo,
  categories: initial.categories || DEFAULT_CATEGORIES,
  templates: initial.templates || DEFAULT_TEMPLATES,
  products: initial.products || DEFAULT_PRODUCTS,
  schedule: initial.schedule || DEFAULT_SCHEDULE,
  timezone: initial.timezone || 'America/Sao_Paulo',

  // Fuso Horário
  setTimezone: (timezone) => {
    set({ timezone })
    get().persist()
  },

  // Navegação
  setActiveTab: (tab) => set({ activeTab: tab, isMobileSidebarOpen: false }),
  setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),

  // Status da Loja & Gatilho Manual de Emergência
  setStoreStatusMode: (mode) => {
    set({
      storeStatusMode: mode,
      isStoreOpen: mode === 'forced_open' || mode === 'auto',
    })
    get().persist()
  },
  pauseStoreTemporarily: () => {
    get().setStoreStatusMode('paused')
  },
  resumeAutoSchedule: () => {
    get().setStoreStatusMode('auto')
  },
  forceOpenStore: () => {
    get().setStoreStatusMode('forced_open')
  },
  toggleStoreOpen: () => {
    const currentMode = get().storeStatusMode
    const nextMode = currentMode === 'paused' ? 'auto' : 'paused'
    get().setStoreStatusMode(nextMode)
  },
  setStoreOpen: (isOpen) => {
    get().setStoreStatusMode(isOpen ? 'auto' : 'paused')
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

  // Gestão de Templates de Complementos
  addTemplate: (templateData) => {
    const newTemplate = {
      id: `tmpl-${Date.now()}`,
      name: formatTitleCase(templateData.name),
      desc: templateData.desc?.trim() || '',
      groups: (templateData.groups || []).map((grp, gIdx) => ({
        id: grp.id || `grp-${Date.now()}-${gIdx}`,
        name: formatTitleCase(grp.name),
        required: Boolean(grp.required),
        min: grp.required ? (Number(grp.min) || 1) : 0,
        max: Number(grp.max) || (grp.required ? 1 : 5),
        items: (grp.items || []).map((item, iIdx) => ({
          id: item.id || `it-${Date.now()}-${gIdx}-${iIdx}`,
          name: formatTitleCase(item.name),
          price: Math.max(0, parseFloat(String(item.price).replace(',', '.')) || 0),
        })),
      })),
    }

    set((state) => ({
      templates: [...state.templates, newTemplate],
    }))
    get().persist()
    return newTemplate
  },

  updateTemplate: (id, partial) => {
    set((state) => ({
      templates: state.templates.map((t) => {
        if (t.id !== id) return t
        return {
          ...t,
          name: partial.name ? formatTitleCase(partial.name) : t.name,
          desc: partial.desc !== undefined ? partial.desc.trim() : t.desc,
          groups: partial.groups
            ? partial.groups.map((grp, gIdx) => ({
                id: grp.id || `grp-${Date.now()}-${gIdx}`,
                name: formatTitleCase(grp.name),
                required: Boolean(grp.required),
                min: grp.required ? (Number(grp.min) || 1) : 0,
                max: Number(grp.max) || (grp.required ? 1 : 5),
                items: (grp.items || []).map((item, iIdx) => ({
                  id: item.id || `it-${Date.now()}-${gIdx}-${iIdx}`,
                  name: formatTitleCase(item.name),
                  price: Math.max(0, parseFloat(String(item.price).replace(',', '.')) || 0),
                })),
              }))
            : t.groups,
        }
      }),
    }))
    get().persist()
  },

  deleteTemplate: (id) => {
    if (id === 'tmpl-none') return // Template padrão neutro não pode ser excluído
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
      // Move produtos que usavam este template para 'tmpl-none'
      products: state.products.map((p) =>
        p.templateId === id ? { ...p, templateId: 'tmpl-none' } : p
      ),
    }))
    get().persist()
  },

  // Gestão de Horários da Semana
  updateDaySchedule: (dayId, partial) => {
    set((state) => ({
      schedule: state.schedule.map((d) =>
        d.id === dayId ? { ...d, ...partial } : d
      ),
    }))
    get().persist()
  },

  applyScheduleToAll: (start, end, open = true) => {
    set((state) => ({
      schedule: state.schedule.map((d) => ({
        ...d,
        open,
        start: start || d.start,
        end: end || d.end,
      })),
    }))
    get().persist()
  },

  applyScheduleToDays: (dayIds, start, end, open = true) => {
    set((state) => ({
      schedule: state.schedule.map((d) =>
        dayIds.includes(d.id)
          ? {
              ...d,
              open,
              start: start || d.start,
              end: end || d.end,
            }
          : d
      ),
    }))
    get().persist()
  },

  setFullSchedule: (newSchedule) => {
    set({ schedule: newSchedule })
    get().persist()
  },

  persist: () => {
    try {
      const state = get()
      const toSave = {
        isStoreOpen: state.isStoreOpen,
        storeStatusMode: state.storeStatusMode,
        soundEnabled: state.soundEnabled,
        storeInfo: state.storeInfo,
        categories: state.categories,
        templates: state.templates,
        products: state.products,
        schedule: state.schedule,
        timezone: state.timezone,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      console.warn('Falha ao persistir dados administrativos:', e)
    }
  },
}))
