import {
  ArrowLeft,
  Clock,
  RotateCcw,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

function getStatusBadge(statusRaw = '') {
  const status = statusRaw.toLowerCase()
  if (status === 'concluido' || status === 'entregue') {
    return {
      label: 'Entregue',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }
  }
  if (status === 'entrega' || status === 'saiu para entrega') {
    return {
      label: 'Saiu p/ Entrega',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    }
  }
  if (status === 'preparando' || status === 'em preparo') {
    return {
      label: 'Em Preparo',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    }
  }
  if (status === 'cancelado') {
    return {
      label: 'Cancelado',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    }
  }
  return {
    label: 'Aceito',
    className: 'bg-orange-50 text-[#FF5E1E] border-orange-200',
  }
}

export function DesktopOrdersScreen({
  orders = [],
  store,
  onBackToMenu,
  onSelectTracking,
  onRepeatOrder,
  onOpenReview,
}) {
  return (
    <div className="w-full min-h-screen bg-[#F4F6F8] py-8 antialiased">
      <div className="max-w-4xl mx-auto px-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onBackToMenu}
              aria-label="Voltar para o cardápio"
              className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1D20]" strokeWidth={2.2} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1A1D20] tracking-tight">
                Meus Pedidos
              </h1>
              <p className="text-xs text-[#6C757D]">
                {store?.name || 'Brasa Burger'} · {orders.length}{' '}
                {orders.length === 1 ? 'pedido realizado' : 'pedidos realizados'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToMenu}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-[#1A1D20] hover:bg-gray-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            Voltar ao Cardápio
          </button>
        </div>

        {/* Lista de Pedidos */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs space-y-4 max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF3EE] text-[#FF5E1E] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1D20]">
                Você ainda não tem pedidos
              </h2>
              <p className="text-xs text-[#6C757D] mt-1 max-w-xs mx-auto">
                Explore nosso cardápio delicioso e faça o seu primeiro pedido!
              </p>
            </div>
            <button
              type="button"
              onClick={onBackToMenu}
              className="px-6 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Ver Cardápio
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const badge = getStatusBadge(ord.status)
              const hasReview = Boolean(ord.review)

              return (
                <div
                  key={ord.orderId}
                  className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs hover:shadow-md transition-shadow space-y-4"
                >
                  {/* Topo do Pedido */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center font-bold text-xs shrink-0">
                        #{ord.orderId.slice(-4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#1A1D20]">
                            Pedido #{ord.orderId}
                          </h3>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6C757D] flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {ord.dateFormatted || 'Hoje'} às{' '}
                            {ord.timeFormatted || '16:00'}
                          </span>
                          <span>•</span>
                          <span>
                            {ord.deliveryMethod === 'pickup'
                              ? 'Retirada no balcão'
                              : 'Entrega'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#6C757D] block">Total</span>
                      <span className="text-base font-extrabold text-[#FF5E1E]">
                        {formatCurrency(ord.total)}
                      </span>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="bg-[#F8F9FA] rounded-2xl p-3.5 space-y-1.5 text-xs text-[#1A1D20]">
                    {ord.items?.map((it, idx) => (
                      <div
                        key={it.cartItemId || idx}
                        className="flex justify-between items-center text-[#6C757D]"
                      >
                        <span className="truncate max-w-[400px]">
                          <strong>{it.quantity}x</strong>{' '}
                          {it.product?.name || it.name}
                          {it.addons?.length > 0 && (
                            <span className="text-[11px] text-gray-400">
                              {' '}
                              (+ {it.addons.map((a) => a.name).join(', ')})
                            </span>
                          )}
                        </span>
                        <span className="font-semibold text-[#1A1D20]">
                          {formatCurrency(
                            it.totalPrice || it.price * it.quantity
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ações do Pedido */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {/* Botão de Avaliação */}
                    {hasReview ? (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-bold">
                          Avaliado: {ord.review.overallRating} ★
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenReview?.(ord)}
                          className="ml-2 text-[11px] underline text-[#FF5E1E] cursor-pointer"
                        >
                          Editar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenReview?.(ord)}
                        className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5E1E] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-orange-200"
                      >
                        <Star className="w-3.5 h-3.5 fill-[#FF5E1E]" />
                        <span>Avaliar Pedido (3 critérios)</span>
                      </button>
                    )}

                    {/* Ações da Direita */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onRepeatOrder?.(ord)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-[#1A1D20] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#FF5E1E]" />
                        <span>Repetir Pedido</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectTracking?.(ord)}
                        className="px-4 py-2 rounded-xl bg-[#1A1D20] hover:bg-black text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#FF5E1E]" />
                        <span>Acompanhar Pedido</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
