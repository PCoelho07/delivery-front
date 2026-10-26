import { useState, useRef, useEffect } from 'react'
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
  MoreVertical,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin, calculateStoreLiveStatus } from '../../store/useStoreAdmin'
import { useAuthStore } from '../../store/useAuthStore'
import { NotificationsPopover } from './notifications/NotificationsPopover'
import { playOrderChime } from '../../utils/audio'
import { ordersWebSocket } from '../../services/ordersWebSocket'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef(null)

  // Fecha o menu suspenso mobile ao clicar fora ou apertar Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

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
    financeiro: 'Financeiro & Faturamento',
    horarios: 'Horários da Semana',
    entregas: 'Bairros & Taxas de Entrega',
    pagamentos: 'Pagamentos & Chave PIX',
    loja: 'Dados do Restaurante',
  }

  // Título curto para visualização limpa no mobile
  const mobileTabTitles = {
    cardapio: 'Cardápio & Vitrine',
    templates: 'Templates',
    cupons: 'Cupons',
    pedidos: 'Gestor de Pedidos',
    financeiro: 'Financeiro',
    horarios: 'Horários',
    entregas: 'Bairros & Taxas',
    pagamentos: 'Pagamentos',
    loja: 'Dados da Loja',
  }

  // Calcula o status dinâmico em tempo real
  const liveStatus = calculateStoreLiveStatus(schedule, timezone, storeStatusMode)

  const handlePause = () => {
    pauseStoreTemporarily()
    ordersWebSocket.updateStoreStatus('paused')
    toast.warning('Loja pausada temporariamente! Novos pedidos foram bloqueados no cardápio.')
    setIsMobileMenuOpen(false)
  }

  const handleResumeAuto = () => {
    resumeAutoSchedule()
    ordersWebSocket.updateStoreStatus('auto')
    toast.success('Operação retornou ao Horário Automático da semana!')
    setIsMobileMenuOpen(false)
  }

  const handleForceOpen = () => {
    forceOpenStore()
    ordersWebSocket.updateStoreStatus('forced_open')
    toast.success('Abertura manual ativada! O cardápio está liberado para receber pedidos.')
    setIsMobileMenuOpen(false)
  }

  const handleToggleSound = () => {
    toggleSound()
    if (!soundEnabled) {
      playOrderChime()
      toast.info('Alerta sonoro de novo pedido ativado (som de teste reproduzido).')
    } else {
      toast.info('Alerta sonoro de novo pedido silenciado.')
    }
  }

  return (
    <header className="h-16 bg-white border-b border-[#E9ECEF] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
      {/* Lado Esquerdo: Hamburger (Mobile) + Título da Aba */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 -ml-1 text-[#6C757D] hover:text-[#1A1D20] hover:bg-[#F8F9FA] rounded-xl md:hidden cursor-pointer shrink-0"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="font-extrabold text-sm sm:text-base text-[#1A1D20] leading-tight truncate">
            {/* Título conciso em telas menores, completo no desktop */}
            <span className="inline md:hidden">
              {mobileTabTitles[activeTab] || 'Painel'}
            </span>
            <span className="hidden md:inline">
              {tabTitles[activeTab] || 'Painel Administrativo'}
            </span>
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sincronização em Tempo Real
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LADO DIREITO MOBILE (< md): Header Clean com Pill + Menu ⋮ */}
      {/* ============================================================ */}
      <div className="flex md:hidden items-center gap-2 relative" ref={mobileMenuRef}>
        {/* Pill Compacta de Status da Loja */}
        {storeStatusMode === 'paused' && (
          <button
            type="button"
            onClick={handleResumeAuto}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold active:scale-95 transition-transform cursor-pointer shadow-2xs"
            title="Loja pausada. Toque para reativar."
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span>Pausado</span>
          </button>
        )}

        {storeStatusMode === 'forced_open' && (
          <button
            type="button"
            onClick={handleResumeAuto}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold active:scale-95 transition-transform cursor-pointer shadow-2xs"
            title="Aberto manualmente. Toque para voltar ao automático."
          >
            <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600 shrink-0" />
            <span>Aberto</span>
          </button>
        )}

        {storeStatusMode === 'auto' && (
          liveStatus.isOpen ? (
            <button
              type="button"
              onClick={handlePause}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold active:scale-95 transition-transform cursor-pointer shadow-2xs"
              title="Loja aberta. Toque para pausar recebimento de pedidos."
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Aberto</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleForceOpen}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold active:scale-95 transition-transform cursor-pointer shadow-2xs"
              title="Loja fechada pelo horário. Toque para abrir agora."
            >
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
              <span>Fechado</span>
            </button>
          )
        )}

        {/* Botão de Notificações Mobile */}
        <NotificationsPopover align="right" />

        {/* Botão de Menu de Ações Rápidas (3 Pontinhos ⋮) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            isMobileMenuOpen
              ? 'bg-[#FFF3EE] border-[#FF5E1E] text-[#FF5E1E]'
              : 'bg-white border-[#E9ECEF] text-[#1A1D20] hover:bg-[#F8F9FA]'
          }`}
          aria-label="Mais opções da loja"
        >
          <MoreVertical className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Dropdown Mobile Suspenso */}
        {isMobileMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#E9ECEF] rounded-2xl shadow-xl shadow-slate-900/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Cabeçalho do Menu Mobile */}
            <div className="px-4 py-2 border-b border-[#E9ECEF] flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black text-[#1A1D20] truncate">
                  {storeInfo?.name || 'Brasa Burger'}
                </p>
                <p className="text-[10.5px] text-[#6C757D] truncate">
                  /{storeSlug}
                </p>
              </div>

              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {liveStatus.isOpen ? 'Aberto' : 'Fechado'}
              </span>
            </div>

            {/* Ações Rápidas */}
            <div className="p-1.5 space-y-0.5">
              {/* Copiar Link */}
              <button
                type="button"
                onClick={() => {
                  handleCopyLink()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-[#F8F9FA] flex items-center justify-between text-xs font-bold text-[#1A1D20] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                  )}
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link do Cardápio'}</span>
                </span>
              </button>

              {/* Abrir Cardápio */}
              <a
                href={menuPath}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-3 py-2 rounded-xl hover:bg-[#F8F9FA] flex items-center justify-between text-xs font-bold text-[#1A1D20] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                  <span>Abrir Cardápio do Cliente</span>
                </span>
                <span className="text-[10px] text-[#6C757D] font-normal">Nova aba</span>
              </a>

              {/* Alerta Sonoro */}
              <button
                type="button"
                onClick={handleToggleSound}
                className="w-full px-3 py-2 rounded-xl hover:bg-[#F8F9FA] flex items-center justify-between text-xs font-bold text-[#1A1D20] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Bell className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <BellOff className="w-4 h-4 text-[#6C757D] shrink-0" />
                  )}
                  <span>Alerta Sonoro de Pedidos</span>
                </span>
                <span
                  className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                    soundEnabled
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-[#6C757D]'
                  }`}
                >
                  {soundEnabled ? 'Ativado' : 'Mudo'}
                </span>
              </button>
            </div>

            {/* Divisória de Operação */}
            <div className="my-1 border-t border-[#E9ECEF]" />

            {/* Ações de Abertura / Pausa */}
            <div className="p-1.5 space-y-0.5">
              {storeStatusMode === 'paused' ? (
                <button
                  type="button"
                  onClick={handleResumeAuto}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Retomar Horário Automático</span>
                </button>
              ) : liveStatus.isOpen ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  <PauseCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Pausar Recebimento de Pedidos</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleForceOpen}
                  className="w-full px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5E1E] flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                  <span>Abrir Cardápio Agora (Manual)</span>
                </button>
              )}
            </div>

            {/* Divisória de Logout */}
            <div className="my-1 border-t border-[#E9ECEF]" />

            {/* Sair */}
            <div className="p-1.5">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sair do Painel</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* LADO DIREITO DESKTOP (md:flex): Mantido 100% Intacto          */}
      {/* ============================================================ */}
      <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
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

        {/* Central de Notificações Desktop */}
        <NotificationsPopover align="right" />

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
