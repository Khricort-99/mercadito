import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, MapPin, Share2, Tag } from 'lucide-react'
import { Navbar } from '../components/common/Navbar.jsx'
import { Button } from '../components/common/Button.jsx'
import { WhatsAppIcon } from '../components/common/WhatsAppIcon.jsx'
import { ImageGallery } from '../components/marketplace/ImageGallery.jsx'
import { ProductGrid } from '../components/marketplace/ProductGrid.jsx'
import { useProduct, useProducts } from '../hooks/useProducts.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useWhatsApp } from '../hooks/useWhatsApp.js'
import { useToast } from '../context/ToastContext.jsx'
import { CONDITION_STYLES, getCategory } from '../data/catalog.js'
import { copyText } from '../utils/clipboard.js'
import { formatDate, formatPrice, relativeTime } from '../utils/format.js'
import { productUrl } from '../utils/url.js'

export default function ProductDetail() {
  const { id } = useParams()
  const { product, loading } = useProduct(id)
  const { products } = useProducts()
  const { openChat } = useWhatsApp()
  const { toast } = useToast()

  usePageTitle(product?.title || 'Publicación')

  const related = useMemo(() => {
    if (!product) return []
    const sameCategory = products.filter(
      (item) =>
        item.id !== product.id &&
        item.availability === 'disponible' &&
        item.category === product.category
    )
    const others = products.filter(
      (item) =>
        item.id !== product.id &&
        item.availability === 'disponible' &&
        item.category !== product.category
    )
    return [...sameCategory, ...others].slice(0, 5)
  }, [products, product])

  const handleShare = async () => {
    if (!product) return
    const url = productUrl(product.id)
    const copied = await copyText(url)
    toast(
      copied ? 'Enlace del producto copiado al portapapeles.' : 'No pudimos copiar el enlace.',
      copied ? 'success' : 'error'
    )
  }

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-fb-bg">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="h-4 w-32 animate-pulse rounded bg-fb-soft" />
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
            <div className="aspect-[4/3] animate-pulse rounded-xl bg-fb-soft" />
            <div className="space-y-3 rounded-xl border border-fb-line bg-white p-5">
              <div className="h-6 w-2/3 animate-pulse rounded bg-fb-soft" />
              <div className="h-10 w-40 animate-pulse rounded bg-fb-soft" />
              <div className="h-4 w-full animate-pulse rounded bg-fb-soft" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-fb-soft" />
              <div className="h-12 w-full animate-pulse rounded bg-fb-soft" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-fb-bg">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 py-20 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-fb-gray shadow-card">
            <Tag size={28} />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Publicación no encontrada</h1>
          <p className="mt-1 text-sm text-fb-gray">
            Es posible que el producto haya sido eliminado o que el enlace no sea válido.
          </p>
          <Link to="/">
            <Button className="mt-5">Volver a Mercadito</Button>
          </Link>
        </main>
      </div>
    )
  }

  const sold = product.availability === 'vendido'
  const category = getCategory(product.category)
  const conditionStyle =
    CONDITION_STYLES[product.condition] ?? CONDITION_STYLES['Usado - Buen estado']

  return (
    <div className="min-h-screen bg-fb-bg">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 lg:pb-10">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fb-gray transition hover:text-fb-ink"
        >
          <ArrowLeft size={16} />
          Volver a Mercadito
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
          <div className="min-w-0">
            <ImageGallery
              images={product.images || []}
              title={product.title}
              sold={sold}
            />
          </div>

          <div className="min-w-0">
            <div className="rounded-xl border border-fb-line bg-white p-5 shadow-card lg:sticky lg:top-20">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${conditionStyle}`}>
                  {product.condition}
                </span>
                <span className="rounded-md bg-fb-bg px-2 py-0.5 text-[11px] font-semibold text-fb-gray">
                  {category.label}
                </span>
                {sold && (
                  <span className="rounded-md bg-fb-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                    Vendido
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold leading-snug">{product.title}</h1>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {formatPrice(product.price)}
              </p>

              <div className="mt-4 space-y-2 border-y border-fb-line py-3 text-sm text-fb-gray">
                <p className="flex items-start gap-2">
                  <MapPin size={15} className="mt-0.5 shrink-0" />
                  {product.location}
                </p>
                <p className="flex items-start gap-2">
                  <CalendarDays size={15} className="mt-0.5 shrink-0" />
                  Publicado el {formatDate(product.createdAt)} · {relativeTime(product.createdAt)}
                </p>
                <p className="flex items-start gap-2">
                  <Tag size={15} className="mt-0.5 shrink-0" />
                  {category.label} · {product.condition}
                </p>
              </div>

              {sold && (
                <p className="mt-3 rounded-lg bg-fb-bg px-3 py-2 text-xs text-fb-gray">
                  Este producto ya fue vendido. Escríbenos para consultar por productos similares.
                </p>
              )}

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-fb-line bg-fb-bg/50 p-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fb-blue text-lg font-bold text-white">
                  M
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Mercadito Oficial</p>
                  <p className="text-xs text-fb-gray">Vendedor verificado · Responde rápido</p>
                </div>
                <span className="rounded-full bg-wa-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-wa-dark">
                  En línea
                </span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                <Button
                  variant="whatsapp"
                  size="lg"
                  onClick={() => openChat(product)}
                  className="w-full shadow-sm"
                >
                  <WhatsAppIcon size={20} />
                  Contactar por WhatsApp
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare} aria-label="Compartir enlace">
                  <Share2 size={18} />
                  <span className="sm:hidden">Compartir enlace</span>
                </Button>
              </div>
              <p className="mt-2 text-center text-[11px] text-fb-gray sm:text-left">
                Te responderemos directo al WhatsApp +56 9 7144 8109.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-xl border border-fb-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold">Descripción</h2>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-fb-ink/90">
            {product.description}
          </p>

          {(product.tags || []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-fb-line pt-4">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-fb-bg px-2.5 py-1 text-xs font-medium text-fb-gray"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-lg font-bold">Publicaciones similares</h2>
              <Link
                to={`/?categoria=${product.category}`}
                className="text-sm font-semibold text-fb-blue hover:text-fb-blue-dark"
              >
                Ver más
              </Link>
            </div>
            <ProductGrid products={related} />
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-fb-line bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <Button
            variant="whatsapp"
            size="lg"
            onClick={() => openChat(product)}
            className="flex-1"
          >
            <WhatsAppIcon size={19} />
            Contactar por WhatsApp
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            aria-label="Compartir enlace"
            className="h-12 w-12"
          >
            <Share2 size={19} />
          </Button>
        </div>
      </div>
    </div>
  )
}
