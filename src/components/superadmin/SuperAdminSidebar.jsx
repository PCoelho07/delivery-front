import {
  Building2,
  CreditCard,
  Layers,
  UserCog,
  UtensilsCrossed,
  Clock,
  MapPin,
  Store,
  ClipboardList,
  CircleDollarSign,
  Lock,
  Flame,
  X,
  ArrowLeft,
} from 'lucide-react'
import { useSuperAdminStore } from '../../store/useSuperAdminStore'

export function SuperAdminSidebar({ onOpenPrivacyModal }) {
  const {
    activeTab,
    setActiveTab,
    supportMode,
    impersonatedCompany,
    supportActiveTab,
    setSupportActiveTab,
    exitSupportMode,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useSuperAdminStore()

  const adminNavItems = [
    {
      id: 'empresas',
      label: 'Empresas Vinculadas',
      icon: Building2,
    },
    {
      id: 'assinaturas',
      label: 'Controle de Assinatura',
      icon: CreditCard,
    },
    {
      id: 'planos',
      label: 'Planos & Preços',
      icon: Layers,
    },
    {
      id: 'perfil',
      label: 'Configuração do Perfil',
      icon: UserCog,
    },
  ]

  const supportNavItems = [
    {
      id: 'cardapio',
      label: 'Cardápio & Vitrine',
      icon: UtensilsCrossed,
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
      {/* Overlay Mobile */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-[#E9ECEF] flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Topo: Logo & Identidade Visual do Backoffice */}
        <div>
          <div className="p-4 border-b border-[#E9ECEF] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#FFF4EE] border border-[#FFE2D1] flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-[#FF5E1E]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-extrabold text-sm text-[#1A1D20] truncate">
                    NumInstante
                  </h2>
                  <span className="text-[9.5px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-900 text-white">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#6C757D] block truncate">
                  {supportMode ? `Suporte: ${impersonatedCompany?.name}` : 'Painel Super Admin'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1 rounded-lg text-[#6C757D] hover:bg-[#F8F9FA] md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Navegação */}
          <div className="p-3 space-y-1 overflow-y-auto">
            {!supportMode ? (
              /* MODO SUPER ADMIN (3 OPÇÕES) */
              <>
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#6C757D] uppercase tracking-wider">
                  Módulos da Plataforma
                </div>

                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id)
                        setMobileSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FF5E1E] text-white shadow-sm shadow-[#FF5E1E]/25 font-semibold'
                          : 'text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#1A1D20]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}
              </>
            ) : (
              /* MODO DE SUPORTE ATIVO */
              <>
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Configurar Loja</span>
                  <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-black">
                    Suporte
                  </span>
                </div>

                {supportNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = supportActiveTab === item.id

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSupportActiveTab(item.id)
                        setMobileSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FF5E1E] text-white shadow-sm shadow-[#FF5E1E]/25 font-semibold'
                          : 'text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#1A1D20]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}

                {/* Itens Restritos por Privacidade (LGPD) */}
                <div className="pt-3 border-t border-[#E9ECEF] space-y-1">
                  <div className="px-3 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Privacidade & LGPD</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenPrivacyModal('kanban')}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ClipboardList className="w-4 h-4 shrink-0" />
                      <span className="truncate">Gestor de Pedidos</span>
                    </div>
                    <span className="text-[9.5px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-bold shrink-0">
                      Bloqueado
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenPrivacyModal('financeiro')}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CircleDollarSign className="w-4 h-4 shrink-0" />
                      <span className="truncate">Financeiro da Loja</span>
                    </div>
                    <span className="text-[9.5px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-bold shrink-0">
                      Bloqueado
                    </span>
                  </button>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => exitSupportMode()}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar ao Super Admin</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-[#E9ECEF] text-xs text-[#6C757D] space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1A1D20]">SaaS Platform</span>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Online
            </span>
          </div>
          <p className="text-[10.5px] text-[#6C757D] leading-tight">
            NumInstante Delivery &copy; 2026
          </p>
        </div>
      </aside>
    </>
  )
}

