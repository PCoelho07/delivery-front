import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Smartphone, Building2 } from 'lucide-react'

export function ViewSwitcherBar() {
  const { pathname } = useLocation()
  const isEmpresas =
    pathname === '/empresas' ||
    pathname === '/cadastro-empresas' ||
    pathname === '/admin/api-health'
  const isBackoffice =
    (pathname.startsWith('/admin') || pathname === '/backoffice') && !isEmpresas
  const isCardapio = !isBackoffice && !isEmpresas

  return (
    <div className="w-full bg-[#1A1D20] text-white px-3 py-1.5 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] z-50 shrink-0 border-b border-white/10 overflow-x-auto">
      <span className="text-white/60 hidden md:inline font-medium mr-1 shrink-0">
        Modo de Visualização:
      </span>

      {/* 1. Painel Backoffice */}
      <Link
        to="/admin"
        className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0 ${
          isBackoffice
            ? 'bg-[#FF5E1E] text-white shadow-xs'
            : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
        }`}
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span>Backoffice Lojista</span>
      </Link>

      {/* 2. Cardápio Cliente (Figma) */}
      <Link
        to="/brasa-burger"
        className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0 ${
          isCardapio
            ? 'bg-[#FF5E1E] text-white shadow-xs'
            : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Cardápio Cliente (Figma)</span>
      </Link>

      {/* 3. Cadastro de Empresas (API) */}
      <Link
        to="/empresas"
        className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0 ${
          isEmpresas
            ? 'bg-[#FF5E1E] text-white shadow-xs'
            : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Cadastro de Empresas (API)</span>
      </Link>
    </div>
  )
}

