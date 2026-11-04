import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { superadminService } from '../services/superadminService'

export const INITIAL_PLANS = [
  {
    id: 'trial',
    name: 'Trial Grátis',
    price: 0,
    billingPeriod: '7 dias',
    trialDays: 7,
    maxProducts: 15,
    description: 'Degustação completa para novos restaurantes conhecerem todas as funções.',
    badge: 'Experimente',
    status: 'active',
    features: [
      '7 dias de teste completo',
      'Até 15 produtos cadastrados',
      'Cardápio digital com QR Code',
      'Pedidos direto no WhatsApp',
      'Painel de pedidos em tempo real',
      'Suporte básico por chat',
    ],
  },
  {
    id: 'basico',
    name: 'Plano Básico',
    price: 49.0,
    billingPeriod: 'mês',
    trialDays: 0,
    maxProducts: 30,
    description: 'Perfeito para lanchonetes e operações enxutas no delivery próprio.',
    badge: null,
    status: 'active',
    features: [
      'Até 30 produtos cadastrados',
      'Cardápio digital mobile first',
      'Gestão de bairros e taxas de entrega',
      'Alerta sonoro e impressão de pedidos',
      'Pagamentos PIX e na entrega',
      'Suporte via WhatsApp em horário comercial',
    ],
  },
  {
    id: 'pro',
    name: 'Plano Pro',
    price: 99.0,
    billingPeriod: 'mês',
    trialDays: 0,
    maxProducts: 100,
    description: 'O mais escolhido por hamburguerias, pizzarias e restaurantes consolidados.',
    badge: 'Mais Popular',
    status: 'active',
    features: [
      'Até 100 produtos cadastrados',
      'Grupos de complementos ilimitados',
      'Sistema de cupons de desconto',
      'Relatórios financeiros e exportação',
      'Links personalizados e domínio próprio',
      'Suporte prioritário 7 dias por semana',
    ],
  },
  {
    id: 'enterprise',
    name: 'Plano Ilimitado',
    price: 199.0,
    billingPeriod: 'mês',
    trialDays: 0,
    maxProducts: null, // Ilimitado
    description: 'Operação de alta escala sem qualquer trava ou limite de produtos.',
    badge: 'Sem Limites',
    status: 'active',
    features: [
      'Produtos e categorias ilimitados',
      'Múltiplos operadores simultâneos',
      'Integração com API e Webhooks',
      'Taxa zero sobre pedidos',
      'Atendimento VIP com gerente de contas',
      'Backup diário e SLA 99.9%',
    ],
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

      // Base de empresas zerada para que apenas empresas cadastradas apareçam
      companies: [],
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
      name: 'delivery_superadmin_store_v3',
      partialize: (state) => ({
        companies: state.companies,
        plans: state.plans,
        adminProfile: state.adminProfile,
      }),
    }
  )
)
