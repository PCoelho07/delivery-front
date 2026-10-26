/**
 * Utilitário de áudio sintetizado para alertas de novos pedidos
 * Utiliza a Web Audio API nativa com reaproveitamento de AudioContext persistente
 * e desbloqueio prévio em eventos do usuário, permitindo reprodução mesmo em abas em segundo plano.
 */

let sharedAudioContext = null

/**
 * Obtém ou inicializa o contexto global compartilhado de áudio
 */
export function getAudioContext() {
  if (typeof window === 'undefined') return null

  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      sharedAudioContext = new AudioContextClass()
    }
  }

  return sharedAudioContext
}

/**
 * Desbloqueia o áudio em qualquer interação do usuário (clique, toque ou tecla)
 * Necessário pelas políticas de autoplay dos navegadores modernos (Chrome, Firefox, Safari, Edge)
 */
export function unlockAudio() {
  try {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  } catch (err) {
    console.warn('[Audio] Falha ao desbloquear AudioContext:', err)
  }
}

// Registra ouvintes globais para desbloqueio passivo no primeiro clique/toque
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'keydown']
  const handleFirstInteraction = () => {
    unlockAudio()
    unlockEvents.forEach((evt) => {
      window.removeEventListener(evt, handleFirstInteraction)
    })
  }

  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleFirstInteraction, { passive: true })
  })
}

/**
 * Toca o sinal sonoro característico de novo pedido (trítono ascendente com ressonância de sino)
 * Funciona mesmo quando a janela estiver minimizada se o áudio já tiver sido desbloqueado.
 */
export function playOrderChime() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    // Garante que o contexto esteja ativo
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        executeChimeNotes(ctx)
      }).catch(() => {})
      return
    }

    executeChimeNotes(ctx)
  } catch (err) {
    console.warn('[Audio] Não foi possível reproduzir som de notificação:', err)
  }
}

/**
 * Executa as notas musicais do sino
 */
function executeChimeNotes(ctx) {
  const now = ctx.currentTime

  // Nota 1 (Mi / E5 ~ 659.25 Hz)
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(659.25, now)
  gain1.gain.setValueAtTime(0.3, now)
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.start(now)
  osc1.stop(now + 0.32)

  // Nota 2 (Sol / G5 ~ 783.99 Hz)
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(783.99, now + 0.14)
  gain2.gain.setValueAtTime(0.35, now + 0.14)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start(now + 0.14)
  osc2.stop(now + 0.58)

  // Nota 3 (Dó agudo / C6 ~ 1046.5 Hz) - Toque de sino forte
  const osc3 = ctx.createOscillator()
  const gain3 = ctx.createGain()
  osc3.type = 'triangle'
  osc3.frequency.setValueAtTime(1046.5, now + 0.28)
  gain3.gain.setValueAtTime(0.4, now + 0.28)
  gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.1)
  osc3.connect(gain3)
  gain3.connect(ctx.destination)
  osc3.start(now + 0.28)
  osc3.stop(now + 1.15)
}
