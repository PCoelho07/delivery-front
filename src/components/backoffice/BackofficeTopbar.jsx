import { Menu, Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'
import { useStoreAdmin } from '../../store/useStoreAdmin'

export function BackofficeTopbar() {
  const {
    activeTab,
    isStoreOpen,
    setStoreOpen,
    soundEnabled,
    toggleSound,
    setMobileSidebarOpen,
  } = useStoreAdmin()

  const tabTitles = {
    cardapio: 'Cardápio & Vitrine de Produtos',
    templates: 'Templates de Complementos & Adicionais',
    pedidos: 'Gestor de Pedidos em Tempo Real',
    horarios: 'Horários da Semana',
    entregas: 'Bairros & Taxas de Entrega',
    pagamentos: 'Pagamentos & Chave PIX',
    loja: 'Dados do Restaurante',
  }

  const handleSetOpen = (open) => {
    setStoreOpen(open)
    if (open) {
      toast.success('🟢 Loja Aberta! O cardápio dos clientes agora aceita novos pedidos.')
    } else {
      toast.error('🔴 Loja Pausada! Clientes verão o aviso de loja fechada no cardápio.')
    }
  }

  const handleToggleSound = () => {
    toggleSound()
    if (!soundEnabled) {
      toast.info('🔔 Alerta sonoro de novo pedido ATIVADO.')
    } else {
      toast.info('🔕 Alerta sonoro de novo pedido SILENCIADO.')
    }
  }

  return (
    <header className="h-16 bg-white border-b border-[#E9ECEF] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
      {/* Lado Esquerdo: Hamburger (Mobile) + Título da Aba */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 -ml-1 text-[#6C757D] hover:text-[#1A1D20] hover:bg-[#F8F9FA] rounded-xl md:hidden"
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

      {/* Lado Direito: Controle de Emergência Aberto/Fechado + Som */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Alternador de Som */}
        <button
          onClick={handleToggleSound}
          className="p-2 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#6C757D] hover:text-[#1A1D20] transition-all relative"
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

        {/* Botão de Emergência: Aberto / Pausar Loja */}
        <div className="flex items-center p-1 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]">
          <button
            onClick={() => handleSetOpen(true)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              isStoreOpen
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#6C757D] hover:text-[#1A1D20]'
            }`}
          >
            🟢 Aberto
          </button>
          <button
            onClick={() => handleSetOpen(false)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              !isStoreOpen
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-[#6C757D] hover:text-[#1A1D20]'
            }`}
          >
            🔴 Pausar
          </button>
        </div>
      </div>
    </header>
  )
}

