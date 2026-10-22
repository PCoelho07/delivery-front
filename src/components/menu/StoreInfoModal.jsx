import { useEffect, useState } from 'react'
import {
  X,
  Clock,
  Banknote,
  Store,
  MapPin,
  Truck,
  ShoppingBag,
} from 'lucide-react'

const DAYS_ORDER = [
  { id: 'dom', label: 'Domingo' },
  { id: 'seg', label: 'Segunda' },
  { id: 'ter', label: 'Terça' },
  { id: 'qua', label: 'Quarta' },
  { id: 'qui', label: 'Quinta' },
  { id: 'sex', label: 'Sexta' },
  { id: 'sab', label: 'Sábado' },
]

function getInitialDayId() {
  const currentDayIndex = new Date().getDay()
  return DAYS_ORDER[currentDayIndex]?.id || 'qua'
}

export function StoreInfoModal({ isOpen, onClose, store = {} }) {
  // Dia atual da semana
  const [currentDayId] = useState(getInitialDayId)

  // Fecha com a tecla Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Horários do estabelecimento
  const scheduleList = store.schedule || []
  const scheduleMap = scheduleList.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {})

  // Formas de pagamento aceitas
  const accepted = store.acceptedPaymentMethods || {
    money: true,
    pix: true,
    credit: true,
    debit: true,
  }

  const paymentMethods = []
  if (accepted.money !== false) {
    paymentMethods.push('Dinheiro')
  }
  if (accepted.pix !== false) {
    paymentMethods.push('PIX (chave exibida após o envio)')
  }
  if (accepted.debit !== false) {
    paymentMethods.push('Cartão de Débito - Maquininha')
  }
  if (accepted.credit !== false) {
    paymentMethods.push('Cartão de Crédito - Maquininha')
  }

  if (paymentMethods.length === 0) {
    paymentMethods.push('Pagamento no momento da entrega')
  }

  const deliveryTime = store.estimatedDelivery || '30 - 50 minutos'
  const pickupTime = store.estimatedPickup || '10 - 30 minutos'
  const showPickup = store.allowPickup !== false

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl border border-orange-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Estabelecimento com Paleta Laranja */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 pr-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/80 text-[#FF5E1E] flex items-center justify-center shrink-0 mt-0.5">
              <Store className="w-5 h-5 text-[#FF5E1E]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base sm:text-[17px] font-black text-[#1A1D20] uppercase tracking-tight leading-snug">
                {store.name || 'Estabelecimento'}
              </h2>

              {store.address && (
                <p className="text-xs text-[#6C757D] flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5E1E] shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </p>
              )}

              <div className="pt-0.5 space-y-1 text-xs text-[#495057]">
                <p className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#FF5E1E] shrink-0" />
                  <span>
                    Tempo médio delivery: <strong className="text-[#1A1D20]">{deliveryTime}</strong>
                  </span>
                </p>

                {showPickup && (
                  <p className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#FF5E1E] shrink-0" />
                    <span>
                      Tempo médio balcão: <strong className="text-[#1A1D20]">{pickupTime}</strong>
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full border border-orange-200/80 text-[#6C757D] hover:text-[#FF5E1E] hover:border-[#FF5E1E] hover:bg-orange-50 flex items-center justify-center transition-all shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Linha Divisória Laranja Suave */}
        <hr className="my-4 border-t border-orange-100" />

        {/* Seção 1: Horários de Funcionamento */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-extrabold text-[#1A1D20]">
            <div className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200/80 text-[#FF5E1E] flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#FF5E1E]" />
            </div>
            <span>Horários de Funcionamento</span>
          </div>

          <div className="space-y-1 pt-0.5">
            {DAYS_ORDER.map((dayDef) => {
              const item = scheduleMap[dayDef.id]
              const isToday = dayDef.id === currentDayId
              const isOpen = item?.open !== false

              if (isToday) {
                return (
                  <div
                    key={dayDef.id}
                    className="flex items-center justify-between text-xs sm:text-[13px] py-1.5 px-3 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5E1E] font-black shadow-2xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E1E]" />
                      <span>{dayDef.label} (Hoje)</span>
                    </span>
                    <span>
                      {isOpen ? (
                        item?.start && item?.end ? (
                          `${item.start} - ${item.end}`
                        ) : (
                          '18:00 - 23:30'
                        )
                      ) : (
                        'Fechado'
                      )}
                    </span>
                  </div>
                )
              }

              return (
                <div
                  key={dayDef.id}
                  className="flex items-center justify-between text-xs sm:text-[13px] py-1 px-3 text-[#495057] font-medium"
                >
                  <span className="w-20 sm:w-24 shrink-0">{dayDef.label}</span>
                  <span>
                    {isOpen ? (
                      item?.start && item?.end ? (
                        `${item.start} - ${item.end}`
                      ) : (
                        '18:00 - 23:30'
                      )
                    ) : (
                      <span className="text-gray-400">Fechado</span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Seção 2: Métodos de Pagamento */}
        <div className="space-y-2 mt-4.5 pt-3 border-t border-orange-100/70">
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-extrabold text-[#1A1D20]">
            <div className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200/80 text-[#FF5E1E] flex items-center justify-center shrink-0">
              <Banknote className="w-3.5 h-3.5 text-[#FF5E1E]" />
            </div>
            <span>Métodos de Pagamento</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {paymentMethods.map((method, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 text-xs text-[#343A40] font-semibold py-1.5 px-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF5E1E] shrink-0" />
                <span>{method}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
