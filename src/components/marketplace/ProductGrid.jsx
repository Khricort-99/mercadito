import { ProductCard } from './ProductCard.jsx'

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-fb-line bg-white shadow-card">
      <div className="aspect-square animate-pulse bg-fb-soft" />
      <div className="space-y-2 p-3">
        <div className="h-5 w-24 animate-pulse rounded bg-fb-soft" />
        <div className="h-3.5 w-full animate-pulse rounded bg-fb-soft" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-fb-soft" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-fb-soft" />
      </div>
    </div>
  )
}

export function ProductGrid({ products, loading = false, skeletonCount = 10 }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!products.length) return null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
