export function dataUrlToBlob(dataUrl) {
  const [meta, base64] = String(dataUrl).split(',')
  const mime = /data:([^;]+)/.exec(meta)?.[1] || 'image/jpeg'
  const binary = atob(base64 ?? '')
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: mime })
}
