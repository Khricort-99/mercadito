import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { productStorage } from '../services/storage.js'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await productStorage.list()
      setProducts(list)
      setError('')
    } catch (currentError) {
      setError(currentError?.message || 'No pudimos cargar las publicaciones.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleChange = () => {
      productStorage
        .list()
        .then((list) => setProducts(list))
        .catch(() => setError('No pudimos actualizar las publicaciones.'))
    }
    window.addEventListener('storage', handleChange)
    window.addEventListener('mercado-cl:products-changed', handleChange)
    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener('mercado-cl:products-changed', handleChange)
    }
  }, [])

  const create = useCallback(async (data) => {
    const product = await productStorage.create(data)
    setProducts((prev) => [product, ...prev.filter((item) => item.id !== product.id)])
    return product
  }, [])

  const update = useCallback(async (id, data) => {
    const product = await productStorage.update(id, data)
    setProducts((prev) => prev.map((item) => (item.id === id ? product : item)))
    return product
  }, [])

  const remove = useCallback(async (id) => {
    await productStorage.remove(id)
    setProducts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const setAvailability = useCallback(async (id, availability) => {
    const product = await productStorage.setAvailability(id, availability)
    setProducts((prev) => prev.map((item) => (item.id === id ? product : item)))
    return product
  }, [])

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      refresh,
      create,
      update,
      remove,
      setAvailability
    }),
    [products, loading, error, refresh, create, update, remove, setAvailability]
  )

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProductContext() {
  const context = useContext(ProductContext)
  if (!context) throw new Error('useProductContext debe usarse dentro de ProductProvider')
  return context
}
