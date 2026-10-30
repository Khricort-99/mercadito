const priceFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
})

export function formatPrice(value) {
  const number = Number(value)
  return priceFormatter.format(Number.isFinite(number) ? number : 0)
}

export function parseDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function formatNumberInput(value) {
  const digits = parseDigits(value)
  return digits ? new Intl.NumberFormat('es-CL').format(Number(digits)) : ''
}

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function relativeTime(value, nowValue = Date.now()) {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return ''
  const diff = Math.max(0, nowValue - timestamp)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
  if (days < 35) {
    const weeks = Math.floor(days / 7)
    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
  }
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(timestamp))
}

export function formatDate(value) {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return ''
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(timestamp))
}

export function shortLocation(location) {
  return String(location ?? '').split(',')[0].trim()
}
