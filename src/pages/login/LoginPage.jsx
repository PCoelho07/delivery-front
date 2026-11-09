import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/useAuthStore'
import { useStoreAdmin } from '../../store/useStoreAdmin'
import { WhatsAppIcon } from '../home/HomePage'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const fromPath = location.state?.from?.pathname
  const storeInfo = useStoreAdmin((state) => state.storeInfo)

  const [email, setEmail] = useState('lojista@brasaburger.com.br')
  const [password, setPassword] = useState('12345678')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false)

  // Login unificado: O e-mail determina automaticamente o nível de acesso e o redirecionamento
  const handleLogin = async (e) => {
    if (e) e.preventDefault()

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      toast.error('Informe seu e-mail de acesso.')
      return
    }

    if (!password) {
      toast.error('Informe sua senha de acesso.')
      return
    }

    setIsLoading(true)

    try {
      // Simulação de autenticação com o backend
      await new Promise((resolve) => setTimeout(resolve, 350))

      // Roteamento inteligente baseado nas credenciais do usuário:
      // - Super Admin: Redireciona diretamente para a gestão geral (/superadmin)
      // - Lojista: Redireciona diretamente para o PDV / Backoffice da loja (/admin)
      const isSuperAdmin =
        trimmedEmail.includes('admin@') || trimmedEmail.includes('superadmin')
      const role = isSuperAdmin ? 'superadmin' : 'merchant'

      await login({
        email: trimmedEmail,
        role,
      })

      if (role === 'superadmin') {
        toast.success('Bem-vindo ao Painel de Gestão Geral (Super Admin)!')
        navigate(fromPath || '/superadmin')
      } else {
        toast.success(`Bem-vindo ao painel ${storeInfo?.name || 'do Restaurante'}!`, {
          description: 'Acesso autenticado com sucesso.',
        })
        navigate(fromPath || '/admin')
      }
    } catch {
      toast.error('Erro ao conectar ao servidor de autenticação.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-[#F8F9FA] via-white to-[#FFF5F0] p-4 sm:p-6">
      {/* Topbar do Login */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 gap-3">
        <Link
          to="/"
          className="btn-hover-zoom inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E9ECEF] bg-white text-xs font-bold text-[#1A1D20] hover:text-[#FF5E1E] hover:border-[#FF5E1E] shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Link>

        <img
          src="/brand/numinstante-logo.png"
          alt="NumInstante"
          className="h-8 sm:h-9 w-auto object-contain select-none"
        />
      </header>

      {/* Card Único de Login Unificado (Sem separação visual Lojista vs Admin) */}
      <main className="w-full max-w-md mx-auto my-auto py-6 sm:py-8">
        <div className="bg-white rounded-3xl border border-[#E9ECEF] p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
          {/* Logo Oficial Centralizada & Textos */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <img
                src="/brand/numinstante-logo.png"
                alt="NumInstante"
                className="h-12 sm:h-14 w-auto object-contain select-none"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1A1D20] tracking-tight">
              Acesse sua conta
            </h1>
            <p className="text-xs text-[#6C757D]">
              Insira suas credenciais para entrar no sistema. O redirecionamento para o seu ambiente é automático.
            </p>
          </div>

          {/* Formulário Único Padrão */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1A1D20]">
                E-mail de Acesso
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@estabelecimento.com.br"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-xs font-semibold text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1A1D20]">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordModal(true)}
                  className="text-[11px] font-bold text-[#FF5E1E] hover:underline cursor-pointer"
                >
                  Esqueci a senha
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
                  className="w-full pl-10 pr-10 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-xs font-semibold text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Manter Conectado */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6C757D]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#FF5E1E] focus:ring-[#FF5E1E] h-4 w-4 accent-[#FF5E1E]"
                />
                <span className="font-semibold text-slate-700">
                  Manter conectado nesta máquina
                </span>
              </label>
            </div>

            {/* Botão Principal de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-hover-zoom w-full py-3.5 rounded-xl bg-[#FF5E1E] hover:bg-[#D9460F] disabled:opacity-75 text-white text-xs font-black tracking-wide uppercase shadow-lg shadow-[#FF5E1E]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Divisor Visual */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#E9ECEF]"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-[#6C757D] uppercase">
              Novo no NumInstante?
            </span>
            <div className="flex-grow border-t border-[#E9ECEF]"></div>
          </div>

          {/* Ação Comercial: Quero Testar / Criar Minha Conta (Direto para WhatsApp) */}
          <div className="space-y-2 text-center">
            <a
              href="https://wa.me/5584999998888?text=Ol%C3%A1!%20Estou%20na%20tela%20de%20login%20do%20NumInstante%20e%20quero%20testar%20%2F%20criar%20minha%20conta%20para%20o%20meu%20delivery!"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-hover-zoom w-full py-3.5 px-4 rounded-xl bg-emerald-50 hover:bg-[#25D366] text-emerald-800 hover:text-white border border-emerald-200 hover:border-[#25D366] text-xs font-black flex items-center justify-center gap-2 group transition-all"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:text-white transition-colors" />
              <span>Quero testar / Criar minha conta</span>
            </a>
            <p className="text-[11px] text-[#6C757D]">
              Atendimento humanizado direto no WhatsApp com nossa equipe comercial.
            </p>
          </div>
        </div>
      </main>

      {/* Rodapé Limpo */}
      <footer className="max-w-md w-full mx-auto text-center py-4 text-xs text-[#6C757D]">
        <p className="font-semibold">© NumInstante - Todos os direitos reservados</p>
      </footer>

      {/* Modal Esqueci a Senha */}
      {forgotPasswordModal && (
        <div
          onClick={() => setForgotPasswordModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[70] flex items-center justify-center p-4 animate-modal-up"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-[#E9ECEF] max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1A1D20]">
                Recuperação de Senha
              </h3>
              <button
                onClick={() => setForgotPasswordModal(false)}
                className="p-1.5 rounded-lg text-[#6C757D] hover:bg-[#F8F9FA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#6C757D] leading-relaxed space-y-3">
              <p>
                Para redefinir sua senha com segurança, entre em contato direto com a equipe de
                suporte do <strong>NumInstante</strong> informando o e-mail ou nome da sua loja:
              </p>
              <a
                href="https://wa.me/5584999998888?text=Ol%C3%A1!%20Esqueci%20minha%20senha%20de%20acesso%20ao%20NumInstante%20e%20preciso%20redefinir."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hover-zoom w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-center flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Solicitar Redefinição via WhatsApp</span>
              </a>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setForgotPasswordModal(false)}
                className="btn-hover-zoom px-5 py-2.5 rounded-xl bg-[#1A1D20] hover:bg-[#FF5E1E] text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
