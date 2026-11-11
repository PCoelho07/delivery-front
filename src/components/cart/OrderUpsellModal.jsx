import { useState } from 'react'
import {
  Sparkles,
  Plus,
  Check,
  ArrowRight,
  X,
  ShoppingBag,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'

export function OrderUpsellModal({
  isOpen,
  onClose,
  onProceedToDelivery,
  recommendations = [],
  onAddToCart,
  cartTotalAmount = 0,
}) {
  const [addedItemIds, setAddedItemIds] = useState(new Set())

  if (!isOpen || !Array.isArray(recommendations) || recommendations.length === 0) {
    return null
  }

  const handleAddItem = (product) => {
    onAddToCart?.(product)
    setAddedItemIds((prev) => new Set(prev).add(product.id))
    toast.success(`"${product.name}" adicionado à sua sacola!`, {
      description: 'Item incluso no seu pedido.',
    })
  }

  const hasAddedAny = addedItemIds.size > 0

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E9ECEF] flex flex-col my-auto overflow-hidden animate-modal">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-[#E9ECEF] flex items-center justify-between gap-3 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5E1E] text-white flex items-center justify-center shadow-md shadow-[#FF5E1E]/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#1A1D20] flex items-center gap-1.5">
                <span>Que tal completar seu pedido?</span>
                <span className="text-base">😋</span>
              </h3>
              <p className="text-[11.5px] text-[#6C757D]">
                Itens selecionados que combinam perfeitamente com a sua sacola:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-[#6C757D] hover:text-[#1A1D20] flex items-center justify-center transition-colors cursor-pointer border border-[#E9ECEF] shrink-0"
            aria-label="Fechar e continuar"
            title="Avançar sem adicionar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Produtos Sugeridos (Até 3) */}
        <div className="p-4 sm:p-5 space-y-3 bg-[#FDFDFD] max-h-[60vh] overflow-y-auto custom-scrollbar">
          {recommendations.slice(0, 3).map((product) => {
            const isAdded = addedItemIds.has(product.id)

            return (
              <div
                key={product.id}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3.5 bg-white ${
                  isAdded
                    ? 'border-emerald-300 ring-2 ring-emerald-500/10 shadow-xs'
                    : 'border-[#E9ECEF] hover:border-orange-200 hover:shadow-xs'
                }`}
              >
                {/* Imagem do Produto */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-[#E9ECEF] relative">
                  <img
                    src={
                      product.imageUrl ||
                      product.image ||
                      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.classList.remove('hidden')
                      }
                    }}
                  />
                  <div className="hidden absolute inset-0 bg-slate-100 flex items-center justify-center p-1 text-center">
                    <ShoppingBag className="w-5 h-5 text-slate-300" />
                  </div>
                </div>

                {/* Detalhes do Produto */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#1A1D20] truncate">
                    {product.name}
                  </h4>
                  {product.description && (
                    <p className="text-[11px] text-[#6C757D] line-clamp-1">
                      {product.description}
                    </p>
                  )}
                  <div className="pt-0.5">
                    <span className="text-xs font-black text-[#FF5E1E]">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>

                {/* Botão de Adicionar / Confirmado */}
                <div className="shrink-0">
                  {isAdded ? (
                    <div className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs animate-in zoom-in-95 duration-150">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Incluso!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddItem(product)}
                      className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-[#FF5E1E] text-[#FF5E1E] hover:text-white border border-orange-200 hover:border-transparent text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5] group-hover:scale-110 transition-transform" />
                      <span>Adicionar</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Rodapé com as Duas Ações */}
        <div className="p-4 sm:p-5 border-t border-[#E9ECEF] bg-[#F8F9FA] space-y-2.5">
          {hasAddedAny ? (
            <button
              type="button"
              onClick={onProceedToDelivery}
              className="btn-hover-zoom w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              <span>Continuar com itens adicionados ({formatCurrency(cartTotalAmount)})</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-3 rounded-xl border border-[#E9ECEF] hover:bg-white text-[#6C757D] hover:text-[#1A1D20] text-xs font-extrabold transition-colors cursor-pointer text-center"
              >
                Não quero, ir para a entrega
              </button>

              <button
                type="button"
                onClick={onProceedToDelivery}
                className="btn-hover-zoom w-full sm:flex-1 py-3 px-3 rounded-xl bg-[#FF5E1E] hover:bg-[#D9460F] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-[#FF5E1E]/20 cursor-pointer text-center"
              >
                <span>Avançar para a entrega</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}

          <p className="text-[10.5px] text-center text-[#9CA3AF]">
            {hasAddedAny
              ? '✅ Os itens adicionados já foram somados à sua sacola.'
              : 'Você pode adicionar quantos itens quiser ou prosseguir diretamente.'}
          </p>
        </div>
      </div>
    </div>
  )
}
