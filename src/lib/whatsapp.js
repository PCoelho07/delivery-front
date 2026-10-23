import { formatCurrency } from './utils'

const PAYMENT_LABELS = {
  money: 'Dinheiro',
  pix: 'PIX (chave exibida após o envio)',
  debit: 'Cartão de Débito - Maquininha',
  credit: 'Cartão de Crédito - Maquininha',
}

export function formatWhatsAppOrderMessage(order) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://numinstante.com.br'
  const slug = (order.storeName || 'loja')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')

  const totalItemsCount = (order.items || []).reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  const itemsLines = (order?.items || [])
    .map((item) => {
      const extras = [
        ...(item.addons || []).map((a) => a.name),
        ...(item.preferences || []).map((p) => p.name),
        ...(item.options || []).map((o) => `${o.name || ''}: ${o.value || ''}`),
      ]
        .filter(Boolean)
        .join(', ')
      const obs = item.notes || item.observation ? ` [Obs: ${item.notes || item.observation}]` : ''
      const details = extras ? ` (${extras})` : ''
      const itemName = item.product?.name || item.name || 'Item'
      const itemPrice = item.totalPrice ?? (item.price ? item.price * (item.quantity || 1) : 0)
      return `➡️ *${item.quantity || 1}x ${itemName}${details}${obs} ${formatCurrency(itemPrice)}*`
    })
    .join('\n')

  const isDelivery = order.deliveryMethod === 'delivery'

  const addressBlock = isDelivery
    ? `*Endereço:* ${order.address?.street || ''}, ${order.address?.number || 'S/N'}
*Bairro:* ${(order.address?.neighborhoodName || '').toUpperCase()}
*Complemento:* ${order.address?.complement || ''}`
    : `*Modalidade:* Retirada no balcão`

  const pixLines =
    order.paymentMethod === 'pix' && order.pix?.key
      ? `\n*Chave PIX:* ${order.pix.key} (${order.pix.keyType || 'Chave'}) - ${order.pix.beneficiary || order.storeName}`
      : ''

  const changeLines =
    order.paymentMethod === 'money'
      ? order.changeFor > 0
        ? `\n*Troco para:* ${formatCurrency(order.changeFor)}`
        : `\n*Troco:* Não precisa (0)`
      : ''

  return [
    `Pedido *${(order.storeName || 'ESTABELECIMENTO').toUpperCase()}* aceito!`,
    ``,
    `*Link p/ acompanhar status:* ${origin}/${slug}?pedido=${order.orderId}`,
    ``,
    `*Pedido:* ${order.orderId} (${order.createdAt})`,
    `*Tipo:* ${isDelivery ? 'Delivery' : 'Retirada'}`,
    `*Estimativa:* ${order.estimatedTime || '30 - 50 minutos'}`,
    `---------------------------------------`,
    `*NOME:* ${order.customer?.name || ''}`,
    `*Fone:* ${order.customer?.phone || ''}`,
    ...(order.customer?.cpf ? [`*CPF:* ${order.customer.cpf}`] : []),
    addressBlock,
    `---------------------------------------`,
    itemsLines,
    `---------------------------------------`,
    `*Itens (${totalItemsCount}):* ${formatCurrency(order.subtotal)}`,
    `*Desconto:* ${formatCurrency(order.discount || 0)}`,
    `*Entrega:* ${formatCurrency(order.deliveryFee || 0)}`,
    ``,
    `*TOTAL:* ${formatCurrency(order.total)}`,
    `---------------------------------------`,
    `*Pagamento:* ${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}${changeLines}${pixLines}`,
    ``,
    `*Para repetir este pedido 👇:*`,
    `${origin}/${slug}?repetir=${order.orderId}`,
  ].join('\n')
}

export function buildWhatsAppOrderUrl(whatsappNumber, order) {
  const cleanPhone = String(whatsappNumber || '5511999990000').replace(/\D/g, '')
  const text = encodeURIComponent(formatWhatsAppOrderMessage(order))
  return `https://wa.me/${cleanPhone}?text=${text}`
}

