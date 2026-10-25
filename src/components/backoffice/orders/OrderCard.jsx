import { useState, useMemo } from 'react'
import {
  Printer,
  ArrowRight,
  ArrowLeft,
  Check,
  Bike,
  Store,
  QrCode,
  CreditCard,
  Banknote,
  Clock,
  ChevronDown,
  ChevronUp,
  Ban,
  Tag,
} from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'

export function OrderCard({
  order,
  compact = false,
  onAdvance,
  onRewind,
  onPrint,
  onCancel,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isDelivery = order.deliveryMethod === 'delivery'

  // Exibe apenas hora (HH:mm) para economizar espaço horizontal no card do Kanban
  const displayTime = useMemo(() => {
    const raw = order.createdAt || order.elapsedTime || ''
    if (raw.includes('às')) {
      return raw.split('às')[1].trim()
    }
    return raw
  }, [order.createdAt, order.elapsedTime])

  // Configurações visuais por status
  const statusConfig = {
    aceito: {
      nextLabel: 'Aceitar',
      nextStatus: 'preparo',
      nextClass: 'bg-[#FF5E1E] hover:bg-[#E64E12] text-white shadow-xs',
      borderClass: 'border-slate-200 hover:border-orange-300',
    },
    novo: {
      nextLabel: 'Aceitar',
      nextStatus: 'preparo',
      nextClass: 'bg-[#FF5E1E] hover:bg-[#E64E12] text-white shadow-xs',
      borderClass: 'border-slate-200 hover:border-orange-300',
    },
    preparo: {
      nextLabel: 'Pronto',
      nextStatus: 'entrega',
      nextClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
      borderClass: 'border-slate-200 hover:border-blue-300',
      prevStatus: 'aceito',
    },
    entrega: {
      nextLabel: 'Concluir',
      nextStatus: 'concluido',
      nextClass: 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs',
      borderClass: 'border-slate-200 hover:border-purple-300',
      prevStatus: 'preparo',
    },
    concluido: {
      borderClass: 'border-slate-200 hover:border-emerald-300',
      prevStatus: 'entrega',
    },
    cancelado: {
      borderClass: 'border-rose-200 bg-rose-50/20',
    },
    recusado: {
      borderClass: 'border-rose-200 bg-rose-50/20',
    },
  }

  const currentCfg = statusConfig[order.status] || statusConfig.aceito
  const isAwaitingPix =
    (order.status === 'aceito' || order.status === 'novo') &&
    order.paymentMethod === 'pix'
  const actionLabel = isAwaitingPix ? 'Confirmar PIX' : currentCfg.nextLabel

  // Badges de forma de pagamento
  const renderPaymentBadge = (isSmall = false) => {
    const sizeClasses = isSmall
      ? 'text-[9.5px] px-1.5 py-0.5'
      : 'text-[10px] px-2 py-0.5'
    const iconSize = isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3'

    switch (order.paymentMethod) {
      case 'pix':
        return (
          <span
            className={`inline-flex items-center gap-1 font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
          >
            <QrCode className={`${iconSize} text-emerald-600`} />
            <span>PIX</span>
          </span>
        )
      case 'credit':
        return (
          <span
            className={`inline-flex items-center gap-1 font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
          >
            <CreditCard className={`${iconSize} text-emerald-600`} />
            <span>Crédito</span>
          </span>
        )
      case 'debit':
        return (
          <span
            className={`inline-flex items-center gap-1 font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
          >
            <CreditCard className={`${iconSize} text-emerald-600`} />
            <span>Débito</span>
          </span>
        )
      case 'money':
        return (
          <span
            className={`inline-flex items-center gap-1 font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
          >
            <Banknote className={`${iconSize} text-emerald-600`} />
            <span>Dinheiro</span>
          </span>
        )
      default:
        return (
          <span
            className={`inline-flex items-center gap-1 font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
          >
            {order.paymentMethod || 'Pagamento'}
          </span>
        )
    }
  }

  // Visual Compacto (ideal para dezenas de pedidos concluídos)
  if (compact && !isExpanded) {
    return (
      <div className="bg-white rounded-xl p-2.5 border border-slate-200 hover:border-emerald-300 shadow-2xs flex items-center justify-between gap-2 text-xs transition-all">
        <div className="min-w-0 flex items-center gap-1.5">
          <span className="font-black text-[#1A1D20] shrink-0 text-[11px]">
            {String(order.orderId).startsWith('#') ? order.orderId : `#${order.orderId}`}
          </span>
          {renderPaymentBadge(true)}
          {order.customer?.name && (
            <span
              className="font-medium text-[#475569] truncate max-w-[85px] text-[11px]"
              title={order.customer.name}
            >
              · {order.customer.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-bold text-[#1A1D20] text-[11.5px]">
            {formatCurrency(order.total || 0)}
          </span>
          <button
            type="button"
            onClick={() => onPrint?.(order)}
            className="p-1 rounded-md text-[#6C757D] hover:text-[#FF5E1E] hover:bg-orange-50 transition-colors cursor-pointer"
            title="Imprimir Comanda"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="p-1 rounded-md text-[#6C757D] hover:text-[#1A1D20] hover:bg-slate-100 transition-colors cursor-pointer"
            title="Expandir detalhes"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl p-3.5 border shadow-xs space-y-2.5 transition-all overflow-hidden ${currentCfg.borderClass}`}
    >
      {/* Linha 1: Número do Pedido, Horário e Pagamento */}
      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-[#F1F3F5]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-black text-[#1A1D20] shrink-0">
            {String(order.orderId).startsWith('#') ? order.orderId : `#${order.orderId}`}
          </span>
          <span
            className="text-[10.5px] text-[#6C757D] flex items-center gap-1 shrink-0"
            title={order.createdAt || order.elapsedTime}
          >
            <Clock className="w-3 h-3 text-[#94A3B8]" />
            <span>{displayTime}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {renderPaymentBadge()}
          {compact && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-md text-[#6C757D] hover:text-[#1A1D20] hover:bg-slate-100 transition-colors cursor-pointer"
              title="Recolher card"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Linha 2: Nome do Cliente e Modalidade (Entrega vs Retirada no Balcão) */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-[#1A1D20] truncate min-w-0">
          {order.customer?.name || 'Cliente'}
        </p>

        <div className="shrink-0">
          {isDelivery ? (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/80">
              <Bike className="w-3 h-3 text-purple-600 shrink-0" />
              <span>Entrega</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/80">
              <Store className="w-3 h-3 text-purple-600 shrink-0" />
              <span>Retirada</span>
            </span>
          )}
        </div>
      </div>

      {/* Lista de Itens do Pedido */}
      <div className="text-xs space-y-2 py-2.5 border-y border-[#F1F3F5]">
        {(order.items || []).map((item, idx) => {
          const itemNotes = item.observation || item.notes
          const rawOptions =
            Array.isArray(item.options) && item.options.length > 0
              ? item.options.map((opt) =>
                  typeof opt === 'string'
                    ? opt
                    : opt.name && opt.name !== 'Opção' && opt.name !== 'Adicional'
                    ? `${opt.name}: ${opt.value}`
                    : opt.value || opt.name || ''
                )
              : [
                  ...(Array.isArray(item.preferences)
                    ? item.preferences.map((p) =>
                        p.groupName ? `${p.groupName}: ${p.name}` : p.name
                      )
                    : []),
                  ...(Array.isArray(item.addons)
                    ? item.addons.map(
                        (a) => `${a.name}${a.price ? ` (+${formatCurrency(a.price)})` : ''}`
                      )
                    : []),
                ]

          const optionsList = Array.from(new Set(rawOptions.filter(Boolean)))

          return (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between font-semibold text-[#1A1D20]">
                <span className="truncate pr-2">
                  {item.quantity}x {item.name || item.product?.name}
                </span>
                <span className="shrink-0 text-[#6C757D]">
                  {formatCurrency(
                    item.totalPrice ?? (item.price || item.unitPrice || 0) * (item.quantity || 1)
                  )}
                </span>
              </div>

              {/* Opcionais/Complementos */}
              {optionsList.length > 0 && (
                <p className="text-[10.5px] text-[#6C757D] pl-2 line-clamp-2">
                  {optionsList.join(' • ')}
                </p>
              )}

              {/* Observação especial */}
              {itemNotes && (
                <p className="text-[10.5px] font-medium text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/70 mt-1">
                  Obs: {itemNotes}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Destaque de Cupom Aplicado (se houver) */}
      {order.coupon && (
        <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10.5px]">
          <span className="flex items-center gap-1 font-bold">
            <Tag className="w-3 h-3 text-emerald-600" />
            <span>Cupom: {order.coupon.code}</span>
          </span>
          <span className="font-extrabold">
            -{order.coupon.discountPercent}% ({formatCurrency(order.coupon.discountAmount || order.discountAmount || 0)})
          </span>
        </div>
      )}

      {/* Mensagem de Cancelamento (se houver) */}
      {(order.status === 'cancelado' || order.status === 'recusado') && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 space-y-0.5">
          <p className="font-bold flex items-center gap-1">
            <Ban className="w-3 h-3 text-rose-600" />
            <span>Pedido Cancelado / Recusado</span>
          </p>
          {order.cancellationReason && (
            <p className="text-[10.5px] text-rose-600">
              Motivo: {order.cancellationReason}
            </p>
          )}
        </div>
      )}

      {/* Rodapé do Card: Total e Botões de Ação */}
      <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-100">
        <div className="min-w-fit shrink-0">
          <span className="text-[10px] text-[#6C757D] block leading-none font-medium">Total</span>
          <span className="text-xs font-black text-[#1A1D20]">
            {formatCurrency(order.total || 0)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Botão de Cancelar / Recusar Pedido */}
          {onCancel &&
            order.status !== 'concluido' &&
            order.status !== 'cancelado' &&
            order.status !== 'recusado' && (
              <button
                type="button"
                onClick={() => onCancel(order)}
                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer shrink-0"
                title={
                  order.status === 'aceito' || order.status === 'novo'
                    ? 'Recusar Pedido'
                    : 'Cancelar Pedido'
                }
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            )}

          {/* Botão de Retroceder Status (se aplicável) */}
          {currentCfg.prevStatus && (
            <button
              type="button"
              onClick={() => onRewind?.(order.orderId, currentCfg.prevStatus)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
              title="Voltar status anterior"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Botão de Imprimir Comanda Térmica */}
          <button
            type="button"
            onClick={() => onPrint?.(order)}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-orange-300 bg-slate-50/70 hover:bg-orange-50 text-slate-500 hover:text-[#FF5E1E] transition-all cursor-pointer shrink-0"
            title="Imprimir Comanda 80mm"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Botão de Avançar Status */}
          {currentCfg.nextStatus && (
            <button
              type="button"
              onClick={() => onAdvance?.(order.orderId, currentCfg.nextStatus)}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 shadow-xs cursor-pointer shrink-0 whitespace-nowrap ${currentCfg.nextClass}`}
            >
              <span>{actionLabel}</span>
              {currentCfg.nextStatus === 'concluido' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {order.status === 'concluido' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
              <Check className="w-3.5 h-3.5" />
              <span>{isDelivery ? 'Entregue' : 'Retirado'}</span>
            </span>
          )}

          {(order.status === 'cancelado' || order.status === 'recusado') && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 shrink-0">
              <Ban className="w-3.5 h-3.5" />
              <span>Cancelado</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
