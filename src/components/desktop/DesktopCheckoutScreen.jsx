import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  Trash2,
  Truck,
  User,
  Banknote,
  QrCode,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  formatBirthdayMask,
  formatCurrency,
  formatPhoneMask,
} from '../../lib/utils'
import { useCartStore } from '../../store/useCartStore'
import { useCustomerStore } from '../../store/useCustomerStore'
import { evaluateCoupon } from '../../utils/couponCalculator'
import { ordersWebSocket } from '../../services/ordersWebSocket'

export function DesktopCheckoutScreen({
  store,
  onBackToCart,
  onAddMoreItems,
  onOrderConfirmed,
}) {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const appliedCoupon = useCartStore((state) => state.appliedCoupon)

  const cachedProfile = useCustomerStore((state) => state.profile)
  const cachedAddress = useCustomerStore((state) => state.address)
  const saveProfile = useCustomerStore((state) => state.saveProfile)
  const saveAddress = useCustomerStore((state) => state.saveAddress)
  const addOrder = useCustomerStore((state) => state.addOrder)

  // 1. Forma de recebimento
  const [deliveryMethod, setDeliveryMethod] = useState('delivery') // 'delivery' | 'pickup'

  // 2. Dados de Contato
  const [name, setName] = useState(cachedProfile?.name || '')
  const [phone, setPhone] = useState(
    formatPhoneMask(cachedProfile?.phone || '')
  )
  const [birthday, setBirthday] = useState(
    formatBirthdayMask(cachedProfile?.birthday || '')
  )

  // 3. Endereço de Entrega
  const [street, setStreet] = useState(cachedAddress?.street || '')
  const [number, setNumber] = useState(cachedAddress?.number || '')
  const [complement, setComplement] = useState(cachedAddress?.complement || '')

  const activeNeighborhoods = useMemo(
    () => (store?.neighborhoods || []).filter((n) => n.active !== false),
    [store?.neighborhoods]
  )

  const defaultNeighborhoodId =
    cachedAddress?.neighborhoodId ||
    (activeNeighborhoods.length > 0 ? activeNeighborhoods[0].id : '')

  const [neighborhoodId, setNeighborhoodId] = useState(defaultNeighborhoodId)

  const selectedNeighborhood = useMemo(
    () => activeNeighborhoods.find((n) => n.id === neighborhoodId) || activeNeighborhoods[0] || null,
    [activeNeighborhoods, neighborhoodId]
  )

  // 4. Forma de Pagamento
  const [paymentMethod, setPaymentMethod] = useState('pix') // 'pix' | 'card' | 'money'
  const [changeFor, setChangeFor] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cálculos financeiros
  const totalCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  )
  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.totalPrice, 0),
    [items]
  )

  const deliveryFee = useMemo(() => {
    if (deliveryMethod === 'pickup') return 0
    if (selectedNeighborhood?.fee != null) return Number(selectedNeighborhood.fee)
    return Number(store?.fixedDeliveryFee ?? 4.0)
  }, [deliveryMethod, selectedNeighborhood, store?.fixedDeliveryFee])

  const couponEvaluation = useMemo(() => {
    if (!appliedCoupon) return null
    return evaluateCoupon(appliedCoupon, items)
  }, [appliedCoupon, items])

  const discountAmount = couponEvaluation?.isEligible ? couponEvaluation.discountAmount : 0
  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount)

  const minOrder = Number(store?.minOrder) || 10.0
  const isBelowMin = minOrder > 0 && subtotal < minOrder
  const amountNeeded = minOrder - subtotal

  const isAddressReady =
    deliveryMethod === 'pickup' ||
    Boolean(
      street.trim() &&
        number.trim() &&
        (neighborhoodId || activeNeighborhoods.length === 0)
    )

  const isCustomerReady = Boolean(
    name.trim().length >= 3 && phone.replace(/\D/g, '').length >= 10
  )

  const canSubmitOrder =
    items.length > 0 &&
    !isBelowMin &&
    isAddressReady &&
    Boolean(paymentMethod) &&
    isCustomerReady

  const handleSubmitOrder = async (e) => {
    e?.preventDefault?.()

    if (items.length === 0) {
      toast.error('Adicione itens ao seu pedido para continuar.')
      return
    }

    if (isBelowMin) {
      toast.error('Pedido abaixo do valor mínimo', {
        description: `O pedido mínimo é de ${formatCurrency(minOrder)}. Faltam ${formatCurrency(amountNeeded)}.`,
      })
      return
    }

    if (!canSubmitOrder) {
      if (!isCustomerReady) {
        toast.error('Informe seu nome completo e telefone de contato.')
        return
      }
      if (!isAddressReady) {
        toast.error('Informe a rua, número e bairro de entrega.')
        return
      }
      toast.error('Selecione a forma de pagamento.')
      return
    }

    const cleanName = name.trim()
    const rawPhone = phone.replace(/\D/g, '')

    if (!cleanName || cleanName.length < 3) {
      toast.error('Informe seu nome completo.')
      return
    }

    if (rawPhone.length < 10) {
      toast.error('Informe um telefone/WhatsApp válido com DDD.')
      return
    }

    if (deliveryMethod === 'delivery') {
      if (!street.trim()) {
        toast.error('Informe a rua/avenida de entrega.')
        return
      }
      if (!number.trim()) {
        toast.error('Informe o número da residência.')
        return
      }
      if (!neighborhoodId && activeNeighborhoods.length > 0) {
        toast.error('Selecione seu bairro.')
        return
      }
    }

    if (!paymentMethod) {
      toast.error('Selecione a forma de pagamento.')
      return
    }

    setIsSubmitting(true)

    // Salva perfil e endereço do cliente para próximas compras
    saveProfile({
      name: cleanName,
      phone: rawPhone,
      birthday: birthday.trim(),
    })

    if (deliveryMethod === 'delivery') {
      saveAddress({
        street: street.trim(),
        number: number.trim(),
        neighborhoodId: selectedNeighborhood?.id || '',
        neighborhoodName: selectedNeighborhood?.name || '',
        complement: complement.trim(),
      })
    }

    const orderId = String(Math.floor(10000 + Math.random() * 90000))
    const now = new Date()

    const newOrder = {
      orderId,
      createdAt: now.toISOString(),
      dateFormatted: now.toLocaleDateString('pt-BR'),
      timeFormatted: now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'aceito',
      storeName: store?.name || 'Brasa Burger',
      customer: {
        name: cleanName,
        phone: rawPhone,
        birthday: birthday.trim(),
      },
      deliveryMethod,
      deliveryAddress:
        deliveryMethod === 'delivery'
          ? {
              street: street.trim(),
              number: number.trim(),
              neighborhood: selectedNeighborhood?.name || 'Centro',
              complement: complement.trim(),
            }
          : null,
      paymentMethod,
      changeFor: paymentMethod === 'money' ? changeFor : null,
      items: [...items],
      subtotal,
      deliveryFee,
      discountAmount,
      total: finalTotal,
      coupon: appliedCoupon ? { ...appliedCoupon } : null,
    }

    // Persiste no store de pedidos do cliente
    addOrder(newOrder)

    // Dispara via WebSocket caso o backend Go esteja conectado
    try {
      ordersWebSocket.sendNewOrder?.(newOrder)
    } catch (err) {
      console.warn('Falha silenciosa ao enviar WebSocket:', err)
    }

    // Limpa a sacola
    clearCart()

    setIsSubmitting(false)
    toast.success(`Pedido #${orderId} enviado com sucesso!`)
    onOrderConfirmed?.(newOrder)
  }

  return (
    <div className="w-full min-h-screen bg-[#F4F6F8] py-8 antialiased">
      <div className="max-w-5xl mx-auto px-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBackToCart}
            aria-label="Voltar para a sacola"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A1D20]" strokeWidth={2.2} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1D20] tracking-tight">
              Finalizar Pedido
            </h1>
            <p className="text-xs text-[#6C757D]">
              Preencha seus dados de entrega e forma de pagamento
            </p>
          </div>
        </div>

        {/* Layout Responsivo em 2 Colunas */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna da Esquerda: Formulários (7 Colunas no Desktop) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Bloco 1: Forma de Entrega */}
            <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
              <h2 className="text-sm font-bold text-[#1A1D20] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FF5E1E]" strokeWidth={2.2} />
                <span>Como você quer receber seu pedido?</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-2.5 cursor-pointer transition-all ${
                    deliveryMethod === 'delivery'
                      ? 'border-[#FF5E1E] bg-[#FFF3EE]/50 shadow-2xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={() => setDeliveryMethod('delivery')}
                    className="accent-[#FF5E1E]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#1A1D20]">Entrega em casa</p>
                    <p className="text-[11px] text-[#6C757D]">35 a 50 minutos</p>
                  </div>
                </label>

                <label
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-2.5 cursor-pointer transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'border-[#FF5E1E] bg-[#FFF3EE]/50 shadow-2xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    className="accent-[#FF5E1E]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#1A1D20]">Retirar no balcão</p>
                    <p className="text-[11px] text-[#6C757D]">15 a 25 minutos</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Bloco 2: Seus Dados de Contato */}
            <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-[#1A1D20] flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF5E1E]" strokeWidth={2.2} />
                <span>Seus Dados de Contato</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1A1D20] mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Lucas Mendes"
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1D20] mb-1">
                    WhatsApp / Celular *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                  />
                </div>

                {/* Campo de Aniversário DD/MM */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1D20] mb-1">
                    Dia e mês de aniversário <span className="text-[#6C757D] font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={birthday}
                    onChange={(e) => setBirthday(formatBirthdayMask(e.target.value))}
                    placeholder="DD/MM (Ex: 15/08)"
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Bloco 3: Endereço de Entrega */}
            {deliveryMethod === 'delivery' && (
              <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
                <h2 className="text-sm font-bold text-[#1A1D20] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF5E1E]" strokeWidth={2.2} />
                  <span>Endereço de Entrega</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1A1D20] mb-1">
                      Rua / Avenida *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ex: Rua das Acácias"
                      className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1D20] mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ex: 142"
                      className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1D20] mb-1">
                      Bairro *
                    </label>
                    <select
                      value={neighborhoodId}
                      onChange={(e) => setNeighborhoodId(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                    >
                      {activeNeighborhoods.length > 0 ? (
                        activeNeighborhoods.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name} (+ {formatCurrency(n.fee ?? 4.0)})
                          </option>
                        ))
                      ) : (
                        <option value="">Centro (+ R$ 4,00)</option>
                      )}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1A1D20] mb-1">
                      Complemento / Ponto de Referência
                    </label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto 204 / Próximo à pracinha"
                      className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Bloco 4: Forma de Pagamento */}
            <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
              <h2 className="text-sm font-bold text-[#1A1D20] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FF5E1E]" strokeWidth={2.2} />
                <span>Forma de Pagamento *</span>
              </h2>

              <div className="space-y-2">
                {/* PIX */}
                <label
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-[#FF5E1E] bg-[#FFF3EE]/40 shadow-2xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pix"
                    checked={paymentMethod === 'pix'}
                    onChange={() => setPaymentMethod('pix')}
                    className="accent-[#FF5E1E]"
                  />
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1A1D20]">
                        PIX (Chave exibida logo após o envio)
                      </p>
                      <p className="text-[11px] text-[#6C757D]">
                        Aprovação rápida e sem taxas
                      </p>
                    </div>
                  </div>
                </label>

                {/* Cartão na Maquininha */}
                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#FF5E1E] bg-[#FFF3EE]/40 shadow-2xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-[#FF5E1E]"
                  />
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1A1D20]">
                        Cartão de Crédito ou Débito na Maquininha
                      </p>
                      <p className="text-[11px] text-[#6C757D]">
                        O entregador leva a maquininha até você
                      </p>
                    </div>
                  </div>
                </label>

                {/* Dinheiro */}
                <label
                  onClick={() => setPaymentMethod('money')}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'money'
                      ? 'border-[#FF5E1E] bg-[#FFF3EE]/40 shadow-2xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="money"
                    checked={paymentMethod === 'money'}
                    onChange={() => setPaymentMethod('money')}
                    className="accent-[#FF5E1E]"
                  />
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1A1D20]">Dinheiro</p>
                      <p className="text-[11px] text-[#6C757D]">
                        Informe se precisa de troco
                      </p>
                    </div>
                  </div>
                </label>

                {/* Campo de troco quando dinheiro estiver selecionado */}
                {paymentMethod === 'money' && (
                  <div className="pt-2 pl-9">
                    <label className="block text-xs font-semibold text-[#1A1D20] mb-1">
                      Precisa de troco para quanto? (Ex: R$ 50,00 ou 0 se não precisar)
                    </label>
                    <input
                      type="text"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      placeholder="Ex: R$ 50,00"
                      className="w-full max-w-xs bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E]"
                    />
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Coluna da Direita: Resumo Fixo de Envio (5 Colunas no Desktop) */}
          <aside className="lg:col-span-5 sticky top-6 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-md space-y-4">
              <div className="border-b border-gray-100 pb-3.5 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-base text-[#1A1D20]">
                    Seu Pedido
                  </h2>
                  <span className="text-xs text-[#6C757D]">
                    {totalCount} {totalCount === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onAddMoreItems || onBackToCart}
                  className="text-xs font-bold text-[#FF5E1E] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Adicionar itens</span>
                </button>
              </div>

              {/* Itens com Controle de Quantidade e Exclusão no Checkout */}
              <div className="space-y-2.5 text-xs max-h-60 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <div className="py-6 px-3 text-center space-y-1.5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-[#1A1D20]">Seu pedido está sem itens</p>
                    <button
                      type="button"
                      onClick={onAddMoreItems || onBackToCart}
                      className="text-xs font-bold text-[#FF5E1E] hover:underline cursor-pointer"
                    >
                      + Adicionar itens do cardápio
                    </button>
                  </div>
                ) : (
                  items.map((it) => (
                    <div
                      key={it.cartItemId}
                      className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100 space-y-2 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[#1A1D20] text-[13px] truncate">
                            {it.quantity}x {it.product.name}
                          </p>
                          {it.addons?.length > 0 && (
                            <p className="text-[11px] text-[#6C757D] truncate mt-0.5">
                              + {it.addons.map((a) => a.name).join(', ')}
                            </p>
                          )}
                          {it.observation && (
                            <p className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-1 line-clamp-1 inline-block">
                              Obs: {it.observation}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(it.cartItemId)}
                          className="text-gray-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer shrink-0"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                        <span className="font-extrabold text-[#FF5E1E] text-xs sm:text-[13px]">
                          {formatCurrency(it.totalPrice)}
                        </span>

                        {/* Stepper de Ajuste no Próprio Checkout */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (it.quantity === 1) {
                                removeItem(it.cartItemId)
                              } else {
                                updateQuantity(it.cartItemId, it.quantity - 1)
                              }
                            }}
                            className="w-6 h-6 rounded-md bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-[#1A1D20] transition-colors cursor-pointer"
                            title={it.quantity === 1 ? 'Remover' : 'Diminuir'}
                          >
                            {it.quantity === 1 ? (
                              <Trash2 className="w-3 h-3 text-rose-500" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                          </button>

                          <span className="w-4 text-center text-xs font-bold text-[#1A1D20]">
                            {it.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(it.cartItemId, it.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-[#FF5E1E] hover:bg-[#E64E12] text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                            title="Aumentar"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Preços e Totais */}
              <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-[#6C757D]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#1A1D20]">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>
                    Entrega {deliveryMethod === 'pickup' ? '(Retirada)' : `(${selectedNeighborhood?.name || 'Padrão'}):`}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#FF5E1E]">
                    <span>Desconto de Cupom:</span>
                    <span className="font-bold">- {formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-extrabold text-[#1A1D20] pt-2 border-t border-gray-100">
                  <span>Total a Pagar:</span>
                  <span className="text-xl font-black text-[#FF5E1E]">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Aviso de Pedido Mínimo idêntico ao mobile */}
              {isBelowMin && (
                <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">
                      Pedido mínimo: <strong>{formatCurrency(minOrder)}</strong>
                    </span>
                  </div>
                  <span className="font-extrabold text-amber-900 text-[11px] bg-amber-200/80 px-2.5 py-1 rounded-lg shrink-0">
                    Faltam {formatCurrency(amountNeeded)}
                  </span>
                </div>
              )}

              {/* Botão de Confirmar Pedido idêntico ao mobile */}
              <button
                type="submit"
                disabled={!canSubmitOrder || isSubmitting}
                className={`w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                  canSubmitOrder && !isSubmitting
                    ? 'bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] text-white cursor-pointer'
                    : 'bg-[#D1D5DB] text-[#6C757D] cursor-not-allowed shadow-none'
                }`}
              >
                <span>
                  {isBelowMin
                    ? `Abaixo do mínimo (${formatCurrency(minOrder)})`
                    : canSubmitOrder
                    ? 'Confirmar e Enviar Pedido'
                    : 'Enviar pedido'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!canSubmitOrder && (
                <p className="text-center text-[11.5px] text-[#6C757D] mt-2 leading-relaxed">
                  {isBelowMin
                    ? `Pedido abaixo do mínimo de ${formatCurrency(minOrder)}. Adicione mais itens.`
                    : !isCustomerReady
                    ? 'Informe seu nome e telefone de contato.'
                    : !isAddressReady
                    ? 'Informe o endereço de entrega.'
                    : 'Selecione a forma de pagamento.'}
                </p>
              )}
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}

