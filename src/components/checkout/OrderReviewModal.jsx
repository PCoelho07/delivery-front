import { useEffect, useState } from 'react'
import {
  X,
  Star,
  Clock,
  UtensilsCrossed,
  HeartHandshake,
  Send,
} from 'lucide-react'

function StarRatingInput({ label, icon: Icon, value, onChange }) {
  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-100 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1A1D20]">
          <Icon className="w-4 h-4 text-[#FF5E1E]" strokeWidth={2.2} />
          <span>{label}</span>
        </div>
        <span className="text-[12px] font-bold text-[#FF5E1E] bg-[#FFF3EE] px-2 py-0.5 rounded-full">
          {value} / 5
        </span>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <button
          type="button"
          onClick={() => onChange(0)}
          className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
            value === 0
              ? 'bg-gray-200/80 text-[#1A1D20] border-gray-300'
              : 'bg-white text-[#6C757D] border-gray-200 hover:bg-gray-100'
          }`}
          title="Definir 0 estrelas"
        >
          0 ★
        </button>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= value
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star === value ? 0 : star)}
                aria-label={`${label}: ${star} estrelas`}
                className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    isFilled
                      ? 'text-[#FF5E1E] fill-[#FF5E1E]'
                      : 'text-gray-300 fill-gray-100 hover:text-orange-300'
                  }`}
                  strokeWidth={2}
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function OrderReviewModal({
  isOpen,
  onClose,
  order,
  defaultUserName = '',
  onSubmit,
}) {
  const existingReview = order?.review

  const [deliveryRating, setDeliveryRating] = useState(
    existingReview?.deliveryRating ?? 5
  )
  const [qualityRating, setQualityRating] = useState(
    existingReview?.qualityRating ?? 5
  )
  const [serviceRating, setServiceRating] = useState(
    existingReview?.serviceRating ?? 5
  )
  const [comment, setComment] = useState(existingReview?.comment ?? '')

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

  if (!isOpen || !order) return null

  const overallAverage = (
    (Number(deliveryRating) + Number(qualityRating) + Number(serviceRating)) /
    3
  ).toFixed(1)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.({
      orderId: order.orderId,
      userName: defaultUserName || order.customerName || 'Cliente',
      date: new Date().toLocaleDateString('pt-BR'),
      deliveryRating: Number(deliveryRating),
      qualityRating: Number(qualityRating),
      serviceRating: Number(serviceRating),
      overallRating: Number(overallAverage),
      comment: comment.trim(),
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Avaliar pedido #${order.orderId}`}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-orange-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-5 pt-5 pb-3.5 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF3EE] text-[#FF5E1E] flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-[#FF5E1E]" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#1A1D20] leading-tight">
                Avaliar Pedido #{order.orderId}
              </h2>
              <p className="text-[12px] text-[#6C757D]">
                {order.storeName || 'Brasa Burger'} · {order.createdAt}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de avaliação"
            className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-gray-200/70 text-[#6C757D] hover:text-[#1A1D20] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2.4} />
          </button>
        </div>

        {/* Formulário Rolável */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Destaque da Nota Geral (Média das 3 notas) */}
          <div className="bg-[#FFF3EE]/70 border border-orange-200/70 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5E1E]">
                Nota Geral Calculada
              </span>
              <p className="text-[12px] text-[#6C757D] mt-0.5">
                Média entre entrega, produto e atendimento
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-2xl border border-orange-200 shadow-2xs">
              <Star className="w-5 h-5 text-[#FF5E1E] fill-[#FF5E1E]" />
              <span className="text-[20px] font-extrabold text-[#1A1D20]">
                {overallAverage.replace('.', ',')}
              </span>
            </div>
          </div>

          {/* 3 Campos de 0 a 5 Estrelas */}
          <div className="space-y-2.5">
            <StarRatingInput
              label="Tempo de entrega"
              icon={Clock}
              value={deliveryRating}
              onChange={setDeliveryRating}
            />

            <StarRatingInput
              label="Qualidade do produto"
              icon={UtensilsCrossed}
              value={qualityRating}
              onChange={setQualityRating}
            />

            <StarRatingInput
              label="Atendimento"
              icon={HeartHandshake}
              value={serviceRating}
              onChange={setServiceRating}
            />
          </div>

          {/* Campo Opcional de Comentário */}
          <div>
            <label
              htmlFor="order-review-comment"
              className="block text-[12.5px] font-semibold text-[#1A1D20] mb-1.5"
            >
              Comentário sobre o pedido{' '}
              <span className="text-[#6C757D] font-normal">(opcional)</span>
            </label>
            <textarea
              id="order-review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência com o lanche, entrega ou atendimento..."
              maxLength={300}
              className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-2xl px-3.5 py-2.5 text-[13px] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] transition-colors resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E2E5E9] bg-white hover:bg-gray-50 text-[#6C757D] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar avaliação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
