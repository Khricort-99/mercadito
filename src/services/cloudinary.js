import { dataUrlToBlob } from '../utils/blob.js'

const DEFAULT_CONFIG = {
  VITE_CLOUDINARY_CLOUD_NAME: 'xcny56fc',
  VITE_CLOUDINARY_UPLOAD_PRESET: 'Tienda'
}

function isPlaceholder(value) {
  if (!value) return true
  return /^(tu_|your_|tu-|your-|tu\s|your\s)/i.test(value)
}

function read(key) {
  const value = import.meta.env[key]
  return value && !isPlaceholder(value) ? value : DEFAULT_CONFIG[key]
}

export function isCloudinaryConfigured() {
  return (
    !isPlaceholder(read('VITE_CLOUDINARY_CLOUD_NAME')) &&
    !isPlaceholder(read('VITE_CLOUDINARY_UPLOAD_PRESET'))
  )
}

function extensionFor(type) {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  if (type === 'image/gif') return 'gif'
  if (type === 'image/svg+xml') return 'svg'
  return 'jpg'
}

export const uploadToCloudinary = async (file) => {
  const cloudName = read('VITE_CLOUDINARY_CLOUD_NAME')
  const uploadPreset = read('VITE_CLOUDINARY_UPLOAD_PRESET')

  if (!cloudName || !uploadPreset) {
    throw new Error('Faltan las credenciales de Cloudinary en el archivo .env')
  }

  const blob = typeof file === 'string' ? dataUrlToBlob(file) : file
  const formData = new FormData()
  formData.append('file', blob, blob.name || `imagen.${extensionFor(blob.type)}`)
  formData.append('upload_preset', uploadPreset)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    let errorData = null
    try {
      errorData = await response.json()
    } catch {
      errorData = null
    }
    throw new Error(errorData?.error?.message || 'Error al subir la imagen a Cloudinary')
  }

  const data = await response.json()
  if (!data?.secure_url) throw new Error('Cloudinary no devolvió una URL válida')
  return data.secure_url
}
