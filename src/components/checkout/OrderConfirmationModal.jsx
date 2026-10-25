import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Bike,
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
  X,
  Ban,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  formatCpfMask,
  formatCurrency,
  formatPhoneMask,
} from '../../lib/utils'
import { calculateTimeEstimate } from '../../utils/timeEstimate'
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

  // Localiza pedido em andamento no histórico caso não tenha sido passado activeOrder
  const activeExistingOrder = orders.find(
    (o) => o.status !== 'concluido' && o.status !== 'entregue' && o.status !== 'cancelado'
  )

  const orderFromStore = activeOrder?.orderId
    ? orders.find((o) => o.orderId === activeOrder.orderId)
    : null

  const currentOrder =
    orderFromStore ||
    activeOrder ||
    activeExistingOrder ||
    (orders.length > 0 ? orders[0] : null)

  const isDelivered = Boolean(
    currentOrder && (currentOrder.status === 'concluido' || currentOrder.status === 'entregue')
  )
  const isOrderActive = Boolean(
    currentOrder && !isDelivered && currentOrder.status !== 'cancelado'
  )

  const [dismissDeliveredBanner, setDismissDeliveredBanner] = useState(false)
  const showDeliveredBanner = isDelivered && !dismissDeliveredBanner

  const currentStatusId = currentOrder?.status || 'aceito'
  const isPickup = currentOrder?.deliveryMethod === 'pickup'
  const rawEstimate =
    currentOrder?.estimatedTime ||
    (isPickup
      ? store?.estimatedPickup || '20 - 30 min'
      : store?.estimatedDelivery || '40 - 50 min')

  const timeEstimate = useMemo(() => {
    if (!currentOrder) return null
    return calculateTimeEstimate(
      rawEstimate,
      currentOrder.createdAtTimestamp || currentOrder.createdAt,
      currentOrder.deliveryMethod || 'delivery'
    )
  }, [currentOrder, rawEstimate])

  const instagramUrl =
    currentOrder?.instagramUrl || store?.instagramUrl || 'https://instagram.com'

  const pixData = currentOrder?.pix || {
    key: store?.pix?.key || '00000000000',
    keyType: store?.pix?.keyType || 'Chave PIX',
    beneficiary: store?.pix?.beneficiary || store?.name || 'Brasa Burger',
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

  const renderRecentOrders = () => (
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
                  {(ord.items || []).map((item, idx) => (
                    <p key={item.cartItemId || idx}>
                      {item.quantity || 1}x {item.product?.name || item.name || 'Item'}
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
  )

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
                {isOrderActive ? 'Pedido enviado!' : 'Últimos pedidos'}
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
          {/* Alerta de Pedido Concluído / Entregue / Retirado */}
          {!isOrderActive && showDeliveredBanner && currentOrder && (
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-bold text-emerald-950 truncate">
                    Pedido #{currentOrder.orderId} {currentOrder.deliveryMethod === 'pickup' ? 'retirado' : 'entregue'}!
                  </h3>
                  <p className="text-[12px] text-emerald-700">
                    {currentOrder.deliveryMethod === 'pickup'
                      ? 'Seu pedido foi retirado com sucesso. Bom apetite!'
                      : 'Seu pedido foi entregue com sucesso. Bom apetite!'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDismissDeliveredBanner(true)}
                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                aria-label="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 1. Card de Confirmação do Pedido Atual + Status + PIX + WhatsApp (APENAS se estiver ativo) */}
          {isOrderActive && currentOrder && (
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

              {/* Alerta de Pedido Cancelado (se houver) */}
              {(currentStatusId === 'cancelado' || currentStatusId === 'recusado') && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <Ban className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-[15px] text-rose-950">
                      Pedido Cancelado pelo Restaurante
                    </h4>
                    <p className="text-xs text-rose-800">
                      Motivo: <span className="font-bold">{currentOrder.cancellationReason || 'Inviabilidade de atendimento no momento.'}</span>
                    </p>
                    {currentOrder.cancellationNote && (
                      <p className="text-[11.5px] text-rose-700 italic">
                        &ldquo;{currentOrder.cancellationNote}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Etapas de Status do Pedido (Indicador de Progresso - Atualizado pelo Restaurante) */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1.5 bg-[#F8F9FA] p-1.5 rounded-xl border border-gray-100 select-none">
                  {ORDER_STATUS_STEPS.map((step, idx) => {
                    const currentIdx = ORDER_STATUS_STEPS.findIndex((s) => s.id === currentStatusId)
                    const isFinished = currentStatusId === 'concluido'
                    const isCurrent = currentStatusId === step.id
                    const isPast = isFinished || (currentIdx !== -1 && idx < currentIdx)

                    const isPix = currentOrder?.paymentMethod === 'pix'
                    const isPickup = currentOrder?.deliveryMethod === 'pickup'

                    let stepLabel = step.label
                    let StepIcon = step.icon

                    if (step.id === 'aceito') {
                      if (isPix) stepLabel = 'Aguardando pagamento'
                    } else if (step.id === 'entrega') {
                      if (isPickup) {
                        stepLabel = 'Pronto p/ retirada'
                        StepIcon = Store
                      }
                    }

                    if (isPast && !isCurrent) {
                      StepIcon = CheckCircle2
                    } else if (step.id === 'aceito' && isPix && isCurrent) {
                      StepIcon = Clock
                    }

                    return (
                      <div
                        key={step.id}
                        className={`py-2 px-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isCurrent
                            ? 'bg-[#FF5E1E] text-white shadow-xs'
                            : isPast
                            ? 'bg-orange-50 text-[#FF5E1E] border border-orange-200/60'
                            : 'text-[#9CA3AF] bg-transparent'
                        }`}
                      >
                        <StepIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{stepLabel}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Aviso contextual quando o status for "entrega" (Pronto no balcão vs Saiu para entrega) */}
                {currentStatusId === 'entrega' && (
                  <div
                    className={`border rounded-xl px-3 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 ${
                      currentOrder.deliveryMethod === 'pickup'
                        ? 'bg-blue-50 text-blue-900 border-blue-200'
                        : 'bg-purple-50 text-purple-900 border-purple-200'
                    }`}
                  >
                    {currentOrder.deliveryMethod === 'pickup' ? (
                      <>
                        <Store className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Seu pedido está pronto! Já pode vir retirar no balcão.</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Seu pedido saiu para entrega! Fique atento ao entregador.</span>
                      </>
                    )}
                  </div>
                )}

                {currentStatusId === 'concluido' && (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-3 py-2 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {currentOrder.deliveryMethod === 'pickup'
                        ? 'Pedido retirado no balcão e concluído com sucesso!'
                        : 'Pedido entregue e concluído com sucesso!'}
                    </span>
                  </div>
                )}
              </div>

              {/* Previsão de Entrega ou Retirada */}
              {timeEstimate && (
                <div className="bg-[#F8F9FA] rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px] text-[#6C757D]">
                    {isPickup ? (
                      <Store className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                    ) : (
                      <Bike className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                    )}
                    <span className="font-medium">
                      {isPickup ? 'Previsão para ficar pronto' : 'Previsão de entrega'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[13.5px] font-bold text-[#1A1D20]">
                      {timeEstimate.timeWindow}
                    </span>
                    <span className="text-[11.5px] text-[#6C757D] font-normal">
                      ({rawEstimate})
                    </span>
                  </div>
                </div>
              )}

              {/* Box da Chave PIX */}
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
                  {(currentOrder.items || []).map((item, idx) => {
                    const itemName = item.product?.name || item.name || 'Item'
                    const itemPrice = item.totalPrice ?? (item.price ? item.price * (item.quantity || 1) : 0)
                    const itemNotes = item.observation || item.notes
                    const rawOptions =
                      Array.isArray(item.options) && item.options.length > 0
                        ? item.options.map((opt) =>
                            typeof opt === 'string'
                              ? opt
                              : opt.name && opt.name !== 'Opção' && opt.name !== 'Adicional'
                              ? `${opt.name}: ${opt.value}`
                              : opt.value || opt.name || ''
                          )
                        : [
                            ...(Array.isArray(item.preferences)
                              ? item.preferences.map((p) =>
                                  p.groupName ? `${p.groupName}: ${p.name}` : p.name
                                )
                              : []),
                            ...(Array.isArray(item.addons)
                              ? item.addons.map(
                                  (a) =>
                                    `${a.name}${a.price ? ` (+${formatCurrency(a.price)})` : ''}`
                                )
                              : []),
                          ]

                    const optionsList = Array.from(new Set(rawOptions.filter(Boolean)))

                    return (
                      <div key={item.cartItemId || idx} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {item.quantity || 1}x {itemName}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(itemPrice)}
                          </span>
                        </div>

                        {/* Opções e Adicionais selecionados */}
                        {optionsList.length > 0 && (
                          <p className="text-[11px] text-[#6C757D] pl-2 line-clamp-2">
                            {optionsList.join(' • ')}
                          </p>
                        )}

                        {/* Observação do Item */}
                        {itemNotes && (
                          <p className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                            Obs: {itemNotes}
                          </p>
                        )}

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
                                        itemName,
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
                    )
                  })}
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

          {/* Quando NÃO há pedido ativo: exibe PRIMEIRO Últimos Pedidos e o botão Voltar ao Cardápio */}
          {!isOrderActive && (
            <>
              {renderRecentOrders()}

              <button
                type="button"
                onClick={onBackToMenu}
                className="w-full h-12 bg-[#FF5E1E] hover:bg-[#E64E12] active:scale-[0.99] text-white font-semibold text-[15px] rounded-2xl px-5 flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs"
              >
                <Store className="w-5 h-5 stroke-[2.2]" />
                <span>Voltar ao cardápio</span>
              </button>
            </>
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

          {/* 3. Card: Últimos Pedidos (quando pedido ativo, exibido após o perfil) */}
          {isOrderActive && renderRecentOrders()}
        </div>
      </div>
    </div>
  )
}
