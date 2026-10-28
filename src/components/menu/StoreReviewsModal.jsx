import { useEffect, useMemo } from 'react'
import {
  X,
  Star,
  Clock,
  UtensilsCrossed,
  HeartHandshake,
  MessageSquareQuote,
  User,
} from 'lucide-react'

function formatScore(value) {
  const num = Number(value) || 0
  return num.toFixed(1).replace('.', ',')
}

function calculateAverage(delivery, quality, service) {
  const d = Number(delivery) || 0
  const q = Number(quality) || 0
  const s = Number(service) || 0
  return (d + q + s) / 3
}

function StarRow({ score = 0, size = 'sm' }) {
  const numericScore = Math.max(0, Math.min(5, Number(score) || 0))
  const roundedStars = Math.round(numericScore)
  const iconClass = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'

  return (
    <div
      className="inline-flex items-center gap-0.5"
      aria-label={`${formatScore(numericScore)} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= roundedStars
        return (
          <Star
            key={starIndex}
            className={`${iconClass} ${
              isFilled
                ? 'text-[#FF5E1E] fill-[#FF5E1E]'
                : 'text-gray-300 fill-gray-100'
            }`}
            strokeWidth={2}
          />
        )
      })}
    </div>
  )
}

export function StoreReviewsModal({
  isOpen,
  onClose,
  store = {},
  reviews = [],
}) {
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

  // Calcula as médias por categoria com base nas avaliações listadas
  const summaryStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        avgDelivery: 5.0,
        avgQuality: 5.0,
        avgService: 5.0,
      }
    }

    const totals = reviews.reduce(
      (acc, rev) => {
        acc.delivery += Number(rev.deliveryRating ?? 5)
        acc.quality += Number(rev.qualityRating ?? 5)
        acc.service += Number(rev.serviceRating ?? 5)
        return acc
      },
      { delivery: 0, quality: 0, service: 0 }
    )

    const count = reviews.length
    return {
      avgDelivery: totals.delivery / count,
      avgQuality: totals.quality / count,
      avgService: totals.service / count,
    }
  }, [reviews])

  if (!isOpen) return null

  const storeRatingDisplay = store.rating || '4,9'
  const totalReviewsCount = store.reviewsCount ?? reviews.length

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Avaliações do estabelecimento"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-orange-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Fixo */}
        <div className="px-5 pt-5 pb-3.5 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF3EE] text-[#FF5E1E] flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-[#FF5E1E]" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#1A1D20] leading-tight">
                Avaliações dos Clientes
              </h2>
              <p className="text-[12px] text-[#6C757D]">
                {store.name || 'Brasa Burger'} · {totalReviewsCount}{' '}
                {totalReviewsCount === 1 ? 'avaliação' : 'avaliações'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de avaliações"
            className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-gray-200/70 text-[#6C757D] hover:text-[#1A1D20] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2.4} />
          </button>
        </div>

        {/* Corpo Rolável */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Painel Resumo da Nota Geral + Médias dos 3 Critérios */}
          <div className="bg-[#FFF3EE]/60 border border-orange-200/60 rounded-2xl p-3.5 flex items-center gap-4">
            <div className="text-center pr-4 border-r border-orange-200/60 shrink-0">
              <div className="text-[28px] font-extrabold text-[#1A1D20] leading-none">
                {storeRatingDisplay}
              </div>
              <div className="mt-1">
                <StarRow
                  score={Number(String(storeRatingDisplay).replace(',', '.'))}
                  size="sm"
                />
              </div>
              <p className="text-[10.5px] font-medium text-[#6C757D] mt-1">
                Nota geral
              </p>
            </div>

            <div className="flex-1 space-y-1.5 text-[12px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#6C757D] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF5E1E]" />
                  Tempo de entrega
                </span>
                <span className="font-bold text-[#1A1D20]">
                  {formatScore(summaryStats.avgDelivery)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#6C757D] flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-[#FF5E1E]" />
                  Qualidade do produto
                </span>
                <span className="font-bold text-[#1A1D20]">
                  {formatScore(summaryStats.avgQuality)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#6C757D] flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#FF5E1E]" />
                  Atendimento
                </span>
                <span className="font-bold text-[#1A1D20]">
                  {formatScore(summaryStats.avgService)}
                </span>
              </div>
            </div>
          </div>

          {/* Lista de Avaliações Individuais */}
          {reviews.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[#6C757D]">
              Ainda não há avaliações detalhadas cadastradas para este
              estabelecimento.
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => {
                const overall =
                  rev.overallRating ??
                  calculateAverage(
                    rev.deliveryRating,
                    rev.qualityRating,
                    rev.serviceRating
                  )

                return (
                  <article
                    key={rev.id}
                    className="rounded-2xl border border-gray-100 bg-[#F8F9FA] p-3.5 space-y-3"
                  >
                    {/* Topo: Nome da pessoa, Data e Nota Geral (Média das 3 notas) */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200/80 text-[#FF5E1E] flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[13.5px] font-bold text-[#1A1D20] truncate">
                            {rev.userName || 'Cliente'}
                          </h3>
                          <p className="text-[11px] text-[#6C757D]">
                            {rev.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <div className="inline-flex items-center gap-1 bg-[#FFF3EE] border border-orange-200/70 text-[#FF5E1E] px-2.5 py-0.5 rounded-full text-[12px] font-extrabold">
                          <Star className="w-3.5 h-3.5 fill-[#FF5E1E]" />
                          <span>{formatScore(overall)}</span>
                        </div>
                        <span className="text-[10px] text-[#6C757D] mt-0.5">
                          Nota geral
                        </span>
                      </div>
                    </div>

                    {/* Os 3 Campos de 0 a 5 Estrelas */}
                    <div className="bg-white rounded-xl p-2.5 border border-gray-100 space-y-1.5 text-[12px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#6C757D] font-medium">
                          Tempo de entrega
                        </span>
                        <div className="flex items-center gap-1.5">
                          <StarRow score={rev.deliveryRating} />
                          <span className="text-[11px] font-bold text-[#1A1D20] w-5 text-right">
                            {rev.deliveryRating ?? 0}/5
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#6C757D] font-medium">
                          Qualidade do produto
                        </span>
                        <div className="flex items-center gap-1.5">
                          <StarRow score={rev.qualityRating} />
                          <span className="text-[11px] font-bold text-[#1A1D20] w-5 text-right">
                            {rev.qualityRating ?? 0}/5
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#6C757D] font-medium">
                          Atendimento
                        </span>
                        <div className="flex items-center gap-1.5">
                          <StarRow score={rev.serviceRating} />
                          <span className="text-[11px] font-bold text-[#1A1D20] w-5 text-right">
                            {rev.serviceRating ?? 0}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Comentário Opcional */}
                    {rev.comment && rev.comment.trim() !== '' && (
                      <div className="flex items-start gap-2 pt-0.5 text-[12.5px] text-[#1A1D20]">
                        <MessageSquareQuote className="w-4 h-4 text-[#FF5E1E] shrink-0 mt-0.5" />
                        <p className="italic text-[#343A40] leading-relaxed">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-[#F8F9FA] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1A1D20] hover:bg-[#2c3035] text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

