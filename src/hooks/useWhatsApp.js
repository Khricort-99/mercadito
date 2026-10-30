import { useCallback } from 'react'
import { formatPrice } from '../utils/format.js'
import { productUrl } from '../utils/url.js'

const FALLBACK_NUMBER = '56971448109'

function getWhatsAppNumber() {
  return (import.meta.env.VITE_WHATSAPP_NUMBER || FALLBACK_NUMBER).replace(/\D/g, '')
}

function buildProductUrl(product) {
  return productUrl(product.id)
}

function buildProductMessage(product, url) {
  return `¡Hola! Estoy interesado en el producto: ${product.title} (Precio: ${formatPrice(
    product.price
  )}). ¿Sigue disponible? Enlace: ${url}`
}

function buildWhatsAppLink(product, url = buildProductUrl(product)) {
  const message = buildProductMessage(product, url)
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`
}

export function useWhatsApp() {
  const openChat = useCallback((product, overrideUrl) => {
    if (!product) return null
    const link = buildWhatsAppLink(product, overrideUrl || buildProductUrl(product))
    window.open(link, '_blank', 'noopener,noreferrer')
    return link
  }, [])

  return { openChat, number: getWhatsAppNumber() }
}
