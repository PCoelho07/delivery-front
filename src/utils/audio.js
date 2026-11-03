/**
 * Utilitário de áudio sintetizado nativo (Web Audio API)
 *
 * Características:
 * - 100% autônomo: Não depende de arquivos MP3/WAV externos ou requisições de rede.
 * - Desbloqueio robusto para iOS / Safari (WebKit) usando buffer silencioso de 1 sample.
 * - Tratamento universal de Autoplay Policy para Chrome, Safari, Edge e Firefox.
 * - Sons distintos e calibrados:
 *   1. Lojista: Alerta chamativo de Novo Pedido (trítono ascendente com sino ressonante).
 *   2. Cliente: Toques discretos e agradáveis para mudanças de status (Preparo, Saiu p/ Entrega, Entregue).
 */

let sharedAudioContext = null
let isUnlocked = false
const unlockListeners = []

/**
 * Obtém ou inicializa a instância singleton do AudioContext
 */
export function getAudioContext() {
  if (typeof window === 'undefined') return null

  if (!sharedAudioContext) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext || null
    if (AudioContextClass) {
      sharedAudioContext = new AudioContextClass()
    }
  }

  return sharedAudioContext
}

/**
 * Registra callback para quando o áudio for desbloqueado
 */
export function onAudioUnlocked(callback) {
  if (isUnlocked) {
    callback(true)
    return () => {}
  }
  unlockListeners.push(callback)
  return () => {
    const idx = unlockListeners.indexOf(callback)
    if (idx !== -1) unlockListeners.splice(idx, 1)
  }
}

/**
 * Verifica se o áudio está desbloqueado e ativo
 */
export function isAudioReady() {
  const ctx = getAudioContext()
  return Boolean(ctx && ctx.state === 'running' && isUnlocked)
}

/**
 * Desbloqueia o contexto de áudio em resposta a uma interação do usuário.
 * No iOS Safari, tocar um buffer de 1 frame silencioso é essencial para liberar o pipeline.
 */
export async function unlockAudio() {
  const ctx = getAudioContext()
  if (!ctx) return false

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    // Truque do buffer silencioso para compatibilidade rigorosa com iOS/Safari WebKit
    const buffer = ctx.createBuffer(1, 1, 22050)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start(0)

    isUnlocked = true
    unlockListeners.forEach((cb) => {
      try {
        cb(true)
      } catch {
        // ignorar
      }
    })
    return true
  } catch (err) {
    console.warn('[Audio] Erro ao desbloquear AudioContext:', err)
    return false
  }
}

// Auto-desbloqueio passivo no primeiro toque, clique ou teclado
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'touchend', 'keydown']
  const handleInteraction = () => {
    unlockAudio()
    unlockEvents.forEach((evt) => {
      window.removeEventListener(evt, handleInteraction)
    })
  }

  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleInteraction, { passive: true, once: true })
  })
}

// ============================================================================
// 1. SONS DO LOJISTA
// ============================================================================

/**
 * Som de Alerta para o LOJISTA: Novo pedido recebido
 * Alerta sonoro proeminente (Trítono de sino ressonante: Mi5 -> Sol5 -> Dó6)
 */
export function playOrderChime() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => executeOrderChime(ctx)).catch(() => {})
      return
    }

    executeOrderChime(ctx)
  } catch (err) {
    console.warn('[Audio] Falha ao reproduzir alerta de pedido:', err)
  }
}

