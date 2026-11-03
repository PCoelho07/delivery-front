import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Ban,
  Bike,
  Check,
  CheckCircle2,
  ChefHat,
  Copy,
  MessageCircle,
  ShoppingBag,
  Star,
  Store,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatPhoneMask } from '../../lib/utils'
import { calculateTimeEstimate } from '../../utils/timeEstimate'
import { useCustomerStore } from '../../store/useCustomerStore'

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const ORDER_STATUS_STEPS = [
  { id: 'aceito', label: 'Aceito', icon: CheckCircle2 },
  { id: 'preparo', label: 'Em preparo', icon: ChefHat },
  { id: 'entrega', label: 'Saiu p/ entrega', icon: Truck },
]

function normalizeOrderStatus(rawStatus = 'aceito') {
  const s = String(rawStatus || 'aceito').toLowerCase().trim()
  if (s === 'preparo' || s === 'preparando' || s === 'em preparo') {
    return 'preparo'
  }
  if (s === 'entrega' || s === 'saiu para entrega' || s === 'pronto') {
    return 'entrega'
  }
  if (s === 'concluido' || s === 'concluído' || s === 'entregue') {
    return 'concluido'
  }
  if (s === 'cancelado' || s === 'recusado') {
    return 'cancelado'
  }
  return 'aceito'
}

