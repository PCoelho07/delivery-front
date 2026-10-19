import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  Trash2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  formatCpfMask,
  formatCurrency,
  formatPhoneMask,
} from '../../lib/utils'
import { useCartStore } from '../../store/useCartStore'
import { useCustomerStore } from '../../store/useCustomerStore'

const PAYMENT_OPTIONS = [
  { id: 'money', label: 'Dinheiro', subtitle: null },
  {
    id: 'pix',
    label: 'PIX',
    subtitle: 'Chave exibida após o envio do pedido',
  },
  { id: 'debit', label: 'Cartão de Débito - Maquininha', subtitle: null },
  { id: 'credit', label: 'Cartão de Crédito - Maquininha', subtitle: null },
]

export function CheckoutModal({
  store,
  onBack,
  onAddMoreItems,
  onOrderConfirmed,
}) {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)

  const cachedProfile = useCustomerStore((state) => state.profile)
  const cachedAddress = useCustomerStore((state) => state.address)
  const savedAddresses = useCustomerStore((state) => state.savedAddresses)
  const saveProfile = useCustomerStore((state) => state.saveProfile)
  const saveAddress = useCustomerStore((state) => state.saveAddress)
  const addOrder = useCustomerStore((state) => state.addOrder)

  const hasSavedProfile = Boolean(
    cachedProfile?.name?.trim() && cachedProfile?.phone?.trim()
  )

  const [isEditingProfile, setIsEditingProfile] = useState(!hasSavedProfile)
  const [name, setName] = useState(cachedProfile?.name || '')
  const [phone, setPhone] = useState(
    formatPhoneMask(cachedProfile?.phone || '')
  )
  const [cpf, setCpf] = useState(formatCpfMask(cachedProfile?.cpf || ''))

  const [deliveryMethod, setDeliveryMethod] = useState('delivery')
  const [street, setStreet] = useState(cachedAddress?.street || '')
  const [number, setNumber] = useState(cachedAddress?.number || '')
  const [neighborhoodId, setNeighborhoodId] = useState(
    cachedAddress?.neighborhoodId || ''
  )
  const [complement, setComplement] = useState(cachedAddress?.complement || '')
  const [showSavedAddresses, setShowSavedAddresses] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState('')
  const [changeFor, setChangeFor] = useState('0')

  const neighborhoods = useMemo(
    () => store?.neighborhoods || [],
    [store?.neighborhoods]
  )

  const selectedNeighborhood = useMemo(
    () => neighborhoods.find((n) => n.id === neighborhoodId) || null,
    [neighborhoods, neighborhoodId]
  )

  const totalCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.totalPrice, 0),
    [items]
  )

  const deliveryFee =
    deliveryMethod === 'pickup' ? 0 : selectedNeighborhood?.fee ?? null

  const finalTotal = subtotal + (deliveryFee || 0)

  const isAddressReady =
    deliveryMethod === 'pickup' ||
    Boolean(street.trim() && number.trim() && selectedNeighborhood)

  const phoneDigits = phone.replace(/\D/g, '')
  const isCustomerReady = Boolean(name.trim() && phoneDigits.length >= 10)

  const canSubmitOrder =
    items.length > 0 &&
    isAddressReady &&
    Boolean(paymentMethod) &&
    isCustomerReady

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

  const handleSelectSavedAddress = (addr) => {
    setStreet(addr.street || '')
    setNumber(addr.number || '')
    setNeighborhoodId(addr.neighborhoodId || '')
    setComplement(addr.complement || '')
    setShowSavedAddresses(false)
    toast.success('Endereço preenchido!')
  }

  const handleSaveProfileInline = () => {
    if (!name.trim() || phoneDigits.length < 10) {
      toast.error('Informe seu nome e um telefone válido.')
      return
    }
    saveProfile({
      name: name.trim(),
      phone: formatPhoneMask(phone),
      cpf: formatCpfMask(cpf),
    })
    setIsEditingProfile(false)
    toast.success('Seus dados foram salvos para os próximos pedidos!')
  }

  const handleSubmitOrder = () => {
    if (!canSubmitOrder) {
      if (!isCustomerReady) {
        setIsEditingProfile(true)
        toast.error('Preencha seu nome e um telefone válido.')
        return
      }
      toast.error('Selecione o bairro e a forma de pagamento.')
      return
    }

    const cleanProfile = {
      name: name.trim(),
      phone: formatPhoneMask(phone),
      cpf: formatCpfMask(cpf),
    }
    saveProfile(cleanProfile)

    if (deliveryMethod === 'delivery') {
      saveAddress({
        street: street.trim(),
        number: number.trim(),
        neighborhoodId,
        complement: complement.trim(),
      })
    }

    const now = new Date()
    const formattedDate = now.toLocaleDateString('pt-BR')
    const formattedTime = now.toLocaleTimeString('pt-BR')
    const orderId = String(Math.floor(100000000 + Math.random() * 900000000))
    const parsedChange =
      paymentMethod === 'money'
        ? Number(String(changeFor).replace(',', '.')) || 0
        : 0

    const newOrder = {
      orderId,
      status: 'aceito',
      createdAt: `${formattedDate} ${formattedTime}`,
      storeName: store?.name || 'Brasa Burger',
      storePhone: store?.phone || '(00) 00000-0000',
      whatsapp: store?.whatsapp || '5500000000000',
      instagramUrl: store?.instagramUrl || 'https://instagram.com',
      estimatedTime: store?.estimatedTime || '30 - 50 minutos',
      deliveryMethod,
      customer: cleanProfile,
      address:
        deliveryMethod === 'delivery'
          ? {
              street: street.trim(),
              number: number.trim(),
              neighborhoodId,
              neighborhoodName: selectedNeighborhood?.name || '',
              complement: complement.trim(),
            }
          : null,
      items: [...items],
      subtotal,
      discount: 0,
      deliveryFee: deliveryFee || 0,
      total: finalTotal,
      paymentMethod,
      changeFor: parsedChange,
      pix: store?.pix || {
        key: '00000000000',
        keyType: 'Chave PIX',
        beneficiary: store?.name || 'Brasa Burger',
      },
      rating: null,
    }

    addOrder(newOrder)
    clearCart()
    onOrderConfirmed?.(newOrder)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Finalizar pedido"
      className="fixed inset-0 z-50 flex justify-center bg-black/40 backdrop-blur-[1px]"
    >
      <div className="w-full max-w-[480px] h-dvh bg-[#F8F9FA] flex flex-col overflow-hidden shadow-2xl animate-modal-up">
        {/* Cabeçalho Fixo */}
        <header className="px-4 pt-4 pb-3 flex items-center gap-3 shrink-0 bg-[#F8F9FA]">
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar para a sacola"
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 active:scale-95 flex items-center justify-center shadow-xs transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A1D20]" strokeWidth={2.2} />
          </button>

          <div>
            <h1 className="text-[22px] font-bold text-[#1A1D20] tracking-tight leading-tight">
              Finalizar pedido
            </h1>
            <p className="text-[12.5px] text-[#6C757D]">
              {store?.name || 'Brasa Burger'} · Feito na brasa
            </p>
          </div>
        </header>

        {/* Corpo Rolável */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-5">
          {/* Lista de Itens do Pedido */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-[#1A1D20]">
                Seu pedido · {totalCount} {totalCount === 1 ? 'item' : 'itens'}
              </h2>

              <button
                type="button"
                onClick={onAddMoreItems}
                className="text-[13px] font-semibold text-[#FF5E1E] hover:underline cursor-pointer"
              >
                Adicionar itens
              </button>
            </div>

            <div className="space-y-3">
              {items.map((cartItem) => (
                <article
                  key={cartItem.cartItemId}
                  className="bg-white rounded-2xl p-3 flex items-center gap-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
                >
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

                  <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[78px]">
                    <div>
                      <h3 className="text-[15px] font-bold text-[#1A1D20] truncate">
                        {cartItem.product.name}
                      </h3>
                      <p className="text-[12px] text-[#6C757D] truncate mt-0.5">
                        {formatItemSubtitle(cartItem)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[15px] font-bold text-[#1A1D20]">
                        {formatCurrency(cartItem.totalPrice)}
                      </span>

                      <div className="flex items-center justify-between bg-[#F8F9FA] rounded-xl px-2.5 py-1.5 min-w-[96px]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              cartItem.cartItemId,
                              cartItem.quantity - 1
                            )
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

            {/* Total dos Produtos */}
            <div className="flex items-baseline justify-between mt-4 px-0.5">
              <span className="text-[16px] font-bold text-[#1A1D20]">
                Total dos produtos
              </span>
              <span className="text-[20px] font-extrabold text-[#1A1D20]">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </section>

          {/* Card: Como quer receber? */}
          <section className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <h3 className="text-[14.5px] font-bold text-[#1A1D20] mb-3">
              Como quer receber?
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-[14px] transition-all cursor-pointer ${
                  deliveryMethod === 'delivery'
                    ? 'bg-[#FFF3EE] text-[#FF5E1E] font-semibold'
                    : 'bg-white text-[#6C757D] font-medium hover:text-[#1A1D20]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    deliveryMethod === 'delivery'
                      ? 'bg-[#FF5E1E] text-white'
                      : 'border border-[#CBD5E1] bg-white'
                  }`}
                >
                  {deliveryMethod === 'delivery' && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </span>
                <span>Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-[14px] transition-all cursor-pointer ${
                  deliveryMethod === 'pickup'
                    ? 'bg-[#FFF3EE] text-[#FF5E1E] font-semibold'
                    : 'bg-white text-[#6C757D] font-medium hover:text-[#1A1D20]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    deliveryMethod === 'pickup'
                      ? 'bg-[#FF5E1E] text-white'
                      : 'border border-[#CBD5E1] bg-white'
                  }`}
                >
                  {deliveryMethod === 'pickup' && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </span>
                <span>Retirada</span>
              </button>
            </div>
          </section>

          {/* Card: Endereço de Entrega (Exibido quando Entrega está marcado) */}
          {deliveryMethod === 'delivery' && (
            <section className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin
                    className="w-4 h-4 text-[#FF5E1E]"
                    strokeWidth={2.2}
                  />
                  <h3 className="text-[15px] font-bold text-[#1A1D20]">
                    Endereço de entrega
                  </h3>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSavedAddresses((prev) => !prev)}
                    className="text-[12.5px] font-semibold text-[#FF5E1E] hover:underline cursor-pointer"
                  >
                    Meus Endereços
                  </button>
                )}
              </div>

              {showSavedAddresses && savedAddresses.length > 0 && (
                <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E9] space-y-2">
                  <p className="text-[11.5px] font-semibold text-[#6C757D]">
                    Endereços salvos no aparelho:
                  </p>
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr)}
                      className="w-full text-left p-2 rounded-lg bg-white hover:bg-[#FFF3EE] text-[12.5px] text-[#1A1D20] border border-gray-100 transition-colors cursor-pointer"
                    >
                      <strong>
                        {addr.street}, {addr.number}
                      </strong>{' '}
                      {addr.complement ? `(${addr.complement})` : ''}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-[12px] text-[#6C757D] mb-1">
                  Rua / avenida
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ex: Rua das Palmeiras"
                  className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                />
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4">
                  <label className="block text-[12px] text-[#6C757D] mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="450"
                    className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                  />
                </div>

                <div className="col-span-8">
                  <label className="block text-[12px] text-[#6C757D] mb-1">
                    Bairro / condomínio *
                  </label>
                  <div className="relative">
                    <select
                      value={neighborhoodId}
                      onChange={(e) => setNeighborhoodId(e.target.value)}
                      className={`w-full bg-white border rounded-xl pl-3.5 pr-9 py-2.5 text-[13.5px] appearance-none cursor-pointer focus:outline-none transition-colors ${
                        neighborhoodId
                          ? 'border-[#E2E5E9] text-[#1A1D20]'
                          : 'border-[#FF5E1E] text-[#6C757D]'
                      }`}
                    >
                      <option value="">Selecione o bairro</option>
                      {neighborhoods.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} (+ {formatCurrency(n.fee)})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#FF5E1E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-[#6C757D] mb-1">
                  APTO / Referência / Complemento · opcional
                </label>
                <input
                  type="text"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Ex: Apto 102, Bloco B"
                  className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                />
              </div>
            </section>
          )}

          {/* Card: Seus Dados (Mini-cadastro com Máscaras de Telefone e CPF) */}
          <section className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF5E1E]" strokeWidth={2.2} />
                <h3 className="text-[15px] font-bold text-[#1A1D20]">
                  Seus dados
                </h3>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="text-[12.5px] font-semibold text-[#FF5E1E] hover:underline cursor-pointer"
                >
                  Editar
                </button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="bg-[#F8F9FA] rounded-xl p-3 text-[13px] space-y-1">
                <p className="text-[#1A1D20]">
                  <span className="text-[#6C757D]">Nome:</span>{' '}
                  <strong>{name}</strong>
                </p>
                <p className="text-[#1A1D20]">
                  <span className="text-[#6C757D]">Celular:</span>{' '}
                  <strong>{formatPhoneMask(phone)}</strong>
                </p>
                {cpf && (
                  <p className="text-[#1A1D20]">
                    <span className="text-[#6C757D]">CPF:</span>{' '}
                    <strong>{formatCpfMask(cpf)}</strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] text-[#6C757D] mb-1">
                    Seu nome *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Lucas Mendes"
                    className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] text-[#6C757D] mb-1">
                      Celular / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) =>
                        setPhone(formatPhoneMask(e.target.value))
                      }
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] text-[#6C757D] mb-1">
                      CPF · opcional
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cpf}
                      onChange={(e) => setCpf(formatCpfMask(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E]"
                    />
                  </div>
                </div>

                {hasSavedProfile && (
                  <button
                    type="button"
                    onClick={handleSaveProfileInline}
                    className="text-[12.5px] font-semibold text-[#FF5E1E] hover:underline cursor-pointer"
                  >
                    Salvar alterações
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Card: Forma de Pagamento * */}
          <section className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 mb-3.5">
              <CreditCard
                className="w-4 h-4 text-[#FF5E1E]"
                strokeWidth={2.2}
              />
              <h3 className="text-[15px] font-bold text-[#1A1D20]">
                Forma de pagamento *
              </h3>
            </div>

            <div className="space-y-3.5">
              {PAYMENT_OPTIONS.map((option) => {
                const isSelected = paymentMethod === option.id
                return (
                  <div key={option.id} className="space-y-2.5">
                    <label
                      onClick={() => setPaymentMethod(option.id)}
                      className="flex items-start gap-3 cursor-pointer select-none group"
                    >
                      <span
                        className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-[#FF5E1E] bg-[#FF5E1E] text-white'
                            : 'border-[#CBD5E1] bg-white group-hover:border-[#94A3B8]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>

                      <div>
                        <p className="text-[14px] text-[#1A1D20] leading-snug">
                          {option.label}
                        </p>
                        {option.subtitle && (
                          <p className="text-[12px] text-[#6C757D] mt-0.5">
                            {option.subtitle}
                          </p>
                        )}
                      </div>
                    </label>

                    {/* Caixinha de Troco ao marcar Dinheiro */}
                    {option.id === 'money' && isSelected && (
                      <div className="ml-8 bg-[#F8F9FA] rounded-xl p-3 border border-[#E2E5E9] space-y-1.5">
                        <label className="block text-[12px] font-semibold text-[#1A1D20]">
                          Precisa de troco para quanto? (R$)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={changeFor}
                          onChange={(e) => setChangeFor(e.target.value)}
                          placeholder="0"
                          className="w-full bg-white border border-[#E2E5E9] rounded-xl px-3 py-2 text-[13.5px] font-semibold text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E] transition-colors"
                        />
                        <p className="text-[11.5px] text-[#6C757D]">
                          Se não precisar de troco, pode deixar <strong>0</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Rodapé Fixo de Envio do Pedido */}
        <footer className="shrink-0 bg-white border-t border-gray-100 px-4 pt-3 pb-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-[#6C757D]">
              Subtotal dos produtos
            </span>
            <span className="text-[17px] font-bold text-[#1A1D20]">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-1 mb-3 text-[12.5px] text-[#6C757D]">
            <span>
              {deliveryMethod === 'pickup'
                ? 'Retirada no estabelecimento'
                : 'Entrega calculada por bairro'}
            </span>
            <span className="font-medium text-[#1A1D20]">
              {deliveryMethod === 'pickup'
                ? 'Grátis'
                : deliveryFee !== null
                  ? formatCurrency(deliveryFee)
                  : 'A calcular'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmitOrder}
            className={`w-full h-12 rounded-2xl px-5 font-semibold text-[15px] flex items-center justify-between transition-all ${
              canSubmitOrder
                ? 'bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] text-white cursor-pointer shadow-xs'
                : 'bg-[#D1D5DB] text-[#6C757D] cursor-not-allowed'
            }`}
          >
            <span className="w-5" />
            <span>
              {canSubmitOrder
                ? `Enviar pedido • ${formatCurrency(finalTotal)}`
                : 'Enviar pedido'}
            </span>
            <ArrowRight className="w-5 h-5 stroke-[2.2]" />
          </button>

          {!canSubmitOrder && (
            <p className="text-center text-[11.5px] text-[#6C757D] mt-2">
              {!isCustomerReady
                ? 'Informe seu nome, telefone, bairro e forma de pagamento.'
                : 'Selecione o bairro e a forma de pagamento.'}
            </p>
          )}
        </footer>
      </div>
    </div>
  )
}
