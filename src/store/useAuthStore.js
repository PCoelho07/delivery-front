import { create } from 'zustand'

const STORAGE_KEY = 'delivery_auth_session_v1'

function loadInitialAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return {
    isAuthenticated: true, // Ativo por padrão para desenvolvimento e testes
    user: {
      id: 'usr-lojista-1',
      name: 'Gerente Brasa Burger',
      email: 'lojista@brasaburger.com.br',
      role: 'merchant',
      storeName: 'Brasa Burger',
    },
    token: 'jwt-mock-delivery-front-bearer-token',
  }
}

export const useAuthStore = create((set) => ({
  ...loadInitialAuth(),

  login: async ({ email, role = 'merchant' } = {}) => {
    // Simula a recepção do token JWT e dos dados do usuário da API do backend
    const user = {
      id: role === 'superadmin' ? 'usr-superadmin' : 'usr-lojista-1',
      name: role === 'superadmin' ? 'Super Administrador' : 'Gerente Brasa Burger',
      email:
        email ||
        (role === 'superadmin'
          ? 'admin@plataforma.com'
          : 'lojista@brasaburger.com.br'),
      role,
      storeName: 'Brasa Burger',
    }
    const token = `mock-bearer-jwt-${Date.now()}`

    const newState = {
      isAuthenticated: true,
      user,
      token,
    }

    set(newState)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    } catch {
      // ignore
    }
    return { success: true, user, token }
  },

  logout: () => {
    const emptyState = {
      isAuthenticated: false,
      user: null,
      token: null,
    }
    set(emptyState)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  },
}))

