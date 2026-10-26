import { useState, useRef, useEffect } from 'react'
import {
  Bell,
  BellOff,
  ShoppingBag,
  Volume2,
  VolumeX,
  Laptop,
  Check,
  CheckCheck,
  Trash2,
  ArrowRight,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useNotificationStore, useUnreadNotificationsCount } from '../../../store/useNotificationStore'
import { useStoreAdmin } from '../../../store/useStoreAdmin'
import { playOrderChime } from '../../../utils/audio'

export function NotificationsPopover({ align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    desktopPermission,
    requestPermission,
  } = useNotificationStore()

  const unreadCount = useUnreadNotificationsCount()
  const { soundEnabled, toggleSound, setActiveTab } = useStoreAdmin()

  // Fecha o dropdown ao clicar fora ou apertar Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Alterna o alerta sonoro e toca o som de teste se ativado
  const handleToggleSound = () => {
    toggleSound()
    if (!soundEnabled) {
      playOrderChime()
      toast.info('Alerta sonoro ativado (som de teste reproduzido).')
    } else {
      toast.info('Alerta sonoro silenciado.')
    }
  }

  // Solicita permissão do navegador para notificações na área de trabalho
  const handleRequestDesktopPermission = async () => {
    const perm = await requestPermission()
    if (perm === 'granted') {
      toast.success('Notificações no navegador ativadas!', {
        description: 'Você receberá avisos no Windows/Celular mesmo com o navegador minimizado.',
      })
    } else if (perm === 'denied') {
      toast.error('Notificações bloqueadas pelo navegador.', {
        description: 'Libere a permissão de notificações nas configurações do seu navegador.',
      })
    }
  }

  // Clica em um pedido para ver no Gestor Kanban
  const handleOpenOrder = (notif) => {
    markAsRead(notif.id)
    setActiveTab('pedidos')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Botão de Gatilho (Sino) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2 rounded-xl border transition-all relative cursor-pointer shadow-2xs ${
          isOpen
            ? 'bg-[#FFF3EE] border-[#FF5E1E] text-[#FF5E1E]'
            : 'bg-white border-[#E9ECEF] text-[#6C757D] hover:text-[#1A1D20] hover:bg-[#F8F9FA]'
        }`}
        title="Central de Notificações e Alertas"
        aria-label="Abrir notificações"
      >
        {soundEnabled ? (
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <BellOff className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
        )}

        {/* Badge de Contagem de Não Lidas */}
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 bg-[#FF5E1E] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : soundEnabled ? (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
        ) : null}
      </button>

      {/* Dropdown / Popover Flutuante */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } top-full mt-2 w-80 sm:w-96 bg-white border border-[#E9ECEF] rounded-2xl shadow-2xl shadow-slate-900/20 z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Topo do Popover */}
          <div className="p-3.5 sm:p-4 border-b border-[#E9ECEF] bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-[#1A1D20] leading-none">
                  Notificações
                </h3>
                <p className="text-[10.5px] text-[#6C757D] mt-0.5">
                  {unreadCount > 0
                    ? `${unreadCount} ${unreadCount === 1 ? 'nova não lida' : 'novas não lidas'}`
                    : 'Tudo atualizado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Lidas</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Faixa de Controles de Alerta e Sistema */}
          <div className="bg-[#F8F9FA] px-3.5 py-2.5 border-b border-[#E9ECEF] space-y-1.5 shrink-0">
            {/* Toggle de Alerta Sonoro */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className="text-[11px] font-bold text-[#1A1D20]">
                  Alerta Sonoro de Pedidos:
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {soundEnabled ? 'Ativado' : 'Mudo'}
              </button>
            </div>

            {/* Controle de Notificações Desktop */}
            <div className="flex items-center justify-between pt-1 border-t border-[#E9ECEF]/60">
              <div className="flex items-center gap-2 min-w-0">
                <Laptop className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] font-bold text-[#6C757D] truncate">
                  Avisos com tela minimizada:
                </span>
              </div>

              {desktopPermission === 'granted' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <Check className="w-3 h-3" />
                  <span>Ativas</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestDesktopPermission}
                  className="text-[10px] font-extrabold text-[#FF5E1E] hover:text-[#E64E12] bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                >
                  Permitir no Windows
                </button>
              )}
            </div>
          </div>

          {/* Lista de Notificações com Rolagem */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E9ECEF] custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] text-slate-400 flex items-center justify-center mb-2">
                  <BellOff className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-xs font-bold text-[#1A1D20]">Nenhuma notificação</p>
                <p className="text-[11px] text-[#6C757D] mt-1 max-w-[220px]">
                  Novos pedidos tocarão o sino sonoro e aparecerão listados aqui.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => notif.orderId && handleOpenOrder(notif)}
                  className={`p-3.5 transition-colors flex items-start gap-3 ${
                    notif.orderId ? 'cursor-pointer hover:bg-orange-50/40' : ''
                  } ${!notif.read ? 'bg-[#FFF9F6]' : 'bg-white'}`}
                >
                  {/* Ícone por Tipo */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                      notif.type === 'order'
                        ? 'bg-orange-50 text-[#FF5E1E]'
                        : notif.type === 'alert'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {notif.type === 'order' ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : notif.type === 'alert' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          !notif.read
                            ? 'font-black text-[#1A1D20]'
                            : 'font-semibold text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-[#6C757D] shrink-0 font-medium">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6C757D] mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Ação rápida para pedidos */}
                    {notif.orderId && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10.5px] font-extrabold text-[#FF5E1E] flex items-center gap-1 hover:underline">
                          <span>Ver no Kanban</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#FF5E1E]" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rodapé Fixo */}
          <div className="p-2.5 border-t border-[#E9ECEF] bg-white flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('pedidos')
                setIsOpen(false)
              }}
              className="text-[11px] font-extrabold text-[#1A1D20] hover:text-[#FF5E1E] flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#F8F9FA] transition-colors cursor-pointer"
            >
              <span>Gestor de Pedidos</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[10.5px] font-semibold text-[#6C757D] hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Limpar histórico"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

