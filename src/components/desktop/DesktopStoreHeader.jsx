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
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
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

export function DesktopStoreHeader({
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

  const todayHoursFormatted =
    store.todayHours || store.openingHours || '18:00 às 23:30'

  return (
    <header className="relative w-full">
      {/* 1. Imagem no Topo Absoluto da Página com Efeito Ambient / Anti-Zoom */}
      <div className="relative h-60 sm:h-64 md:h-72 lg:h-80 w-full overflow-hidden bg-[#1A1D20]">
        {store.bannerUrl ? (
          <>
            {/* Camada de Fundo: Efeito Ambiente Desfocado (preenche toda a largura da tela em monitores ultra-wide sem distorcer) */}
            <img
              src={store.bannerUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
            />

            {/* Camada Central: Banner com Proporção Natural e Enquadramento Otimizado (sem zoom excessivo) */}
            <div className="relative h-full max-w-5xl xl:max-w-6xl mx-auto overflow-hidden">
              <img
                src={store.bannerUrl}
                alt={store.name}
                className="w-full h-full object-cover object-center"
              />
              {/* Vinhetas laterais suaves para fusão com o fundo escuro ambiente */}
              <div className="absolute inset-y-0 left-0 w-20 sm:w-28 bg-gradient-to-r from-[#1A1D20]/90 via-[#1A1D20]/30 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-20 sm:w-28 bg-gradient-to-l from-[#1A1D20]/90 via-[#1A1D20]/30 to-transparent pointer-events-none" />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#1A1D20] to-[#2c3035]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1D20]/80 via-transparent to-black/25 pointer-events-none" />
      </div>

      {/* 2. Card de Informações da Loja Sobreposto */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-md -mt-14 sm:-mt-16 md:-mt-20 z-10 space-y-4">
          {/* Linha Superior: Logo + Identidade e Pílulas de Operação */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Logo e Nome da Loja */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1A1D20] border-4 border-white shadow-md flex items-center justify-center shrink-0 -mt-10 sm:-mt-12 md:-mt-14 relative z-10 overflow-hidden">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Flame className="w-6 h-6 text-[#FF5E1E]" strokeWidth={2.2} />
                    <span className="text-[10px] font-extrabold tracking-wider text-white uppercase leading-none mt-0.5">
                      {shortBrand}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1D20] tracking-tight leading-tight">
                    {store.name || 'Brasa Burger'}
                  </h1>

                  {/* Selo de Avaliações Clicável */}
                  {store.rating && (
                    <button
                      type="button"
                      onClick={onOpenReviews}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-2xs hover:border-[#FF5E1E] hover:bg-orange-50 active:scale-95 transition-all text-xs cursor-pointer group"
                      title="Clique para ver todas as avaliações com notas detalhadas"
                    >
                      <Star className="w-3.5 h-3.5 text-[#FF5E1E] fill-[#FF5E1E]" />
                      <span className="font-bold text-[#1A1D20] group-hover:text-[#FF5E1E]">
                        {store.rating}
                      </span>
                      {store.reviewsCount && (
                        <span className="text-[#6C757D] underline decoration-gray-300 underline-offset-2 group-hover:text-[#FF5E1E] group-hover:decoration-[#FF5E1E]">
                          ({store.reviewsCount} avaliações)
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-[#FF5E1E] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-[13px] text-[#6C757D] mt-1">
                  {store.subtitle || 'Hambúrguer artesanal · Feito na brasa'} · Entrega média:{' '}
                  {store.estimatedDelivery || store.estimatedTime || '35-50 min'}
                </p>
              </div>
            </div>

            {/* Pílulas de Operação (Ped. Mínimo, Horário e Aberto/Fechado) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
              {/* Pedido Mínimo */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1A1D20]">
                <ShoppingBag className="w-4 h-4 text-[#FF5E1E]" />
                <span>
                  Ped. mín. <strong>{formatCurrency(store.minOrder ?? 10)}</strong>
                </span>
              </div>

              {/* Horário de Funcionamento */}
              <button
                type="button"
                onClick={onOpenStoreInfo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1A1D20] hover:border-[#FF5E1E] hover:bg-orange-50/50 transition-colors cursor-pointer"
                title="Ver horários completos e informações da loja"
              >
                <Clock className="w-4 h-4 text-[#FF5E1E]" />
                <span>
                  Hoje: <strong>{todayHoursFormatted}</strong>
                </span>
                <Info className="w-3 h-3 text-[#6C757D]" />
              </button>

              {/* Status Aberto / Fechado */}
              <span
                className={`font-bold px-3 py-1.5 rounded-xl border text-xs inline-flex items-center gap-1.5 ${
                  store.statusMode === 'paused'
                    ? 'text-rose-700 bg-rose-50 border-rose-200'
                    : store.isOpen !== false
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-gray-600 bg-gray-100 border-gray-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    store.statusMode === 'paused'
                      ? 'bg-rose-500'
                      : store.isOpen !== false
                      ? 'bg-emerald-500'
                      : 'bg-gray-400'
                  }`}
                />
                {store.statusMode === 'paused'
                  ? 'Pausado'
                  : store.isOpen !== false
                  ? 'Aberto agora'
                  : 'Fechado'}
              </span>
            </div>
          </div>

          {/* Linha Inferior: Canto Inferior Direito com Meus Pedidos + WhatsApp + Instagram */}
          <div className="flex items-center justify-end pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2.5">
              {/* Meus Pedidos na parte de baixo junto com zap e insta */}
              <button
                type="button"
                onClick={onOpenCustomerHub}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#FF5E1E] hover:bg-orange-50/60 active:scale-95 text-[#1A1D20] font-bold text-xs shadow-2xs transition-all cursor-pointer"
                title="Ver histórico e status dos meus pedidos"
              >
                <ClipboardList className="w-4 h-4 text-[#FF5E1E]" />
                <span>Meus Pedidos {ordersCount > 0 ? `(${ordersCount})` : ''}</span>
              </button>

              {/* WhatsApp no canto inferior direito */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Falar no WhatsApp"
                  className="w-8 h-8 rounded-full bg-white hover:bg-emerald-50 text-emerald-600 border border-gray-200 hover:border-emerald-300 shadow-2xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-emerald-600" />
                </a>
              )}

              {/* Instagram no canto inferior direito */}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver Instagram"
                  className="w-8 h-8 rounded-full bg-white hover:bg-rose-50 text-rose-600 border border-gray-200 hover:border-rose-300 shadow-2xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
