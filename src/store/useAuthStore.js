import { create } from 'zustand'

const STORAGE_KEY = 'delivery_auth_session_v1'

function loadInitialAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.isAuthenticated && parsed.token && parsed.user) {
        return parsed
      }
    }
  } catch {
    // fallback
  }

  // Por padrão deslogado, exigindo login via ProtectedRoute
  return {
    isAuthenticated: false,
    user: null,
    token: null,
  }
}

export const useAuthStore = create((set) => ({
  ...loadInitialAuth(),

  /**
   * Define uma sessão autenticada diretamente (usado na integração com o backend Go)
   */
  setSession: ({ user, token }) => {
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
  },

  /**
   * Login simulado / integração de credenciais
   */
  login: async ({ email, role = 'merchant' } = {}) => {
    const isSuperAdmin = role === 'superadmin' || email === 'admin@plataforma.com'
    const actualRole = isSuperAdmin ? 'superadmin' : 'merchant'

    const user = {
      id: isSuperAdmin ? 'usr-superadmin' : 'usr-lojista-1',
      name: isSuperAdmin ? 'Super Administrador' : 'Gerente Brasa Burger',
      email:
        email ||
        (isSuperAdmin
          ? 'admin@plataforma.com'
          : 'lojista@brasaburger.com.br'),
      role: actualRole,
      storeName: 'Brasa Burger',
    }
    const token = `mock-bearer-jwt-${actualRole}-${Date.now()}`

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

  /**
   * Encerra a sessão e limpa o armazenamento local
   */
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
