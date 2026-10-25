import { create } from 'zustand'
import { formatTitleCase } from '../utils/textUtils'

const STORAGE_KEY = 'delivery_admin_store_v3'

const DEFAULT_CATEGORIES = [
  { id: 'cat-populares', name: 'Populares', order: 1, status: 'active', icon: '🔥' },
  { id: 'cat-lanches', name: 'Lanches Artesanais', order: 2, status: 'active', icon: '🍔' },
  { id: 'cat-bebidas', name: 'Bebidas & Sucos', order: 3, status: 'active', icon: '🥤' },
]

const DEFAULT_TEMPLATES = [
  {
    id: 'tmpl-burger',
    name: '🍔 Hambúrgueres (Ponto & Adicionais)',
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
    name: '🍕 Pizzas (Bordas & Massas)',
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
    name: '🍧 Açaí (Acompanhamentos)',
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
    name: '🚫 Nenhum (Sem adicionais / Bebida)',
    desc: 'Sem adicionais, vai direto para a sacola',
    groups: [],
  },
]

const DEFAULT_PRODUCTS = [
  {
    id: 'item-1',
    name: 'Brasa da Casa',
    categoryId: 'cat-populares',
    templateId: 'tmpl-burger',
    price: 34.9,
    oldPrice: null,
    desc: 'Blend 180 g, cheddar, cebola caramelizada e maionese da casa.',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    available: true,
    order: 1,
    badge: 'MAIS PEDIDO',
  },
  {
    id: 'item-2',
    name: 'Duplo Smash',
    categoryId: 'cat-populares',
    templateId: 'tmpl-burger',
    price: 39.9,
    oldPrice: null,
    desc: 'Dois smashs, cheddar duplo, picles e nosso molho especial.',
    image:
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    available: true,
    order: 2,
    badge: null,
  },
  {
    id: 'item-3',
    name: 'Batata Rústica Especial',
    categoryId: 'cat-populares',
    templateId: 'tmpl-none',
    price: 19.9,
    oldPrice: null,
    desc: 'Douradinha, com alecrim, flor de sal e aioli de alho assado.',
    image:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    available: true,
    order: 3,
    badge: null,
  },
  {
    id: 'item-4',
    name: 'Double Cheddar Smash',
    categoryId: 'cat-lanches',
    templateId: 'tmpl-burger',
    price: 38.9,
    oldPrice: null,
    desc: 'Dois smash burgers, cheddar derretido, picles e maionese no brioche.',
    image:
      'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    available: true,
    order: 1,
    badge: null,
  },
  {
    id: 'item-5',
    name: 'Clássico Salada Brasa',
    categoryId: 'cat-lanches',
    templateId: 'tmpl-burger',
    price: 32.9,
    oldPrice: null,
    desc: 'Hambúrguer 180 g na brasa, queijo prato, alface americana, tomate e molho especial.',
    image:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    available: true,
    order: 2,
    badge: null,
  },
  {
    id: 'item-6',
    name: 'Bacon BBQ Defumado',
    categoryId: 'cat-lanches',
    templateId: 'tmpl-burger',
    price: 41.9,
    oldPrice: null,
    desc: 'Blend 180 g, fatias de bacon crocante, queijo cheddar, onion rings e barbecue da casa.',
    image:
      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
    available: true,
    order: 3,
    badge: null,
  },
  {
    id: 'item-7',
    name: 'Coca-Cola Lata 350ml',
    categoryId: 'cat-bebidas',
    templateId: 'tmpl-none',
    price: 6.9,
    oldPrice: null,
    desc: 'Lata 350ml trincando de gelada.',
    image:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    available: true,
    order: 1,
    badge: null,
  },
  {
    id: 'item-8',
    name: 'Suco Natural de Laranja 500ml',
    categoryId: 'cat-bebidas',
    templateId: 'tmpl-none',
    price: 12.9,
    oldPrice: null,
    desc: 'Feito na hora com laranjas selecionadas, sem adição de conservantes.',
    image:
      'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    available: true,
    order: 2,
    badge: null,
  },
]

