import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Flame,
  Minus,
  Plus,
  TicketPercent,
  Trash2,
} from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { useCartStore } from '../../store/useCartStore'

export function CartModal({ store, onClose, onContinueToDelivery }) {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)

  const [showCouponInput, setShowCouponInput] = useState(false)
  const [couponCode, setCouponCode] = useState('')

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0)

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

          {/* Card Adicionar Cupom */}
          {items.length > 0 && (
            <section className="bg-white rounded-2xl p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
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
                      Adicionar cupom
                    </p>
                    <p className="text-[12px] text-[#6C757D] mt-0.5">
                      {couponCode ? `Cupom: ${couponCode.toUpperCase()}` : 'Opcional'}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#6C757D]" />
              </button>

              {showCouponInput && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Digite o código do cupom"
                    className="flex-1 bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3 py-2 text-[13px] text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(false)}
                    className="px-4 py-2 rounded-xl bg-[#FF5E1E] text-white text-[13px] font-semibold cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
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

              <div className="border-t border-gray-100" />

              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-bold text-[#1A1D20]">
                  Total dos produtos
                </span>
                <span className="text-[20px] font-extrabold text-[#1A1D20]">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <p className="text-[11.5px] text-[#6C757D]">
                Entrega calculada por bairro na próxima etapa.
              </p>
            </section>
          )}
        </div>

        {/* Rodapé Fixo com Botão Continuar para Entrega */}
        {items.length > 0 && (
          <footer className="shrink-0 bg-white border-t border-gray-100 px-4 py-3.5">
            <button
              type="button"
              onClick={onContinueToDelivery}
              className="w-full h-12 bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] text-white font-semibold text-[15px] rounded-2xl px-5 flex items-center justify-between transition-all cursor-pointer shadow-xs"
            >
              <span className="w-5" />
              <span>Continuar para entrega</span>
              <ArrowRight className="w-5 h-5 stroke-[2.2]" />
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}

