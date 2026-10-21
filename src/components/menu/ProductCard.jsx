import { Plus } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

export function ProductCard({ item, onSelect }) {
  const isAvailable = item.available !== false

  return (
    <article
      onClick={() => isAvailable && onSelect?.(item)}
      className={`bg-white rounded-2xl p-3 flex items-center gap-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all ${
        isAvailable
          ? 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer'
          : 'opacity-70 cursor-not-allowed'
      }`}
    >
      {/* Foto do Produto + Badge opcional */}
      <div className="relative w-24 h-24 sm:w-[100px] sm:h-[100px] rounded-xl overflow-hidden shrink-0 bg-[#F8F9FA]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className={`w-full h-full object-cover ${
              !isAvailable ? 'grayscale opacity-75' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[11px] text-[#6C757D]">
            Sem foto
          </div>
        )}

        {!isAvailable ? (
          <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[8.5px] font-extrabold uppercase tracking-tight px-2 py-0.5 rounded-full shadow-xs">
            Esgotado
          </span>
        ) : item.badge ? (
          <span className="absolute top-1.5 left-1.5 bg-white text-[#1A1D20] text-[8.5px] font-extrabold uppercase tracking-tight px-2 py-0.5 rounded-full shadow-xs">
            {item.badge}
          </span>
        ) : null}
      </div>

      {/* Informações do Produto */}
      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[92px]">
        <div>
          <h3
            className={`text-[15px] font-bold leading-snug truncate transition-all ${
              !isAvailable ? 'line-through text-[#6C757D]' : 'text-[#1A1D20]'
            }`}
          >
            {item.name}
          </h3>
          {item.description && (
            <p className="text-[12px] text-[#6C757D] leading-snug mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span
            className={`text-[15px] font-bold ${
              !isAvailable ? 'text-[#6C757D]' : 'text-[#1A1D20]'
            }`}
          >
            {formatCurrency(item.price)}
          </span>

          {isAvailable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelect?.(item)
              }}
              aria-label={`Ver detalhes de ${item.name}`}
              className="w-8 h-8 rounded-full bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <span className="text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              Esgotado
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
