/**
 * Utilitário de áudio sintetizado para alertas de novos pedidos
 * Utiliza a Web Audio API nativa do navegador, sem dependência de arquivos de áudio externos (.mp3)
 */
export function playOrderChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    const ctx = new AudioContext()

    // O navegador exige interação prévia do usuário para áudio
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // Nota 1 (Mi / E5 ~ 659 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(659.25, now)
    gain1.gain.setValueAtTime(0.25, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.3)

    // Nota 2 (Sol / G5 ~ 784 Hz)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(783.99, now + 0.15)
    gain2.gain.setValueAtTime(0.3, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.6)

    // Nota 3 (Dó agudo / C6 ~ 1046 Hz) - Toque de sino de entrega
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'triangle'
    osc3.frequency.setValueAtTime(1046.5, now + 0.32)
    gain3.gain.setValueAtTime(0.2, now + 0.32)
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)
    osc3.connect(gain3)
    gain3.connect(ctx.destination)
    osc3.start(now + 0.32)
    osc3.stop(now + 0.82)
  } catch (err) {
    // Falha silenciosa em navegadores com restrições rígidas de autoplay
    console.warn('[Audio] Não foi possível reproduzir som de notificação:', err)
  }
}

