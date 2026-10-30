import { useProductContext } from '../context/ProductContext.jsx'

export function useProducts() {
  return useProductContext()
}

export function useProduct(id) {
  const { products, loading, error } = useProducts()
  return {
    product: products.find((item) => item.id === id) ?? null,
    loading,
    error
  }
}
