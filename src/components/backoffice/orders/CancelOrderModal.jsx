import { useState } from 'react'
import {
  X,
  AlertTriangle,
  Ban,
  MapPin,
  Clock,
  Utensils,
  UserX,
  FileText,
} from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'

const PRESET_REASONS = [
  {
    id: 'out_of_area',
    label: 'Fora da área de entrega',
    description: 'Endereço não é atendido pelos motoboys da loja.',
    icon: MapPin,
  },
  {
    id: 'item_out_of_stock',
    label: 'Falta de ingrediente / Produto esgotado',
    description: 'Insumos insuficientes para preparar um ou mais itens.',
    icon: Utensils,
  },
  {
    id: 'store_closed',
    label: 'Loja fechando / Fora do expediente',
    description: 'Horário de atendimento encerrado para novos pedidos.',
    icon: Clock,
  },
  {
    id: 'kitchen_overloaded',
    label: 'Cozinha sobrecarregada / Tempo excessivo',
    description: 'Fila de pedidos muito alta para atender com qualidade.',
    icon: AlertTriangle,
  },
  {
    id: 'customer_request',
    label: 'Cancelamento solicitado pelo cliente',
    description: 'O próprio cliente solicitou o cancelamento via contato.',
    icon: UserX,
  },
  {
    id: 'other',
    label: 'Outro motivo (Personalizado)',
    description: 'Descreva uma justificativa específica abaixo.',
    icon: FileText,
  },
]

export function CancelOrderModal({ order, onClose, onConfirmCancel }) {
  const [selectedReason, setSelectedReason] = useState('out_of_area')
  const [customNote, setCustomNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!order) return null

  const handleConfirm = () => {
    const reasonObj = PRESET_REASONS.find((r) => r.id === selectedReason)
    const reasonText =
      selectedReason === 'other'
        ? customNote.trim() || 'Cancelado pelo estabelecimento'
        : reasonObj?.label || 'Cancelado pelo estabelecimento'

    setIsSubmitting(true)
    onConfirmCancel?.(order.orderId, reasonText, customNote.trim())
    setIsSubmitting(false)
    onClose?.()
  }

  const orderNum = String(order.orderId || '').startsWith('#')
    ? order.orderId
    : `#${order.orderId}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header com Alerta */}
        <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <Ban className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-rose-950">
                Recusar Pedido {orderNum}
              </h3>
              <p className="text-xs text-rose-700">
                Cliente: <span className="font-semibold">{order.customer?.name || 'Cliente'}</span> · {formatCurrency(order.total || 0)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Seleção de Motivo */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-xs font-black text-[#1A1D20] uppercase tracking-wider mb-2">
              Selecione o Motivo da Recusa / Cancelamento:
            </label>
            <div className="space-y-2">
              {PRESET_REASONS.map((reason) => {
                const Icon = reason.icon
                const isSelected = selectedReason === reason.id

                return (
                  <label
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={reason.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500 h-4 w-4 shrink-0 accent-rose-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-600' : 'text-slate-500'}`} />
                        <span className={`font-bold ${isSelected ? 'text-rose-950' : 'text-[#1A1D20]'}`}>
                          {reason.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6C757D] mt-0.5">
                        {reason.description}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Campo de Observação Adicional */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[11.5px] font-bold text-[#1A1D20]">
              Detalhes adicionais (opcional / visível ao cliente):
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ex: Acabou o pão brioche artesanal; ou motoboy não sobe morro..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white text-[#1A1D20] placeholder:text-slate-400 resize-none transition-all"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              O pedido será retirado da fila ativa de preparo e o status será marcado como <span className="font-bold">Cancelado</span> no acompanhamento do cliente.
            </p>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Voltar / Manter Pedido
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-2"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Confirmar Recusa</span>
          </button>
        </div>
      </div>
    </div>
  )
}

