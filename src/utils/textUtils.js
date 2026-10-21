/**
 * Capitaliza as primeiras letras das palavras (Title Case)
 * Ex: "cachorro quente" ➔ "Cachorro Quente"
 * Ex: "lanches e porções" ➔ "Lanches e Porções"
 * Ex: "✨ novidades do mês" ➔ "✨ Novidades do Mês"
 */
export function formatTitleCase(str) {
  if (!str) return ''
  const minorWords = new Set([
    'de',
    'do',
    'da',
    'dos',
    'das',
    'e',
    'em',
    'com',
    'para',
    'por',
  ])

  return str
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      // Localiza a primeira letra alfabética na palavra (suporta caracteres unicode/acentos)
      const firstLetterMatch = word.match(/\p{L}/u)
      if (!firstLetterMatch) return word

      const lower = word.toLowerCase()
      // Preposições curtas não no início permanecem em minúsculas
      if (index > 0 && minorWords.has(lower)) {
        return lower
      }

      const letterIndex = word.indexOf(firstLetterMatch[0])
      return (
        word.slice(0, letterIndex) +
        firstLetterMatch[0].toUpperCase() +
        word.slice(letterIndex + 1).toLowerCase()
      )
    })
    .join(' ')
}

/**
 * Normaliza horário no padrão brasileiro 24 horas (HH:mm)
 * Ex: "19" ➔ "19:00"
 * Ex: "19h" ➔ "19:00"
 * Ex: "19h30" ➔ "19:30"
 * Ex: "1930" ➔ "19:30"
 * Ex: "7" ➔ "07:00"
 * Ex: "23:30" ➔ "23:30"
 */
export function normalizeTime24h(val, fallback = '18:00') {
  if (!val || typeof val !== 'string') return fallback
  const cleaned = val.trim().toLowerCase().replace('h', ':').replace(/\s+/g, '')
  if (!cleaned) return fallback

  // Caso: 3 ou 4 dígitos seguidos (ex: "1930" -> "19:30" ou "730" -> "07:30")
  if (/^\d{3,4}$/.test(cleaned)) {
    const h = cleaned.slice(0, cleaned.length - 2)
    const m = cleaned.slice(-2)
    return normalizeTime24h(`${h}:${m}`, fallback)
  }

  const parts = cleaned.split(':')
  let hours = parseInt(parts[0], 10)
  let minutes = parts[1] !== undefined && parts[1] !== '' ? parseInt(parts[1], 10) : 0

  if (isNaN(hours)) return fallback
  if (hours < 0) hours = 0
  if (hours === 24 && minutes === 0) {
    hours = 0
  } else if (hours > 23) {
    hours = 23
  }

  if (isNaN(minutes) || minutes < 0) minutes = 0
  if (minutes > 59) minutes = 59

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}


