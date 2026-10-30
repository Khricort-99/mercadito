import { createSeedProducts } from '../data/seed.js'
import { createId } from '../utils/id.js'

const PRODUCTS_KEY = 'mercado-cl:products:v1'

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function hasStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function readProducts() {
  if (!hasStorage()) return []
  return safeParse(window.localStorage.getItem(PRODUCTS_KEY), [])
}

function ensureSeed() {
  if (!hasStorage()) return []
  if (window.localStorage.getItem(PRODUCTS_KEY) === null) {
    const seeded = createSeedProducts()
    try {
      window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seeded))
    } catch {
      return seeded
    }
    return seeded
  }
  return readProducts()
}

function persistProducts(products) {
  if (!hasStorage()) throw new Error('El almacenamiento local no está disponible.')
  try {
    window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  } catch (error) {
    if (error?.name === 'QuotaExceededError' || error?.code === 22) {
      throw new Error(
        'No hay espacio suficiente para guardar las imágenes. Prueba con fotos más livianas o elimina algunas.'
      )
    }
    throw error
  }
  window.dispatchEvent(new Event('mercado-cl:products-changed'))
}

function normalizeProduct(input) {
  const rawTags = Array.isArray(input.tags)
    ? input.tags
    : String(input.tags ?? '').split(',')
  const tags = Array.from(
    new Set(
      rawTags
        .map((tag) => String(tag).trim())
        .filter(Boolean)
        .slice(0, 12)
    )
  )
  const images = (Array.isArray(input.images) ? input.images : [])
    .filter((image) => typeof image === 'string' && image.length > 0)
    .slice(0, 8)
  const genero = input.genero === 'hombre' || input.genero === 'mujer' ? input.genero : ''

  return {
    title: String(input.title ?? '').trim(),
    price: Math.max(0, Number(input.price) || 0),
    category: input.category || 'otros',
    genero,
    condition: input.condition || 'Usado - Buen estado',
    description: String(input.description ?? '').trim(),
    location: input.location || '',
    tags,
    images,
    availability: input.availability === 'vendido' ? 'vendido' : 'disponible'
  }
}

function sortProducts(products) {
  return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export const productStorage = {
  async list() {
    return sortProducts(ensureSeed())
  },

  async get(id) {
    return ensureSeed().find((product) => product.id === id) ?? null
  },

  async create(input) {
    const now = new Date().toISOString()
    const product = {
      id: createId(),
      ...normalizeProduct(input),
      createdAt: now,
      updatedAt: now
    }
    persistProducts([product, ...ensureSeed()])
    return product
  },

  async update(id, input) {
    const products = ensureSeed()
    const index = products.findIndex((product) => product.id === id)
    if (index === -1) throw new Error('La publicación ya no existe.')
    const updated = {
      ...products[index],
      ...normalizeProduct(input),
      id,
      createdAt: products[index].createdAt,
      updatedAt: new Date().toISOString()
    }
    products[index] = updated
    persistProducts(products)
    return updated
  },

  async remove(id) {
    const products = ensureSeed()
    const next = products.filter((product) => product.id !== id)
    if (next.length === products.length) throw new Error('La publicación ya no existe.')
    persistProducts(next)
  },

  async setAvailability(id, availability) {
    const products = ensureSeed()
    const index = products.findIndex((product) => product.id === id)
    if (index === -1) throw new Error('La publicación ya no existe.')
    const updated = {
      ...products[index],
      availability: availability === 'vendido' ? 'vendido' : 'disponible',
      updatedAt: new Date().toISOString()
    }
    products[index] = updated
    persistProducts(products)
    return updated
  }
}
