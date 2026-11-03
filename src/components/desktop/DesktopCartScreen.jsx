import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  TicketPercent,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'
import { useCartStore } from '../../store/useCartStore'
import { useStoreAdmin } from '../../store/useStoreAdmin'
import { evaluateCoupon } from '../../utils/couponCalculator'

export function DesktopCartScreen({
  store,
  onBackToMenu,
  onContinueToCheckout,
}) {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const removeUnavailableItems = useCartStore((state) => state.removeUnavailableItems)
  const clearCart = useCartStore((state) => state.clearCart)
  const appliedCoupon = useCartStore((state) => state.appliedCoupon)
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon)
  const removeAppliedCoupon = useCartStore((state) => state.removeAppliedCoupon)

  const adminCoupons = useStoreAdmin((state) => state.coupons) || []

  const [couponCode, setCouponCode] = useState('')
  const [showCouponInput, setShowCouponInput] = useState(true)

  const hasUnavailableItems = useMemo(
    () => items.some((item) => item.isUnavailable),
    [items]
  )

  const totalCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  )
  const totalAmount = useMemo(
    () => items.reduce((acc, item) => acc + item.totalPrice, 0),
    [items]
  )

  const minOrder = Number(store?.minOrder) || 10.0
  const isBelowMin = totalCount > 0 && totalAmount < minOrder
  const amountNeeded = minOrder - totalAmount

  const deliveryFee = Number(store?.fixedDeliveryFee ?? 4.0)

  // Avaliação do cupom
  const couponEvaluation = useMemo(() => {
    if (!appliedCoupon) return null
    return evaluateCoupon(appliedCoupon, items)
  }, [appliedCoupon, items])

  const discountAmount = couponEvaluation?.isEligible ? couponEvaluation.discountAmount : 0
  const finalTotal = Math.max(0, totalAmount + deliveryFee - discountAmount)

  const handleApplyCoupon = (e) => {
    e?.preventDefault?.()
    const cleanCode = couponCode.trim().toUpperCase()
    if (!cleanCode) {
      toast.error('Digite o código do cupom.')
      return
    }

    const found = adminCoupons.find(
      (c) => c.code.toUpperCase() === cleanCode && c.active !== false
    )

    if (!found) {
      toast.error('Cupom inválido ou expirado.')
      return
    }

    const evalResult = evaluateCoupon(found, items)
    if (!evalResult.isEligible) {
      toast.error('Cupom não aplicável a estes itens', {
        description: evalResult.reason || 'Nenhum item participante encontrado na sacola.',
      })
      return
    }

    setAppliedCoupon(found)
    setCouponCode('')
    toast.success(`Cupom "${found.code}" aplicado com sucesso!`)
  }

  const handleAdvance = () => {
    if (items.length === 0) {
      toast.error('Sua sacola está vazia.')
      return
    }
    if (hasUnavailableItems) {
      toast.error('Itens indisponíveis na sacola', {
        description: 'Remova os produtos excluídos ou esgotados para avançar para a finalização.',
      })
      return
    }
    if (store?.statusMode === 'paused') {
      toast.error('O restaurante pausou os pedidos temporariamente.')
      return
    }
    if (store?.isOpen === false) {
      toast.error('O restaurante está fechado no momento.')
      return
    }
    if (isBelowMin) {
      toast.error('Pedido abaixo do valor mínimo', {
        description: `O pedido mínimo é de ${formatCurrency(minOrder)}. Faltam ${formatCurrency(amountNeeded)}.`,
      })
      return
    }
    onContinueToCheckout?.()
  }

  return (
    <div className="w-full min-h-screen bg-[#F4F6F8] py-8 antialiased">
      <div className="max-w-5xl xl:max-w-6xl mx-auto px-6">
        {/* Cabeçalho da Sacola */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onBackToMenu}
              aria-label="Voltar para o cardápio"
              className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1D20]" strokeWidth={2.2} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1A1D20] tracking-tight">
                Sua Sacola de Pedidos
              </h1>
              <p className="text-xs text-[#6C757D]">
                {store?.name || 'Brasa Burger'} · {totalCount}{' '}
                {totalCount === 1 ? 'item selecionado' : 'itens selecionados'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToMenu}
            className="text-xs sm:text-sm font-bold text-[#FF5E1E] hover:underline cursor-pointer"
          >
            + Adicionar mais itens
          </button>
        </div>

        {/* Estado Vazio */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs space-y-4 max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF3EE] text-[#FF5E1E] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1D20]">Sua sacola está vazia</h2>
              <p className="text-xs text-[#6C757D] mt-1 max-w-xs mx-auto">
                Você ainda não adicionou nenhum lanche ou bebida à sua sacola.
              </p>
            </div>
            <button
              type="button"
              onClick={onBackToMenu}
              className="px-6 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Ver Cardápio
            </button>
          </div>
        ) : (
          /* Grid Responsiva com mais espaço para o Resumo e Botão */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Coluna da Esquerda: Itens da Sacola + Cupom (7 Colunas no Desktop) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Aviso se houver itens excluídos ou esgotados */}
              {hasUnavailableItems && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-rose-950">
                        Produtos indisponíveis na sacola
                      </p>
                      <p className="text-[11px] text-rose-700">
                        Um ou mais itens foram pausados ou excluídos pelo restaurante. Remova-os para concluir o pedido.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeUnavailableItems}
                    className="px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100/50 transition-colors cursor-pointer shrink-0"
                  >
                    Remover indisponíveis
                  </button>
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className={`bg-white rounded-2xl p-4 sm:p-4.5 border shadow-2xs flex items-center justify-between gap-4 transition-colors ${
                    item.isUnavailable
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-gray-200/80'
                  }`}
                >
                  {/* Foto do Produto */}
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-gray-100 shrink-0 relative">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className={`w-full h-full object-cover ${
                          item.isUnavailable ? 'grayscale opacity-60' : ''
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[#6C757D]">
                        Sem foto
                      </div>
                    )}
                    {item.isUnavailable && (
                      <span className="absolute inset-x-0 bottom-0 bg-rose-600 text-white text-[9px] font-extrabold text-center py-0.5">
                        ESGOTADO
                      </span>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-[#1A1D20] text-base leading-snug truncate">
                        {item.quantity}x {item.product.name}
                      </h2>
                      {item.isUnavailable && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                          Indisponível
                        </span>
                      )}
                    </div>

                    {item.isUnavailable && item.unavailableReason && (
                      <p className="text-xs text-rose-600 font-medium mt-0.5">
                        {item.unavailableReason}
                      </p>
                    )}

                    {/* Adicionais */}
                    {item.addons?.length > 0 && (
                      <div className="space-y-0.5 mt-0.5">
                        {item.addons.map((a, i) => (
                          <p key={a.id || i} className="text-xs text-[#6C757D] truncate">
                            + {a.name}{' '}
                            {Number(a.price) > 0 &&
                              `(+ ${formatCurrency(a.price)})`}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Preferências */}
                    {item.preferences?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.preferences.map((p, i) => (
                          <span
                            key={p.id || i}
                            className="text-[10px] text-[#6C757D] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Observação */}
                    {item.observation && (
                      <p className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
                        Obs: {item.observation}
                      </p>
                    )}

                    <p className={`font-extrabold text-sm sm:text-base mt-1 ${
                      item.isUnavailable ? 'text-gray-400 line-through' : 'text-[#FF5E1E]'
                    }`}>
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>

                  {/* Stepper de Quantidade e Excluir */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeItem(item.cartItemId)
                        } else {
                          updateQuantity(item.cartItemId, item.quantity - 1)
                        }
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xs text-[#1A1D20] transition-colors cursor-pointer"
                      title={item.quantity === 1 ? 'Remover item' : 'Diminuir quantidade'}
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <span className="font-bold text-sm w-4 text-center text-[#1A1D20]">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (item.isUnavailable) {
                          toast.error('Este produto está esgotado ou indisponível.')
                          return
                        }
                        updateQuantity(item.cartItemId, item.quantity + 1)
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                        item.isUnavailable
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#FF5E1E] hover:bg-[#E64E12] text-white'
                      }`}
                      title="Aumentar quantidade"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Bloco de Cupom de Desconto IDÊNTICO AO MOBILE */}
              <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-gray-200/80 shadow-2xs space-y-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-950 truncate">
                          Cupom {appliedCoupon.code} aplicado com sucesso!
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          {appliedCoupon.discountPercent}% de desconto {couponEvaluation?.scopeLabel ? `(${couponEvaluation.scopeLabel})` : ''} (-{formatCurrency(discountAmount)})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeAppliedCoupon}
                      className="text-xs font-bold text-emerald-700 hover:text-rose-600 transition-colors cursor-pointer ml-3 shrink-0"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowCouponInput(!showCouponInput)}
                      className="w-full flex items-center justify-between cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5E1E] flex items-center justify-center shrink-0">
                          <TicketPercent className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-[#1A1D20]">
                            Possui cupom de desconto?
                          </p>
                          <p className="text-[11px] text-[#6C757D]">
                            Insira seu código promocional
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-[#6C757D] transition-transform ${
                          showCouponInput ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {showCouponInput && (
                      <form
                        onSubmit={handleApplyCoupon}
                        className="pt-2 border-t border-gray-100 flex gap-2"
                      >
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="DIGITE SEU CUPOM"
                          className="flex-1 bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-[#1A1D20] placeholder:text-gray-400 placeholder:font-normal outline-none focus:border-[#FF5E1E]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                        >
                          Aplicar
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Coluna da Direita: Resumo Financeiro & Botão de Avançar (5 Colunas) */}
            <aside className="lg:col-span-5 sticky top-6">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-extrabold text-[#1A1D20] text-base">
                    Resumo do Pedido
                  </h3>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-[#6C757D] hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Esvaziar Sacola
                  </button>
                </div>

                <div className="space-y-2 text-xs sm:text-[13px] text-[#6C757D]">
                  <div className="flex justify-between items-center">
                    <span>Itens ({totalCount} unidades):</span>
                    <span className="font-semibold text-[#1A1D20]">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Taxa de entrega prevista:</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(deliveryFee)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-[#FF5E1E]">
                      <span>Desconto de Cupom:</span>
                      <span className="font-bold">- {formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline text-xs sm:text-sm font-bold text-[#1A1D20] pt-2.5 border-t border-gray-100">
                    <span>Total da Sacola:</span>
                    <span className="text-base sm:text-lg font-extrabold text-[#FF5E1E]">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Aviso de Pedido Mínimo */}
                {isBelowMin && !hasUnavailableItems && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Pedido mínimo: {formatCurrency(minOrder)}</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Falta {formatCurrency(amountNeeded)} para atingir o mínimo.
                      </p>
                    </div>
                  </div>
                )}

                {/* Botão Alinhado e Proporcional */}
                <button
                  type="button"
                  onClick={handleAdvance}
                  disabled={isBelowMin || hasUnavailableItems || store?.isOpen === false || store?.statusMode === 'paused'}
                  className={`w-full py-3 px-4 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer ${
                    isBelowMin || hasUnavailableItems || store?.isOpen === false || store?.statusMode === 'paused'
                      ? 'bg-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-[#FF5E1E] hover:bg-[#E64E12]'
                  }`}
                >
                  <span>
                    {hasUnavailableItems
                      ? 'Remova os itens indisponíveis para avançar'
                      : 'Avançar para Endereço & Dados'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
