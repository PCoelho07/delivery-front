/**
 * Regras de Planos, Limites e Cobrança de Excedentes — NumInstante Delivery
 *
 * Modelo de Negócio:
 * - Impulso Inicial (Free): R$ 0,00 até R$ 2.500/mês. Excedente: R$ 1,00 por pedido extra.
 * - Crescimento: R$ 49,90 até R$ 6.000/mês. Excedente: R$ 0,50 por pedido extra.
 * - Alta Escala: R$ 89,90 com faturamento ilimitado. Cota de WhatsApp: 600 pedidos/mês (~1.200 msgs).
 *   Excedente: R$ 0,32 por pedido extra acima de 600.
 */

export const SYSTEM_PLANS = [
  {
    id: 'free',
    name: 'Plano Start',
    shortName: 'Start',
    price: 0,
    billingThreshold: 2500, // R$ 2.500/mês
    extraOrderFee: 1.0, // R$ 1,00 por pedido extra
    includedOrders: null,
    warningMargin: 100, // Alerta quando faltar R$ 100
    description: '100% liberado até R$ 2.500 de faturamento no mês com 2 msgs automáticas no WhatsApp.',
    badge: 'Grátis',
  },
  {
    id: 'crescimento',
    name: 'Plano Express',
    shortName: 'Express',
    price: 49.9,
    billingThreshold: 6000, // R$ 6.000/mês
    extraOrderFee: 0.5, // R$ 0,50 por pedido extra
    includedOrders: null,
    warningMargin: 100, // Alerta quando faltar R$ 100
    description: 'Para operações com faturamento entre R$ 2.501 e R$ 6.000/mês no ritmo do seu delivery.',
    badge: 'Popular',
  },
  {
    id: 'escala',
    name: 'Plano Turbo',
    shortName: 'Turbo',
    price: 89.9,
    billingThreshold: null, // Ilimitado em faturamento
    extraOrderFee: 0.32, // R$ 0,32 por pedido extra
    includedOrders: 600, // Franquia de 600 pedidos/mês no WhatsApp
    warningMarginOrders: 50, // Alerta a partir de 550 pedidos (faltando 50)
    description: 'Potência máxima e faturamento ilimitado com pacote de até 600 pedidos no WhatsApp inclusos.',
    badge: 'Sem Limite de Vendas',
  },
]

/**
 * Localiza a configuração de um plano pelo ID com fallback seguro
 */
export function getPlanById(planId) {
  if (!planId) return SYSTEM_PLANS[0]
  const normalized = String(planId).toLowerCase().trim()
  return (
    SYSTEM_PLANS.find(
      (p) =>
        p.id === normalized ||
        p.name.toLowerCase() === normalized ||
        p.shortName.toLowerCase() === normalized
    ) || SYSTEM_PLANS[0]
  )
}

/**
 * Calcula o consumo de franquia, status de alerta e valor de excedentes de uma empresa
 */
export function calculateCompanyPlanUsage({
  planId = 'free',
  currentBilling = 0,
  currentOrdersCount = 0,
  exceededOrdersCount = 0,
}) {
  const plan = getPlanById(planId)

  // 1. Plano Alta Escala: Teto baseado em volume de pedidos no WhatsApp (600)
  if (plan.id === 'escala') {
    const limit = plan.includedOrders
    const percentage = limit > 0 ? (currentOrdersCount / limit) * 100 : 0
    const isExceeded = currentOrdersCount > limit
    const extraOrders = Math.max(0, currentOrdersCount - limit)
    const extraAmount = Math.round(extraOrders * plan.extraOrderFee * 100) / 100
    const totalAmount = Math.round((plan.price + extraAmount) * 100) / 100
    const remaining = Math.max(0, limit - currentOrdersCount)
    const isWarning = !isExceeded && currentOrdersCount >= limit - plan.warningMarginOrders

    return {
      plan,
      metricType: 'orders',
      currentValue: currentOrdersCount,
      limitValue: limit,
      remainingValue: remaining,
      percentage: Math.min(100, Math.round(percentage)),
      rawPercentage: percentage,
      isWarning,
      isExceeded,
      extraOrders,
      extraAmount,
      basePrice: plan.price,
      totalAmount,
    }
  }

  // 2. Planos Free e Crescimento: Teto baseado no faturamento bruto do mês
  const limit = plan.billingThreshold
  const percentage = limit > 0 ? (currentBilling / limit) * 100 : 0
  const isExceeded = currentBilling > limit
  const remaining = Math.max(0, limit - currentBilling)
  const isWarning = !isExceeded && currentBilling >= limit - plan.warningMargin

  // Pedidos concluídos após exceder a cota
  const extraOrders = isExceeded ? Math.max(0, exceededOrdersCount) : 0
  const extraAmount = Math.round(extraOrders * plan.extraOrderFee * 100) / 100
  const totalAmount = Math.round((plan.price + extraAmount) * 100) / 100

  return {
    plan,
    metricType: 'currency',
    currentValue: currentBilling,
    limitValue: limit,
    remainingValue: remaining,
    percentage: Math.min(100, Math.round(percentage)),
    rawPercentage: percentage,
    isWarning,
    isExceeded,
    extraOrders,
    extraAmount,
    basePrice: plan.price,
    totalAmount,
  }
}
