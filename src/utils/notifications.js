/**
 * Utilitário de Notificações Nativas do Sistema Operacional (Web Notification API)
 * e Alertas Visuais de Aba em Segundo Plano (Title Blinker).
 *
 * Permite que o lojista receba alertas na tela do computador (Windows/macOS/Linux)
 * e do celular mesmo quando o navegador estiver minimizado ou com outra aba ativa.
 */

let titleBlinkInterval = null
let originalDocumentTitle = ''

/**
 * Verifica se a API de Notificações é suportada pelo navegador
 */
export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

/**
 * Retorna o status de permissão de notificações: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

/**
 * Solicita autorização ao usuário para exibir notificações na área de trabalho
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (err) {
    console.warn('[Notifications] Erro ao solicitar permissão:', err)
    return 'denied'
  }
}

/**
 * Envia notificação nativa para a Central de Ações do Windows/macOS/celular
 */
export function sendDesktopNotification({
  title = '🔔 Novo Pedido Recebido!',
  body = 'Um novo pedido acabou de chegar na sua loja.',
  icon = '/favicon.ico',
  tag = 'new-order',
  onClick,
} = {}) {
  if (!isNotificationSupported()) return null
  if (Notification.permission !== 'granted') return null

  try {
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag,
      renotify: true,
      requireInteraction: false,
    })

    notification.onclick = () => {
      try {
        window.focus()
      } catch {
        // ignorar
      }
      notification.close()
      onClick?.()
    }

    // Auto-fecha após 10 segundos para não acumular
    setTimeout(() => {
      try {
        notification.close()
      } catch {
        // ignorar
      }
    }, 10000)

    return notification
  } catch (err) {
    console.warn('[Notifications] Falha ao disparar notificação desktop:', err)
    return null
  }
}

/**
 * Inicia o piscar do título da aba do navegador quando o usuário está em outra janela/aba
 */
export function startTitleBlink(alertTitle = '🔔 (1) NOVO PEDIDO!') {
  if (typeof document === 'undefined') return

  if (!originalDocumentTitle) {
    originalDocumentTitle = document.title
  }

  stopTitleBlink()

  let isAlert = true
  document.title = alertTitle

  titleBlinkInterval = setInterval(() => {
    document.title = isAlert ? originalDocumentTitle : alertTitle
    isAlert = !isAlert
  }, 1200)

  // Cancela o piscar assim que o usuário retornar à aba
  const handleFocus = () => {
    stopTitleBlink()
    window.removeEventListener('focus', handleFocus)
  }
  window.addEventListener('focus', handleFocus, { once: true })
}

/**
 * Para o piscar e restaura o título original
 */
export function stopTitleBlink() {
  if (titleBlinkInterval) {
    clearInterval(titleBlinkInterval)
    titleBlinkInterval = null
  }
  if (originalDocumentTitle && typeof document !== 'undefined') {
    document.title = originalDocumentTitle
  }
}

