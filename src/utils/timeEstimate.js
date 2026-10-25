/**
 * Utilitário para cálculo de previsão de entrega e retirada
 * baseado na configuração do lojista (ex: "40 - 50 min", "20 - 30 min").
 */

export function calculateTimeEstimate(rawEstimate, orderCreatedAt, method = 'delivery') {
  const isPickup = method === 'pickup'
  const defaultEstimate = isPickup ? '20 - 30 min' : '40 - 50 min'
  const text = (rawEstimate || defaultEstimate).trim()

  // Extrair números do intervalo (ex: "40 - 50 min", "20 a 30", "45 min")
  let minMinutes = isPickup ? 20 : 40
  let maxMinutes = isPickup ? 30 : 50

  const numbers = text.match(/\d+/g)
  if (numbers && numbers.length >= 2) {
    minMinutes = parseInt(numbers[0], 10)
    maxMinutes = parseInt(numbers[1], 10)
    if (minMinutes > maxMinutes) {
      const temp = minMinutes
      minMinutes = maxMinutes
      maxMinutes = temp
    }
  } else if (numbers && numbers.length === 1) {
    const single = parseInt(numbers[0], 10)
    minMinutes = Math.max(5, single - 5)
    maxMinutes = single + 5
  }

  // Data base de referência (momento do pedido)
  let baseDate = new Date()
  if (orderCreatedAt) {
    if (orderCreatedAt instanceof Date) {
      baseDate = orderCreatedAt
    } else if (typeof orderCreatedAt === 'number') {
      baseDate = new Date(orderCreatedAt)
    } else if (typeof orderCreatedAt === 'string') {
      const parsed = Date.parse(orderCreatedAt)
      if (!isNaN(parsed)) {
        baseDate = new Date(parsed)
      } else {
        // Tenta capturar HH:MM em strings como "24/10/2026 às 21:00"
        const timeMatch = orderCreatedAt.match(/(\d{1,2}):(\d{2})/)
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10)
          const minutes = parseInt(timeMatch[2], 10)
          baseDate = new Date()
          baseDate.setHours(hours, minutes, 0, 0)
        }
      }
    }
  }

  const startDate = new Date(baseDate.getTime() + minMinutes * 60 * 1000)
  const endDate = new Date(baseDate.getTime() + maxMinutes * 60 * 1000)

  const formatTime = (d) => {
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
  }

  const startFormatted = formatTime(startDate)
  const endFormatted = formatTime(endDate)

  const timeWindow = `${startFormatted} - ${endFormatted}`
  const fullLabel = `Hoje, entre ${startFormatted} e ${endFormatted}`
  const label = isPickup ? 'Previsão para ficar pronto' : 'Previsão de entrega'
  const shortLabel = isPickup ? 'Pronto até' : 'Chega até'

  return {
    label,
    shortLabel,
    timeWindow,
    fullLabel,
    durationText: `${minMinutes} - ${maxMinutes} min`,
    minMinutes,
    maxMinutes,
    isPickup,
  }
}

