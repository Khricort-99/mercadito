import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  CheckCircle2,
  Eye,
  ImageOff,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Wallet
} from 'lucide-react'
import { useProducts } from '../hooks/useProducts.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useToast } from '../context/ToastContext.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { Button, buttonClasses } from '../components/common/Button.jsx'
import { getCategory } from '../data/catalog.js'
import { formatDate, formatPrice, normalizeText, relativeTime } from '../utils/format.js'

const iconButton =
  'grid h-8 w-8 place-items-center rounded-md text-fb-gray transition hover:bg-fb-bg hover:text-fb-ink'

const TABS = [
  { id: 'todas', label: 'Todas' },
  { id: 'disponibles', label: 'Disponibles' },
  { id: 'vendidas', label: 'Vendidas' }
]

function AvailabilityBadge({ availability }) {
  const sold = availability === 'vendido'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        sold ? 'bg-fb-bg text-fb-gray' : 'bg-emerald-50 text-emerald-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${sold ? 'bg-fb-gray' : 'bg-emerald-500'}`} />
      {sold ? 'Vendido' : 'Disponible'}
    </span>
  )
}

export default function AdminDashboard() {
  const { products, loading, remove, setAvailability } = useProducts()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('todas')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  usePageTitle('Panel de administración')

  const stats = useMemo(() => {
    const available = products.filter((product) => product.availability === 'disponible')
    const sold = products.filter((product) => product.availability === 'vendido')
    const inventory = available.reduce((sum, product) => sum + Number(product.price || 0), 0)
    return { total: products.length, available: available.length, sold: sold.length, inventory }
  }, [products])

  const filtered = useMemo(() => {
    const term = normalizeText(query)
    return [...products]
      .filter((product) => {
        if (status === 'disponibles') return product.availability === 'disponible'
        if (status === 'vendidas') return product.availability === 'vendido'
        return true
      })
      .filter((product) => {
        if (!term) return true
        const haystack = normalizeText(`${product.title} ${(product.tags || []).join(' ')}`)
        return haystack.includes(term)
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [products, status, query])

  const handleToggle = async (product) => {
    const next = product.availability === 'disponible' ? 'vendido' : 'disponible'
    try {
      await setAvailability(product.id, next)
      toast(next === 'vendido' ? 'Publicación marcada como vendida.' : 'Publicación reactivada.')
    } catch (error) {
      toast(error?.message || 'No pudimos actualizar la publicación.', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await remove(deleteTarget.id)
      toast('Publicación eliminada correctamente.')
      setDeleteTarget(null)
    } catch (error) {
      toast(error?.message || 'No pudimos eliminar la publicación.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const statCards = [
    {
      label: 'Publicaciones',
      value: stats.total,
      hint: 'En el catálogo',
      icon: Package,
      tone: 'bg-fb-blue-soft text-fb-blue'
    },
    {
      label: 'Disponibles',
      value: stats.available,
      hint: 'Visibles para clientes',
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: 'Vendidas',
      value: stats.sold,
      hint: 'Marcadas como vendidas',
      icon: BadgeCheck,
      tone: 'bg-amber-50 text-amber-600'
    },
    {
      label: 'Valor disponible',
      value: formatPrice(stats.inventory),
      hint: 'Suma de precios activos',
      icon: Wallet,
      tone: 'bg-purple-50 text-purple-600'
    }
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tus publicaciones</h1>
          <p className="mt-0.5 text-sm text-fb-gray">
            Administra el catálogo que ven tus clientes en Mercadito.
          </p>
        </div>
        <Link
          to="/admin/publicar"
          className={buttonClasses({ variant: 'primary', size: 'lg', className: 'shadow-sm' })}
        >
          <Plus size={18} />
          Nueva publicación
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-xl border border-fb-line bg-white p-4 shadow-card"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-fb-gray">
                  {card.label}
                </p>
                <span className={`grid h-8 w-8 place-items-center rounded-full ${card.tone}`}>
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-2 truncate text-xl font-bold sm:text-2xl">{card.value}</p>
              <p className="mt-0.5 text-[11px] text-fb-gray">{card.hint}</p>
            </div>
          )
        })}
      </div>

      <div className="mb-4 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg border border-fb-line bg-white p-1">
          {TABS.map((tab) => {
            const count =
              tab.id === 'todas'
                ? products.length
                : tab.id === 'disponibles'
                  ? stats.available
                  : stats.sold
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatus(tab.id)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition ${
                  status === tab.id
                    ? 'bg-fb-blue-soft text-fb-blue-dark'
                    : 'text-fb-gray hover:bg-fb-bg hover:text-fb-ink'
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    status === tab.id ? 'bg-white text-fb-blue-dark' : 'bg-fb-bg text-fb-gray'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative sm:w-72">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fb-gray"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar en tus publicaciones"
            aria-label="Buscar en tus publicaciones"
            className="h-10 w-full rounded-lg border border-fb-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-fb-blue focus:ring-2 focus:ring-fb-blue/15"
          />
        </div>
      </div>

      {loading && products.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-fb-border bg-white px-6 py-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-fb-bg text-fb-gray">
            <Package size={26} />
          </span>
          <h2 className="mt-4 text-lg font-bold">
            {products.length === 0 ? 'Aún no hay publicaciones' : 'Sin resultados'}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-fb-gray">
            {products.length === 0
              ? 'Crea tu primera publicación para que aparezca en el catálogo público.'
              : 'Prueba con otra búsqueda o cambia el filtro de estado.'}
          </p>
          {products.length === 0 ? (
            <Link to="/admin/publicar">
              <Button className="mt-4">
                <Plus size={16} />
                Crear publicación
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setQuery('')
                setStatus('todas')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-fb-line bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-fb-line bg-fb-bg/70 text-[11px] uppercase tracking-wide text-fb-gray">
                <tr>
                  <th className="px-4 py-3 font-semibold">Publicación</th>
                  <th className="px-3 py-3 font-semibold">Precio</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-3 py-3 font-semibold">Publicada</th>
                  <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fb-line">
                {filtered.map((product) => (
                  <tr key={product.id} className="transition hover:bg-fb-bg/40">
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-fb-bg">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="grid h-full place-items-center text-fb-gray">
                              <ImageOff size={18} />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-semibold text-fb-ink">
                            {product.title}
                          </p>
                          <p className="text-xs text-fb-gray">
                            {getCategory(product.category).label} · {product.condition}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-3 py-3">
                      <AvailabilityBadge availability={product.availability} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-fb-gray">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/producto/${product.id}`}
                          className={iconButton}
                          title="Ver publicación"
                          aria-label={`Ver ${product.title}`}
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/admin/editar/${product.id}`}
                          className={iconButton}
                          title="Editar publicación"
                          aria-label={`Editar ${product.title}`}
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggle(product)}
                          className={iconButton}
                          title={
                            product.availability === 'disponible'
                              ? 'Marcar como vendido'
                              : 'Reactivar publicación'
                          }
                          aria-label={
                            product.availability === 'disponible'
                              ? `Marcar ${product.title} como vendido`
                              : `Reactivar ${product.title}`
                          }
                        >
                          {product.availability === 'disponible' ? (
                            <BadgeCheck size={16} />
                          ) : (
                            <RotateCcw size={16} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className={`${iconButton} hover:bg-red-50 hover:text-red-600`}
                          title="Eliminar publicación"
                          aria-label={`Eliminar ${product.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-fb-line bg-white p-3 shadow-card"
              >
                <div className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-fb-bg">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-fb-gray">
                        <ImageOff size={20} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">{product.title}</p>
                    <p className="text-sm font-bold">{formatPrice(product.price)}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <AvailabilityBadge availability={product.availability} />
                      <span className="text-[11px] text-fb-gray">
                        {relativeTime(product.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-fb-line pt-2">
                  <Link
                    to={`/producto/${product.id}`}
                    className={iconButton}
                    aria-label={`Ver ${product.title}`}
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    to={`/admin/editar/${product.id}`}
                    className={iconButton}
                    aria-label={`Editar ${product.title}`}
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggle(product)}
                    className={iconButton}
                    aria-label={
                      product.availability === 'disponible'
                        ? `Marcar ${product.title} como vendido`
                        : `Reactivar ${product.title}`
                    }
                  >
                    {product.availability === 'disponible' ? (
                      <BadgeCheck size={16} />
                    ) : (
                      <RotateCcw size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(product)}
                    className={`${iconButton} hover:bg-red-50 hover:text-red-600`}
                    aria-label={`Eliminar ${product.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        title="Eliminar publicación"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </>
        }
      >
        <div className="p-5 text-sm text-fb-gray">
          ¿Seguro que quieres eliminar{' '}
          <strong className="text-fb-ink">{deleteTarget?.title}</strong>? Esta acción no se
          puede deshacer y el producto dejará de estar visible para los clientes.
        </div>
      </Modal>
    </div>
  )
}
