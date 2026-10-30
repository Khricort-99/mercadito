const env = import.meta.env

function isPlaceholder(value) {
  if (!value) return true
  return /^(tu_|your_|tu-|your-|tu\s|your\s)/i.test(value)
}

export function isCloudinaryConfigured() {
  return (
    !isPlaceholder(env.VITE_CLOUDINARY_CLOUD_NAME) &&
    !isPlaceholder(env.VITE_CLOUDINARY_UPLOAD_PRESET)
  )
}

function dataUrlToBlob(dataUrl) {
  const [meta, base64] = dataUrl.split(',')
  const mime = /data:([^;]+)/.exec(meta)?.[1] || 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: mime })
}

export const uploadToCloudinary = async (file) => {
  const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Faltan las credenciales de Cloudinary en el archivo .env')
  }

  const blob = typeof file === 'string' ? dataUrlToBlob(file) : file
  const formData = new FormData()
  formData.append('file', blob, blob.name || 'imagen.jpg')
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
