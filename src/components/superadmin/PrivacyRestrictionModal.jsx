import { ShieldAlert } from 'lucide-react'

export function PrivacyRestrictionModal({ isOpen, onClose, restrictedArea = 'kanban' }) {
  if (!isOpen) return null

  const isKanban = restrictedArea === 'kanban'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E9ECEF] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="font-black text-base text-[#1A1D20]">
            {isKanban
              ? 'Gestor de Pedidos (Kanban) Restrito'
              : 'Financeiro & Extrato Bancário Restrito'}
          </h3>
          <p className="text-xs text-[#6C757D] leading-relaxed">
            {isKanban
              ? 'Por respeito à LGPD e à privacidade operacional, a tela de pedidos e dados pessoais dos clientes finais só podem ser vistos pela equipe do próprio restaurante.'
              : 'Os dados consolidados de faturamento, vendas e relatórios financeiros pertencem exclusivamente aos proprietários do restaurante.'}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px] text-slate-600 space-y-1">
          <div className="font-bold text-slate-800">O que você PODE configurar no suporte:</div>
          <div>✓ Dados cadastrais, endereço e logo</div>
          <div>✓ Cardápio, produtos, categorias e opcionais</div>
          <div>✓ Horários de atendimento e fuso horário</div>
          <div>✓ Taxas de entrega e bairros atendidos</div>
          <div>✓ Formas de pagamento e chave PIX</div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
        >
          Entendido, Voltar
        </button>
      </div>
    </div>
  )
}

