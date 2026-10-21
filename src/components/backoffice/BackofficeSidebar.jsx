import {
  UtensilsCrossed,
  Puzzle,
  ClipboardList,
  Clock,
  MapPin,
  CreditCard,
  Store,
  Building2,
  ExternalLink,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStoreAdmin } from '../../store/useStoreAdmin'

export function BackofficeSidebar() {
  const {
    activeTab,
    setActiveTab,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    isStoreOpen,
    storeInfo,
  } = useStoreAdmin()

  const navItems = [
    {
      id: 'cardapio',
      label: 'Cardápio & Vitrine',
      icon: UtensilsCrossed,
    },
    {
      id: 'templates',
      label: 'Templates de Adicionais',
      icon: Puzzle,
    },
    {
      id: 'pedidos',
      label: 'Gestor de Pedidos',
      icon: ClipboardList,
    },
    {
      id: 'horarios',
      label: 'Horários da Semana',
      icon: Clock,
    },
    {
      id: 'entregas',
      label: 'Bairros & Taxas',
      icon: MapPin,
    },
    {
      id: 'pagamentos',
      label: 'Pagamentos & PIX',
      icon: CreditCard,
    },
    {
      id: 'loja',
      label: 'Dados do Restaurante',
      icon: Store,
    },
  ]

  return (
    <>
      {/* Backdrop Mobile */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E9ECEF] flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-[#E9ECEF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5E1E] to-[#FF844B] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#FF5E1E]/20 shrink-0">
                BB
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm text-[#1A1D20] leading-tight flex items-center gap-1.5 truncate">
                  <span className="truncate">{storeInfo?.name || 'Brasa Burger'}</span>
                  <span
                    className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                      isStoreOpen ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                </h1>
                <p className="text-[11px] text-[#6C757D]">Painel do Lojista</p>
              </div>
            </div>

            {/* Botão Fechar no Mobile */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1 rounded-lg text-[#6C757D] hover:bg-[#F8F9FA] md:hidden"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links de Navegação */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#FF5E1E] text-white shadow-sm shadow-[#FF5E1E]/25 font-semibold'
                      : 'text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#1A1D20]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor || 'bg-slate-100 text-[#6C757D]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar: Acesso direto ao cardápio público e à gestão de empresas */}
        <div className="p-3 border-t border-[#E9ECEF] bg-[#F8F9FA]/60 space-y-1.5">
          <Link
            to="/empresas"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E9ECEF] hover:border-[#FF5E1E] text-xs font-semibold text-[#1A1D20] hover:text-[#FF5E1E] transition-all group shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#6C757D] group-hover:text-[#FF5E1E]" />
              <span>Gestão Empresas (API)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#6C757D] group-hover:text-[#FF5E1E] transition-colors" />
          </Link>

          <Link
            to={`/${storeInfo?.slug || 'brasa-burger'}`}
            target="_blank"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E9ECEF] hover:border-[#FF5E1E] text-xs font-semibold text-[#1A1D20] hover:text-[#FF5E1E] transition-all group shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Ver Cardápio Público</span>
            </span>
            <ExternalLink className="w-4 h-4 text-[#6C757D] group-hover:text-[#FF5E1E] transition-colors" />
          </Link>
        </div>
      </aside>
    </>
  )
}

