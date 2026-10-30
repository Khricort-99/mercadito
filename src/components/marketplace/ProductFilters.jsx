import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { CATEGORIES, CONDITIONS, GENEROS, getCategory } from '../../data/catalog.js'
import { formatNumberInput, formatPrice, parseDigits } from '../../utils/format.js'

const PRICE_RANGES = [
  { label: 'Menos de $50.000', min: '', max: '50000' },
  { label: '$50.000 a $200.000', min: '50000', max: '200000' },
  { label: 'Más de $200.000', min: '200000', max: '' }
]

export function ProductFilters({ products, filters, onChange, onClear, className = '' }) {
  const [minInput, setMinInput] = useState(filters.min)
  const [maxInput, setMaxInput] = useState(filters.max)

  useEffect(() => {
    setMinInput(filters.min)
    setMaxInput(filters.max)
  }, [filters.min, filters.max])

  const counts = useMemo(() => {
    const map = {}
    products.forEach((product) => {
      if (!filters.vendidos && product.availability !== 'disponible') return
      map[product.category] = (map[product.category] || 0) + 1
    })
    return map
  }, [products, filters.vendidos])

  const total = useMemo(
    () => Object.values(counts).reduce((sum, count) => sum + count, 0),
    [counts]
  )

  const hasFilters =
    filters.categoria !== 'todas' ||
    Boolean(filters.categoria === 'ropa' && filters.genero) ||
    Boolean(filters.min || filters.max) ||
    filters.estado.length > 0 ||
    filters.vendidos

  const applyRange = () => {
    const min = parseDigits(minInput)
    const max = parseDigits(maxInput)
    if (min && max && Number(min) > Number(max)) {
      setMinInput(max)
      setMaxInput(min)
      onChange({ min: max, max: min })
      return
    }
    onChange({ min, max })
  }

  const handleRangeKey = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      applyRange()
    }
  }

  const toggleCondition = (condition) => {
    const exists = filters.estado.includes(condition)
    const next = exists
      ? filters.estado.filter((item) => item !== condition)
      : [...filters.estado, condition]
    onChange({ estado: next })
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-fb-ink">
          <SlidersHorizontal size={16} className="text-fb-gray" />
          Filtros
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs font-semibold text-fb-blue hover:text-fb-blue-dark"
          >
            <RotateCcw size={12} />
            Limpiar
          </button>
        )}
      </div>

      <div className="mt-4 space-y-5">
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-fb-gray">
            Categorías
          </h3>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onChange({ categoria: 'todas' })}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                filters.categoria === 'todas'
                  ? 'bg-fb-blue-soft font-semibold text-fb-blue-dark'
                  : 'font-medium text-fb-ink hover:bg-fb-bg'
              }`}
            >
              <LayoutGrid size={16} className="shrink-0" />
              <span className="flex-1">Todas las categorías</span>
              <span className="text-xs text-fb-gray">{total}</span>
            </button>
            {CATEGORIES.map((category) => {
              const Icon = category.icon
              const active = filters.categoria === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onChange({ categoria: category.id })}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                    active
                      ? 'bg-fb-blue-soft font-semibold text-fb-blue-dark'
                      : 'font-medium text-fb-ink hover:bg-fb-bg'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="flex-1">{category.label}</span>
                  <span className="text-xs text-fb-gray">{counts[category.id] || 0}</span>
                </button>
              )
            })}
          </div>
        </section>

        {filters.categoria === 'ropa' && (
          <section className="border-t border-fb-line pt-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-fb-gray">
              Género
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {GENEROS.map((genero) => {
                const active = filters.genero === genero.id
                return (
                  <button
                    key={genero.id}
                    type="button"
                    onClick={() => onChange({ genero: active ? '' : genero.id })}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                      active
                        ? 'border-fb-blue bg-fb-blue-soft text-fb-blue-dark'
                        : 'border-fb-border text-fb-gray hover:border-fb-blue hover:text-fb-blue-dark'
                    }`}
                  >
                    {genero.label}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <section className="border-t border-fb-line pt-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-fb-gray">Precio</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-fb-gray">$</span>
              <input
                value={formatNumberInput(minInput)}
                onChange={(event) => setMinInput(parseDigits(event.target.value))}
                onBlur={applyRange}
                onKeyDown={handleRangeKey}
                inputMode="numeric"
                placeholder="Mínimo"
                aria-label="Precio mínimo"
                className="h-9 w-full rounded-lg border border-fb-border bg-white pl-6 pr-2 text-sm outline-none transition focus:border-fb-blue focus:ring-2 focus:ring-fb-blue/15"
              />
            </div>
            <span className="text-fb-gray">–</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-fb-gray">$</span>
              <input
                value={formatNumberInput(maxInput)}
                onChange={(event) => setMaxInput(parseDigits(event.target.value))}
                onBlur={applyRange}
                onKeyDown={handleRangeKey}
                inputMode="numeric"
                placeholder="Máximo"
                aria-label="Precio máximo"
                className="h-9 w-full rounded-lg border border-fb-border bg-white pl-6 pr-2 text-sm outline-none transition focus:border-fb-blue focus:ring-2 focus:ring-fb-blue/15"
              />
            </div>
          </div>
          {(minInput || maxInput) && (
            <p className="mt-1.5 text-[11px] text-fb-gray">
              {formatPrice(minInput || 0)}
              {maxInput ? ` – ${formatPrice(maxInput)}` : ' o más'}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRICE_RANGES.map((range) => {
              const active = filters.min === range.min && filters.max === range.max
              return (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => onChange({ min: range.min, max: range.max })}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    active
                      ? 'border-fb-blue bg-fb-blue-soft text-fb-blue-dark'
                      : 'border-fb-border text-fb-gray hover:border-fb-blue hover:text-fb-blue-dark'
                  }`}
                >
                  {range.label}
                </button>
              )
            })}
          </div>
        </section>

        <section className="border-t border-fb-line pt-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-fb-gray">Estado</h3>
          <div className="space-y-1.5">
            {CONDITIONS.map((condition) => {
              const checked = filters.estado.includes(condition)
              return (
                <label
                  key={condition}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-fb-ink transition hover:bg-fb-bg"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCondition(condition)}
                    className="h-4 w-4 rounded border-fb-border accent-fb-blue"
                  />
                  {condition}
                </label>
              )
            })}
          </div>
        </section>

        <section className="border-t border-fb-line pt-4">
          <button
            type="button"
            role="switch"
            aria-checked={filters.vendidos}
            onClick={() => onChange({ vendidos: !filters.vendidos })}
            className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-sm font-medium text-fb-ink"
          >
            Mostrar productos vendidos
            <span
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
                filters.vendidos ? 'bg-fb-blue' : 'bg-fb-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                  filters.vendidos ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>
        </section>

        {filters.categoria !== 'todas' && (
          <p className="rounded-lg bg-fb-blue-soft/60 px-2.5 py-2 text-xs text-fb-blue-dark">
            Mostrando {getCategory(filters.categoria).label}
          </p>
        )}
      </div>
    </div>
  )
}
