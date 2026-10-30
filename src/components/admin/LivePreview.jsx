import { useState } from 'react'
import { Clock3, ImageOff, MapPin } from 'lucide-react'
import { CONDITION_STYLES, getCategory } from '../../data/catalog.js'
import { formatPrice, shortLocation } from '../../utils/format.js'
import { WhatsAppIcon } from '../common/WhatsAppIcon.jsx'

const TABS = [
  { id: 'feed', label: 'Vista en el feed' },
  { id: 'detail', label: 'Vista del producto' }
]

export function LivePreview({ form }) {
  const [tab, setTab] = useState('feed')
  const images = (form.images || []).filter(Boolean)
  const cover = images[0]
  const price = Number(form.price) || 0
  const tags = String(form.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const conditionStyle =
    CONDITION_STYLES[form.condition] ?? CONDITION_STYLES['Usado - Buen estado']
  const category = getCategory(form.category)

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-xl border border-fb-line bg-white p-3 shadow-card sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-fb-ink">Previsualización en vivo</h2>
          <span className="rounded-full bg-wa-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-wa-dark">
            En vivo
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-fb-bg p-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`h-8 rounded-md text-xs font-semibold transition ${
                tab === item.id
                  ? 'bg-white text-fb-ink shadow-card'
                  : 'text-fb-gray hover:text-fb-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {tab === 'feed' ? (
            <div className="rounded-xl bg-fb-bg p-3">
              <div className="mx-auto max-w-[270px] overflow-hidden rounded-xl border border-fb-line bg-white shadow-card">
                <div className="relative aspect-square bg-fb-bg">
                  {cover ? (
                    <img src={cover} alt="Portada de la publicación" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center text-fb-gray">
                      <ImageOff size={38} />
                    </span>
                  )}
                  {form.condition && (
                    <span
                      className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${conditionStyle}`}
                    >
                      {form.condition}
                    </span>
                  )}
                  <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-wa-dark shadow-sm">
                    <WhatsAppIcon size={15} />
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-lg font-bold leading-tight">
                    {price > 0 ? formatPrice(price) : 'Precio'}
                  </p>
                  <h3
                    className={`mt-1 line-clamp-2 min-h-10 text-sm leading-5 ${
                      form.title ? 'text-fb-ink' : 'text-fb-gray/70'
                    }`}
                  >
                    {form.title || 'Tu título aparecerá aquí'}
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-fb-gray">
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MapPin size={11} className="shrink-0" />
                      <span className="truncate">
                        {shortLocation(form.location) || 'Ubicación'}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1">
                      <Clock3 size={10} />
                      Ahora
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-fb-gray">
                Así verán tu publicación en el catálogo.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-fb-line bg-white">
              <div className="relative aspect-[4/3] bg-fb-bg">
                {cover ? (
                  <img src={cover} alt="Foto principal" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full place-items-center text-fb-gray">
                    <ImageOff size={44} />
                  </span>
                )}
                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                  1 / {images.length || 1}
                </span>
              </div>
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {form.condition && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${conditionStyle}`}
                    >
                      {form.condition}
                    </span>
                  )}
                  <span className="rounded-md bg-fb-bg px-2 py-0.5 text-[10px] font-semibold text-fb-gray">
                    {category.label}
                  </span>
                </div>
                <h3 className={`text-lg font-bold leading-tight ${form.title ? '' : 'text-fb-gray/70'}`}>
                  {form.title || 'Título de la publicación'}
                </h3>
                <p className="text-2xl font-bold">{price > 0 ? formatPrice(price) : '$0'}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-fb-gray">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} />
                    {shortLocation(form.location) || 'Ubicación'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={11} />
                    Hace un momento
                  </span>
                </div>
                <div className="grid gap-2 pt-1">
                  <div className="flex h-10 items-center justify-center gap-2 rounded-lg bg-wa text-sm font-semibold text-white">
                    <WhatsAppIcon size={17} />
                    Contactar por WhatsApp
                  </div>
                  <div className="flex h-10 items-center justify-center rounded-lg border border-fb-border bg-white text-sm font-semibold text-fb-ink">
                    Compartir
                  </div>
                </div>
                <div className="border-t border-fb-line pt-3">
                  <p className="text-xs font-bold text-fb-ink">Descripción</p>
                  <p
                    className={`mt-1 line-clamp-6 whitespace-pre-line text-xs leading-5 ${
                      form.description ? 'text-fb-ink/85' : 'text-fb-gray/70'
                    }`}
                  >
                    {form.description || 'Aquí aparecerá la descripción que escribas.'}
                  </p>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 8).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-fb-soft px-2 py-0.5 text-[10px] font-medium text-fb-gray"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
