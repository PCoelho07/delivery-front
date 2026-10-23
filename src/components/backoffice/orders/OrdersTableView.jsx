import {
  Printer,
  ArrowRight,
  Check,
  Bike,
  Store,
  QrCode,
  CreditCard,
  Banknote,
  Clock,
} from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'

export function OrdersTableView({
  orders,
  onAdvance,
  onPrint,
}) {
  const getStatusBadge = (status, isDelivery = true) => {
    switch (status) {
      case 'aceito':
      case 'novo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Novo</span>
          </span>
        )
      case 'preparo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Em Preparo</span>
          </span>
        )
      case 'entrega':
        return isDelivery ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-50 text-purple-800 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Em Rota</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Pronto Balcão</span>
          </span>
        )
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>{isDelivery ? 'Entregue' : 'Retirado'}</span>
          </span>
        )
      default:
        return null
    }
  }

  const renderPaymentBadge = (method) => {
    switch (method) {
      case 'pix':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <QrCode className="w-2.5 h-2.5 text-emerald-600" />
            <span>PIX</span>
          </span>
        )
      case 'credit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-2.5 h-2.5 text-blue-600" />
            <span>Crédito</span>
          </span>
        )
      case 'debit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            <CreditCard className="w-2.5 h-2.5 text-sky-600" />
            <span>Débito</span>
          </span>
        )
      case 'money':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            <Banknote className="w-2.5 h-2.5 text-amber-600" />
            <span>Dinheiro</span>
          </span>
        )
      default:
        return <span className="text-[10px] text-slate-500">{method}</span>
    }
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-12 text-center shadow-xs">
        <p className="text-sm font-bold text-[#1A1D20]">Nenhum pedido encontrado</p>
        <p className="text-xs text-[#6C757D] mt-1">Ajuste os filtros de busca ou aguarde novas vendas.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E9ECEF] shadow-xs overflow-hidden">
      <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] sticky top-0 z-10 border-b border-[#E9ECEF] text-[#6C757D] font-bold">
            <tr>
              <th className="py-3 px-3.5"># Pedido</th>
              <th className="py-3 px-3.5">Cliente</th>
              <th className="py-3 px-3.5">Tipo</th>
              <th className="py-3 px-3.5">Itens</th>
              <th className="py-3 px-3.5 text-right">Total</th>
              <th className="py-3 px-3.5">Pagamento</th>
              <th className="py-3 px-3.5 text-center">Status</th>
              <th className="py-3 px-3.5 text-right">Ação Rápida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9ECEF]">
            {orders.map((order) => {
              const isDelivery = order.deliveryMethod === 'delivery'
              const itemsCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0)
              const firstItem = order.items?.[0]

              return (
                <tr key={order.orderId} className="hover:bg-slate-50/80 transition-colors">
                  {/* # Pedido e Horário */}
                  <td className="py-3 px-3.5 font-bold text-[#1A1D20] whitespace-nowrap">
                    <div>
                      <span className="font-black block">
                        {String(order.orderId).startsWith('#') ? order.orderId : `#${order.orderId}`}
                      </span>
                      <span className="text-[10.5px] text-[#6C757D] font-normal flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#6C757D]" />
                        <span>{order.createdAt || order.elapsedTime}</span>
                      </span>
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-bold text-[#1A1D20] block">{order.customer?.name || 'Cliente'}</span>
                    {order.customer?.phone && (
                      <span className="text-[10.5px] text-[#6C757D]">{order.customer.phone}</span>
                    )}
                  </td>

                  {/* Tipo */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {isDelivery ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#1A1D20]">
                        <Bike className="w-3.5 h-3.5 text-[#FF5E1E]" />
                        <span>Entrega</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                        <Store className="w-3.5 h-3.5 text-blue-600" />
                        <span>Retirada</span>
                      </span>
                    )}
                  </td>

                  {/* Itens */}
                  <td className="py-3 px-3.5 max-w-[220px]">
                    <div className="truncate">
                      <span className="font-semibold text-[#1A1D20]">
                        {firstItem ? `${firstItem.quantity}x ${firstItem.name || firstItem.product?.name}` : 'Pedido'}
                      </span>
                      {itemsCount > 1 && (
                        <span className="text-[#6C757D] text-[10.5px] ml-1">
                          (+{itemsCount - 1} {itemsCount - 1 === 1 ? 'item' : 'itens'})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-3.5 text-right font-black text-[#1A1D20] whitespace-nowrap">
                    {formatCurrency(order.total || 0)}
                  </td>

                  {/* Pagamento */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {renderPaymentBadge(order.paymentMethod)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    {getStatusBadge(order.status, isDelivery)}
                  </td>

                  {/* Ações */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPrint?.(order)}
                        className="p-1.5 rounded-lg border border-[#E9ECEF] hover:border-[#FF5E1E] bg-[#F8F9FA] hover:bg-orange-50 text-[#6C757D] hover:text-[#FF5E1E] transition-all cursor-pointer"
                        title="Imprimir Comanda 80mm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {(order.status === 'aceito' || order.status === 'novo') && (
                        <button
                          type="button"
                          onClick={() => onAdvance?.(order.orderId, 'preparo')}
                          className="px-2.5 py-1 rounded-lg bg-[#FF5E1E] hover:bg-[#E64E12] text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{order.paymentMethod === 'pix' ? 'Confirmar PIX' : 'Aceitar'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {order.status === 'preparo' && (
                        <button
                          type="button"
                          onClick={() => onAdvance?.(order.orderId, 'entrega')}
                          className={`px-2.5 py-1 rounded-lg text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                            isDelivery ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <span>{isDelivery ? 'Saiu p/ Entrega' : 'Pronto p/ Retirada'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {order.status === 'entrega' && (
                        <button
                          type="button"
                          onClick={() => onAdvance?.(order.orderId, 'concluido')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isDelivery ? 'Entregue' : 'Retirado'}</span>
                          <Check className="w-3 h-3" />
                        </button>
                      )}

                      {order.status === 'concluido' && (
                        <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {isDelivery ? 'Entregue' : 'Retirado'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

