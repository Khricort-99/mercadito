function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('No pudimos leer la imagen. Intenta nuevamente.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('La imagen no se pudo procesar.'))
    image.src = src
  })
}

export async function prepareImage(file, options = {}) {
  const { maxSize = 1400, quality = 0.82, maxBytes = 12 * 1024 * 1024 } = options
  if (!file || !String(file.type).startsWith('image/')) {
    throw new Error(`"${file?.name || 'Archivo'}" no es una imagen válida.`)
  }
  if (file.size > maxBytes) {
    throw new Error(`"${file.name}" supera los ${Math.round(maxBytes / (1024 * 1024))} MB.`)
  }

  const dataUrl = await readAsDataUrl(file)
  if (file.type === 'image/svg+xml') return dataUrl

  const image = await loadImage(dataUrl)
  const ratio = Math.min(1, maxSize / Math.max(image.width, image.height))
  if (ratio === 1 && file.size <= 320 * 1024) return dataUrl

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * ratio))
  canvas.height = Math.max(1, Math.round(image.height * ratio))
  const context = canvas.getContext('2d')
  if (!context) return dataUrl

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}
