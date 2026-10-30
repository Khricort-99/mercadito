export function publicUrl(path = '') {
  if (typeof window === 'undefined') return ''
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const relative = String(path).replace(/^\/+/, '')
  return `${window.location.origin}${normalizedBase}${relative}`
}

export function productUrl(id) {
  return publicUrl(`producto/${encodeURIComponent(id)}`)
}
