import { Link } from 'react-router-dom'
import { Clock3, ImageOff, MapPin } from 'lucide-react'
import { CONDITION_STYLES } from '../../data/catalog.js'
import { formatPrice, relativeTime, shortLocation } from '../../utils/format.js'
import { assetUrl } from '../../utils/assets.js'
import { useWhatsApp } from '../../hooks/useWhatsApp.js'
import { WhatsAppIcon } from '../common/WhatsAppIcon.jsx'

export function ProductCard({ product }) {
  const { openChat } = useWhatsApp()
  const sold = product.availability === 'vendido'
  const cover = assetUrl(product.images?.[0])
  const detailUrl = `/producto/${product.id}`
  const conditionStyle = CONDITION_STYLES[product.condition] ?? CONDITION_STYLES['Usado - Buen estado']

  return (
    <article className="group relative overflow-hidden rounded-xl border border-fb-line bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-pop">
      <Link to={detailUrl} className="block">
        <div className="relative aspect-square overflow-hidden bg-fb-bg">
          {cover ? (
            <img
              src={cover}
              alt={product.title}
              loading="lazy"
              className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
                sold ? 'opacity-70' : ''
              }`}
            />
          ) : (
            <span className="grid h-full place-items-center text-fb-gray">
              <ImageOff size={40} />
            </span>
          )}
          <span
            className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${conditionStyle}`}
          >
            {product.condition}
          </span>
          {sold && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="rounded-md bg-fb-ink/85 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Vendido
              </span>
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="text-lg font-bold leading-tight">{formatPrice(product.price)}</p>
          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-fb-ink">
            {product.title}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-fb-gray">
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{shortLocation(product.location)}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1">
              <Clock3 size={11} />
              {relativeTime(product.createdAt)}
            </span>
          </div>
        </div>
      </Link>

      {!sold && (
        <button
          type="button"
          onClick={() => openChat(product)}
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-wa-dark shadow-md ring-1 ring-black/5 transition hover:bg-wa hover:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          aria-label={`Contactar por WhatsApp sobre ${product.title}`}
          title="Contactar por WhatsApp"
        >
          <WhatsAppIcon size={17} />
        </button>
      )}
    </article>
  )
}
