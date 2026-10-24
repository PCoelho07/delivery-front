import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const INITIAL_COMPANIES = [
  {
    id: 1,
    name: 'Brasa Burguer',
    slug: 'brasaburguer',
    cnpj: '12.345.678/0001-90',
    phone: '(84) 99876-5432',
    owner: 'Lucas Silva',
    status: 'active', // active | trial | inactive
    plan: 'pro',
    planName: 'Plano Pro',
    price: 99.0,
    nextBilling: '28/10/2026',
    isPaid: true,
    daysLeft: 4,
    productsCount: 18,
    createdAt: '12/03/2026',
  },
  {
    id: 2,
    name: 'Pizzaria Bella Massa',
    slug: 'bellamassa',
    cnpj: '98.765.432/0001-11',
    phone: '(84) 98765-4321',
    owner: 'Mariana Costa',
    status: 'active',
    plan: 'pro',
    planName: 'Plano Pro',
    price: 99.0,
    nextBilling: '25/10/2026',
    isPaid: true,
    daysLeft: 1,
    productsCount: 32,
    createdAt: '01/04/2026',
  },
  {
    id: 3,
    name: 'Açaí Tropical Raiz',
    slug: 'acaitropical',
    cnpj: '45.123.789/0001-55',
    phone: '(84) 99112-3344',
    owner: 'Carlos Eduardo',
    status: 'trial',
    plan: 'trial',
    planName: 'Trial Grátis',
    price: 0.0,
    nextBilling: '29/10/2026',
    isPaid: true,
    daysLeft: 5,
    productsCount: 12,
    createdAt: '22/10/2026',
  },
  {
    id: 4,
    name: 'Sushi Zen Japanese',
    slug: 'sushizen',
    cnpj: '33.999.888/0001-22',
    phone: '(84) 99444-5566',
    owner: 'Renato Takahashi',
    status: 'active',
    plan: 'enterprise',
    planName: 'Plano Ilimitado',
    price: 199.0,
    nextBilling: '05/11/2026',
    isPaid: true,
    daysLeft: 12,
    productsCount: 45,
    createdAt: '15/01/2026',
  },
  {
    id: 5,
    name: 'Pastelaria do Beto',
    slug: 'pasteldobeto',
    cnpj: '77.888.999/0001-33',
    phone: '(84) 98888-2211',
    owner: 'Roberto Souza',
    status: 'inactive',
    plan: 'basico',
    planName: 'Plano Básico',
    price: 49.0,
    nextBilling: '18/10/2026',
    isPaid: false,
    daysLeft: -6,
    productsCount: 15,
    createdAt: '10/02/2026',
  },
  {
    id: 6,
    name: 'Café & Confeitaria Doce Vida',
    slug: 'doceda',
    cnpj: '11.222.333/0001-44',
    phone: '(84) 99777-6655',
    owner: 'Fabiana Lima',
    status: 'active',
    plan: 'basico',
    planName: 'Plano Básico',
    price: 49.0,
    nextBilling: '26/10/2026',
    isPaid: false,
    daysLeft: 2,
    productsCount: 24,
    createdAt: '20/05/2026',
  },
]

export const useSuperAdminStore = create(
  persist(
    (set) => ({
      activeTab: 'empresas', // empresas | assinaturas | perfil
      supportMode: false,
      impersonatedCompany: null,
      supportActiveTab: 'cardapio', // cardapio | horarios | entregas | pagamentos | loja
      isMobileSidebarOpen: false,

      companies: INITIAL_COMPANIES,

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

      addCompany: (newCompany) =>
        set((state) => ({
          companies: [newCompany, ...state.companies],
        })),

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
    }),
    {
      name: 'delivery_superadmin_store_v1',
    }
  )
)

