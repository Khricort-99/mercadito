import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { productStorage } from '../services/storage.js'
import { useAuth } from './AuthContext.jsx'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const { isAuthenticated, initializing } = useAuth()
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
    const unsubscribe = productStorage.subscribe(
      (list) => {
        setProducts(list)
        setLoading(false)
        setError('')
      },
      () => {
        setError('No pudimos actualizar las publicaciones en tiempo real.')
      }
    )
    return unsubscribe
  }, [])

  useEffect(() => {
    if (initializing || !isAuthenticated) return undefined
    let active = true

    productStorage
      .seedIfEmpty()
      .then((count) => {
        if (!active || !count) return undefined
        return refresh()
      })
      .catch((seedError) => {
        if (!active) return
        const permissionDenied =
          seedError?.code === 'permission-denied' ||
          seedError?.code === 'firestore/permission-denied'
        setError(
          permissionDenied
            ? 'No pudimos guardar el catálogo en Firestore. Verifica las reglas y tu documento en la colección admins.'
            : seedError?.message || 'No pudimos inicializar el catálogo en Firestore.'
        )
      })

    return () => {
      active = false
    }
  }, [initializing, isAuthenticated, refresh])

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