export function DesktopTrackingScreen({
  order: orderProp,
  store,
  onBackToMenu,
  onOpenCustomerHub,
  onOpenReview,
}) {
  const [copiedPix, setCopiedPix] = useState(false)
  const orders = useCustomerStore((state) => state.orders)

  // Garante leitura em tempo real diretamente da store quando o Kanban atualizar
  const order = useMemo(() => {
    if (orderProp?.orderId) {
      return orders.find((o) => o.orderId === orderProp.orderId) || orderProp
    }
    const activeExistingOrder = orders.find(
      (o) =>
        o.status !== 'concluido' &&
        o.status !== 'entregue' &&
        o.status !== 'cancelado'
    )
    return orderProp || activeExistingOrder || orders[0] || null
  }, [orderProp, orders])

  const isPickup = order?.deliveryMethod === 'pickup'
  const rawEstimate =
    order?.estimatedTime ||
    (isPickup
      ? store?.estimatedPickup || '15 - 25 min'
      : store?.estimatedDelivery || '35 - 50 min')

  const timeEstimate = useMemo(() => {
    if (!order) return null
    return calculateTimeEstimate(
      rawEstimate,
      order.createdAtTimestamp || order.createdAt,
      order.deliveryMethod || 'delivery'
    )
  }, [order, rawEstimate])

  if (!order) {
    return (
      <div className="w-full min-h-screen bg-[#F4F6F8] py-12 antialiased flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-gray-200/80 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF5E1E] mx-auto flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1D20]">Nenhum pedido ativo</h2>
          <p className="text-xs text-[#6C757D]">
            Você não possui nenhum pedido em andamento no momento.
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <button
              type="button"
              onClick={onBackToMenu}
              className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] text-white text-xs font-bold hover:bg-[#E64E12] transition-colors cursor-pointer"
            >
              Ir ao Cardápio
            </button>
            <button
              type="button"
              onClick={onOpenCustomerHub}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-[#1A1D20] text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Meus Pedidos
            </button>
          </div>
        </div>
      </div>
    )
  }

  const cleanPhone = (store?.whatsapp || store?.phone || '').replace(/\D/g, '')
  const whatsappUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone.startsWith('55') ? cleanPhone.slice(2) : cleanPhone}?text=${encodeURIComponent(
        `Olá! Gostaria de acompanhar o meu pedido #${order.orderId}.`
      )}`
    : ''

  const instagramRaw = (store?.instagram || store?.instagramUrl || '').trim()
  const instagramUrl = instagramRaw
    ? instagramRaw.startsWith('http')
      ? instagramRaw
      : `https://instagram.com/${instagramRaw.replace(/^@/, '')}`
    : ''

  const pixKey =
    order?.pix?.key || store?.pix?.key || store?.cnpj || '00.000.000/0001-00'
  const pixBeneficiary =
    order?.pix?.beneficiary ||
    store?.pix?.beneficiary ||
    store?.corporateName ||
    store?.name ||
    'Brasa Burger'

  const handleCopyPix = () => {
    navigator.clipboard?.writeText?.(pixKey)
    setCopiedPix(true)
    toast.success('Chave PIX copiada para a área de transferência!')
    setTimeout(() => setCopiedPix(false), 2500)
  }

  const currentStatusId = normalizeOrderStatus(order.status)

  return (
    <div className="w-full min-h-screen bg-[#F4F6F8] py-8 antialiased">
      <div className="max-w-4xl mx-auto px-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                currentStatusId === 'cancelado'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {currentStatusId === 'cancelado' ? (
                <Ban className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1D20] tracking-tight">
                {currentStatusId === 'cancelado'
                  ? 'Pedido Cancelado'
                  : currentStatusId === 'concluido'
                  ? isPickup
                    ? 'Pedido Retirado com Sucesso!'
                    : 'Pedido Entregue com Sucesso!'
                  : 'Pedido Recebido com Sucesso!'}
              </h1>
              <p className="text-xs text-[#6C757D]">
                Pedido #{order.orderId} · {store?.name || 'Brasa Burger'} ·{' '}
                {order.createdAt ||
                  `${order.dateFormatted || 'Hoje'} às ${order.timeFormatted || '16:15'}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToMenu}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-[#1A1D20] hover:bg-gray-50 active:scale-95 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Cardápio</span>
          </button>
        </div>

        {/* Grid Responsiva no Desktop (7 cols esquerda, 5 cols direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna da Esquerda: Status ao Vivo + Pagamento PIX (7 Colunas) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Box de Status de Progresso */}
            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#6C757D]">
                  Status do seu Pedido
                </h2>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Atualizado em tempo real
                </span>
              </div>

              {/* Alerta se o pedido foi cancelado */}
              {currentStatusId === 'cancelado' && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <Ban className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-rose-950">
                      Pedido Cancelado pelo Restaurante
                    </h4>
                    <p className="text-xs text-rose-800">
                      Motivo:{' '}
                      <span className="font-bold">
                        {order.cancellationReason ||
                          'Inviabilidade de atendimento no momento.'}
                      </span>
                    </p>
                    {order.cancellationNote && (
                      <p className="text-xs text-rose-700 italic">
                        &ldquo;{order.cancellationNote}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Etapas Visuais com Lucide Icons */}
              <div className="grid grid-cols-3 gap-2 select-none">
                {ORDER_STATUS_STEPS.map((step, idx) => {
                  const currentIdx = ORDER_STATUS_STEPS.findIndex(
                    (s) => s.id === currentStatusId
                  )
                  const isFinished = currentStatusId === 'concluido'
                  const isCurrent = currentStatusId === step.id
                  const isPast =
                    isFinished || (currentIdx !== -1 && idx < currentIdx)

                  let stepLabel = step.label
                  let StepIcon = step.icon

                  if (step.id === 'entrega' && isPickup) {
                    stepLabel = 'Pronto p/ retirada'
                    StepIcon = Store
                  }

                  if (isPast && !isCurrent) {
                    StepIcon = CheckCircle2
                  }

                  return (
                    <div
                      key={step.id}
                      className={`py-2.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-[#FF5E1E] text-white shadow-xs'
                          : isPast
                          ? 'bg-orange-50 border border-orange-200 text-[#FF5E1E]'
                          : 'bg-gray-100 text-gray-400 font-semibold'
                      }`}
                    >
                      <StepIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{stepLabel}</span>
                    </div>
                  )
                })}
              </div>

              {/* Aviso contextual quando o status for "entrega" ou "concluido" */}
              {currentStatusId === 'entrega' && (
                <div
                  className={`border rounded-2xl px-3.5 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 ${
                    isPickup
                      ? 'bg-blue-50 text-blue-900 border-blue-200'
                      : 'bg-purple-50 text-purple-900 border-purple-200'
                  }`}
                >
                  {isPickup ? (
                    <>
                      <Store className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        Seu pedido está pronto! Já pode vir retirar no balcão.
                      </span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>
                        Seu pedido saiu para entrega! Fique atento ao entregador.
                      </span>
                    </>
                  )}
                </div>
              )}

              {currentStatusId === 'concluido' && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl px-3.5 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isPickup
                      ? 'Pedido retirado no balcão e concluído com sucesso!'
                      : 'Pedido entregue e concluído com sucesso!'}
                  </span>
                </div>
              )}

              {/* Previsão de Entrega ou Retirada */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#6C757D]">
                  {isPickup ? (
                    <Store className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                  ) : (
                    <Bike className="w-4 h-4 text-[#FF5E1E] shrink-0" />
                  )}
                  <span>
                    {isPickup
                      ? 'Previsão para ficar pronto:'
                      : 'Previsão estimada:'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {timeEstimate ? (
                    <>
                      <span className="font-extrabold text-sm text-[#1A1D20]">
                        {timeEstimate.timeWindow}
                      </span>
                      <span className="text-xs text-[#6C757D]">
                        ({rawEstimate})
                      </span>
                    </>
                  ) : (
                    <span className="font-extrabold text-sm text-[#1A1D20]">
                      {isPickup
                        ? `${rawEstimate} (Retirada)`
                        : rawEstimate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Box do PIX Copia e Cola (Apenas se o método foi PIX) */}
            {order.paymentMethod === 'pix' && (
              <div className="bg-[#FFF3EE]/70 rounded-3xl p-5 border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF5E1E]">
                    Pagamento via PIX ({order?.pix?.keyType || store?.pix?.keyType || 'CNPJ'})
                  </span>
                  <span className="text-xs font-bold text-[#1A1D20]">
                    Valor: {formatCurrency(order.total)}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-gray-200 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-[#1A1D20] truncate">
                      {pixKey}
                    </p>
                    <p className="text-[10px] text-[#6C757D]">
                      Favorecido: {pixBeneficiary}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="px-3.5 py-2 rounded-xl bg-[#FF5E1E] text-white text-xs font-semibold shrink-0 hover:bg-[#E64E12] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar PIX</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Botões de Ação: WhatsApp & Instagram */}
            {(whatsappUrl || instagramUrl) && (
              <div className="space-y-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Acompanhar ou tirar dúvidas no WhatsApp</span>
                  </a>
                )}

                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.99] text-[#1A1D20] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
                  >
                    <InstagramIcon className="w-4 h-4 text-[#FF5E1E]" />
                    <span>Siga o {store?.name || 'Brasa Burger'} no Instagram</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Coluna da Direita: Resumo do Pedido & Endereço (5 Colunas) */}
          <aside className="lg:col-span-5 bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-[#1A1D20]">
                Detalhes da Entrega
              </h3>
              <button
                type="button"
                onClick={onOpenCustomerHub}
                className="text-xs text-[#FF5E1E] hover:underline font-semibold cursor-pointer"
              >
                Ver todos pedidos
              </button>
            </div>

            <div className="text-xs space-y-2 text-[#6C757D]">
              <p>
                <strong className="text-[#1A1D20]">Cliente:</strong>{' '}
                {order.customer?.name || 'Cliente'}
              </p>
              <p>
                <strong className="text-[#1A1D20]">WhatsApp:</strong>{' '}
                {formatPhoneMask(order.customer?.phone || '')}
              </p>
              <p>
                <strong className="text-[#1A1D20]">Forma:</strong>{' '}
                {order.deliveryMethod === 'pickup'
                  ? 'Retirada no balcão'
                  : 'Entrega em casa'}
              </p>
              {order.deliveryMethod !== 'pickup' && order.deliveryAddress && (
                <p>
                  <strong className="text-[#1A1D20]">Endereço:</strong>{' '}
                  {order.deliveryAddress.street}, {order.deliveryAddress.number}{' '}
                  – {order.deliveryAddress.neighborhood}
                  {order.deliveryAddress.complement
                    ? ` (${order.deliveryAddress.complement})`
                    : ''}
                </p>
              )}
            </div>

            {/* Lista de Itens */}
            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
              <p className="font-bold text-[#1A1D20]">Itens:</p>
              {order.items?.map((it, idx) => (
                <div
                  key={it.cartItemId || idx}
                  className="flex justify-between text-[#6C757D]"
                >
                  <span className="truncate max-w-[200px]">
                    {it.quantity}x {it.product?.name || it.name}
                  </span>
                  <span className="font-semibold text-[#1A1D20]">
                    {formatCurrency(it.totalPrice || it.price * it.quantity)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between text-[#6C757D] pt-1 border-t border-gray-100">
                <span>Taxa de entrega:</span>
                <span className="font-semibold text-emerald-600">
                  {order.deliveryFee > 0
                    ? formatCurrency(order.deliveryFee)
                    : 'Grátis'}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#FF5E1E]">
                  <span>Desconto de Cupom:</span>
                  <span className="font-bold">
                    - {formatCurrency(order.discountAmount)}
                  </span>
                </div>
              )}

              <p className="text-sm font-extrabold text-[#FF5E1E] pt-2 border-t border-gray-100 flex justify-between">
                <span>Total Pago:</span>
                <span>{formatCurrency(order.total)}</span>
              </p>
            </div>

            {/* Card de Avaliação: Lembrança Educativa de UX com botão */}
            <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/70 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[#1A1D20] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#FF5E1E] fill-[#FF5E1E]" />
                  <span>Avaliação do Pedido</span>
                </p>

                {order.review ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Avaliado ({order.review.overallRating} ★)
                  </span>
                ) : null}
              </div>

              <p className="text-[11.5px] text-[#6C757D] leading-relaxed">
                {order.review
                  ? 'Você já avaliou este pedido. Obrigado pelo seu feedback!'
                  : 'Avalie com os 3 critérios (entrega, qualidade e atendimento) após a chegada do seu lanche!'}
              </p>

              <button
                type="button"
                onClick={() => onOpenReview?.(order)}
                className="w-full py-2 rounded-xl bg-white border border-orange-300 hover:bg-orange-50 text-[#FF5E1E] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-[#FF5E1E]" />
                <span>
                  {order.review ? 'Ver ou Editar Avaliação' : 'Avaliar este Pedido Agora'}
                </span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
