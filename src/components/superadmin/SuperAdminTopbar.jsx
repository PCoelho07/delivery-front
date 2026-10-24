import { Menu, Zap } from 'lucide-react'
import { useSuperAdminStore } from '../../store/useSuperAdminStore'
import { formatCurrency } from '../../lib/utils'

export function SuperAdminTopbar() {
  const {
    activeTab,
    supportMode,
    impersonatedCompany,
    supportActiveTab,
    companies,
    setMobileSidebarOpen,
  } = useSuperAdminStore()

  const activeStoresCount = companies.filter((c) => c.status === 'active').length
  const trialStoresCount = companies.filter((c) => c.status === 'trial').length
  const totalMrr = companies
    .filter((c) => c.status === 'active' && c.plan !== 'trial')
    .reduce((acc, c) => acc + (c.price || 0), 0)

  const adminTabTitles = {
    empresas: 'Empresas Vinculadas',
    assinaturas: 'Controle de Assinatura',
    perfil: 'Configuração do Perfil Master',
  }

  const supportTabTitles = {
    cardapio: 'Cardápio & Vitrine da Loja',
    horarios: 'Horários da Semana & Fuso',
    entregas: 'Bairros & Taxas de Entrega',
    pagamentos: 'Pagamentos & Chave PIX',
    loja: 'Dados do Restaurante',
  }

  const currentTitle = supportMode
    ? `${supportTabTitles[supportActiveTab] || 'Suporte'} — ${impersonatedCompany?.name || 'Loja'}`
    : adminTabTitles[activeTab] || 'Painel da Plataforma'

  return (
    <header className="h-16 bg-white border-b border-[#E9ECEF] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
      {/* Lado Esquerdo: Hamburger (Mobile) + Título */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#1A1D20] md:hidden cursor-pointer"
          title="Abrir menu de navegação"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5E1E] flex items-center justify-center font-bold text-xs shrink-0">
            <Zap className="w-3.5 h-3.5 fill-[#FF5E1E]" />
          </div>
          <h1 className="font-extrabold text-sm sm:text-base text-[#1A1D20] leading-none">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Lado Direito: Ticker de Métricas & Perfil */}
      <div className="flex items-center gap-4">
        {!supportMode && (
          <div className="hidden lg:flex items-center gap-5 text-xs border-r border-[#E9ECEF] pr-5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#6C757D]">Lojas Ativas:</span>
              <strong className="text-[#1A1D20]">{activeStoresCount}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#6C757D]">Em Trial:</span>
              <strong className="text-amber-600">{trialStoresCount}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#6C757D]">MRR:</span>
              <strong className="text-emerald-700 font-extrabold">
                {formatCurrency(totalMrr)}
              </strong>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
            SA
          </div>
          <div className="hidden sm:block text-left">
            <span className="font-bold text-xs text-[#1A1D20] block leading-tight">
              Master Admin
            </span>
            <span className="text-[10px] text-[#6C757D]">Super Administrador</span>
          </div>
        </div>
      </div>
    </header>
  )
}

