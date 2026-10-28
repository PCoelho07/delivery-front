import {
  ClipboardList,
  Flame,
  ShoppingBag,
  Star,
  Clock,
  Info,
  ChevronRight,
} from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8.01 12.27C8.14 12.44 9.76 14.94 12.24 16.01C12.83 16.27 13.29 16.42 13.65 16.54C14.24 16.73 14.78 16.7 15.21 16.64C15.69 16.57 16.68 16.04 16.89 15.45C17.1 14.86 17.1 14.36 17.04 14.25C16.97 14.15 16.81 14.09 16.57 13.97C16.33 13.85 15.14 13.27 14.92 13.19C14.7 13.11 14.54 13.07 14.38 13.31C14.21 13.56 13.75 14.09 13.61 14.25C13.47 14.42 13.33 14.44 13.09 14.32C12.85 14.2 11.83 13.87 10.63 12.8C9.7 11.97 9.07 10.94 8.95 10.74C8.83 10.53 8.94 10.42 9.06 10.3C9.17 10.19 9.3 10.02 9.42 9.87C9.54 9.73 9.58 9.62 9.66 9.46C9.74 9.3 9.7 9.15 9.64 9.04C9.58 8.93 9.11 7.78 8.92 7.31C8.73 6.86 8.53 6.92 8.39 6.91C8.25 6.91 8.09 6.91 7.93 6.91L8.53 7.33Z" />
    </svg>
  )
}

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export function StoreHeader({
  store,
  ordersCount = 0,
  onOpenCustomerHub,
  onOpenStoreInfo,
  onOpenReviews,
}) {
  const shortBrand =
    store.shortBrand ||
    (store.name ? store.name.split(' ')[0].toUpperCase().slice(0, 8) : 'LOJA')

  const cleanPhone = (store.whatsapp || store.phone || '').replace(/\D/g, '')
  const whatsappUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone.startsWith('55') ? cleanPhone.slice(2) : cleanPhone}`
    : null

  const instagramRaw = store.instagram || store.instagramUrl || ''
  const instagramUrl = instagramRaw
    ? (instagramRaw.startsWith('http')
        ? instagramRaw
        : `https://instagram.com/${instagramRaw.replace(/^@/, '')}`)
    : null

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

      {/* Faixa Interativa Abaixo do Banner: Redes Sociais no Canto Superior Esquerdo e Logo Centralizada */}
      <div className="relative z-10 -mt-9 px-4 flex items-center justify-between">
        {/* Canto superior esquerdo abaixo do plano de fundo (ajuste de altura via pt-11) */}
        <div className="flex items-center gap-2 pt-11 shrink-0">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp"
              title="Falar no WhatsApp"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#25D366]/10 text-[#25D366] border border-gray-200/90 shadow-2xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 fill-[#25D366]" />
            </a>
          )}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver Instagram"
              title="Ver Instagram"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#E4405F]/10 text-[#E4405F] border border-gray-200/90 shadow-2xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <InstagramIcon className="w-4 h-4 stroke-[2.2]" />
            </a>
          )}
        </div>

        {/* Logo Circular Centralizada */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[76px] h-[76px] rounded-full bg-[#1A1D20] border-[3.5px] border-[#F8F9FA] flex flex-col items-center justify-center overflow-hidden shadow-xs">
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

        {/* Espaçador à direita para balanceamento */}
        <div className="w-16 shrink-0" />
      </div>

      {/* Nome, Subtítulo e Avaliações */}
      <div className="px-4 text-center mt-1.5">
        <h1 className="text-[22px] font-bold text-[#1A1D20] tracking-tight leading-tight">
          {store.name || 'Nome do Estabelecimento'}
        </h1>

        {store.subtitle && (
          <p className="text-[13px] text-[#6C757D] mt-0.5">{store.subtitle}</p>
        )}

        {store.rating && (
          <button
            type="button"
            onClick={onOpenReviews}
            title="Clique para ver as avaliações do estabelecimento"
            className="inline-flex items-center justify-center gap-1.5 text-[13px] mt-2 mx-auto px-3 py-1 rounded-full bg-white border border-gray-200/90 shadow-2xs hover:border-[#FF5E1E]/40 hover:bg-orange-50/70 active:scale-95 transition-all cursor-pointer group select-none"
          >
            <Star
              className="w-3.5 h-3.5 text-[#FF5E1E] fill-[#FF5E1E] shrink-0"
              strokeWidth={2}
            />
            <span className="font-bold text-[#1A1D20] group-hover:text-[#FF5E1E] transition-colors">
              {store.rating}
            </span>
            {store.reviewsCount && (
              <span className="text-[#6C757D] underline decoration-[#6C757D]/60 underline-offset-2 group-hover:text-[#FF5E1E] group-hover:decoration-[#FF5E1E] transition-colors">
                ({store.reviewsCount} avaliações)
              </span>
            )}
            <ChevronRight
              className="w-3.5 h-3.5 text-[#FF5E1E] shrink-0 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.4}
            />
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

        {/* Horário de Funcionamento (Única parte clicável com ícone informativo I) */}
        <button
          type="button"
          onClick={onOpenStoreInfo}
          className="inline-flex items-center gap-1.5 py-1 px-1.5 text-[#1A1D20] hover:text-[#FF5E1E] transition-colors cursor-pointer group shrink-0"
          title="Clique para ver os horários de funcionamento e informações da loja"
        >
          <Clock className="w-3.5 h-3.5 text-[#FF5E1E] shrink-0" strokeWidth={2.2} />
          <span className="font-semibold text-[11.5px] truncate max-w-[125px] sm:max-w-none">
            {store.todayHours || store.openingHours || '18:00 às 23:30'}
          </span>
          <Info className="w-3.5 h-3.5 text-[#6C757D] group-hover:text-[#FF5E1E] transition-colors shrink-0" />
        </button>

        {/* Status Aberto / Fechado (Informativo, não clicável) */}
        <span
          className={`font-bold text-xs shrink-0 select-none ${
            store.statusMode === 'paused'
              ? 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[11px]'
              : store.isOpen !== false
              ? 'text-emerald-600'
              : 'text-[#6C757D]'
          }`}
        >
          {store.statusMode === 'paused'
            ? 'Fechado temporariamente'
            : store.isOpen !== false
            ? 'Aberto'
            : 'Fechado'}
        </span>
      </div>
    </div>
  )
}
