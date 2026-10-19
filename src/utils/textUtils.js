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

