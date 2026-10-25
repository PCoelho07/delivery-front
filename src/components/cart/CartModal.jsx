import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Flame,
  Minus,
  Plus,
  TicketPercent,
  Trash2,
  AlertTriangle,
  X,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'
import { useCartStore } from '../../store/useCartStore'
import { useStoreAdmin } from '../../store/useStoreAdmin'
import { evaluateCoupon } from '../../utils/couponCalculator'

export function CartModal({ store, onClose, onContinueToDelivery }) {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const appliedCoupon = useCartStore((state) => state.appliedCoupon)
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon)
  const removeAppliedCoupon = useCartStore((state) => state.removeAppliedCoupon)

  const adminCoupons = useStoreAdmin((state) => state.coupons) || []

  const [showCouponInput, setShowCouponInput] = useState(false)
  const [couponCode, setCouponCode] = useState('')

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0)

  // Pedido Mínimo
  const minOrder = Number(store?.minOrder) || 0
  const isBelowMin = minOrder > 0 && totalAmount < minOrder
  const amountNeeded = minOrder - totalAmount

  // Desconto do Cupom com Avaliação de Escopo (Geral, Categoria ou Produto)
  const couponEvaluation = useMemo(() => {
    if (!appliedCoupon) return null
    return evaluateCoupon(appliedCoupon, items)
  }, [appliedCoupon, items])

  const discountAmount = couponEvaluation?.isEligible ? couponEvaluation.discountAmount : 0
  const finalProductTotal = Math.max(0, totalAmount - discountAmount)

  const handleApplyCoupon = () => {
    const cleanCode = couponCode.trim().toUpperCase()
    if (!cleanCode) {
      toast.error('Digite o código do cupom.')
      return
    }

    const found = adminCoupons.find(
      (c) => c.code.toUpperCase() === cleanCode && c.active !== false
    )

    if (!found) {
      toast.error('Cupom inválido ou expirado.', {
        description: 'Verifique o código digitado e tente novamente.',
      })
      return
    }

    const evaluation = evaluateCoupon(found, items)
    if (!evaluation.isEligible) {
      toast.error('Cupom não aplicável a estes itens', {
        description: evaluation.reason || 'Nenhum item participante encontrado na sua sacola.',
      })
      return
    }

    setAppliedCoupon(found)
    setShowCouponInput(false)
    setCouponCode('')
    toast.success(`Cupom "${found.code}" aplicado com sucesso!`, {
      description: `${found.discountPercent}% de desconto ${evaluation.scopeLabel}.`,
    })
  }

  const handleRemoveCoupon = () => {
    removeAppliedCoupon()
    toast.info('Cupom removido.')
  }

  const handleProceed = () => {
    if (isBelowMin) {
      toast.error('Pedido abaixo do valor mínimo', {
        description: `O pedido mínimo desta loja é de ${formatCurrency(minOrder)}. Adicione mais ${formatCurrency(amountNeeded)} para avançar para a entrega.`,
      })
      return
    }
    onContinueToDelivery?.()
  }

  const shortBrand =
    store?.shortBrand ||
    (store?.name ? store.name.split(' ')[0].toUpperCase().slice(0, 8) : 'BRASA')

  const handleClearCart = () => {
    clearCart()
    onClose?.()
  }

  const formatItemSubtitle = (cartItem) => {
    const parts = []
    if (cartItem.addons?.length > 0) {
      parts.push(cartItem.addons.map((a) => a.name).join(', '))
    }
    if (cartItem.preferences?.length > 0) {
      parts.push(cartItem.preferences.map((p) => p.name).join(', '))
    }
    if (cartItem.observation) {
      parts.push(`Obs: ${cartItem.observation}`)
    }
    if (parts.length > 0) {
      return parts.join(' · ')
    }
    return cartItem.product.description || ''
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sua sacola"
      className="fixed inset-0 z-50 flex justify-center bg-black/40 backdrop-blur-[1px]"
    >
      <div className="w-full max-w-[480px] h-dvh bg-[#F8F9FA] flex flex-col overflow-hidden shadow-2xl animate-modal-up">
        {/* Cabeçalho Fixo da Sacola */}
        <header className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0 bg-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Voltar para o cardápio"
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 active:scale-95 flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1D20]" strokeWidth={2.2} />
            </button>

            <h1 className="text-[22px] font-bold text-[#1A1D20] tracking-tight">
              Sua sacola
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="text-[13.5px] font-medium text-[#6C757D] hover:text-[#1A1D20] transition-colors cursor-pointer"
            >
              Limpar
            </button>
          )}
        </header>

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-5">
          {/* Identificação do Estabelecimento */}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-12 h-12 rounded-full bg-[#1A1D20] flex flex-col items-center justify-center shrink-0 overflow-hidden">
              {store?.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Flame
                    className="w-4 h-4 text-[#FF5E1E] mb-0.5"
                    strokeWidth={2.2}
                  />
                  <span className="text-[9px] font-extrabold tracking-wider text-white uppercase leading-none">
                    {shortBrand}
                  </span>
                </>
              )}
            </div>

            <div>
              <h2 className="text-[15px] font-bold text-[#1A1D20] leading-tight">
                {store?.name || 'Brasa Burger'}
              </h2>
              <p className="text-[12.5px] text-[#6C757D] mt-0.5">
                Feito na brasa, do seu jeito.
              </p>
            </div>
          </div>

          {/* Lista de Itens do Pedido */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#1A1D20]">
                Seu pedido · {totalCount} {totalCount === 1 ? 'item' : 'itens'}
              </h3>

              <button
                type="button"
                onClick={onClose}
                className="text-[13px] font-semibold text-[#FF5E1E] hover:underline cursor-pointer"
              >
                Adicionar itens
              </button>
            </div>

            {items.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center space-y-3 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                <p className="text-[14px] text-[#6C757D]">
                  Sua sacola está vazia.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#FF5E1E] text-white text-[13px] font-semibold cursor-pointer"
                >
                  Escolher itens no cardápio
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((cartItem) => (
                  <article
                    key={cartItem.cartItemId}
                    className="bg-white rounded-2xl p-3 flex items-center gap-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
                  >
                    {/* Foto do Item */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#F8F9FA]">
                      {cartItem.product.imageUrl ? (
                        <img
                          src={cartItem.product.imageUrl}
                          alt={cartItem.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[11px] text-[#6C757D]">
                          Sem foto
                        </div>
                      )}
                    </div>

                    {/* Detalhes + Preço e Stepper */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[78px]">
                      <div>
                        <h4 className="text-[15px] font-bold text-[#1A1D20] truncate">
                          {cartItem.product.name}
                        </h4>
                        <p className="text-[12px] text-[#6C757D] truncate mt-0.5">
                          {formatItemSubtitle(cartItem)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[15px] font-bold text-[#1A1D20]">
                          {formatCurrency(cartItem.totalPrice)}
                        </span>

                        {/* Controle de Quantidade / Lixeira */}
                        <div className="flex items-center justify-between bg-[#F8F9FA] rounded-xl px-2.5 py-1.5 min-w-[96px]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                cartItem.cartItemId,
                                cartItem.quantity - 1
                              )
                            }
                            aria-label={
                              cartItem.quantity <= 1
                                ? `Remover ${cartItem.product.name}`
                                : 'Diminuir quantidade'
                            }
                            className="p-0.5 text-[#FF5E1E] hover:text-[#E64E12] transition-colors cursor-pointer"
                          >
                            {cartItem.quantity <= 1 ? (
                              <Trash2 className="w-4 h-4 stroke-[2]" />
                            ) : (
                              <Minus className="w-4 h-4 stroke-[2.2]" />
                            )}
                          </button>

                          <span className="text-[14px] font-bold text-[#1A1D20] px-2 select-none">
                            {cartItem.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                cartItem.cartItemId,
                                cartItem.quantity + 1
                              )
                            }
                            aria-label="Aumentar quantidade"
                            className="p-0.5 text-[#FF5E1E] hover:text-[#E64E12] transition-colors cursor-pointer"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Card de Cupom de Desconto */}
          {items.length > 0 && (
            <section className="bg-white rounded-2xl p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-2.5">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-emerald-950 truncate">
                        Cupom {appliedCoupon.code} aplicado!
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        {appliedCoupon.discountPercent}% OFF {couponEvaluation?.scopeLabel ? `(${couponEvaluation.scopeLabel})` : ''} (-{formatCurrency(discountAmount)})
                      </p>
                      {couponEvaluation && !couponEvaluation.isEligible && (
                        <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                          Itens elegíveis ausentes na sacola.
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-lg text-emerald-700 hover:text-rose-600 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                    title="Remover cupom"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowCouponInput((prev) => !prev)}
                    className="w-full flex items-center justify-between cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] flex items-center justify-center shrink-0">
                        <TicketPercent
                          className="w-5 h-5 text-[#FF5E1E]"
                          strokeWidth={2}
                        />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#1A1D20] leading-tight">
                          Possui cupom de desconto?
                        </p>
                        <p className="text-[12px] text-[#6C757D] mt-0.5">
                          Insira o código promocional para obter desconto em %
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#6C757D]" />
                  </button>

                  {showCouponInput && (
                    <div className="pt-2 border-t border-gray-100 flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleApplyCoupon()
                          }
                        }}
                        placeholder="Ex: PRIMEIRACOMPRA"
                        className="flex-1 bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3 py-2 text-[13px] font-bold uppercase text-[#1A1D20] placeholder:text-[#ADB5BD] placeholder:font-normal focus:outline-none focus:border-[#FF5E1E]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-[13px] font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* Card Resumo do Pedido */}
          {items.length > 0 && (
            <section className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-3">
              <h3 className="text-[15px] font-bold text-[#1A1D20]">
                Resumo do pedido
              </h3>

              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-[#6C757D]">
                  Subtotal · {totalCount} {totalCount === 1 ? 'item' : 'itens'}
                </span>
                <span className="font-semibold text-[#1A1D20]">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              {appliedCoupon && couponEvaluation?.isEligible && (
                <div className="flex items-center justify-between text-[13.5px] text-emerald-700 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>
                      Desconto ({appliedCoupon.code} -{appliedCoupon.discountPercent}%
                      {couponEvaluation?.scopeLabel ? ` ${couponEvaluation.scopeLabel}` : ''})
                    </span>
                  </span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="border-t border-gray-100" />

              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-bold text-[#1A1D20]">
                  Total dos produtos
                </span>
                <div className="text-right">
                  {appliedCoupon && (
                    <span className="text-xs line-through text-[#6C757D] block">
                      {formatCurrency(totalAmount)}
                    </span>
                  )}
                  <span className="text-[20px] font-extrabold text-[#1A1D20]">
                    {formatCurrency(finalProductTotal)}
                  </span>
                </div>
              </div>

              <p className="text-[11.5px] text-[#6C757D]">
                Entrega calculada por bairro na próxima etapa.
              </p>
            </section>
          )}
        </div>

        {/* Rodapé Fixo com Alerta de Pedido Mínimo e Botão Continuar para Entrega */}
        {items.length > 0 && (
          <footer className="shrink-0 bg-white border-t border-gray-100 px-4 py-3.5 space-y-2.5">
            {isBelowMin && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-medium">
                    Pedido mínimo: <strong className="font-bold">{formatCurrency(minOrder)}</strong>
                  </span>
                </div>
                <span className="font-extrabold text-amber-900 text-[11px] bg-amber-200/80 px-2.5 py-0.5 rounded-lg shrink-0">
                  Faltam {formatCurrency(amountNeeded)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleProceed}
              className={`w-full h-12 font-semibold text-[15px] rounded-2xl px-5 flex items-center justify-between transition-all ${
                isBelowMin
                  ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-xs'
                  : 'bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] text-white cursor-pointer shadow-xs'
              }`}
            >
              <span className="w-5" />
              <span>
                {isBelowMin
                  ? `Mínimo não atingido (Faltam ${formatCurrency(amountNeeded)})`
                  : 'Continuar para entrega'}
              </span>
              <ArrowRight className="w-5 h-5 stroke-[2.2]" />
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}

