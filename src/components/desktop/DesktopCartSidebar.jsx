import { useMemo, useState } from 'react'
import {
  ArrowRight,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  TicketPercent,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'
import { useCartStore } from '../../store/useCartStore'
import { useStoreAdmin } from '../../store/useStoreAdmin'
import { evaluateCoupon } from '../../utils/couponCalculator'

export function DesktopCartSidebar({
  store,
  onOpenCart,
}) {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const appliedCoupon = useCartStore((state) => state.appliedCoupon)
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon)
  const removeAppliedCoupon = useCartStore((state) => state.removeAppliedCoupon)

  const adminCoupons = useStoreAdmin((state) => state.coupons) || []

  const [couponCode, setCouponCode] = useState('')
  const [showCouponInput, setShowCouponInput] = useState(false)

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

  // Avaliação de cupom
  const couponEvaluation = useMemo(() => {
    if (!appliedCoupon) return null
    return evaluateCoupon(appliedCoupon, items)
  }, [appliedCoupon, items])

  const discountAmount = couponEvaluation?.isEligible ? couponEvaluation.discountAmount : 0
  const finalTotal = Math.max(0, totalAmount + deliveryFee - discountAmount)

  const handleApplyCoupon = (e) => {
    e.preventDefault()
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
    setShowCouponInput(false)
    setCouponCode('')
    toast.success(`Cupom "${found.code}" aplicado com sucesso!`)
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.info('Sua sacola está vazia.')
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
    onOpenCart?.()
  }

  return (
    <aside className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-[168px] self-start z-20">
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-md flex flex-col max-h-[calc(100vh-190px)] overflow-hidden">
        {/* Cabeçalho Fixo da Sacola */}
        <div
          onClick={onOpenCart}
          className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0 cursor-pointer group"
          title="Clique para abrir a sacola completa"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFF3EE] text-[#FF5E1E] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1D20] group-hover:text-[#FF5E1E] transition-colors">
                Sua Sacola
              </h3>
              <p className="text-[11px] text-[#6C757D] truncate max-w-[160px]">
                {store?.name || 'Brasa Burger'}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-[#FF5E1E] bg-[#FFF3EE] px-2.5 py-0.5 rounded-full">
            {totalCount} {totalCount === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {/* Estado Vazio */}
        {items.length === 0 ? (
          <div className="py-10 text-center space-y-2.5 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF5E1E] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 stroke-[1.8]" />
            </div>
            <p className="text-sm font-bold text-[#1A1D20]">Sua sacola está vazia</p>
            <p className="text-xs text-[#6C757D] max-w-[200px] mx-auto leading-relaxed">
              Escolha itens saborosos do cardápio para começar o seu pedido.
            </p>
          </div>
        ) : (
          <>
            {/* Lista de Itens Rolável com Scroll Suave */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 my-3 pr-1">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100 flex flex-col gap-2 group hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#1A1D20] leading-snug truncate">
                        {item.quantity}x {item.product.name}
                      </h4>

                      {/* Opcionais e Adicionais Selecionados */}
                      {item.addons?.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {item.addons.map((a, i) => (
                            <p
                              key={a.id || i}
                              className="text-[11px] text-[#6C757D] truncate"
                            >
                              + {a.name}{' '}
                              {Number(a.price) > 0 &&
                                `(+ ${formatCurrency(a.price)})`}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Preferências */}
                      {item.preferences?.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {item.preferences.map((p, i) => (
                            <span
                              key={p.id || i}
                              className="text-[10px] text-[#6C757D] bg-white px-1.5 py-0.5 rounded border border-gray-200"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Observações */}
                      {item.observation && (
                        <p className="text-[10.5px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1 line-clamp-1">
                          Obs: {item.observation}
                        </p>
                      )}
                    </div>

                    {/* Botão Remover */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-gray-400 hover:text-rose-500 transition-colors p-0.5 shrink-0 cursor-pointer"
                      title="Remover item da sacola"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Preço e Stepper de Quantidade */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-gray-200/60">
                    <span className="text-xs sm:text-[13px] font-extrabold text-[#FF5E1E]">
                      {formatCurrency(item.totalPrice)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-[#1A1D20] transition-colors cursor-pointer"
                        title="Diminuir quantidade"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-4 text-center text-xs font-bold text-[#1A1D20]">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-[#FF5E1E] hover:bg-[#E64E12] text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                        title="Aumentar quantidade"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé Fixo da Sacola */}
            <div className="shrink-0 pt-2 border-t border-gray-100 space-y-2.5">
              {/* Cupom de Desconto */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-emerald-950 truncate">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-emerald-700 text-[10.5px]">
                          -{formatCurrency(discountAmount)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAppliedCoupon()}
                      className="text-emerald-700 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                      title="Remover cupom"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : showCouponInput ? (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="EX: PRIMEIRACOMPRA"
                        className="flex-1 bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-2.5 py-1.5 text-xs uppercase font-bold text-[#1A1D20] placeholder:text-gray-400 focus:outline-none focus:border-[#FF5E1E]"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-95 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                      >
                        Aplicar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCouponInput(false)}
                        className="px-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(true)}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-orange-50/50 hover:bg-orange-50 border border-orange-100/70 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FFF0EB] text-[#FF5E1E] flex items-center justify-center shrink-0">
                        <TicketPercent className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A1D20] leading-tight">
                          Possui cupom de desconto?
                        </p>
                        <p className="text-[10px] text-[#6C757D]">
                          Clique para inserir o código
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#6C757D] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              {/* Totais Financeiros */}
              <div className="space-y-1.5 text-xs text-[#6C757D]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#1A1D20]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Entrega estimada:</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(deliveryFee)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#FF5E1E]">
                    <span>Desconto de Cupom:</span>
                    <span className="font-bold">- {formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold text-[#1A1D20] pt-1.5 border-t border-gray-100">
                  <span>Total:</span>
                  <span className="text-base text-[#FF5E1E]">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Aviso de Pedido Mínimo */}
              {isBelowMin && (
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

              {/* CTA Finalizar / Abrir Carrinho */}
              <div className="space-y-1.5 pt-0.5">
                <button
                  type="button"
                  disabled={isBelowMin || store?.isOpen === false || store?.statusMode === 'paused'}
                  onClick={handleCheckout}
                  className={`w-full py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                    isBelowMin || store?.isOpen === false || store?.statusMode === 'paused'
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99]'
                  }`}
                >
                  <span>Continuar para Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onOpenCart}
                  className="w-full text-center text-[11px] font-semibold text-[#6C757D] hover:text-[#1A1D20] transition-colors py-0.5 cursor-pointer"
                >
                  Ver sacola completa com cupom detalhado
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

