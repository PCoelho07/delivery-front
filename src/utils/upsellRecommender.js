/**
 * upsellRecommender.js
 *
 * Algoritmo Híbrido de Recomendações de Checkout (Aumento de Ticket Médio)
 *
 * Prioridades:
 * 1. Filtra itens indisponíveis e itens que JÁ estão no carrinho.
 * 2. Itens selecionados manualmente pelo lojista (isUpsell === true).
 * 3. Preenchimento automático inteligente (se houver menos de maxSuggestions):
 *    - Cross-sell de impulso (bebidas, refrigerantes, sucos, sobremesas, porções/acompanhamentos).
 *    - Mais vendidos com base no histórico de pedidos da loja.
 *    - Itens de menor ticket (compra por impulso).
 *    - Itens sem adicionais obrigatórios (adiciona com 1 clique rápido).
 */

const IMPULSE_KEYWORDS = [
  'bebida',
  'refrigerante',
  'suco',
  'refri',
  'coca',
  'guaraná',
  'guarana',
  'água',
  'agua',
  'cerveja',
  'chopp',
  'sobremesa',
  'doce',
  'açaí',
  'acai',
  'pudim',
  'brownie',
  'sorvete',
  'porção',
  'porcao',
  'batata',
  'fritas',
  'nuggets',
  'coxinha',
  'acompanhamento',
  'entrada',
]

export function getUpsellRecommendations({
  allProducts = [],
  categories = [],
  cartItems = [],
  orders = [],
  maxSuggestions = 3,
}) {
  if (!Array.isArray(allProducts) || allProducts.length === 0) return []

  // 1. IDs e Nomes já na sacola (para nunca sugerir o que o cliente já colocou)
  const cartIds = new Set(
    cartItems.map((ci) => String(ci.product?.id || ci.id || ''))
  )
  const cartNames = new Set(
    cartItems.map((ci) =>
      String(ci.product?.name || ci.name || '')
        .toLowerCase()
        .trim()
    )
  )

  // Mapa de categorias por ID
  const categoryMap = new Map()
  if (Array.isArray(categories)) {
    categories.forEach((cat) => {
      if (cat?.id) {
        categoryMap.set(String(cat.id), cat.name || cat.tabLabel || '')
      }
    })
  }

  // 2. Contagem de vendas por produto a partir dos pedidos
  const salesCountMap = new Map()
  if (Array.isArray(orders)) {
    orders.forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const idKey = String(item.product?.id || item.id || '')
          const nameKey = String(item.product?.name || item.name || '')
            .toLowerCase()
            .trim()
          const qty = Number(item.quantity) || 1
          if (idKey) {
            salesCountMap.set(idKey, (salesCountMap.get(idKey) || 0) + qty)
          }
          if (nameKey) {
            salesCountMap.set(nameKey, (salesCountMap.get(nameKey) || 0) + qty)
          }
        })
      }
    })
  }

  // 3. Filtrar candidatos elegíveis
  const candidates = allProducts.filter((prod) => {
    if (!prod || prod.available === false) return false
    const idStr = String(prod.id)
    const nameStr = String(prod.name || '').toLowerCase().trim()
    if (cartIds.has(idStr) || cartNames.has(nameStr)) return false
    if (Number(prod.price) <= 0) return false
    return true
  })

  if (candidates.length === 0) return []

  // 4. Selecionados manualmente pelo lojista (isUpsell === true)
  const merchantPicks = candidates.filter((p) => p.isUpsell === true)

  const selected = [...merchantPicks.slice(0, maxSuggestions)]
  const selectedIds = new Set(selected.map((p) => String(p.id)))

  // Se já atingiu maxSuggestions, retorna
  if (selected.length >= maxSuggestions) {
    return selected
  }

  // 5. Preenchimento automático inteligente para os restantes
  const remainingCandidates = candidates.filter((p) => !selectedIds.has(String(p.id)))

  const scoredCandidates = remainingCandidates.map((prod) => {
    const catName = (categoryMap.get(String(prod.categoryId)) || '').toLowerCase()
    const prodName = String(prod.name || '').toLowerCase()
    const prodDesc = String(prod.description || prod.desc || '').toLowerCase()

    // É categoria ou item de impulso?
    const isImpulse = IMPULSE_KEYWORDS.some(
      (kw) => catName.includes(kw) || prodName.includes(kw) || prodDesc.includes(kw)
    )

    // Quantidade vendida
    const sales =
      (salesCountMap.get(String(prod.id)) || 0) +
      (salesCountMap.get(prodName.trim()) || 0)

    // Não tem adicionais obrigatórios? (fácil de adicionar direto sem abrir tela de opções)
    const hasRequiredOptions =
      Array.isArray(prod.preferences) && prod.preferences.length > 0
    const noFriction = !hasRequiredOptions ? 25 : 0

    // Menor preço (mais impulsivo)
    const price = Number(prod.price) || 0
    const priceBonus = price <= 15 ? 30 : price <= 25 ? 15 : 0

    const score = (isImpulse ? 80 : 0) + sales * 10 + noFriction + priceBonus

    return {
      product: prod,
      score,
    }
  })

  // Ordena por score decrescente
  scoredCandidates.sort((a, b) => b.score - a.score)

  for (const item of scoredCandidates) {
    if (selected.length >= maxSuggestions) break
    selected.push(item.product)
    selectedIds.add(String(item.product.id))
  }

  return selected
}