export const DEFAULT_COUPONS = [
  {
    id: 'cupom-1',
    code: 'PRIMEIRACOMPRA',
    discountPercent: 10,
    active: true,
    targetType: 'all',
    targetCategoryId: null,
    targetCategoryName: '',
    targetProductIds: [],
    targetProductNames: [],
    createdAt: '2026-01-01',
  },
  {
    id: 'cupom-2',
    code: 'DIADOBURGER',
    discountPercent: 15,
    active: true,
    targetType: 'category',
    targetCategoryId: 'cat-lanches',
    targetCategoryName: 'Lanches Artesanais',
    targetProductIds: [],
    targetProductNames: [],
    createdAt: '2026-01-01',
  },
  {
    id: 'cupom-3',
    code: 'PROMOBRASA',
    discountPercent: 20,
    active: true,
    targetType: 'product',
    targetCategoryId: null,
    targetCategoryName: '',
    targetProductIds: ['item-1'],
    targetProductNames: ['Brasa da Casa'],
    createdAt: '2026-01-01',
  },
]

const DEFAULT_SCHEDULE = [
  { id: 'seg', name: 'Segunda-feira', shortName: 'Seg', open: true, start: '18:00', end: '23:30' },
  { id: 'ter', name: 'Terça-feira', shortName: 'Ter', open: true, start: '18:00', end: '23:30' },
  { id: 'qua', name: 'Quarta-feira', shortName: 'Qua', open: true, start: '18:00', end: '23:30' },
  { id: 'qui', name: 'Quinta-feira', shortName: 'Qui', open: true, start: '18:00', end: '23:30' },
  { id: 'sex', name: 'Sexta-feira', shortName: 'Sex', open: true, start: '18:00', end: '00:00' },
  { id: 'sab', name: 'Sábado', shortName: 'Sáb', open: true, start: '18:00', end: '00:30' },
  { id: 'dom', name: 'Domingo', shortName: 'Dom', open: true, start: '18:00', end: '23:30' },
]

export const DEFAULT_NEIGHBORHOODS = [
  { id: 'nb-centro', name: 'Centro', fee: 3.0, active: true },
  { id: 'nb-jd-america', name: 'Jardim América', fee: 4.0, active: true },
  { id: 'nb-vila-nova', name: 'Vila Nova', fee: 5.0, active: true },
  { id: 'nb-bela-vista', name: 'Bela Vista', fee: 5.0, active: true },
  { id: 'nb-alto-boa-vista', name: 'Alto da Boa Vista', fee: 6.0, active: true },
  { id: 'nb-distrito-industrial', name: 'Distrito Industrial', fee: 8.0, active: false },
]

export const DEFAULT_DELIVERY_CONFIG = {
  pricingMode: 'by_neighborhood', // 'fixed' | 'by_neighborhood'
  fixedFee: 5.0,
  estimatedDelivery: '40 - 50 min',
  estimatedPickup: '20 - 30 min',
  allowPickup: true,
  minOrder: 15.0,
}

export const DEFAULT_PAYMENT_CONFIG = {
  methods: {
    money: true,
    pix: true,
    credit: true,
    debit: true,
  },
  pix: {
    keyType: 'cnpj', // 'cnpj' | 'cpf' | 'email' | 'phone' | 'random'
    key: '00.000.000/0001-00',
    beneficiary: 'Brasa Burger',
  },
}

/**
 * Calcula o status real de atendimento da loja (automático vs pausas manuais)
 */
