/**
 * Calcula os detalhes e a elegibilidade do cupom sobre a lista de itens do carrinho.
 * Suporta três modalidades flexíveis:
 * - targetType: 'all' (todo o cardápio)
 * - targetType: 'category' (categoria inteira, ex: dia do hambúrguer)
 * - targetType: 'product' (produtos específicos marcados pelo lojista)
 */
export function evaluateCoupon(coupon, cartItems = []) {
  if (!coupon || !Array.isArray(cartItems) || cartItems.length === 0) {
    return {
      isValid: false,
      isEligible: false,
      discountAmount: 0,
      scopeLabel: '',
      reason: 'Adicione itens à sacola para utilizar um cupom de desconto.',
    }
  }

  const targetType = coupon.targetType || 'all'
  let eligibleItems = []
  let scopeLabel = 'em todos os produtos'

  if (targetType === 'all') {
    eligibleItems = cartItems
    scopeLabel = 'no total dos produtos'
  } else if (targetType === 'category') {
    const targetCatId = String(coupon.targetCategoryId || '')
    eligibleItems = cartItems.filter((item) => {
      const itemCatId = String(item.product?.categoryId || item.categoryId || '')
      return itemCatId === targetCatId
    })
    scopeLabel = coupon.targetCategoryName
      ? `em ${coupon.targetCategoryName}`
      : 'na categoria selecionada'
  } else if (targetType === 'product') {
    const targetIds = (coupon.targetProductIds || []).map(String)
    eligibleItems = cartItems.filter((item) => {
      const prodId = String(item.product?.id || item.id || '')
      return targetIds.includes(prodId)
    })
    scopeLabel =
      coupon.targetProductNames?.length === 1
        ? `em ${coupon.targetProductNames[0]}`
        : 'nos itens participantes da promoção'
  }

  if (eligibleItems.length === 0) {
    let reason = 'Nenhum item da sua sacola é elegível para este cupom.'
    if (targetType === 'category') {
      reason = `O cupom ${coupon.code} é válido apenas para produtos da categoria "${coupon.targetCategoryName || 'específica'}". Adicione um item dessa categoria para obter o desconto.`
    } else if (targetType === 'product') {
      const names = (coupon.targetProductNames || []).join(', ')
      reason = `O cupom ${coupon.code} é exclusivo para ${names ? `"${names}"` : 'itens específicos da promoção'}. Adicione o produto participante à sacola.`
    }

    return {
      isValid: true,
      isEligible: false,
      discountAmount: 0,
      scopeLabel,
      eligibleItemsCount: 0,
      reason,
    }
  }

  const eligibleSubtotal = eligibleItems.reduce(
    (acc, item) => acc + (Number(item.totalPrice) || 0),
    0
  )
  const discountPercent = Number(coupon.discountPercent) || 0
  const discountAmount = (eligibleSubtotal * discountPercent) / 100

  return {
    isValid: true,
    isEligible: true,
    discountPercent,
    discountAmount,
    eligibleSubtotal,
    eligibleItemsCount: eligibleItems.length,
    scopeLabel,
  }
}

