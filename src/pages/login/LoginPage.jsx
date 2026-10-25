import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  Building2,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/useAuthStore'
import { useStoreAdmin } from '../../store/useStoreAdmin'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const storeInfo = useStoreAdmin((state) => state.storeInfo)

  const [email, setEmail] = useState('lojista@brasaburger.com.br')
  const [password, setPassword] = useState('12345678')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('merchant') // 'merchant' | 'superadmin'

  const handleLogin = async (e) => {
    if (e) e.preventDefault()

    if (!email.trim()) {
      toast.error('Informe seu e-mail de acesso.')
      return
    }

    setIsLoading(true)

    try {
      // Simulação de autenticação com a API (preparado para chamada real fetch/axios)
      await new Promise((resolve) => setTimeout(resolve, 350))

      await login({
        email: email.trim(),
        role: selectedRole,
      })

      if (selectedRole === 'superadmin') {
        toast.success('Bem-vindo ao Painel Super Admin!')
        navigate('/superadmin')
      } else {
        toast.success(`Bem-vindo ao painel ${storeInfo?.name || 'do Restaurante'}!`, {
          description: 'Acesso autenticado com sucesso.',
        })
        navigate('/admin')
      }
    } catch {
      toast.error('Erro ao conectar ao servidor de autenticação.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLoginAs = (role) => {
    setSelectedRole(role)
    if (role === 'superadmin') {
      setEmail('admin@plataforma.com')
      setPassword('admin123')
    } else {
      setEmail('lojista@brasaburger.com.br')
      setPassword('12345678')
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-[#F8F9FA] via-white to-[#FFF5F0] p-4 sm:p-6">
      {/* Top Header / Branding */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5E1E] text-white flex items-center justify-center shadow-md shadow-[#FF5E1E]/20">
            <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#1A1D20] tracking-tight leading-none">
              DELIVERY<span className="text-[#FF5E1E]">PRO</span>
            </h1>
            <p className="text-[10px] text-[#6C757D] font-bold uppercase tracking-wider mt-0.5">
              Portal de Gestão & Backoffice
            </p>
          </div>
        </div>

        <Link
          to={`/${storeInfo?.slug || 'brasa-burger'}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9ECEF] bg-white text-xs font-bold text-[#1A1D20] hover:text-[#FF5E1E] hover:border-[#FF5E1E] transition-all shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Ver Cardápio</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#6C757D]" />
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl border border-[#E9ECEF] p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5">
          {/* Header do Card */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[11px] font-bold text-[#FF5E1E]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acesso Seguro ao Estabelecimento</span>
            </div>
            <h2 className="text-2xl font-black text-[#1A1D20] tracking-tight">
              Entrar no Backoffice
            </h2>
            <p className="text-xs text-[#6C757D]">
              Gerencie pedidos, vitrine, entregas e faturamento em tempo real.
            </p>
          </div>

          {/* Seletor de Perfil de Acesso */}
          <div className="grid grid-cols-2 gap-2 bg-[#F8F9FA] p-1 rounded-2xl border border-[#E9ECEF]">
            <button
              type="button"
              onClick={() => handleQuickLoginAs('merchant')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'merchant'
                  ? 'bg-white text-[#FF5E1E] shadow-xs'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Lojista</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLoginAs('superadmin')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'superadmin'
                  ? 'bg-white text-[#1A1D20] shadow-xs'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo E-mail */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1A1D20]">
                E-mail ou Usuário
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@restaurante.com.br"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-[#E9ECEF] rounded-xl text-xs font-semibold text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-all placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1A1D20]">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('A redefinição de senha será integrada com o e-mail da loja via API.')}
                  className="text-[11px] font-semibold text-[#FF5E1E] hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-[#E9ECEF] rounded-xl text-xs font-semibold text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-all placeholder:font-normal placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox Lembrar-me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6C757D]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#FF5E1E] focus:ring-[#FF5E1E] h-4 w-4 accent-[#FF5E1E]"
                />
                <span className="font-medium text-slate-700">
                  Manter conectado nesta máquina
                </span>
              </label>
            </div>

            {/* Botão de Entrar (1 Clique) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] disabled:opacity-75 text-white text-xs font-black tracking-wide uppercase transition-all shadow-lg shadow-[#FF5E1E]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Painel</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Dica de Desenvolvimento / Acesso Instantâneo */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-[#1A1D20]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5E1E]" />
              <span>Acesso Rápido de Teste (1 Clique)</span>
            </div>
            <p className="text-[#6C757D] leading-relaxed">
              As credenciais já vêm preenchidas para teste imediato. Basta apertar o botão{' '}
              <strong className="text-[#1A1D20]">Entrar no Painel</strong> para ser redirecionado ao backoffice. No backend, isso validará o token JWT e as permissões de tenant no banco de dados.
            </p>
          </div>
        </div>
      </main>

      {/* Footer com Aviso de Segurança */}
      <footer className="max-w-md w-full mx-auto text-center py-4 text-xs text-[#6C757D] space-y-1">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sessão protegida por criptografia de ponta a ponta</span>
        </p>
        <p className="text-[10px] text-slate-400">
          DELIVERY-FRONT • Arquitetura multi-inquilino pronta para API REST
        </p>
      </footer>
    </div>
  )
}

