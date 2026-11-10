import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { superadminService } from '../services/superadminService'
import { getPlanById } from '../utils/planRules'

export const INITIAL_PLANS = [
  {
    id: 'free',
    name: 'Plano Start',
    shortName: 'Start',
    price: 0,
    billingPeriod: 'mês',
    billingThreshold: 2500, // R$ 2.500/mês
    extraOrderFee: 1.0, // R$ 1,00 por pedido extra
    includedOrders: null,
    warningMargin: 100,
    status: 'active',
    badge: 'Grátis',
    description: 'Comece 100% grátis com faturamento até R$ 2.500/mês e 2 mensagens por pedido no WhatsApp.',
    features: [
      'Faturamento até R$ 2.500,00/mês',
      '2 mensagens automáticas por pedido no WhatsApp (infos do pedido e saiu p/ entrega)',
      'Cardápio digital mobile first completo',
      'PDV em tempo real e impressão térmica',
      'Taxa de excedente: R$ 1,00 por pedido extra',
    ],
  },
  {
    id: 'crescimento',
    name: 'Plano Express',
    shortName: 'Express',
    price: 49.9,
    billingPeriod: 'mês',
    billingThreshold: 6000, // R$ 6.000/mês
    extraOrderFee: 0.5, // R$ 0,50 por pedido extra
    includedOrders: null,
    warningMargin: 100,
    status: 'active',
    badge: 'Mais Escolhido',
    description: 'Para lojas em crescimento com faturamento entre R$ 2.501 e R$ 6.000/mês e 2 msgs por pedido no WhatsApp.',
    features: [
      'Faturamento de R$ 2.501 até R$ 6.000,00/mês',
      '2 mensagens automáticas por pedido no WhatsApp (infos do pedido e saiu p/ entrega)',
      'Todos os recursos de cardápio e gestão liberados',
      'Alerta automático de cota no painel',
      'Taxa de excedente: R$ 0,50 por pedido extra',
    ],
  },
  {
    id: 'escala',
    name: 'Plano Turbo',
    shortName: 'Turbo',
    price: 89.9,
    billingPeriod: 'mês',
    billingThreshold: null, // Ilimitado em faturamento
    extraOrderFee: 0.32, // R$ 0,32 por pedido extra
    includedOrders: 600, // Franquia viável de até 600 pedidos/mês (~1.200 msgs)
    warningMarginOrders: 50,
    status: 'active',
    badge: 'Alta Escala',
    description: 'Faturamento ilimitado. Viável até 600 pedidos/mês; acima disso taxa extra equilibra alto volume (ex: 1.000 pedidos).',
    features: [
      'Faturamento ilimitado (acima de R$ 6.000,00/mês)',
      '2 mensagens automáticas por pedido no WhatsApp (infos do pedido e saiu p/ entrega)',
      'Franquia base viável de até 600 pedidos/mês (~1.200 msgs inclusas)',
      'Taxa de excedente: R$ 0,32 por pedido extra acima de 600 (para operações de 1.000+ pedidos)',
      'Suporte prioritário e consultoria',
    ],
  },
]

export const INITIAL_COMPANIES = [
  {
    id: 'comp-1',
    name: 'Brasa Burger',
    slug: 'brasa-burger',
    cnpj: '45.123.456/0001-89',
    owner: 'Lucas Silva',
    phone: '(84) 99433-4789',
    planId: 'free',
    planName: 'Plano Start',
    price: 0,
    status: 'active',
    currentBilling: 2420.0,
    currentOrdersCount: 68,
    exceededOrdersCount: 0,
    daysLeft: 22,
    nextBilling: '01/12/2026',
    isPaid: true,
  },
  {
    id: 'comp-2',
    name: 'Bella Pizza Forneria',
    slug: 'bella-pizza',
    cnpj: '38.987.654/0001-12',
    owner: 'Juliana Costa',
    phone: '(84) 98877-6655',
    planId: 'crescimento',
    planName: 'Plano Express',
    price: 49.9,
    status: 'active',
    currentBilling: 6350.0,
    currentOrdersCount: 175,
    exceededOrdersCount: 14,
    daysLeft: 18,
    nextBilling: '27/11/2026',
    isPaid: true,
  },
  {
    id: 'comp-3',
    name: 'Sushizeira Premium',
    slug: 'sushizeira',
    cnpj: '51.222.333/0001-44',
    owner: 'Renato Takahashi',
    phone: '(84) 99111-2233',
    planId: 'escala',
    planName: 'Plano Turbo',
    price: 89.9,
    status: 'active',
    currentBilling: 28400.0,
    currentOrdersCount: 565,
    exceededOrdersCount: 0,
    daysLeft: 25,
    nextBilling: '04/12/2026',
    isPaid: true,
  },
  {
    id: 'comp-4',
    name: 'Mega Açaí & Sorvetes',
    slug: 'mega-acai',
    cnpj: '19.444.555/0001-09',
    owner: 'Carlos Eduardo',
    phone: '(84) 99666-5544',
    planId: 'escala',
    planName: 'Plano Turbo',
    price: 89.9,
    status: 'active',
    currentBilling: 34200.0,
    currentOrdersCount: 642,
    exceededOrdersCount: 42,
    daysLeft: 12,
    nextBilling: '21/11/2026',
    isPaid: true,
  },
]

