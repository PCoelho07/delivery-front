import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Bell,
  BellOff,
  PauseCircle,
  PlayCircle,
  Zap,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  LogOut,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin, calculateStoreLiveStatus } from '../../store/useStoreAdmin'
import { useAuthStore } from '../../store/useAuthStore'

export function BackofficeTopbar() {
  const {
    activeTab,
    schedule,
    timezone,
    storeStatusMode,
    pauseStoreTemporarily,
    resumeAutoSchedule,
    forceOpenStore,
    soundEnabled,
    toggleSound,
    setMobileSidebarOpen,
    storeInfo,
  } = useStoreAdmin()

  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [copiedLink, setCopiedLink] = useState(false)

  const handleLogout = () => {
    logout()
    toast.info('Sessão encerrada.')
    navigate('/login')
  }

  const storeSlug = storeInfo?.slug || 'brasa-burger'
  const menuPath = `/${storeSlug}`
  const fullMenuUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${menuPath}`
      : menuPath

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullMenuUrl)
      setCopiedLink(true)
      toast.success('Link do cardápio copiado!', {
        description: fullMenuUrl,
      })
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      toast.error('Não foi possível copiar o link automaticamente.')
    }
  }

  const tabTitles = {
    cardapio: 'Cardápio & Vitrine de Produtos',
    templates: 'Templates de Complementos & Adicionais',
    cupons: 'Cupons de Desconto',
    pedidos: 'Gestor de Pedidos em Tempo Real',
    horarios: 'Horários da Semana',
    entregas: 'Bairros & Taxas de Entrega',
    pagamentos: 'Pagamentos & Chave PIX',
    loja: 'Dados do Restaurante',
  }

  // Calcula o status dinâmico em tempo real
  const liveStatus = calculateStoreLiveStatus(schedule, timezone, storeStatusMode)

  const handlePause = () => {
    pauseStoreTemporarily()
    toast.warning('Loja pausada temporariamente! Novos pedidos foram bloqueados no cardápio.')
  }

  const handleResumeAuto = () => {
    resumeAutoSchedule()
    toast.success('Operação retornou ao Horário Automático da semana!')
  }

  const handleForceOpen = () => {
    forceOpenStore()
    toast.success('Abertura manual ativada! O cardápio está liberado para receber pedidos.')
  }

  const handleToggleSound = () => {
    toggleSound()
    if (!soundEnabled) {
      toast.info('Alerta sonoro de novo pedido ativado.')
    } else {
      toast.info('Alerta sonoro de novo pedido silenciado.')
    }
  }

  return (
    <header className="h-16 bg-white border-b border-[#E9ECEF] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
      {/* Lado Esquerdo: Hamburger (Mobile) + Título da Aba */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 -ml-1 text-[#6C757D] hover:text-[#1A1D20] hover:bg-[#F8F9FA] rounded-xl md:hidden cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="font-extrabold text-sm sm:text-base text-[#1A1D20] leading-tight">
            {tabTitles[activeTab] || 'Painel Administrativo'}
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sincronização em Tempo Real
          </span>
        </div>
      </div>

      {/* Lado Direito: Ações rápidas (Copiar Link + Ver Cardápio) + Som + Gatilho Aberto/Fechado */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Botão Copiar Link do Cardápio */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title={`Copiar link do cardápio (${fullMenuUrl})`}
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Copy className="w-4 h-4 text-[#FF5E1E] shrink-0" />
          )}
          <span className="hidden md:inline">
            {copiedLink ? 'Copiado!' : 'Copiar Link'}
          </span>
        </button>

        {/* Botão Ver Cardápio Público */}
        <a
          href={menuPath}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200/60 text-[#FF5E1E] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Abrir cardápio do cliente em uma nova aba"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline">Ver Cardápio</span>
        </a>

        {/* Alternador de Som */}
        <button
          onClick={handleToggleSound}
          className="p-2 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] transition-all relative cursor-pointer"
          title={soundEnabled ? 'Alerta sonoro ativado' : 'Alerta sonoro desativado'}
        >
          {soundEnabled ? (
            <>
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1D20]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            </>
          ) : (
            <BellOff className="w-4 h-4 sm:w-5 sm:h-5 text-[#6C757D]" />
          )}
        </button>

        {/* Gatilho Inteligente de Operação */}
        <div className="flex items-center gap-2">
          {/* Cenário 1: Pausa Temporária Ativa */}
          {storeStatusMode === 'paused' && (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-2xl p-1 shadow-xs">
              <span className="text-[11px] font-black text-rose-700 px-2.5 py-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Fechado Temporariamente</span>
              </span>
              <button
                type="button"
                onClick={handleResumeAuto}
                title="Clique para voltar a aceitar pedidos pelo horário normal"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Retomar Horário</span>
              </button>
            </div>
          )}

          {/* Cenário 2: Abertura Forçada Ativa */}
          {storeStatusMode === 'forced_open' && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-2xl p-1 shadow-xs">
              <span className="text-[11px] font-black text-emerald-800 px-2.5 py-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Aberto (Manual)</span>
              </span>
              <button
                type="button"
                onClick={handleResumeAuto}
                title="Voltar a seguir o horário automático da semana"
                className="px-2.5 py-1.5 rounded-xl border border-emerald-300 hover:bg-white text-emerald-900 font-extrabold text-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Voltar Automático</span>
              </button>
            </div>
          )}

          {/* Cenário 3: Modo Automático Normal */}
          {storeStatusMode === 'auto' && (
            <div className="flex items-center gap-1.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-1 shadow-xs">
              {liveStatus.isOpen ? (
                <>
                  <span className="text-[11px] font-black text-emerald-700 px-2.5 py-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Aberto Agora</span>
                  </span>
                  <button
                    type="button"
                    onClick={handlePause}
                    title="Pausar pedidos temporariamente caso a cozinha esteja lotada ou falte energia"
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PauseCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Pausar</span>
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[11px] font-bold text-[#6C757D] px-2.5 py-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span>{liveStatus.label}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleForceOpen}
                    title="Abrir o cardápio agora antes do horário programado"
                    className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-[#FF5E1E] text-[#FF5E1E] hover:text-white border border-orange-200 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Abrir Agora</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Botão Sair / Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-xl border border-[#E9ECEF] hover:border-rose-300 hover:bg-rose-50 text-[#6C757D] hover:text-rose-600 transition-all cursor-pointer shadow-2xs"
          title="Sair do painel e voltar ao login"
        >
          <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>
    </header>
  )
}
