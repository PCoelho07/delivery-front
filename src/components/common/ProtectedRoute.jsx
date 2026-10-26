import { Navigate, useLocation, Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

/**
 * Route Guard para proteção de rotas privadas do Backoffice e Super Admin
 *
 * Regras:
 * 1. Sem sessão ativa (sem token ou !isAuthenticated) -> Redireciona para /login
 * 2. Lojista tentando acessar área de Super Admin -> Bloqueia com tela 403 amigável
 * 3. Super Admin tem permissão universal (acessa Super Admin e áreas do Lojista)
 */
export function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, token } = useAuthStore()
  const location = useLocation()

  // 1. Não autenticado -> Guarda rota de destino e redireciona ao login
  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 2. Validação de Papel de Acesso (RBAC)
  const isSuperAdmin = user.role === 'superadmin'

  // Se a rota exige 'superadmin' e o usuário é apenas 'merchant', bloqueia com 403
  if (requiredRole === 'superadmin' && !isSuperAdmin) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#F8F9FA] text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 shadow-xs">
          <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h2 className="text-xl font-black text-[#1A1D20] tracking-tight">
          Acesso Restrito (403)
        </h2>
        <p className="text-xs text-[#6C757D] max-w-sm mt-1.5 leading-relaxed">
          Esta área é exclusiva para a <strong>Super Administração</strong> da plataforma SaaS.
          Sua conta atual está configurada como <strong>Lojista</strong> ({user.storeName || 'Restaurante'}).
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            to="/lojista"
            className="px-4 py-2.5 rounded-xl bg-[#FF5E1E] text-white text-xs font-bold hover:bg-[#E64E12] transition-all shadow-xs"
          >
            Ir para o Meu Painel Lojista
          </Link>
          <Link
            to="/login"
            className="px-4 py-2.5 rounded-xl border border-[#E9ECEF] bg-white text-xs font-bold text-[#6C757D] hover:text-[#1A1D20] hover:bg-slate-50 transition-all"
          >
            Trocar de Conta
          </Link>
        </div>
      </div>
    )
  }

  return children
}

