import { createSeedProducts } from '../data/seed.js'
import { createId } from '../utils/id.js'
import {
  deleteProduct as deleteRemoteProduct,
  fetchProduct,
  fetchProducts,
  hasProducts,
  saveProduct as saveRemoteProduct,
  saveProducts,
  subscribeProducts
} from './firestore.js'

const PRODUCTS_KEY = 'mercado-cl:products:v1'
const MAX_DOCUMENT_BYTES = 950000

function hasStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function readLocal() {
  if (!hasStorage()) return null
  const raw = window.localStorage.getItem(PRODUCTS_KEY)
  if (raw === null) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeLocal(products) {
  if (!hasStorage()) return
  try {
    window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  } catch {
    void 0
  }
}

function ensureLocalSeed() {
  const existing = readLocal()
  if (existing && existing.length) return existing
  writeLocal([])
  return []
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

function toIso(value, fallback) {
  if (!value) return fallback
  if (typeof value.toDate === 'function') {
    try {
      return value.toDate().toISOString()
    } catch {
      return fallback
    }
  }
  if (typeof value === 'string' && !Number.isNaN(new Date(value).getTime())) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
}

function normalizeStored(input) {
  const now = new Date().toISOString()
  const rawId = String(input.id ?? '').trim()
  const id = rawId ? rawId.replaceAll('/', '-') : createId()
  const createdAt = toIso(input.createdAt, now)

  return {
    id,
    ...normalizeProduct(input),
    createdAt,
    updatedAt: toIso(input.updatedAt, createdAt)
  }
}

function sortProducts(products) {
  const time = (value) => {
    const result = new Date(value).getTime()
    return Number.isNaN(result) ? 0 : result
  }
  return [...products].sort((a, b) => time(b.createdAt) - time(a.createdAt))
}

function documentSize(product) {
  return new TextEncoder().encode(JSON.stringify(product)).length
}

function fitsDocument(product) {
  return documentSize(product) <= MAX_DOCUMENT_BYTES
}

function assertDocumentSize(product) {
  if (fitsDocument(product)) return
  throw new Error(
    'La publicación es demasiado grande para guardarse en Firestore. Usa imágenes más livianas o revisa la configuración de Firebase Storage.'
  )
}

function cacheUpsert(product) {
  const cached = readLocal()
  if (!cached) return
  const exists = cached.some((item) => item.id === product.id)
  const next = exists
    ? cached.map((item) => (item.id === product.id ? product : item))
    : [product, ...cached]
  writeLocal(next)
}

function cacheRemove(id) {
  const cached = readLocal()
  if (!cached) return
  writeLocal(cached.filter((item) => item.id !== id))
}

function cacheList(products) {
  if (products.length) writeLocal(products)
}

let seeding = null

export const productStorage = {
  async list() {
    try {
      const remote = await fetchProducts()
      const products = remote.map(normalizeStored).filter((p) => !String(p.id).startsWith('seed-'))
      cacheList(products)
      return sortProducts(products)
    } catch (error) {
      throw new Error(error?.message || 'No pudimos cargar las publicaciones.')
    }
  },

  async get(id) {
    const remote = await fetchProduct(id)
    return remote ? normalizeStored(remote) : null
  },

  subscribe(onChange, onError) {
    return subscribeProducts(
      (products) => {
        const normalized = products.map(normalizeStored).filter((p) => !String(p.id).startsWith('seed-'))
        cacheList(normalized)
        onChange(sortProducts(normalized))
      },
      onError
    )
  },

  async create(input) {
    const now = new Date().toISOString()
    const product = {
      id: createId(),
      ...normalizeProduct(input),
      createdAt: now,
      updatedAt: now
    }
    assertDocumentSize(product)
    await saveRemoteProduct(product)
    cacheUpsert(product)
    return product
  },

  async update(id, input) {
    const existing = await fetchProduct(id)
    if (!existing) throw new Error('La publicación ya no existe.')
    const base = normalizeStored(existing)
    const updated = {
      ...base,
      ...normalizeProduct(input),
      id: base.id,
      createdAt: base.createdAt,
      updatedAt: new Date().toISOString()
    }
    assertDocumentSize(updated)
    await saveRemoteProduct(updated)
    cacheUpsert(updated)
    return updated
  },

  async remove(id) {
    await deleteRemoteProduct(id)
    cacheRemove(id)
  },

  async setAvailability(id, availability) {
    const existing = await fetchProduct(id)
    if (!existing) throw new Error('La publicación ya no existe.')
    const updated = {
      ...normalizeStored(existing),
      availability: availability === 'vendido' ? 'vendido' : 'disponible',
      updatedAt: new Date().toISOString()
    }
    assertDocumentSize(updated)
    await saveRemoteProduct(updated)
    cacheUpsert(updated)
    return updated
  },

  async seedIfEmpty() {
    if (seeding) return seeding
    seeding = (async () => {
      if (await hasProducts()) return 0

      let products = ensureLocalSeed().map(normalizeStored).filter(fitsDocument)
      if (!products.length) {
        products = createSeedProducts().map(normalizeStored).filter(fitsDocument)
      }
      if (!products.length) return 0

      await saveProducts(products)
      cacheList(products)
      return products.length
    })().finally(() => {
      seeding = null
    })
    return seeding
  }
}