export function calculateStoreLiveStatus(schedule = [], timezone = 'America/Sao_Paulo', statusMode = 'auto') {
  // Sempre descobre o horário programado para o dia de hoje
  let formattedHours = '18:00 às 23:30'
  try {
    const dayMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
    const now = new Date()
    const todayIndex = now.getDay()
    const todayId = dayMap[todayIndex]
    const todaySchedule = Array.isArray(schedule) ? schedule.find((d) => d.id === todayId) : null
    if (todaySchedule && todaySchedule.open) {
      formattedHours = `${todaySchedule.start || '18:00'} às ${todaySchedule.end || '23:30'}`
    } else if (todaySchedule && !todaySchedule.open) {
      formattedHours = 'Sem expediente hoje'
    }
  } catch {
    formattedHours = '18:00 às 23:30'
  }

  if (statusMode === 'paused') {
    return {
      isOpen: false,
      mode: 'paused',
      badge: 'Pausa Temporária',
      label: 'Fechado Temporariamente',
      subtext: 'Pausa acionada manualmente no painel',
      clientTag: 'Fechado temporariamente',
      variant: 'paused',
      todayHours: formattedHours,
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
      todayHours: formattedHours,
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
        todayHours: 'Fechado hoje',
      }
    }

    const start = todaySchedule.start || '18:00'
    const end = todaySchedule.end || '23:30'
    const formattedHours = `${start} às ${end}`

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
        todayHours: formattedHours,
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
        todayHours: formattedHours,
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
      if (!Array.isArray(parsed.neighborhoods) || parsed.neighborhoods.length === 0) {
        parsed.neighborhoods = DEFAULT_NEIGHBORHOODS
      }
      if (!Array.isArray(parsed.categories) || parsed.categories.length === 0) {
        parsed.categories = DEFAULT_CATEGORIES
      }
      if (!Array.isArray(parsed.products) || parsed.products.length === 0) {
        parsed.products = DEFAULT_PRODUCTS
      }
      if (!Array.isArray(parsed.coupons) || parsed.coupons.length === 0) {
        parsed.coupons = DEFAULT_COUPONS
      }
      if (!parsed.deliveryConfig) {
        parsed.deliveryConfig = DEFAULT_DELIVERY_CONFIG
      } else {
        parsed.deliveryConfig = { ...DEFAULT_DELIVERY_CONFIG, ...parsed.deliveryConfig }
      }
      if (!parsed.paymentConfig) {
        parsed.paymentConfig = DEFAULT_PAYMENT_CONFIG
      } else {
        parsed.paymentConfig = {
          methods: {
            ...DEFAULT_PAYMENT_CONFIG.methods,
            ...(parsed.paymentConfig.methods || {}),
          },
          pix: {
            ...DEFAULT_PAYMENT_CONFIG.pix,
            ...(parsed.paymentConfig.pix || {}),
          },
        }
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
    deliveryConfig: DEFAULT_DELIVERY_CONFIG,
    neighborhoods: DEFAULT_NEIGHBORHOODS,
    paymentConfig: DEFAULT_PAYMENT_CONFIG,
    coupons: DEFAULT_COUPONS,
  }
}

const initial = loadInitialState()

