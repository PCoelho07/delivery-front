import { create } from 'zustand'
import { formatTitleCase } from '../utils/textUtils'
import { ordersWebSocket } from '../services/ordersWebSocket'
import { storeService } from '../services/storeService'
import { menuService } from '../services/menuService'
import { operationService } from '../services/operationService'
import { couponService } from '../services/couponService'

export const STORAGE_KEY = 'delivery_admin_store_v4'

const LEGACY_STORAGE_KEYS = [
  'delivery_admin_store',
  'delivery_admin_store_v1',
  'delivery_admin_store_v2',
  'delivery_admin_store_v3',
  'delivery_customer_store_v1',
  'delivery_customer_store_v2',
]

function cleanupLegacyStorageKeys() {
  if (typeof window === 'undefined' || !window.localStorage) return
  LEGACY_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignorar
    }
  })
}

cleanupLegacyStorageKeys()

const TAB_SENDER_ID = `admin-tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
let adminBroadcastChannel = null

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    adminBroadcastChannel = new BroadcastChannel('delivery_admin_store_sync')
  } catch {
    adminBroadcastChannel = null
  }
}

// Lista de Fusos Horários Brasileiros suportados
export const BRAZIL_TIMEZONES = [
  {
    id: 'America/Sao_Paulo',
    label: 'Horário de Brasília (SP, RJ, MG, PR, SC, RS, GO, DF, BA, CE, PE, RN, PB, AL, SE, PI, MA, PA, TO, AP)',
    shortLabel: 'Brasília (GMT-3)',
  },
  {
    id: 'America/Manaus',
    label: 'Horário do Amazonas / Mato Grosso (AM, RR, RO, MT, MS)',
    shortLabel: 'Amazonas / MT (GMT-4)',
  },
  {
    id: 'America/Rio_Branco',
    label: 'Horário do Acre (AC e Sudoeste do AM)',
    shortLabel: 'Acre (GMT-5)',
  },
  {
    id: 'America/Noronha',
    label: 'Fernando de Noronha (PE)',
    shortLabel: 'Noronha (GMT-2)',
  },
]

export const DEFAULT_CATEGORIES = [
  {
    id: 'cat-hamburgueres',
    name: 'Hambúrgueres Artesanais',
    order: 1,
    status: 'active',
  },
  {
    id: 'cat-porcoes',
    name: 'Porções & Acompanhamentos',
    order: 2,
    status: 'active',
  },
  {
    id: 'cat-bebidas',
    name: 'Bebidas Geladas',
    order: 3,
    status: 'active',
  },
  {
    id: 'cat-sobremesas',
    name: 'Sobremesas Deliciosas',
    order: 4,
    status: 'active',
  },
]

export const DEFAULT_TEMPLATES = [
  {
    id: 'tmpl-none',
    name: '🚫 Nenhum (Sem adicionais / Bebida)',
    desc: 'Sem adicionais, vai direto para a sacola',
    groups: [],
  },
  {
    id: 'tmpl-burger',
    name: '🍔 Personalização de Hambúrguer',
    desc: 'Ponto da carne e adicionais especiais',
    groups: [
      {
        id: 'grp-ponto',
        name: 'Ponto da Carne',
        required: true,
        min: 1,
        max: 1,
        items: [
          { id: 'it-ponto-1', name: 'Ao Ponto (Suculento e rosado)', price: '0' },
          { id: 'it-ponto-2', name: 'Bem Passado (Sem ponto rosado)', price: '0' },
          { id: 'it-ponto-3', name: 'Ao Ponto para Mal (Centro vermelho)', price: '0' },
        ],
      },
      {
        id: 'grp-turbinar',
        name: 'Turbine seu Burger',
        required: false,
        min: 0,
        max: 5,
        items: [
          { id: 'it-add-1', name: 'Bacon Artesanal Crocante (+4 fatias)', price: '5.50' },
          { id: 'it-add-2', name: 'Queijo Cheddar Cremoso Extra', price: '4.00' },
          { id: 'it-add-3', name: 'Queijo Coalho Grelhado', price: '6.00' },
          { id: 'it-add-4', name: 'Ovo Estalado com Gema Mole', price: '3.50' },
          { id: 'it-add-5', name: 'Maionese Especial Defumada (Pote 50ml)', price: '3.00' },
        ],
      },
    ],
  },
]

export const DEFAULT_PRODUCTS = [
  // 1. Hambúrgueres Artesanais
  {
    id: 101,
    name: 'X-Burger Artesanal Brasa',
    categoryId: 'cat-hamburgueres',
    templateId: 'tmpl-burger',
    price: 29.90,
    desc: 'Pão brioche tostado na manteiga, blend especial 160g na brasa, queijo cheddar derretido, cebola caramelizada e maionese defumada.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 1,
    badge: 'Mais Vendido',
    isUpsell: false,
  },
  {
    id: 102,
    name: 'Smash Burger Duplo Bacon',
    categoryId: 'cat-hamburgueres',
    templateId: 'tmpl-burger',
    price: 34.90,
    desc: 'Dois blends smash prensados de 90g com crostinha crocante, queijo prato derretido duplo, muito bacon artesanal e molho especial.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 2,
    badge: 'Favorito',
    isUpsell: false,
  },
  {
    id: 103,
    name: 'Chicken Crispy Supreme',
    categoryId: 'cat-hamburgueres',
    templateId: 'tmpl-burger',
    price: 28.50,
    desc: 'Sobrecoxa de frango empanada super crocante no tempero secreto, alface americana fresca, picles artesanal e maionese verde de ervas.',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 3,
    badge: 'Crocante',
    isUpsell: false,
  },
  {
    id: 104,
    name: 'Monster Brasa Costela 200g',
    categoryId: 'cat-hamburgueres',
    templateId: 'tmpl-burger',
    price: 42.00,
    desc: 'Hambúrguer de costela bovina 200g, queijo monterey jack maçaricado, bacon crocante, barbecue de goiabada e anéis de cebola crispy.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 4,
    badge: 'Premium',
    isUpsell: false,
  },

  // 2. Porções & Acompanhamentos
  {
    id: 201,
    name: 'Batata Rústica com Cheddar & Bacon',
    categoryId: 'cat-porcoes',
    templateId: 'tmpl-none',
    price: 21.90,
    desc: 'Batatas rústicas crocantes por fora e macias por dentro, cobertas com cheddar cremoso e farofa de bacon crocante.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 1,
    badge: 'Top Acompanhamento',
    isUpsell: true,
  },
  {
    id: 202,
    name: 'Onion Rings Crocantes (12 un)',
    categoryId: 'cat-porcoes',
    templateId: 'tmpl-none',
    price: 18.00,
    desc: 'Anéis de cebola empanados e sequinhos, servidos com molho barbecue defumado.',
    image: 'https://images.unsplash.com/photo-1639024471285-0af50858e475?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 2,
    badge: null,
    isUpsell: false,
  },
  {
    id: 203,
    name: 'Dadinhos de Tapioca com Geleia (10 un)',
    categoryId: 'cat-porcoes',
    templateId: 'tmpl-none',
    price: 22.00,
    desc: 'Dadinhos crocantes de queijo coalho e tapioca granulada, servidos com geleia de pimenta agridoce.',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 3,
    badge: 'Artesanal',
    isUpsell: false,
  },

  // 3. Bebidas Geladas
  {
    id: 301,
    name: 'Coca-Cola Original Lata 350ml',
    categoryId: 'cat-bebidas',
    templateId: 'tmpl-none',
    price: 6.50,
    desc: 'Lata 350ml estupidamente gelada para acompanhar seu lanche.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 1,
    badge: 'Geladinha',
    isUpsell: true,
  },
  {
    id: 302,
    name: 'Coca-Cola Sem Açúcar Lata 350ml',
    categoryId: 'cat-bebidas',
    templateId: 'tmpl-none',
    price: 6.50,
    desc: 'Lata 350ml zero calorias bem gelada.',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 2,
    badge: null,
    isUpsell: false,
  },
  {
    id: 303,
    name: 'Guaraná Antarctica Lata 350ml',
    categoryId: 'cat-bebidas',
    templateId: 'tmpl-none',
    price: 6.00,
    desc: 'O sabor autêntico do Brasil, lata 350ml trincando de gelada.',
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 3,
    badge: null,
    isUpsell: false,
  },
  {
    id: 304,
    name: 'Suco Natural de Laranja 500ml',
    categoryId: 'cat-bebidas',
    templateId: 'tmpl-none',
    price: 9.90,
    desc: 'Feito na hora com laranjas selecionadas, sem adição de água nem açúcar.',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 4,
    badge: '100% Natural',
    isUpsell: false,
  },
  {
    id: 305,
    name: 'Cerveja Heineken Long Neck 330ml',
    categoryId: 'cat-bebidas',
    templateId: 'tmpl-none',
    price: 11.00,
    desc: 'Cerveja puro malte Premium, 330ml bem gelada.',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 5,
    badge: '+18',
    isUpsell: false,
  },

  // 4. Sobremesas Deliciosas
  {
    id: 401,
    name: 'Pudim de Leite Condensado da Vovó',
    categoryId: 'cat-sobremesas',
    templateId: 'tmpl-none',
    price: 12.90,
    desc: 'Textura aveludada e cremosa com calda de caramelo dourada brilhante. Porção individual de 140g.',
    image: 'https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 1,
    badge: 'Sem Furinhos',
    isUpsell: true,
  },
  {
    id: 402,
    name: 'Brownie Quente com Nutella & Nozes',
    categoryId: 'cat-sobremesas',
    templateId: 'tmpl-none',
    price: 16.50,
    desc: 'Brownie macio por dentro e com casquinha crocante, recheado com nozes e coberto com Nutella pura.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 2,
    badge: 'Chocolate Belga',
    isUpsell: false,
  },
  {
    id: 403,
    name: 'Milkshake de Morango com Chantilly 400ml',
    categoryId: 'cat-sobremesas',
    templateId: 'tmpl-none',
    price: 19.90,
    desc: 'Batido com sorvete artesanal de morango, pedaços de fruta fresca e generosa cobertura de chantilly.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
    available: true,
    order: 3,
    badge: 'Cremoso',
    isUpsell: false,
  },
]

export const DEFAULT_SCHEDULE = [
  { id: 'seg', dayIndex: 1, day: 'Segunda-feira', short: 'Seg', open: true, start: '11:00', end: '23:59' },
  { id: 'ter', dayIndex: 2, day: 'Terça-feira', short: 'Ter', open: true, start: '11:00', end: '23:59' },
  { id: 'qua', dayIndex: 3, day: 'Quarta-feira', short: 'Qua', open: true, start: '11:00', end: '23:59' },
  { id: 'qui', dayIndex: 4, day: 'Quinta-feira', short: 'Qui', open: true, start: '11:00', end: '23:59' },
  { id: 'sex', dayIndex: 5, day: 'Sexta-feira', short: 'Sex', open: true, start: '11:00', end: '23:59' },
  { id: 'sab', dayIndex: 6, day: 'Sábado', short: 'Sáb', open: true, start: '11:00', end: '23:59' },
  { id: 'dom', dayIndex: 0, day: 'Domingo', short: 'Dom', open: true, start: '11:00', end: '23:59' },
]

export const DEFAULT_DELIVERY_CONFIG = {
  pricingMode: 'by_neighborhood', // 'fixed' | 'by_neighborhood'
  fixedFee: 0,
  minOrder: 15.0,
  estimatedDelivery: '30 - 45 min',
  estimatedPickup: '20 - 30 min',
  createdAt: '2026-01-01T00:00:00.000Z',
  allowPickup: true,
}

export const DEFAULT_NEIGHBORHOODS = [
  { id: 'bairro-1', name: 'Centro', fee: 4.0, estimatedTime: '25 - 35 min', active: true },
  { id: 'bairro-2', name: 'Jardim América', fee: 6.0, estimatedTime: '30 - 45 min', active: true },
  { id: 'bairro-3', name: 'Vila Nova', fee: 7.5, estimatedTime: '35 - 50 min', active: true },
  { id: 'bairro-4', name: 'Bela Vista', fee: 5.0, estimatedTime: '30 - 40 min', active: true },
]

export const DEFAULT_PAYMENT_CONFIG = {
  methods: {
    money: true,
    pix: true,
    credit: true,
    debit: true,
  },
  pix: {
    keyType: 'cnpj', // 'cnpj' | 'cpf' | 'phone' | 'email' | 'random'
    key: '12.345.678/0001-90',
    beneficiary: 'Brasa Burger Delivery Ltda',
  },
}

export const DEFAULT_COUPONS = [
  {
    id: 'cupom-primeira-compra',
    code: 'BEMVINDO10',
    discountPercent: 10,
    targetType: 'all',
    active: true,
  },
  {
    id: 'cupom-burgers',
    code: 'BURGER15',
    discountPercent: 15,
    targetType: 'category',
    targetCategoryId: 'cat-hamburgueres',
    targetCategoryName: 'Hambúrgueres Artesanais',
    active: true,
  },
]

/**
 * Converte string "HH:MM" em total de minutos desde 00:00
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/**
 * Calcula em tempo real se a loja está aberta ou fechada com base em:
 * 1) Gatilho manual de emergência (storeStatusMode: 'paused' | 'forced_open' | 'auto')
 * 2) Fuso horário configurado (ex: 'America/Sao_Paulo')
 * 3) Grade de horários da semana (incluindo virada de meia-noite ex: 18:00 às 02:00)
 */
export function calculateStoreLiveStatus(
  schedule = DEFAULT_SCHEDULE,
  timezone = 'America/Sao_Paulo',
  storeStatusMode = 'auto'
) {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || 'America/Sao_Paulo',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    const parts = formatter.formatToParts(now)
    const partMap = {}
    parts.forEach((p) => {
      partMap[p.type] = p.value
    })

    const weekdayMap = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    }

    const currentDayIndex = weekdayMap[partMap.weekday] ?? now.getDay()
    const currentHour = parseInt(partMap.hour, 10) % 24
    const currentMinute = parseInt(partMap.minute, 10) || 0
    const currentMinutes = currentHour * 60 + currentMinute
    const currentTimeFormatted = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

    const todaySchedule =
      schedule.find((d) => d.dayIndex === currentDayIndex) || schedule[0]

    const prevDayIndex = (currentDayIndex + 6) % 7
    const yesterdaySchedule = schedule.find((d) => d.dayIndex === prevDayIndex)

    // 1. Verifica se ainda estamos no turno da madrugada de ontem (ex: ontem abriu 18:00 até 02:00)
    let isOpenBySchedule = false
    let activeShiftText = todaySchedule?.open
      ? `${todaySchedule.start} às ${todaySchedule.end}`
      : 'Fechado hoje'

    if (yesterdaySchedule && yesterdaySchedule.open) {
      const yStart = parseTimeToMinutes(yesterdaySchedule.start)
      const yEnd = parseTimeToMinutes(yesterdaySchedule.end)
      if (yEnd < yStart && currentMinutes <= yEnd) {
        isOpenBySchedule = true
        activeShiftText = `${yesterdaySchedule.start} às ${yesterdaySchedule.end}`
      }
    }

    // 2. Verifica o horário do dia atual
    if (!isOpenBySchedule && todaySchedule && todaySchedule.open) {
      const tStart = parseTimeToMinutes(todaySchedule.start)
      const tEnd = parseTimeToMinutes(todaySchedule.end)

      if (tEnd >= tStart) {
        // Turno normal no mesmo dia (ex: 18:00 às 23:30)
        if (currentMinutes >= tStart && currentMinutes <= tEnd) {
          isOpenBySchedule = true
        }
      } else {
        // Turno que atravessa a meia-noite (ex: 18:00 às 02:00)
        if (currentMinutes >= tStart) {
          isOpenBySchedule = true
        }
      }
    }

    // 3. Aplica o modo de operação (Auto vs Pausado Manualmente vs Forçado Aberto)
    if (storeStatusMode === 'paused') {
      return {
        isOpen: false,
        mode: 'paused',
        badge: 'Pausado Manualmente',
        label: 'Fechado Temporariamente',
        subtext: 'Vendas pausadas pelo gestor',
        todayHours: activeShiftText,
        currentTimeFormatted,
        todaySchedule,
      }
    }

    if (storeStatusMode === 'forced_open') {
      return {
        isOpen: true,
        mode: 'forced_open',
        badge: 'Aberto Manualmente',
        label: 'Aberto agora',
        subtext: `Horário livre ativado (${activeShiftText})`,
        todayHours: activeShiftText,
        currentTimeFormatted,
        todaySchedule,
      }
    }

    // Modo Automático (segue rigorosamente a tabela de horários)
    return {
      isOpen: isOpenBySchedule,
      mode: 'auto',
      badge: isOpenBySchedule ? 'Aberto (Automático)' : 'Fechado (Fora do Horário)',
      label: isOpenBySchedule ? 'Aberto agora' : 'Fechado no momento',
      subtext: todaySchedule?.open
        ? `Hoje das ${todaySchedule.start} às ${todaySchedule.end}`
        : 'Não abrimos hoje',
      todayHours: activeShiftText,
      currentTimeFormatted,
      todaySchedule,
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

function normalizeStorePayload(parsed) {
  if (!parsed || typeof parsed !== 'object') return null
  const next = { ...parsed }

  if (!Array.isArray(next.templates) || next.templates.length === 0) {
    next.templates = DEFAULT_TEMPLATES
  } else {
    next.templates = next.templates.map((t) => ({
      ...t,
      groups: Array.isArray(t.groups) ? t.groups : [],
    }))
    const hasBurgerTmpl = next.templates.some((t) => t.id === 'tmpl-burger')
    if (!hasBurgerTmpl) {
      const burgerTmpl = DEFAULT_TEMPLATES.find((t) => t.id === 'tmpl-burger')
      if (burgerTmpl) next.templates.push(burgerTmpl)
    }
  }
  if (!Array.isArray(next.schedule) || next.schedule.length === 0 || next.schedule.every((s) => !s.open)) {
    next.schedule = DEFAULT_SCHEDULE
  }
  if (!next.timezone) {
    next.timezone = 'America/Sao_Paulo'
  }
  if (!next.storeStatusMode) {
    next.storeStatusMode = 'auto'
  }
  if (!Array.isArray(next.neighborhoods) || next.neighborhoods.length === 0) {
    next.neighborhoods = DEFAULT_NEIGHBORHOODS
  }
  if (!Array.isArray(next.categories) || next.categories.length === 0) {
    next.categories = DEFAULT_CATEGORIES
  }
  if (!Array.isArray(next.products) || next.products.length === 0) {
    next.products = DEFAULT_PRODUCTS
  }
  if (!Array.isArray(next.coupons) || next.coupons.length === 0) {
    next.coupons = DEFAULT_COUPONS
  }
  if (!next.deliveryConfig) {
    next.deliveryConfig = DEFAULT_DELIVERY_CONFIG
  } else {
    next.deliveryConfig = { ...DEFAULT_DELIVERY_CONFIG, ...next.deliveryConfig }
  }
  if (!next.paymentConfig) {
    next.paymentConfig = DEFAULT_PAYMENT_CONFIG
  } else {
    next.paymentConfig = {
      methods: {
        ...DEFAULT_PAYMENT_CONFIG.methods,
        ...(next.paymentConfig.methods || {}),
      },
      pix: {
        ...DEFAULT_PAYMENT_CONFIG.pix,
        ...(next.paymentConfig.pix || {}),
      },
    }
  }
  return next
}

const loadInitialState = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed = normalizeStorePayload(JSON.parse(cached))
      if (parsed) return parsed
    }
  } catch (error) {
    console.warn('Erro ao carregar dados administrativos do localStorage:', error)
  }

  return {
    updatedAt: 0,
    isStoreOpen: true,
    storeStatusMode: 'auto',
    soundEnabled: true,
    storeInfo: {
      name: 'Brasa Burger',
      slug: 'brasa-burger',
      corporateName: 'Brasa Burger Comércio de Alimentos Ltda',
      cnpj: '12.345.678/0001-90',
      subtitle: 'Hambúrguer artesanal · Feito na brasa',
      phone: '(11) 98765-4321',
      whatsapp: '5511987654321',
      instagram: '@brasaburger',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      logoUrl: '',
      bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
      minOrder: 15.0,
      estimatedDelivery: '30 - 45 min',
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
  updatedAt: initial.updatedAt || 0,
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
      (a, b) => (a.order !== b.order ? a.order - b.order : String(a.id).localeCompare(String(b.id)))
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
    try {
      ordersWebSocket?.broadcastCategoryCreated?.(newCategory)
    } catch {
      // safe fallback
    }
    return newCategory
  },

  updateCategory: (id, partial) => {
    const currentCat = get().categories.find((c) => String(c.id) === String(id))
    if (!currentCat) return

    const existing = get()
      .categories.filter((c) => String(c.id) !== String(id))
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : String(a.id).localeCompare(String(b.id))))

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
    try {
      ordersWebSocket?.broadcastCategoryUpdated?.(updatedCat)
    } catch {
      // safe fallback
    }
  },

  deleteCategory: (id) => {
    set((state) => {
      const remainingCategories = state.categories.filter(
        (c) => String(c.id) !== String(id)
      )
      const fallbackCatId = remainingCategories[0]?.id || ''
      return {
        categories: remainingCategories,
        // Se ainda houver outra categoria, move os produtos; se não houver nenhuma, remove os órfãos
        products: fallbackCatId
          ? state.products.map((p) =>
              String(p.categoryId) === String(id)
                ? { ...p, categoryId: fallbackCatId }
                : p
            )
          : state.products.filter((p) => String(p.categoryId) !== String(id)),
      }
    })
    get().persist()
    try {
      ordersWebSocket?.broadcastCategoryDeleted?.(id)
    } catch {
      // safe fallback
    }
  },

  moveProductsAndDeleteCategory: (categoryId, targetCategoryId) => {
    const productsToMove = get().products.filter(
      (p) => String(p.categoryId) === String(categoryId)
    )
    set((state) => {
      const remainingCategories = state.categories.filter(
        (c) => String(c.id) !== String(categoryId)
      )
      // Renormaliza a ordem das categorias
      remainingCategories
        .sort((a, b) => a.order - b.order)
        .forEach((c, idx) => {
          c.order = idx + 1
        })

      // Move os produtos da categoria apagada para a categoria de destino
      const updatedProducts = state.products.map((p) => {
        if (String(p.categoryId) === String(categoryId)) {
          return { ...p, categoryId: targetCategoryId }
        }
        return p
      })

      return {
        categories: remainingCategories,
        products: updatedProducts,
      }
    })
    get().persist()

    try {
      ordersWebSocket?.broadcastCategoryDeleted?.(categoryId)
      productsToMove.forEach((p) => {
        ordersWebSocket?.broadcastMenuItemUpdated?.({
          ...p,
          categoryId: targetCategoryId,
        })
      })
    } catch {
      // safe fallback
    }
  },

  deleteCategoryAndProducts: (categoryId) => {
    const prodsToDelete = get().products.filter(
      (p) => String(p.categoryId) === String(categoryId)
    )
    set((state) => {
      const remainingCategories = state.categories.filter(
        (c) => String(c.id) !== String(categoryId)
      )
      remainingCategories
        .sort((a, b) => a.order - b.order)
        .forEach((c, idx) => {
          c.order = idx + 1
        })

      const remainingProducts = state.products.filter(
        (p) => String(p.categoryId) !== String(categoryId)
      )

      return {
        categories: remainingCategories,
        products: remainingProducts,
      }
    })
    get().persist()

    try {
      ordersWebSocket?.broadcastCategoryDeleted?.(categoryId)
      prodsToDelete.forEach((p) => {
        ordersWebSocket?.broadcastMenuItemDeleted?.(p.id, categoryId)
      })
    } catch {
      // safe fallback
    }
  },

  toggleCategoryStatus: (id) => {
    let updated = null
    set((state) => ({
      categories: state.categories.map((c) => {
        if (String(c.id) === String(id)) {
          updated = { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
          return updated
        }
        return c
      }),
    }))
    get().persist()
    if (updated) {
      try {
        ordersWebSocket?.broadcastCategoryUpdated?.(updated)
      } catch {
        // safe fallback
      }
    }
  },

  reorderCategory: (id, direction) => {
    const list = [...get().categories].sort((a, b) => a.order - b.order)
    const index = list.findIndex((c) => String(c.id) === String(id))
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
    const targetCatId =
      productData.categoryId || get().categories[0]?.id || ''
    const existingInCat = get()
      .products.filter((p) => String(p.categoryId) === String(targetCatId))
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : Number(a.id) - Number(b.id)))

    const requestedOrder = Math.max(
      1,
      Number(productData.order) || existingInCat.length + 1
    )
    const insertIndex = Math.min(requestedOrder - 1, existingInCat.length)

    const newProduct = {
      id: Date.now(),
      name: formatTitleCase(productData.name),
      categoryId: targetCatId,
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
      isUpsell: Boolean(productData.isUpsell),
    }

    // Insere na posição desejada (empurra os itens posteriores para a próxima posição)
    existingInCat.splice(insertIndex, 0, newProduct)

    // Reindexa 1, 2, 3...
    existingInCat.forEach((p, idx) => {
      p.order = idx + 1
    })

    const otherProducts = get().products.filter(
      (p) => String(p.categoryId) !== String(targetCatId)
    )

    set({
      products: [...otherProducts, ...existingInCat],
    })
    get().persist()
    try {
      ordersWebSocket?.broadcastMenuItemCreated?.(newProduct)
    } catch {
      // safe fallback
    }
    return newProduct
  },

  updateProduct: (id, partial) => {
    const currentProd = get().products.find((p) => String(p.id) === String(id))
    if (!currentProd) return

    const targetCategoryId = partial.categoryId || currentProd.categoryId

    const updatedProd = {
      ...currentProd,
      ...partial,
      categoryId: targetCategoryId,
      name:
        partial.name !== undefined
          ? formatTitleCase(partial.name)
          : currentProd.name,
      price:
        partial.price !== undefined ? Number(partial.price) : currentProd.price,
      isUpsell:
        partial.isUpsell !== undefined
          ? Boolean(partial.isUpsell)
          : currentProd.isUpsell ?? false,
      badge:
        partial.badge !== undefined
          ? (partial.badge?.trim() || null)
          : (currentProd.badge || null),
    }

    const catProds = get()
      .products.filter(
        (p) =>
          String(p.categoryId) === String(targetCategoryId) &&
          String(p.id) !== String(id)
      )
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : Number(a.id) - Number(b.id)))

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
      (p) =>
        String(p.categoryId) !== String(targetCategoryId) &&
        String(p.id) !== String(id)
    )

    set({
      products: [...otherProducts, ...catProds],
    })
    get().persist()
    try {
      ordersWebSocket?.broadcastMenuItemUpdated?.(updatedProd)
    } catch {
      // safe fallback
    }
  },

  deleteProduct: (id) => {
    const prodToDelete = get().products.find((p) => String(p.id) === String(id))
    set((state) => {
      const remaining = state.products.filter((p) => String(p.id) !== String(id))
      if (!prodToDelete) return { products: remaining }

      // Renormaliza a ordem dos produtos restantes desta categoria (1, 2, 3...)
      const catProds = remaining
        .filter((p) => String(p.categoryId) === String(prodToDelete.categoryId))
        .sort((a, b) => a.order - b.order)
      catProds.forEach((p, idx) => {
        p.order = idx + 1
      })

      return {
        products: remaining.map((p) => {
          const match = catProds.find((cp) => String(cp.id) === String(p.id))
          return match ? { ...p, order: match.order } : p
        }),
      }
    })
    get().persist()
    if (prodToDelete) {
      try {
        ordersWebSocket?.broadcastMenuItemDeleted?.(id, prodToDelete.categoryId)
      } catch {
        // safe fallback
      }
    }
  },

  toggleProductAvailability: (id) => {
    let updated = null
    set((state) => ({
      products: state.products.map((p) => {
        if (String(p.id) === String(id)) {
          updated = { ...p, available: !p.available }
          return updated
        }
        return p
      }),
    }))
    get().persist()
    if (updated) {
      try {
        ordersWebSocket?.broadcastMenuItemUpdated?.(updated)
      } catch {
        // safe fallback
      }
    }
  },

  toggleProductUpsell: (id) => {
    let updated = null
    set((state) => ({
      products: state.products.map((p) => {
        if (String(p.id) === String(id)) {
          updated = { ...p, isUpsell: !p.isUpsell }
          return updated
        }
        return p
      }),
    }))
    get().persist()
    if (updated) {
      try {
        ordersWebSocket?.broadcastMenuItemUpdated?.(updated)
      } catch {
        // safe fallback
      }
    }
    return updated
  },

  reorderProduct: (id, direction) => {
    const allProducts = get().products
    const prod = allProducts.find((p) => String(p.id) === String(id))
    if (!prod) return

    // Lista ordenada dos produtos desta categoria
    const catProds = allProducts
      .filter((p) => String(p.categoryId) === String(prod.categoryId))
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : Number(a.id) - Number(b.id)))

    // Garante que a sequência seja estritamente 1, 2, 3... (corrige duplicidades)
    catProds.forEach((p, idx) => {
      p.order = idx + 1
    })

    const currentIndex = catProds.findIndex((p) => String(p.id) === String(id))
    const targetIndex = currentIndex + direction

    if (targetIndex >= 0 && targetIndex < catProds.length) {
      // Troca os números de ordem
      catProds[currentIndex].order = targetIndex + 1
      catProds[targetIndex].order = currentIndex + 1

      set((state) => ({
        products: state.products.map((p) => {
          const updated = catProds.find((cp) => String(cp.id) === String(p.id))
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

  getSerializableState: () => {
    const state = get()
    return {
      updatedAt: state.updatedAt || Date.now(),
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
  },

  persist: () => {
    const now = Date.now()
    set({ updatedAt: now })
    const toSave = {
      ...get().getSerializableState(),
      updatedAt: now,
    }

    // 1. Persiste no localStorage (limpando chaves antigas caso haja limite de quota)
    try {
      cleanupLegacyStorageKeys()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      console.warn('Falha ao persistir dados administrativos no localStorage:', e)
    }

    // 2. Sincroniza imediatamente entre abas abertas no mesmo navegador via BroadcastChannel
    if (adminBroadcastChannel) {
      try {
        adminBroadcastChannel.postMessage({
          _senderId: TAB_SENDER_ID,
          payload: toSave,
        })
      } catch {
        // ignorar
      }
    }

    // 3. Sincroniza com o servidor de desenvolvimento (permite sincronizar entre localhost e IP na rede local / mobile)
    if (typeof fetch === 'function') {
      fetch('/__store_sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      }).catch(() => {
        // Ignora silenciosamente em produção caso o endpoint não exista
      })
    }
  },

  pushToServer: () => {
    const toSave = get().getSerializableState()
    if (
      typeof fetch === 'function' &&
      (toSave.categories?.length > 0 ||
        toSave.products?.length > 0 ||
        toSave.updatedAt > 0)
    ) {
      fetch('/__store_sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      }).catch(() => {})
    }
  },

  syncFromServer: async () => {
    if (typeof fetch !== 'function') return
    try {
      const res = await fetch('/__store_sync', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (!data || data.empty) return

      const normalized = normalizeStorePayload(data)
      if (!normalized) return

      const localUpdatedAt = get().updatedAt || 0
      const remoteUpdatedAt = normalized.updatedAt || 0
      const localIsEmpty =
        (get().categories?.length || 0) === 0 &&
        (get().products?.length || 0) === 0
      const remoteHasData =
        (normalized.categories?.length || 0) > 0 ||
        (normalized.products?.length || 0) > 0

      if (
        remoteUpdatedAt > localUpdatedAt ||
        (localIsEmpty && remoteHasData)
      ) {
        set((state) => ({ ...state, ...normalized }))
        try {
          cleanupLegacyStorageKeys()
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
        } catch {
          // ignorar
        }
      }
    } catch {
      // Ignora silenciosamente
    }
  },


  syncWithBackendApi: async (businessId = 1) => {
    try {
      const [
        profileRes,
        categoriesRes,
        productsRes,
        templatesRes,
        scheduleRes,
        deliveryRes,
        paymentsRes,
        couponsRes,
      ] = await Promise.allSettled([
        storeService.getBusinessProfile(businessId),
        menuService.listCategories(businessId),
        menuService.listProducts(businessId),
        menuService.listTemplates(businessId),
        operationService.getSchedule(businessId),
        operationService.getDeliveryConfig(businessId),
        operationService.getPaymentConfig(businessId),
        couponService.listCoupons(businessId),
      ])

      const updates = {}

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        updates.storeInfo = {
          ...get().storeInfo,
          ...profileRes.value,
        }
      }

      if (
        categoriesRes.status === 'fulfilled' &&
        Array.isArray(categoriesRes.value) &&
        categoriesRes.value.length > 0
      ) {
        updates.categories = categoriesRes.value.map((c) => ({
          ...c,
          status: c.active !== false ? 'active' : 'inactive',
        }))
      }

      if (
        productsRes.status === 'fulfilled' &&
        Array.isArray(productsRes.value) &&
        productsRes.value.length > 0
      ) {
        updates.products = productsRes.value.map((p) => ({
          ...p,
          desc: p.description || p.desc || '',
          image: p.imageUrl || p.image || '',
          oldPrice: p.promotionalPrice || p.oldPrice || null,
        }))
      }

      if (
        templatesRes.status === 'fulfilled' &&
        Array.isArray(templatesRes.value) &&
        templatesRes.value.length > 0
      ) {
        updates.templates = templatesRes.value
      }

      if (scheduleRes.status === 'fulfilled' && scheduleRes.value) {
        if (scheduleRes.value.days) {
          updates.schedule = scheduleRes.value.days
        }
        if (scheduleRes.value.timezone) {
          updates.timezone = scheduleRes.value.timezone
        }
        if (scheduleRes.value.statusMode) {
          updates.storeStatusMode = scheduleRes.value.statusMode
        }
      }

      if (deliveryRes.status === 'fulfilled' && deliveryRes.value) {
        updates.deliveryConfig = {
          ...get().deliveryConfig,
          pricingMode: deliveryRes.value.pricingMode || get().deliveryConfig.pricingMode,
          fixedFee: deliveryRes.value.fixedFee ?? get().deliveryConfig.fixedFee,
          estimatedDelivery: deliveryRes.value.estimatedDelivery || get().deliveryConfig.estimatedDelivery,
          estimatedPickup: deliveryRes.value.estimatedPickup || get().deliveryConfig.estimatedPickup,
          allowPickup: deliveryRes.value.allowPickup ?? get().deliveryConfig.allowPickup,
        }
        if (Array.isArray(deliveryRes.value.neighborhoods) && deliveryRes.value.neighborhoods.length > 0) {
          updates.neighborhoods = deliveryRes.value.neighborhoods
        }
      }

      if (paymentsRes.status === 'fulfilled' && paymentsRes.value) {
        updates.paymentConfig = {
          ...get().paymentConfig,
          ...paymentsRes.value,
        }
      }

      if (
        couponsRes.status === 'fulfilled' &&
        Array.isArray(couponsRes.value) &&
        couponsRes.value.length > 0
      ) {
        updates.coupons = couponsRes.value
      }

      if (Object.keys(updates).length > 0) {
        set((state) => ({ ...state, ...updates }))
        get().persist()
      }
    } catch (err) {
      console.warn('Erro ao sincronizar com backend Go:', err)
    }
  },

  reloadFromStorage: () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = normalizeStorePayload(JSON.parse(cached))
        if (parsed) {
          set((state) => ({ ...state, ...parsed }))
        }
      }
    } catch (e) {
      console.warn('Falha ao recarregar dados do localStorage:', e)
    }
  },

  loadSampleData: () => {
    set({
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
      templates: DEFAULT_TEMPLATES,
      neighborhoods: DEFAULT_NEIGHBORHOODS,
      coupons: DEFAULT_COUPONS,
      schedule: DEFAULT_SCHEDULE,
      storeStatusMode: 'auto',
      isStoreOpen: true,
      updatedAt: Date.now(),
    })
    get().persist()
  },
}))

if (adminBroadcastChannel) {
  adminBroadcastChannel.onmessage = (event) => {
    const msg = event.data
    if (msg && msg._senderId !== TAB_SENDER_ID && msg.payload) {
      const normalized = normalizeStorePayload(msg.payload)
      if (normalized) {
        useStoreAdmin.setState((state) => ({ ...state, ...normalized }))
      }
    }
  }
}
