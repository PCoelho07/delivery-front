import {
  ChevronRight,
  ClipboardList,
  Flame,
  ShoppingBag,
  Star,
  Clock,
  ChevronDown,
} from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

export function StoreHeader({
  store,
  ordersCount = 0,
  onOpenCustomerHub,
  onOpenStoreInfo,
}) {
  const shortBrand =
    store.shortBrand ||
    (store.name ? store.name.split(' ')[0].toUpperCase().slice(0, 8) : 'LOJA')

  return (
    <div className="w-full bg-[#F8F9FA]">
      {/* Banner de Capa */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[#1A1D20]">
        {store.bannerUrl ? (
          <img
            src={store.bannerUrl}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#1A1D20] to-[#2c3035]" />
        )}

        {/* Botão de Acesso Rápido a Meus Pedidos / Perfil */}
        {ordersCount > 0 && (
          <button
            type="button"
            onClick={onOpenCustomerHub}
            className="absolute top-3 right-3 bg-white/95 hover:bg-white active:scale-95 text-[#1A1D20] text-[11.5px] font-semibold px-3 py-1.5 rounded-full shadow-md inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-[#FF5E1E]" />
            <span>Meus pedidos ({ordersCount})</span>
          </button>
        )}
      </div>

      {/* Logo Circular Sobreposta */}
      <div className="relative z-10 -mt-9 mx-auto w-[76px] h-[76px] rounded-full bg-[#1A1D20] border-[3.5px] border-[#F8F9FA] flex flex-col items-center justify-center overflow-hidden shadow-xs">
        {store.logoUrl ? (
          <img
            src={store.logoUrl}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <Flame className="w-5 h-5 text-[#FF5E1E] mb-0.5" strokeWidth={2.2} />
            <span className="text-[11px] font-extrabold tracking-wider text-white uppercase leading-none">
              {shortBrand}
            </span>
          </>
        )}
      </div>

      {/* Nome, Subtítulo e Avaliações */}
      <div className="px-4 text-center mt-1.5">
        <h1 className="text-[22px] font-bold text-[#1A1D20] tracking-tight leading-tight">
          {store.name || 'Nome do Estabelecimento'}
        </h1>

        {store.subtitle && (
          <p className="text-[13px] text-[#6C757D] mt-0.5">{store.subtitle}</p>
        )}

        {(store.rating || store.distance) && (
          <button
            type="button"
            onClick={onOpenStoreInfo}
            className="flex items-center justify-center gap-1 text-[13px] mt-1.5 cursor-pointer group mx-auto"
          >
            {store.rating && (
              <>
                <Star className="w-3.5 h-3.5 text-[#FF5E1E]" strokeWidth={2.2} />
                <span className="font-bold text-[#1A1D20]">{store.rating}</span>
              </>
            )}
            {store.reviewsCount && (
              <span className="text-[#6C757D]">
                ({store.reviewsCount} avaliações)
              </span>
            )}
            {store.distance && (
              <span className="text-[#6C757D]">· {store.distance}</span>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-[#6C757D] group-hover:text-[#FF5E1E] transition-colors" />
          </button>
        )}
      </div>

      {/* Barra de Pedido Mínimo, Horário e Status */}
      <div className="mx-4 mt-3 mb-1 bg-white rounded-xl px-3.5 py-2.5 flex items-center justify-between text-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <ShoppingBag
            className="w-4 h-4 text-[#FF5E1E] shrink-0"
            strokeWidth={2.2}
          />
          <span className="font-semibold text-[#1A1D20]">
            Pedido mín. {formatCurrency(store.minOrder ?? 10)}
          </span>
        </div>

        {/* Botão de Horário de Funcionamento com Horário de Hoje */}
        <button
          type="button"
          onClick={onOpenStoreInfo}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF5E1E] border border-orange-200/80 font-bold text-[11.5px] transition-all active:scale-95 cursor-pointer shadow-2xs group"
          title="Ver todos os horários e informações da loja"
        >
          <Clock className="w-3.5 h-3.5 text-[#FF5E1E] shrink-0" />
          <span className="truncate max-w-[125px] sm:max-w-none">
            {store.todayHours || store.openingHours || '18:00 às 23:30'}
          </span>
          <ChevronDown className="w-3 h-3 text-[#FF5E1E] shrink-0 group-hover:translate-y-0.5 transition-transform" />
        </button>

        {/* Status Aberto / Fechado */}
        <button
          type="button"
          onClick={onOpenStoreInfo}
          className={`font-semibold text-xs cursor-pointer shrink-0 transition-opacity hover:opacity-85 ${
            store.statusMode === 'paused'
              ? 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[11px]'
              : store.isOpen !== false
              ? 'text-[#FF5E1E]'
              : 'text-[#6C757D]'
          }`}
        >
          {store.statusMode === 'paused'
            ? 'Fechado temporariamente'
            : store.isOpen !== false
            ? 'Aberto'
            : 'Fechado'}
        </button>
      </div>
    </div>
  )
}
