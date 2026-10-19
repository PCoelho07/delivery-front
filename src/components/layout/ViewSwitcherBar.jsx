import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Smartphone } from 'lucide-react'

export function ViewSwitcherBar() {
  const { pathname } = useLocation()
  const isAdminView = pathname.startsWith('/admin') || pathname === '/backoffice'

  return (
    <div className="w-full bg-[#1A1D20] text-white px-3 py-1.5 flex items-center justify-center gap-2 text-[12px] z-50 shrink-0 border-b border-white/10">
      <span className="text-white/60 hidden sm:inline font-medium mr-1">
        Modo de Visualização:
      </span>

      <Link
        to="/admin"
        className={`px-3 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors ${
          isAdminView
            ? 'bg-[#FF5E1E] text-white'
            : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
        }`}
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span>Painel do Restaurante (Backoffice)</span>
      </Link>

      <Link
        to="/brasa-burger"
        className={`px-3 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors ${
          !isAdminView
            ? 'bg-[#FF5E1E] text-white'
            : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Cardápio Cliente (Figma)</span>
      </Link>
    </div>
  )
}

