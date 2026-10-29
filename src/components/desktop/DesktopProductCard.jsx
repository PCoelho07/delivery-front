import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'

export function DesktopProductCard({ item, onSelect, isStoreClosed = false }) {
  const isAvailable = item.available !== false

  const handleClick = () => {
    if (!isAvailable) {
      toast.info(`"${item.name}" está esgotado no momento.`)
      return
    }
    if (isStoreClosed) {
      toast.info('O restaurante está fechado para novos pedidos no momento.')
      return
    }
    onSelect?.(item)
  }

  return (
    <article
      onClick={handleClick}
      className={`bg-white rounded-2xl p-4 flex items-center gap-4 sm:gap-5 border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#FF5E1E]/40 transition-all cursor-pointer group w-full ${
        isAvailable && !isStoreClosed
          ? ''
          : isStoreClosed
          ? 'opacity-85 hover:bg-slate-50/70 cursor-not-allowed'
          : 'opacity-70 cursor-not-allowed'
      }`}
    >
      {/* 1. Imagem do Produto SEMPRE do Lado Esquerdo */}
      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0 bg-[#F8F9FA]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.style.display = 'none'
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              !isAvailable ? 'grayscale opacity-75' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#6C757D]">
            Sem foto
          </div>
        )}

        {!isAvailable ? (
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-extrabold uppercase tracking-tight px-2 py-0.5 rounded-full shadow-xs">
            Esgotado
          </span>
        ) : item.badge ? (
          <span className="absolute top-2 left-2 bg-white text-[#1A1D20] text-[9.5px] font-extrabold uppercase tracking-tight px-2.5 py-0.5 rounded-full shadow-xs">
            {item.badge}
          </span>
        ) : null}
      </div>

      {/* 2. Informações do Produto SEMPRE do Lado Direito */}
      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[105px]">
        <div>
          <h3
            className={`text-base md:text-lg font-bold leading-snug group-hover:text-[#FF5E1E] transition-colors truncate ${
              !isAvailable ? 'line-through text-[#6C757D]' : 'text-[#1A1D20]'
            }`}
          >
            {item.name}
          </h3>

          {item.description && (
            <p className="text-[13px] text-[#6C757D] leading-relaxed mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Rodapé interno com Preço e Botão Laranja Circular */}
        <div className="flex items-center justify-between mt-2 pt-1">
          <span
            className={`text-base md:text-lg font-extrabold ${
              !isAvailable ? 'text-[#6C757D]' : 'text-[#1A1D20]'
            }`}
          >
            {formatCurrency(item.price)}
          </span>

          {!isAvailable ? (
            <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
              Esgotado
            </span>
          ) : isStoreClosed ? (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Fechado
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClick()
              }}
              aria-label={`Ver detalhes de ${item.name}`}
              className="w-9 h-9 rounded-full bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

