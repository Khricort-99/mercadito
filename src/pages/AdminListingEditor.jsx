import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ListingWizard } from '../components/admin/ListingWizard.jsx'
import { useProduct, useProducts } from '../hooks/useProducts.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useToast } from '../context/ToastContext.jsx'

export default function AdminListingEditor() {
  const { id } = useParams()
  const editing = Boolean(id)
  const { product, loading } = useProduct(id)
  const { create, update } = useProducts()
  const navigate = useNavigate()
  const { toast } = useToast()

  usePageTitle(editing ? 'Editar publicación' : 'Nueva publicación')

  const handleSubmit = async (data) => {
    if (editing) {
      await update(id, data)
      toast('Publicación actualizada correctamente.')
    } else {
      await create(data)
      toast('¡Publicación creada! Ya está visible en Mercadito.')
    }
    navigate('/admin')
  }

  if (editing && loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-fb-soft" />
        <div className="h-24 animate-pulse rounded-xl bg-white" />
        <div className="h-96 animate-pulse rounded-xl bg-white" />
      </div>
    )
  }

  if (editing && !product) {
    return (
      <div className="rounded-xl border border-dashed border-fb-border bg-white px-6 py-16 text-center">
        <h1 className="text-xl font-bold">Publicación no encontrada</h1>
        <p className="mt-1 text-sm text-fb-gray">
          Es posible que haya sido eliminada. Vuelve al panel para ver el catálogo actual.
        </p>
        <Link
          to="/admin"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-fb-blue hover:text-fb-blue-dark"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fb-gray transition hover:text-fb-ink"
      >
        <ArrowLeft size={16} />
        Volver al panel
      </Link>
      <ListingWizard
        initialProduct={product}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin')}
      />
    </div>
  )
}
