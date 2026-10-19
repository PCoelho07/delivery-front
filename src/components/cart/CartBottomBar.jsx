import { formatCurrency } from '../../lib/utils'

export function CartBottomBar({ totalAmount, totalCount, onOpenCart }) {
  if (!totalCount || totalCount <= 0) return null

  return (
    <div className="shrink-0 bg-white border-t border-gray-100 rounded-t-2xl px-4 py-3 flex items-center justify-between gap-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20 animate-bar-up">
      <div className="flex flex-col">
        <span className="text-[12px] text-[#6C757D]">Total sem a entrega</span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-[17px] font-bold text-[#1A1D20]">
            {formatCurrency(totalAmount)}
          </span>
          <span className="text-[13px] text-[#6C757D]">
            / {totalCount} {totalCount === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenCart}
        className="bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] text-white font-semibold text-[15px] rounded-2xl px-7 h-12 min-w-[180px] sm:min-w-[205px] flex items-center justify-center transition-all cursor-pointer shadow-xs"
      >
        Ver sacola
      </button>
    </div>
  )
}