function executeOrderChime(ctx) {
  const now = ctx.currentTime

  // Nota 1 (Mi / E5 ~ 659 Hz)
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(659.25, now)
  gain1.gain.setValueAtTime(0.35, now)
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.start(now)
  osc1.stop(now + 0.32)

  // Nota 2 (Sol / G5 ~ 784 Hz)
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(783.99, now + 0.14)
  gain2.gain.setValueAtTime(0.4, now + 0.14)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start(now + 0.14)
  osc2.stop(now + 0.58)

  // Nota 3 (Dó agudo / C6 ~ 1046 Hz) - Sino ressonante
  const osc3 = ctx.createOscillator()
  const gain3 = ctx.createGain()
  osc3.type = 'triangle'
  osc3.frequency.setValueAtTime(1046.5, now + 0.28)
  gain3.gain.setValueAtTime(0.45, now + 0.28)
  gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
  osc3.connect(gain3)
  gain3.connect(ctx.destination)
  osc3.start(now + 0.28)
  osc3.stop(now + 1.25)
}

// ============================================================================
// 2. SONS DO CLIENTE (Discretos e Não Intrusivos)
// ============================================================================

/**
 * Notificação discreta padrão para o CLIENTE (bipe suave)
 */
export function playSoftNotification() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => executeSoftNotification(ctx)).catch(() => {})
      return
    }

    executeSoftNotification(ctx)
  } catch (err) {
    console.warn('[Audio] Falha ao reproduzir notificação suave:', err)
  }
}

function executeSoftNotification(ctx) {
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, now) // Lá5
  osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12) // Ré6

  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.3)
}

/**
 * Som de "Em Preparo" (Cozinha): Tom duplo suave e encorajador
 */
export function playPreparingSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => executePreparingSound(ctx)).catch(() => {})
      return
    }
    executePreparingSound(ctx)
  } catch {
    // ignorar
  }
}

function executePreparingSound(ctx) {
  const now = ctx.currentTime

  // Nota 1 (Fá5 ~ 698 Hz)
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(698.46, now)
  gain1.gain.setValueAtTime(0.2, now)
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.start(now)
  osc1.stop(now + 0.2)

  // Nota 2 (Lá5 ~ 880 Hz)
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(880, now + 0.12)
  gain2.gain.setValueAtTime(0.22, now + 0.12)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start(now + 0.12)
  osc2.stop(now + 0.4)
}

/**
 * Som de "Saiu para Entrega" (Motoboy / Retirada): Sinal alegre de movimento
 */
export function playDeliverySound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => executeDeliverySound(ctx)).catch(() => {})
      return
    }
    executeDeliverySound(ctx)
  } catch {
    // ignorar
  }
}

function executeDeliverySound(ctx) {
  const now = ctx.currentTime
  const notes = [587.33, 739.99, 880] // Ré5, Fá#5, Lá5

  notes.forEach((freq, idx) => {
    const startTime = now + idx * 0.09
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)
    gain.gain.setValueAtTime(0.22, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(startTime)
    osc.stop(startTime + 0.25)
  })
}

/**
 * Som de "Pedido Entregue / Concluído": Arpejo de sucesso discreto
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => executeSuccessSound(ctx)).catch(() => {})
      return
    }
    executeSuccessSound(ctx)
  } catch {
    // ignorar
  }
}

function executeSuccessSound(ctx) {
  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // Dó5, Mi5, Sol5, Dó6

  notes.forEach((freq, idx) => {
    const startTime = now + idx * 0.08
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = idx === 3 ? 'triangle' : 'sine'
    osc.frequency.setValueAtTime(freq, startTime)
    gain.gain.setValueAtTime(0.25, startTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (idx === 3 ? 0.6 : 0.2))
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(startTime)
    osc.stop(startTime + (idx === 3 ? 0.65 : 0.25))
  })
}

/**
 * Toca o som contextual correto com base no status do pedido recebido
 */
export function playOrderStatusSound(status) {
  const normalized = String(status || '').toLowerCase().trim()
  if (normalized === 'preparo' || normalized === 'preparando' || normalized === 'em preparo') {
    playPreparingSound()
  } else if (normalized === 'entrega' || normalized === 'saiu para entrega' || normalized === 'pronto') {
    playDeliverySound()
  } else if (normalized === 'concluido' || normalized === 'concluído' || normalized === 'entregue') {
    playSuccessSound()
  } else {
    playSoftNotification()
  }
}
