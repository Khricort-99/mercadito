import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

export function ImageGallery({ images, title, sold = false, className = '' }) {
  const [index, setIndex] = useState(0)
  const total = images?.length ?? 0

  useEffect(() => {
    setIndex(0)
  }, [images])

  const safeIndex = total ? Math.min(index, total - 1) : 0
  const current = total ? images[safeIndex] : null

  const go = (direction) => {
    if (total < 2) return
    setIndex((value) => (value + direction + total) % total)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
    }
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-fb-line bg-white ${className}`}>
      <div
        className="relative aspect-[4/3] bg-fb-bg outline-none"
        tabIndex={0}
        role="group"
        aria-label={`Galería de fotos de ${title}`}
        onKeyDown={handleKeyDown}
      >
        {current ? (
          <img
            key={`${current}-${safeIndex}`}
            src={current}
            alt={`${title} - foto ${safeIndex + 1}`}
            className="animate-fade-in h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full place-items-center text-fb-gray">
            <ImageOff size={56} />
          </span>
        )}

        {sold && (
          <span className="absolute left-3 top-3 rounded-md bg-fb-ink/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Vendido
          </span>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-fb-ink shadow-md transition hover:bg-white"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-fb-ink shadow-md transition hover:bg-white"
              aria-label="Foto siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {total > 0 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {safeIndex + 1} / {total}
          </span>
        )}
      </div>

      {total > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
          {images.map((image, imageIndex) => (
            <button
              key={`${image}-${imageIndex}`}
              type="button"
              onClick={() => setIndex(imageIndex)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                imageIndex === safeIndex ? 'ring-fb-blue' : 'ring-transparent hover:ring-fb-border'
              }`}
              aria-label={`Ver foto ${imageIndex + 1}`}
              aria-current={imageIndex === safeIndex}
            >
              <img
                src={image}
                alt={`Miniatura ${imageIndex + 1} de ${title}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
