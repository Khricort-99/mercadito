import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { Navbar } from '../components/common/Navbar.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { Button } from '../components/common/Button.jsx'
import { ProductFilters } from '../components/marketplace/ProductFilters.jsx'
import { ProductGrid } from '../components/marketplace/ProductGrid.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { GENEROS, SORT_OPTIONS, getCategory } from '../data/catalog.js'
import { formatPrice, normalizeText, shortLocation } from '../utils/format.js'

export default function Home() {
  const [params, setParams] = useSearchParams()
  const { products, loading, error } = useProducts()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filters = useMemo(() => {
    const conditions = (params.get('estado') || '').split('|').filter(Boolean)
    return {
      q: params.get('q') ?? '',
      categoria: params.get('categoria') ?? 'todas',
      genero: params.get('genero') ?? '',
      ubicacion: params.get('ubicacion') ?? '',
      min: params.get('min') ?? '',
      max: params.get('max') ?? '',
      estado: conditions,
      orden: params.get('orden') ?? 'recent',
      vendidos: params.get('vendidos') === '1'
    }
  }, [params])

  const updateFilters = useCallback(
    (patch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(patch)) {
            const isArray = Array.isArray(value)
            const shouldDelete =
              value === '' ||
              value === null ||
              value === undefined ||
              value === false ||
              (isArray && value.length === 0) ||
              (key === 'categoria' && value === 'todas') ||
              (key === 'orden' && value === 'recent')
            if (shouldDelete) {
              next.delete(key)
              continue
            }
            if (isArray) next.set(key, value.join('|'))
            else if (typeof value === 'boolean') next.set(key, '1')
            else next.set(key, String(value))
          }
          if ((patch.categoria ?? next.get('categoria')) !== 'ropa') next.delete('genero')
          return next
        },
        { replace: true }
      )
    },
    [setParams]
  )

  const clearFilters = useCallback(() => {
    setParams(new URLSearchParams(), { replace: true })
  }, [setParams])

  const realProducts = useMemo(
    () => products.filter((p) => !String(p.id ?? '').startsWith('seed-')),
    [products]
  )

  const visibleProducts = useMemo(() => {
    const term = normalizeText(filters.q)
    const min = filters.min ? Number(filters.min) : null
    const max = filters.max ? Number(filters.max) : null

    const list = realProducts.filter((product) => {
      if (!filters.vendidos && product.availability !== 'disponible') return false
      if (filters.categoria !== 'todas' && product.category !== filters.categoria) return false
      if (filters.categoria === 'ropa' && filters.genero && product.genero !== filters.genero)
        return false
      if (filters.ubicacion && product.location !== filters.ubicacion) return false
      if (min !== null && Number(product.price) < min) return false
      if (max !== null && Number(product.price) > max) return false
      if (filters.estado.length && !filters.estado.includes(product.condition)) return false
      if (term) {
        const haystack = normalizeText(
          [
            product.title,
            product.description,
            (product.tags || []).join(' '),
            product.location,
            getCategory(product.category).label
          ].join(' ')
        )
        if (!haystack.includes(term)) return false
      }
      return true
    })

    return list.sort((a, b) => {
      if (filters.orden === 'price_asc') return Number(a.price) - Number(b.price)
      if (filters.orden === 'price_desc') return Number(b.price) - Number(a.price)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [realProducts, filters])

  const hasActiveIntent =
    Boolean(filters.q) ||
    filters.categoria !== 'todas' ||
    Boolean(filters.genero) ||
    Boolean(filters.ubicacion) ||
    filters.estado.length > 0 ||
    filters.vendidos ||
    Boolean(filters.min || filters.max)

  const displayedProducts = visibleProducts.slice(0, 15)

  const activeFilterCount = [
    Boolean(filters.q),
    filters.categoria !== 'todas',
    Boolean(filters.categoria === 'ropa' && filters.genero),
    Boolean(filters.ubicacion),
    Boolean(filters.min || filters.max),
    filters.estado.length > 0,
    filters.vendidos
  ].filter(Boolean).length

  const chips = useMemo(() => {
    const list = []
    if (filters.q) list.push({ key: 'q', label: `“${filters.q}”`, patch: { q: '' } })
    if (filters.categoria !== 'todas') {
      list.push({
        key: 'categoria',
        label: getCategory(filters.categoria).label,
        patch: { categoria: 'todas' }
      })
    }
    if (filters.categoria === 'ropa' && filters.genero) {
      list.push({
        key: 'genero',
        label: GENEROS.find((genero) => genero.id === filters.genero)?.label ?? filters.genero,
        patch: { genero: '' }
      })
    }
    if (filters.ubicacion) {
      list.push({
        key: 'ubicacion',
        label: shortLocation(filters.ubicacion),
        patch: { ubicacion: '' }
      })
    }
    if (filters.min || filters.max) {
      list.push({
        key: 'precio',
        label: `${formatPrice(filters.min || 0)} – ${
          filters.max ? formatPrice(filters.max) : 'sin límite'
        }`,
        patch: { min: '', max: '' }
      })
    }
    filters.estado.forEach((condition) => {
      list.push({
        key: `estado-${condition}`,
        label: condition,
        patch: { estado: filters.estado.filter((item) => item !== condition) }
      })
    })
    if (filters.vendidos) {
      list.push({ key: 'vendidos', label: 'Incluye vendidos', patch: { vendidos: false } })
    }
    return list
  }, [filters])

  const pageTitle =
    filters.categoria !== 'todas' ? getCategory(filters.categoria).label : ''
  usePageTitle(pageTitle)

  const resultsLabel =
    hasActiveIntent || displayedProducts.length > 0
      ? `${displayedProducts.length} ${
          displayedProducts.length === 1 ? 'publicación' : 'publicaciones'
        }`
      : ''

  return (
    <div className="min-h-screen bg-fb-bg">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
          <div className="sticky top-20 rounded-xl border border-fb-line bg-white p-4 shadow-card">
            <ProductFilters
              products={realProducts}
              filters={filters}
              onChange={updateFilters}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {filters.categoria !== 'todas'
                  ? getCategory(filters.categoria).label
                  : 'Hoy en Mercadito'}
              </h1>
              <p className="mt-0.5 text-sm text-fb-gray">
                {loading
                  ? 'Cargando publicaciones...'
                  : `${resultsLabel}${filters.q ? ` para “${filters.q}”` : ''}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="relative inline-flex h-10 items-center gap-1.5 rounded-lg border border-fb-border bg-white px-3 text-sm font-semibold text-fb-ink transition hover:bg-fb-bg lg:hidden"
              >
                <SlidersHorizontal size={16} />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-fb-blue px-1 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <select
                  value={filters.orden}
                  onChange={(event) => updateFilters({ orden: event.target.value })}
                  aria-label="Ordenar publicaciones"
                  className="h-10 cursor-pointer appearance-none rounded-lg border border-fb-border bg-white pl-3 pr-8 text-sm font-medium text-fb-ink outline-none transition hover:bg-fb-bg focus:border-fb-blue focus:ring-2 focus:ring-fb-blue/15"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fb-gray"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => updateFilters(chip.patch)}
                  className="inline-flex h-7 items-center gap-1 rounded-full border border-fb-border bg-white pl-2.5 pr-1.5 text-xs font-medium text-fb-ink transition hover:border-fb-blue hover:text-fb-blue-dark"
                >
                  {chip.label}
                  <X size={12} className="text-fb-gray" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="ml-1 text-xs font-semibold text-fb-blue hover:text-fb-blue-dark"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {hasActiveIntent || displayedProducts.length > 0 ? (
            <>
              {displayedProducts.length === 0 ? (
                loading ? (
                  <ProductGrid products={[]} loading skeletonCount={10} />
                ) : (
                  <div className="rounded-xl border border-dashed border-fb-border bg-white px-6 py-16 text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-fb-bg text-fb-gray">
                      <SearchX size={26} />
                    </span>
                    <h2 className="mt-4 text-lg font-bold">No encontramos publicaciones</h2>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-fb-gray">
                      Prueba con otra búsqueda o ajusta los filtros para ver más resultados.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  </div>
                )
              ) : (
                <ProductGrid products={displayedProducts} loading={loading} skeletonCount={10} />
              )}
            </>
          ) : null}
        </section>
      </main>

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtros"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
            <Button onClick={() => setFiltersOpen(false)}>
              Ver {displayedProducts.length} resultados
            </Button>
          </>
        }
      >
        <div className="p-4">
          <ProductFilters
            products={realProducts}
            filters={filters}
            onChange={updateFilters}
            onClear={clearFilters}
          />
        </div>
      </Modal>

      <footer className="border-t border-fb-line bg-white py-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 text-xs text-fb-gray">
          <p>© {new Date().getFullYear()} Mercadito. Compra y vende en tu comunidad.</p>
          <p>Contacto directo por WhatsApp al +56 9 7144 8109</p>
        </div>
      </footer>
    </div>
  )
}
