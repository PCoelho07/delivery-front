/**
 * Utilitário de Compressão de Imagens no Front-End via HTML5 Canvas
 * Redimensiona e converte fotos pesadas (ex: 3MB a 10MB) para WebP/JPEG leve (60KB a 120KB)
 * sem necessidade de bibliotecas externas pesadas.
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.8,
    mimeType = 'image/webp',
  } = options

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem.'))

    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Erro ao carregar a imagem para processamento.'))

      img.onload = () => {
        let width = img.width
        let height = img.height

        // Redimensiona proporcionalmente mantendo a proporção de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Não foi possível inicializar o canvas de compressão.'))
          return
        }

        // Fundo branco caso haja transparência convertida para JPEG
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, width, height)
        }

        ctx.drawImage(img, 0, 0, width, height)

        let dataUrl
        try {
          dataUrl = canvas.toDataURL(mimeType, quality)
        } catch {
          // Fallback para jpeg padrão se o navegador não suportar webp no canvas
          dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        }

        // Cálculo aproximado do tamanho em KB a partir do base64
        const base64Data = dataUrl.split(',')[1] || ''
        const sizeBytes = Math.round((base64Data.length * 3) / 4)
        const sizeKB = Math.round(sizeBytes / 1024)
        const originalSizeKB = Math.round(file.size / 1024)

        resolve({
          dataUrl,
          sizeKB,
          originalSizeKB,
          width,
          height,
          fileName: file.name,
        })
      }

      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  })
}

