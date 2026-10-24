import { Wrench, ArrowLeft } from 'lucide-react'
import { useSuperAdminStore } from '../../store/useSuperAdminStore'
import { toast } from 'sonner'

export function SupportModeBanner() {
  const { supportMode, impersonatedCompany, exitSupportMode } = useSuperAdminStore()

  if (!supportMode || !impersonatedCompany) return null

  const handleExit = () => {
    exitSupportMode()
    toast.info('Sessão de suporte encerrada. Retornado ao Painel Master Super Admin.')
  }

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-[#FF5E1E] text-white px-4 py-2.5 shadow-md flex items-center justify-between z-50 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Modo de Suporte Ativo
            </span>
            <span className="text-sm font-extrabold truncate">
              {impersonatedCompany.name}
            </span>
            <span className="text-xs opacity-90 hidden sm:inline truncate">
              · CNPJ: {impersonatedCompany.cnpj}
            </span>
          </div>
          <p className="text-[11px] text-white/90 truncate hidden md:block">
            Você pode cadastrar cardápio, horários, taxas e dados da loja. Áreas confidenciais (pedidos e faturamento) estão bloqueadas por LGPD.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleExit}
        className="px-3.5 py-1.5 rounded-xl bg-white text-[#1A1D20] hover:bg-slate-100 text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 shrink-0 ml-3 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-slate-700" />
        <span className="hidden sm:inline">Sair para Painel Admin</span>
        <span className="sm:hidden">Sair</span>
      </button>
    </div>
  )
}