export const useSuperAdminStore = create(
  persist(
    (set) => ({
      activeTab: 'empresas', // empresas | assinaturas | planos | perfil
      supportMode: false,
      impersonatedCompany: null,
      supportActiveTab: 'cardapio', // cardapio | horarios | entregas | pagamentos | loja
      isMobileSidebarOpen: false,

      // Base inicial com cenários representativos de planos e consumo
      companies: INITIAL_COMPANIES,
      plans: INITIAL_PLANS,

      adminProfile: {
        name: 'Master Admin',
        email: 'admin@numinstante.com',
        trialDays: 7,
        pixKey: 'financeiro@numinstante.com',
        supportPhone: '(84) 99999-8888',
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),

      setSupportActiveTab: (tab) => set({ supportActiveTab: tab }),

      startSupportMode: (company) =>
        set({
          supportMode: true,
          impersonatedCompany: company,
          supportActiveTab: 'cardapio',
        }),

      exitSupportMode: () =>
        set({
          supportMode: false,
          impersonatedCompany: null,
          activeTab: 'empresas',
        }),

      addCompany: (newCompany) => {
        set((state) => ({
          companies: [newCompany, ...state.companies],
        }))
        superadminService
          .createCompany({
            name: newCompany.name,
            phone: newCompany.phone,
            email: newCompany.email,
            cnpj: newCompany.cnpj,
          })
          .catch(() => {})
      },

      fetchCompaniesFromApi: async () => {
        try {
          const list = await superadminService.listCompanies()
          if (Array.isArray(list) && list.length > 0) {
            set((state) => {
              const existingIds = new Set(list.map((comp) => String(comp.id)))
              const localsNotRemote = state.companies.filter((comp) => !existingIds.has(String(comp.id)))
              return { companies: [...list, ...localsNotRemote] }
            })
          }
        } catch (e) {
          console.warn('Erro ao carregar empresas do Go backend:', e)
        }
      },

      setCompanies: (companiesList) =>
        set({
          companies: Array.isArray(companiesList) ? companiesList : [],
        }),

      clearCompanies: () =>
        set({
          companies: [],
        }),

      toggleCompanyStatus: (id) =>
        set((state) => ({
          companies: state.companies.map((c) => {
            if (c.id !== id) return c
            const nextStatus = c.status === 'inactive' ? 'active' : 'inactive'
            return {
              ...c,
              status: nextStatus,
            }
          }),
        })),

      changeCompanyPlan: (companyId, newPlanId) =>
        set((state) => ({
          companies: state.companies.map((c) => {
            if (c.id !== companyId) return c
            const plan = getPlanById(newPlanId)
            return {
              ...c,
              planId: plan.id,
              planName: plan.name,
            }
          }),
        })),

      updateCompanyMetrics: (companyId, partialMetrics) =>
        set((state) => ({
          companies: state.companies.map((c) => {
            if (c.id !== companyId) return c
            return {
              ...c,
              ...partialMetrics,
            }
          }),
        })),

      markSubscriptionPaid: (id) =>
        set((state) => ({
          companies: state.companies.map((c) => {
            if (c.id !== id) return c
            return {
              ...c,
              isPaid: true,
              status: 'active',
              daysLeft: 30,
              nextBilling: '24/11/2026',
            }
          }),
        })),

      updateAdminProfile: (partial) =>
        set((state) => ({
          adminProfile: { ...state.adminProfile, ...partial },
        })),

      // Gestão de Planos da Plataforma
      addPlan: (newPlan) =>
        set((state) => ({
          plans: [...(state.plans || INITIAL_PLANS), newPlan],
        })),

      updatePlan: (id, updatedFields) =>
        set((state) => ({
          plans: (state.plans || INITIAL_PLANS).map((p) =>
            p.id === id ? { ...p, ...updatedFields } : p
          ),
        })),

      togglePlanStatus: (id) =>
        set((state) => ({
          plans: (state.plans || INITIAL_PLANS).map((p) => {
            if (p.id !== id) return p
            return {
              ...p,
              status: p.status === 'inactive' ? 'active' : 'inactive',
            }
          }),
        })),

      deletePlan: (id) =>
        set((state) => ({
          plans: (state.plans || INITIAL_PLANS).filter((p) => p.id !== id),
        })),

      resetPlansToDefault: () =>
        set({
          plans: INITIAL_PLANS,
        }),
    }),
    {
      name: 'delivery_superadmin_store_v5',
      version: 5,
      migrate: (persistedState, version) => {
        if (!persistedState || version < 5 || !persistedState.plans || !persistedState.plans.some((p) => p.id === 'escala')) {
          return {
            ...persistedState,
            plans: INITIAL_PLANS,
            companies: INITIAL_COMPANIES,
          }
        }
        return persistedState
      },
      partialize: (state) => ({
        companies: state.companies,
        plans: state.plans,
        adminProfile: state.adminProfile,
      }),
    }
  )
)
