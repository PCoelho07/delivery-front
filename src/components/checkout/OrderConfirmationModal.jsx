import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Copy,
  Edit3,
  LogOut,
  MessageCircle,
  RotateCcw,
  Star,
  Store,
  Truck,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  formatCpfMask,
  formatCurrency,
  formatPhoneMask,
} from '../../lib/utils'
import {
  buildWhatsAppOrderUrl,
  formatWhatsAppOrderMessage,
} from '../../lib/whatsapp'
import { useCustomerStore } from '../../store/useCustomerStore'

const PAYMENT_NAMES = {
  money: 'Dinheiro',
  pix: 'PIX',
  debit: 'Cartão de Débito - Maquininha',
  credit: 'Cartão de Crédito - Maquininha',
}

const ORDER_STATUS_STEPS = [
  { id: 'aceito', label: 'Aceito', icon: CheckCircle2 },
  { id: 'preparo', label: 'Em preparo', icon: ChefHat },
  { id: 'entrega', label: 'Saiu p/ entrega', icon: Truck },
]

export function OrderConfirmationModal({
  activeOrder,
  store,
  onBackToMenu,
  onRepeatOrder,
}) {
  const profile = useCustomerStore((state) => state.profile)
  const orders = useCustomerStore((state) => state.orders)
  const saveProfile = useCustomerStore((state) => state.saveProfile)
  const clearProfile = useCustomerStore((state) => state.clearProfile)
  const updateOrderStatus = useCustomerStore((state) => state.updateOrderStatus)
  const rateOrder = useCustomerStore((state) => state.rateOrder)
  const rateOrderItem = useCustomerStore((state) => state.rateOrderItem)

  const [copiedPix, setCopiedPix] = useState(false)
  const [showProductRating, setShowProductRating] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState(profile?.name || '')
  const [editPhone, setEditPhone] = useState(
    formatPhoneMask(profile?.phone || '')
  )
  const [editCpf, setEditCpf] = useState(formatCpfMask(profile?.cpf || ''))
  const [ratingOrderId, setRatingOrderId] = useState(null)

  const currentOrder =
    orders.find((o) => o.orderId === activeOrder?.orderId) ||
    activeOrder ||
    orders[0] ||
    null

  const currentStatusId = currentOrder?.status || 'aceito'
  const instagramUrl =
    currentOrder?.instagramUrl || store?.instagramUrl || 'https://instagram.com'

  const pixData = currentOrder?.pix ||
    store?.pix || {
      key: '00000000000',
      keyType: 'Chave PIX',
      beneficiary: store?.name || 'Brasa Burger',
    }

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixData.key)
      setCopiedPix(true)
      toast.success('Chave PIX copiada para a área de transferência!')
      setTimeout(() => setCopiedPix(false), 2500)
    } catch {
      toast.error('Não foi possível copiar automaticamente.')
    }
  }

  const handleOpenWhatsApp = (orderToSend) => {
    if (!orderToSend) return
    const url = buildWhatsAppOrderUrl(
      orderToSend.whatsapp || store?.whatsapp,
      orderToSend
    )
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleStatusChange = (statusId) => {
    if (!currentOrder) return
    updateOrderStatus(currentOrder.orderId, statusId)
    const step = ORDER_STATUS_STEPS.find((s) => s.id === statusId)
    toast.success(`Status atualizado: ${step?.label}`)
  }

  const handleRateProduct = (cartItemId, productName, stars) => {
    if (!currentOrder) return
    rateOrderItem(currentOrder.orderId, cartItemId, stars)
    rateOrder(currentOrder.orderId, stars)
    toast.success(`Você avaliou "${productName}" com ${stars} estrelas!`)
  }

  const handleSaveProfile = () => {
    const phoneDigits = editPhone.replace(/\D/g, '')
    if (!editName.trim() || phoneDigits.length < 10) {
      toast.error('Nome e um celular válido são obrigatórios.')
      return
    }
    saveProfile({
      name: editName.trim(),
      phone: formatPhoneMask(editPhone),
      cpf: formatCpfMask(editCpf),
    })
    setIsEditingProfile(false)
    toast.success('Perfil atualizado!')
  }

  const handleLogoutProfile = () => {
    clearProfile()
    setEditName('')
    setEditPhone('')
    setEditCpf('')
    toast.info('Dados do perfil removidos deste aparelho.')
  }

  const handleSelectStar = (orderId, stars) => {
    rateOrder(orderId, stars)
    setRatingOrderId(null)
    toast.success(`Obrigado pela sua avaliação de ${stars} estrelas!`)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirmação e Histórico de Pedidos"
      className="fixed inset-0 z-50 flex justify-center bg-black/40 backdrop-blur-[1px]"
    >
      <div className="w-full max-w-[480px] h-dvh bg-[#F8F9FA] flex flex-col overflow-hidden shadow-2xl animate-modal-up">
        {/* Topo Fixo (Distribuição Original Moderna) */}
        <header className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0 bg-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToMenu}
              aria-label="Voltar ao cardápio"
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 active:scale-95 flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1D20]" strokeWidth={2.2} />
            </button>

            <div>
              <h1 className="text-[20px] font-bold text-[#1A1D20] tracking-tight leading-tight">
                {activeOrder ? 'Pedido enviado!' : 'Minha conta'}
              </h1>
              <p className="text-[12px] text-[#6C757D]">
                {store?.name || 'Brasa Burger'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToMenu}
            className="px-3.5 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-[12.5px] font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Voltar ao cardápio
          </button>
        </header>

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-5">
          {/* 1. Card de Confirmação do Pedido Atual + Status + PIX + WhatsApp */}
          {currentOrder && (
            <section className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-4">
              {/* Cabeçalho do Pedido */}
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#FFF3EE] text-[#FF5E1E] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5E1E]">
                      Pedido #{currentOrder.orderId}
                    </span>
                    <h2 className="text-[16px] font-bold text-[#1A1D20] leading-tight">
                      Pedido {currentOrder.storeName} recebido!
                    </h2>
                    <p className="text-[12px] text-[#6C757D] mt-0.5">
                      {currentOrder.createdAt} ·{' '}
                      {currentOrder.deliveryMethod === 'delivery'
                        ? 'Delivery'
                        : 'Retirada'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Etapas de Status do Pedido (Aceito / Em preparo / Saiu para entrega) */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#F8F9FA] p-1.5 rounded-xl border border-gray-100">
                {ORDER_STATUS_STEPS.map((step) => {
                  const isActive = currentStatusId === step.id
                  const StepIcon = step.icon
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleStatusChange(step.id)}
                      className={`py-2 px-2 rounded-lg text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FF5E1E] text-white shadow-xs'
                          : 'text-[#6C757D] hover:text-[#1A1D20]'
                      }`}
                    >
                      <StepIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{step.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Estimativa de Tempo de Espera */}
              <div className="bg-[#F8F9FA] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-[#6C757D]">
                  <Clock className="w-4 h-4 text-[#FF5E1E]" />
                  <span>Tempo estimado de espera</span>
                </div>
                <span className="text-[13.5px] font-bold text-[#1A1D20]">
                  {currentOrder.estimatedTime || '30 - 50 minutos'}
                </span>
              </div>

              {/* Box da Chave PIX (00000000000) */}
              <div className="rounded-2xl border border-[#FF5E1E]/30 bg-[#FFF3EE]/60 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#FF5E1E]">
                    Pagamento via PIX ({pixData.keyType})
                  </span>
                  <span className="text-[12px] font-semibold text-[#1A1D20]">
                    Total: {formatCurrency(currentOrder.total)}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-[#E2E5E9] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#1A1D20] truncate">
                      {pixData.key || '00000000000'}
                    </p>
                    <p className="text-[11.5px] text-[#6C757D] truncate">
                      Favorecido: {pixData.beneficiary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="px-3 py-2 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar PIX
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Resumo Rápido dos Dados do Pedido */}
              <div className="bg-[#F8F9FA] rounded-xl p-3.5 text-[12.5px] space-y-2 text-[#1A1D20]">
                {currentOrder.deliveryMethod === 'delivery' &&
                  currentOrder.address && (
                    <div>
                      <span className="text-[#6C757D]">Endereço: </span>
                      <strong>
                        {currentOrder.address.street},{' '}
                        {currentOrder.address.number} —{' '}
                        {currentOrder.address.neighborhoodName}
                      </strong>
                    </div>
                  )}

                <div className="border-t border-gray-200/70 pt-2 space-y-1.5">
                  {(currentOrder.items || []).map((item) => (
                    <div key={item.cartItemId} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>

                      {showProductRating && (
                        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
                          <span className="text-[11.5px] text-[#6C757D]">
                            Avaliar produto:
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const filled = (item.rating || 0) >= star
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    handleRateProduct(
                                      item.cartItemId,
                                      item.product.name,
                                      star
                                    )
                                  }
                                  className="p-0.5 text-[#FF5E1E] hover:scale-110 transition-transform cursor-pointer"
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      filled ? 'fill-[#FF5E1E]' : ''
                                    }`}
                                  />
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200/70 pt-2 space-y-1">
                  <div className="flex justify-between text-[#6C757D]">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(currentOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#6C757D]">
                    <span>Entrega:</span>
                    <span>{formatCurrency(currentOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-[14px] font-bold text-[#1A1D20] pt-0.5">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(currentOrder.total)}</span>
                  </div>
                  <div className="flex justify-between text-[#6C757D] pt-0.5">
                    <span>Forma de pagamento:</span>
                    <strong className="text-[#1A1D20]">
                      {PAYMENT_NAMES[currentOrder.paymentMethod] ||
                        currentOrder.paymentMethod}
                      {currentOrder.paymentMethod === 'money' &&
                        (currentOrder.changeFor > 0
                          ? ` (Troco p/ ${formatCurrency(currentOrder.changeFor)})`
                          : ' (Sem troco)')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Botões Secundários: Avaliar Produto & Instagram */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowProductRating((prev) => !prev)}
                  className={`py-2.5 px-3 rounded-xl text-[12.5px] font-semibold inline-flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    showProductRating
                      ? 'bg-[#FFF3EE] border-[#FF5E1E] text-[#FF5E1E]'
                      : 'bg-[#F8F9FA] border-[#E2E5E9] text-[#1A1D20] hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-4 h-4 text-[#FF5E1E]" />
                  <span>Avaliar produto</span>
                </button>

                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#F8F9FA] hover:bg-gray-100 border border-[#E2E5E9] text-[#1A1D20] text-[12.5px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-[#FF5E1E]"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>

              {/* Prévia da Mensagem Formatada + Botão Acompanhar no WhatsApp */}
              <details className="group text-[12px] bg-[#F8F9FA] rounded-xl p-3 border border-gray-200/60">
                <summary className="font-semibold text-[#6C757D] cursor-pointer select-none">
                  Ver mensagem formatada para o WhatsApp
                </summary>
                <pre className="mt-2.5 whitespace-pre-wrap font-mono text-[11px] text-[#1A1D20] bg-white p-3 rounded-lg border border-gray-100 leading-relaxed">
                  {formatWhatsAppOrderMessage(currentOrder)}
                </pre>
              </details>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp(currentOrder)}
                className="w-full h-12 bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] text-white font-semibold text-[15px] rounded-2xl px-5 flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-5 h-5 stroke-[2.2]" />
                <span>Acompanhar pedido no WhatsApp</span>
              </button>
            </section>
          )}

          {/* 2. Card: Meu Perfil (Armazenado em Cache com Máscaras) */}
          <section className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF5E1E]" strokeWidth={2.2} />
                <h2 className="text-[16px] font-bold text-[#1A1D20]">
                  Meu perfil
                </h2>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F8F9FA] text-[#6C757D]">
                Salvo neste aparelho
              </span>
            </div>

            {!isEditingProfile ? (
              <>
                <div className="bg-[#F8F9FA] rounded-xl p-3.5 space-y-1.5 text-[13.5px]">
                  <p className="text-[#1A1D20]">
                    <span className="font-semibold">Nome:</span>{' '}
                    {profile?.name || 'Não informado'}
                  </p>
                  <p className="text-[#1A1D20]">
                    <span className="font-semibold">CPF:</span>{' '}
                    {profile?.cpf
                      ? formatCpfMask(profile.cpf)
                      : 'Opcional (não informado)'}
                  </p>
                  <p className="text-[#1A1D20]">
                    <span className="font-semibold">Celular:</span>{' '}
                    {profile?.phone
                      ? formatPhoneMask(profile.phone)
                      : 'Não informado'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(profile?.name || '')
                      setEditPhone(formatPhoneMask(profile?.phone || ''))
                      setEditCpf(formatCpfMask(profile?.cpf || ''))
                      setIsEditingProfile(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E5E9] bg-white hover:bg-[#F8F9FA] text-[13px] font-semibold text-[#1A1D20] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#FF5E1E]" />
                    Editar
                  </button>

                  {profile?.name && (
                    <button
                      type="button"
                      onClick={handleLogoutProfile}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E5E9] bg-white hover:bg-[#F8F9FA] text-[13px] font-medium text-[#6C757D] hover:text-[#1A1D20] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sair
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] text-[#6C757D] mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Ex: Lucas Mendes"
                    className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3.5 py-2 text-[13.5px] text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[#6C757D] mb-1">
                    CPF · opcional
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editCpf}
                    onChange={(e) => setEditCpf(formatCpfMask(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3.5 py-2 text-[13.5px] text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[#6C757D] mb-1">
                    Celular *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={editPhone}
                    onChange={(e) =>
                      setEditPhone(formatPhoneMask(e.target.value))
                    }
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl px-3.5 py-2 text-[13.5px] text-[#1A1D20] focus:outline-none focus:border-[#FF5E1E]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-4 py-2 rounded-xl bg-[#FF5E1E] text-white text-[13px] font-semibold cursor-pointer"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl bg-[#F8F9FA] text-[#6C757D] text-[13px] font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 3. Card: Últimos Pedidos (Histórico com Repetir, Cardápio e Avaliar) */}
          <section className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#1A1D20]">
                Últimos pedidos
              </h2>
              <span className="text-[12px] text-[#6C757D]">
                {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>

            {orders.length === 0 ? (
              <p className="text-[13px] text-[#6C757D] py-4 text-center">
                Você ainda não realizou nenhum pedido neste aparelho.
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <article
                    key={ord.orderId}
                    className="rounded-2xl border border-gray-100 bg-[#F8F9FA] p-3.5 space-y-2.5"
                  >
                    <div className="space-y-1 text-[13px] text-[#1A1D20]">
                      <div className="flex items-center justify-between">
                        <p>
                          <span className="font-bold">Pedido:</span> #
                          {ord.orderId}
                        </p>
                        {ord.rating && (
                          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#FF5E1E] bg-[#FFF3EE] px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-[#FF5E1E]" />
                            {ord.rating},0
                          </span>
                        )}
                      </div>
                      <p>
                        <span className="font-bold">Data:</span> {ord.createdAt}
                      </p>
                      <p>
                        <span className="font-bold">Valor:</span>{' '}
                        {formatCurrency(ord.total)}
                      </p>
                      <p>
                        <span className="font-bold">Local:</span>{' '}
                        {ord.storeName}
                      </p>

                      <div className="pt-1 text-[12.5px] text-[#6C757D] space-y-0.5">
                        {(ord.items || []).map((item) => (
                          <p key={item.cartItemId}>
                            {item.quantity}x {item.product.name}
                          </p>
                        ))}
                      </div>
                    </div>

                    {ratingOrderId === ord.orderId && (
                      <div className="bg-white rounded-xl p-2.5 border border-[#E2E5E9] flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[#1A1D20]">
                          Sua nota:
                        </span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleSelectStar(ord.orderId, star)}
                              className="p-1 text-[#FF5E1E] hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star className="w-5 h-5 fill-[#FF5E1E]" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onRepeatOrder?.(ord)}
                        className="py-2 px-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Repetir
                      </button>

                      <button
                        type="button"
                        onClick={onBackToMenu}
                        className="py-2 px-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#1A1D20] border border-[#E2E5E9] text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Store className="w-3.5 h-3.5 text-[#6C757D]" />
                        Cardápio
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setRatingOrderId((prev) =>
                            prev === ord.orderId ? null : ord.orderId
                          )
                        }
                        className="py-2 px-2.5 rounded-xl bg-[#FFF3EE] hover:bg-[#FFE6DC] text-[#FF5E1E] text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Avaliar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