export const useStoreAdmin = create((set, get) => ({
  activeTab: 'pedidos',
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
  deliveryConfig: initial.deliveryConfig || DEFAULT_DELIVERY_CONFIG,
  neighborhoods: initial.neighborhoods || DEFAULT_NEIGHBORHOODS,
  paymentConfig: initial.paymentConfig || DEFAULT_PAYMENT_CONFIG,
  coupons: initial.coupons || DEFAULT_COUPONS,

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

  // Gestão de Bairros & Taxas de Entrega
  updateDeliveryConfig: (partial) => {
    set((state) => ({
      deliveryConfig: { ...state.deliveryConfig, ...partial },
    }))
    get().persist()
  },

  setDeliveryPricingMode: (mode) => {
    set((state) => ({
      deliveryConfig: { ...state.deliveryConfig, pricingMode: mode },
    }))
    get().persist()
  },

  addNeighborhood: ({ name, fee, active = true }) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return false

    const newNeighborhood = {
      id: `nb-${Date.now()}`,
      name: trimmed,
      fee: Math.max(0, Number(fee) || 0),
      active: active !== false,
    }

    set((state) => ({
      neighborhoods: [...state.neighborhoods, newNeighborhood],
    }))
    get().persist()
    return true
  },

  updateNeighborhood: (id, partial) => {
    set((state) => ({
      neighborhoods: state.neighborhoods.map((n) =>
        n.id === id
          ? {
              ...n,
              ...partial,
              name: partial.name !== undefined ? partial.name.trim() : n.name,
              fee:
                partial.fee !== undefined
                  ? Math.max(0, Number(partial.fee) || 0)
                  : n.fee,
            }
          : n
      ),
    }))
    get().persist()
  },

  toggleNeighborhoodActive: (id) => {
    set((state) => ({
      neighborhoods: state.neighborhoods.map((n) =>
        n.id === id ? { ...n, active: !n.active } : n
      ),
    }))
    get().persist()
  },

  deleteNeighborhood: (id) => {
    set((state) => ({
      neighborhoods: state.neighborhoods.filter((n) => n.id !== id),
    }))
    get().persist()
  },

  setFullNeighborhoods: (newList) => {
    set({ neighborhoods: newList })
    get().persist()
  },

  // Pagamentos & Chave PIX
  updatePaymentMethods: (partial) => {
    set((state) => ({
      paymentConfig: {
        ...state.paymentConfig,
        methods: { ...state.paymentConfig.methods, ...partial },
      },
    }))
    get().persist()
  },

  togglePaymentMethod: (methodKey) => {
    set((state) => ({
      paymentConfig: {
        ...state.paymentConfig,
        methods: {
          ...state.paymentConfig.methods,
          [methodKey]: !state.paymentConfig.methods[methodKey],
        },
      },
    }))
    get().persist()
  },

  updatePixConfig: (partial) => {
    set((state) => ({
      paymentConfig: {
        ...state.paymentConfig,
        pix: { ...state.paymentConfig.pix, ...partial },
      },
    }))
    get().persist()
  },

  // Gestão de Cupons de Desconto
  addCoupon: ({
    code,
    discountPercent,
    active = true,
    targetType = 'all',
    targetCategoryId = null,
    targetCategoryName = '',
    targetProductIds = [],
    targetProductNames = [],
  }) => {
    const trimmedCode = (code || '').trim().toUpperCase()
    if (!trimmedCode) return { error: 'O código do cupom é obrigatório.' }

    const existing = get().coupons || []
    if (existing.some((c) => c.code === trimmedCode)) {
      return { error: 'Já existe um cupom cadastrado com este código.' }
    }

    const newCoupon = {
      id: `cupom-${Date.now()}`,
      code: trimmedCode,
      discountPercent: Math.min(100, Math.max(1, Number(discountPercent) || 10)),
      active: active !== false,
      targetType: targetType || 'all',
      targetCategoryId: targetType === 'category' ? targetCategoryId : null,
      targetCategoryName: targetType === 'category' ? targetCategoryName || '' : '',
      targetProductIds:
        targetType === 'product'
          ? Array.isArray(targetProductIds)
            ? targetProductIds
            : []
          : [],
      targetProductNames:
        targetType === 'product'
          ? Array.isArray(targetProductNames)
            ? targetProductNames
            : []
          : [],
      createdAt: new Date().toISOString(),
    }

    set({ coupons: [newCoupon, ...existing] })
    get().persist()
    return { success: true, coupon: newCoupon }
  },

  updateCoupon: (id, partial) => {
    set((state) => ({
      coupons: (state.coupons || []).map((c) => {
        if (c.id !== id) return c
        return {
          ...c,
          ...partial,
          code: partial.code ? partial.code.trim().toUpperCase() : c.code,
          discountPercent:
            partial.discountPercent !== undefined
              ? Math.min(100, Math.max(1, Number(partial.discountPercent) || 10))
              : c.discountPercent,
        }
      }),
    }))
    get().persist()
  },

  toggleCouponActive: (id) => {
    set((state) => ({
      coupons: (state.coupons || []).map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      ),
    }))
    get().persist()
  },

  deleteCoupon: (id) => {
    set((state) => ({
      coupons: (state.coupons || []).filter((c) => c.id !== id),
    }))
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
        deliveryConfig: state.deliveryConfig,
        neighborhoods: state.neighborhoods,
        paymentConfig: state.paymentConfig,
        coupons: state.coupons,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      console.warn('Falha ao persistir dados administrativos:', e)
    }
  },

  reloadFromStorage: () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        set((state) => ({ ...state, ...parsed }))
      }
    } catch (e) {
      console.warn('Falha ao recarregar dados do localStorage:', e)
    }
  },
}))
