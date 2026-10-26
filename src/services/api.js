import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from 'sonner'

/**
 * Instância do Axios configurada para comunicação com a API Go (:8080).
 *
 * Características:
 * - Em ambiente de desenvolvimento local, utiliza o proxy '/api' do Vite
 *   para redirecionar automaticamente para http://localhost:8080 sem erros de CORS.
 * - Request Interceptor: anexa automaticamente o cabeçalho Authorization com JWT Bearer Token.
 * - Response Interceptor: captura respostas 401 (token expirado ou inválido) e desloga o usuário.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Anexa o Bearer JWT em chamadas autenticadas
api.interceptors.request.use(
  (config) => {
    try {
      const token = useAuthStore.getState().token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // fallback silencioso
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Captura expiração de token (401) e permissão negada (403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      // Apenas desloga e redireciona se a rota atual for do painel administrativo
      const isAdminRoute =
        currentPath.startsWith('/admin') ||
        currentPath.startsWith('/lojista') ||
        currentPath.startsWith('/superadmin') ||
        currentPath.startsWith('/backoffice')

      if (isAdminRoute && currentPath !== '/login') {
        useAuthStore.getState().logout()
        toast.error('Sessão expirada. Faça login novamente para continuar.')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
