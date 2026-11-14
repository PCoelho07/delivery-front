/**
 * Utilitário para ordenação e cálculo de tempo de espera de pedidos
 * Suporta modo Cozinha/Produção (FIFO - Primeiro a Entrar, Primeiro a Sair)
 * e modo Mais Recentes (LIFO).
 */

/**
 * Converte qualquer representação de data/hora do pedido em timestamp (ms)
 * @param {Object} order
 * @returns {number}
 */
export function getOrderTimestamp(order) {
  if (!order) return 0

  // 1. Timestamp numérico explícito
  if (typeof order.createdAtTimestamp === 'number' && order.createdAtTimestamp > 0) {
    return order.createdAtTimestamp
  }

  // 2. Campo createdAt
  if (order.createdAt) {
    if (order.createdAt instanceof Date) {
      return order.createdAt.getTime()
    }
    if (typeof order.createdAt === 'number' && order.createdAt > 0) {
      return order.createdAt
    }
    if (typeof order.createdAt === 'string') {
      const raw = order.createdAt.trim()

      // Tenta parse ISO direto
      const parsedIso = Date.parse(raw)
      if (!isNaN(parsedIso) && parsedIso > 0) {
        return parsedIso
      }

      // Padrão brasileiro: "DD/MM/YYYY às HH:mm" ou "DD/MM/YYYY HH:mm:ss"
      const brDateTimeMatch = raw.match(
        /(\d{1,2})\/(\d{1,2})\/(\d{4}).*?(\d{1,2}):(\d{2})(?::(\d{2}))?/
      )
      if (brDateTimeMatch) {
        const day = parseInt(brDateTimeMatch[1], 10)
        const month = parseInt(brDateTimeMatch[2], 10) - 1
        const year = parseInt(brDateTimeMatch[3], 10)
        const hours = parseInt(brDateTimeMatch[4], 10)
        const minutes = parseInt(brDateTimeMatch[5], 10)
        const seconds = brDateTimeMatch[6] ? parseInt(brDateTimeMatch[6], 10) : 0
        const dateObj = new Date(year, month, day, hours, minutes, seconds)
        if (!isNaN(dateObj.getTime())) {
          return dateObj.getTime()
        }
      }

      // Apenas hora "HH:mm" ou "HH:mm:ss" (assume data de hoje)
      const timeOnlyMatch = raw.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
      if (timeOnlyMatch) {
        const now = new Date()
        now.setHours(
          parseInt(timeOnlyMatch[1], 10),
          parseInt(timeOnlyMatch[2], 10),
          timeOnlyMatch[3] ? parseInt(timeOnlyMatch[3], 10) : 0,
          0
        )
        return now.getTime()
      }
    }
  }

  // 3. Fallback para campo timestamp ou date
  if (order.timestamp) {
    const t = typeof order.timestamp === 'number' ? order.timestamp : Date.parse(order.timestamp)
    if (!isNaN(t) && t > 0) return t
  }
  if (order.date) {
    const d = typeof order.date === 'number' ? order.date : Date.parse(order.date)
    if (!isNaN(d) && d > 0) return d
  }

  // 4. Se o ID contiver um timestamp epoch (ex: "ord-1731534000000" ou "1731534000000")
  const idStr = String(order.orderId || order.id || '')
  const epochMatch = idStr.match(/1[6-7]\d{11}/)
  if (epochMatch) {
    const epochNum = parseInt(epochMatch[0], 10)
    if (!isNaN(epochNum)) return epochNum
  }

  return 0
}

/**
 * Calcula o tempo decorrido desde a realização do pedido
 * @param {Object} order
 * @param {number} [now]
 * @returns {{ minutes: number, label: string, text: string, severity: 'normal'|'warning'|'urgent', badgeClass: string, dotClass: string }}
 */
export function calculateOrderElapsedTime(order, now = Date.now()) {
  const timestamp = getOrderTimestamp(order)

  if (!timestamp || timestamp <= 0) {
    return {
      minutes: 0,
      label: '< 1 min',
      text: 'há poucos instantes',
      shortText: '< 1m',
      severity: 'normal',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
    }
  }

  const diffMs = Math.max(0, now - timestamp)
  const minutes = Math.floor(diffMs / 60000)

  let label = '< 1 min'
  let shortText = '< 1m'
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remMin = minutes % 60
    label = `${hours}h ${remMin > 0 ? `${remMin}m` : ''}`.trim()
    shortText = `${hours}h${remMin > 0 ? `${remMin}m` : ''}`
  } else if (minutes >= 1) {
    label = `${minutes} min`
    shortText = `${minutes}m`
  }

  const text = minutes < 1 ? 'há poucos instantes' : `há ${label}`

  // Classificação de gravidade (SLA de cozinha de delivery):
  // - normal (< 15 min): Dentro do tempo inicial
  // - warning (15 - 29 min): Atenção na produção
  // - urgent (>= 30 min): Atraso potencial, requer prioridade máxima!
  let severity = 'normal'
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  let dotClass = 'bg-emerald-500'

  if (minutes >= 30) {
    severity = 'urgent'
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold'
    dotClass = 'bg-rose-600'
  } else if (minutes >= 15) {
    severity = 'warning'
    badgeClass = 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
    dotClass = 'bg-amber-500'
  }

  return {
    minutes,
    label,
    text,
    shortText,
    severity,
    badgeClass,
    dotClass,
  }
}

/**
 * Ordena a lista de pedidos de acordo com o modo escolhido
 * @param {Array} orders - Lista de pedidos
 * @param {'kitchen'|'newest'|'oldest'} [mode='kitchen']
 * @param {string} [columnStatus] - Status da coluna (ex: 'novo', 'preparo', 'entrega', 'concluido')
 * @returns {Array} Nova lista ordenada
 */
export function sortOrders(orders, mode = 'kitchen', columnStatus = null) {
  if (!Array.isArray(orders) || orders.length <= 1) {
    return Array.isArray(orders) ? [...orders] : []
  }

  return [...orders].sort((a, b) => {
    const timeA = getOrderTimestamp(a)
    const timeB = getOrderTimestamp(b)

    // Se o modo for 'kitchen' (FIFO para ativos da cozinha, LIFO para concluídos/cancelados)
    if (mode === 'kitchen') {
      const isHistorical =
        columnStatus === 'concluido' ||
        columnStatus === 'cancelado' ||
        columnStatus === 'recusado' ||
        a.status === 'concluido' ||
        a.status === 'cancelado' ||
        a.status === 'recusado'

      if (isHistorical) {
        // Concluídos/Cancelados: Mais recentes no topo (decrescente)
        if (timeA !== timeB) return timeB - timeA
      } else {
        // Cozinha / Fila de Produção ativa (Novos, Em Preparo, Saiu para Entrega):
        // Mais antigos no topo (crescente - FIFO)
        if (timeA !== timeB) return timeA - timeB
      }
    } else if (mode === 'newest') {
      // Mais recentes no topo (decrescente)
      if (timeA !== timeB) return timeB - timeA
    } else if (mode === 'oldest') {
      // Mais antigos no topo (crescente)
      if (timeA !== timeB) return timeA - timeB
    }

    // Desempate estável por ID caso o timestamp seja idêntico (ex: ambos às 10:30:00)
    const idA = String(a.orderId || a.id || '')
    const idB = String(b.orderId || b.id || '')
    return idA.localeCompare(idB)
  })
}
