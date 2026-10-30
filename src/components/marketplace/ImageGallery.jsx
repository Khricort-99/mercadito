import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react'
import { assetUrl } from '../../utils/assets.js'

export function ImageGallery({ images, title, sold = false, className = '' }) {
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const closeButtonRef = useRef(null)
  const gestureRef = useRef({ x: 0, y: 0, active: false, moved: false })
  const total = images?.length ?? 0

  useEffect(() => {
    setIndex(0)
  }, [images])

  useEffect(() => {
    if (!lightboxOpen || typeof document === 'undefined') return undefined
    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setLightboxOpen(false)
      }
      if (event.key === 'ArrowLeft' && total > 1) {
        event.preventDefault()
        setIndex((value) => (value - 1 + total) % total)
      }
      if (event.key === 'ArrowRight' && total > 1) {
        event.preventDefault()
        setIndex((value) => (value + 1) % total)
      }
    }

    document.addEventListener('keydown', handleKey)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [lightboxOpen, total])

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

  const handlePointerDown = (event) => {
    if (event.target instanceof Element && event.target.closest('button')) return
    gestureRef.current = {
      x: event.clientX,
      y: event.clientY,
      active: true,
      moved: false
    }
  }

  const handlePointerMove = (event) => {
    if (!gestureRef.current.active) return
    if (Math.abs(event.clientX - gestureRef.current.x) > 10) {
      gestureRef.current.moved = true
    }
  }

  const handlePointerUp = (event) => {
    if (!gestureRef.current.active) return
    const { x, y } = gestureRef.current
    gestureRef.current.active = false
    const deltaX = event.clientX - x
    const deltaY = event.clientY - y
    if (total > 1 && Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      go(deltaX < 0 ? 1 : -1)
    }
  }

  const handlePointerCancel = () => {
    gestureRef.current.active = false
  }

  const handleLightboxClick = (event) => {
    if (gestureRef.current.moved) return
    if (event.target === event.currentTarget) setLightboxOpen(false)
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
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block h-full w-full cursor-zoom-in"
            aria-label={`Abrir foto ${safeIndex + 1} de ${total} en tamaño completo`}
          >
            <img
              key={`${current}-${safeIndex}`}
              src={assetUrl(current)}
              alt={`${title} - foto ${safeIndex + 1}`}
              className="animate-fade-in h-full w-full object-cover"
            />
          </button>
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
                src={assetUrl(image)}
                alt={`Miniatura ${imageIndex + 1} de ${title}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && current
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Galería de fotos de ${title}`}
              className="fixed inset-0 z-50 flex touch-none select-none items-center justify-center bg-black/95 p-4 sm:p-8"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onClick={handleLightboxClick}
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-6 sm:top-6"
                aria-label="Cerrar imagen"
              >
                <X size={22} />
              </button>

              <img
                src={assetUrl(current)}
                alt={`${title} - foto ${safeIndex + 1} de ${total}`}
                className="animate-fade-in max-h-full max-w-full object-contain"
                draggable={false}
              />

              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:left-6"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-6"
                    aria-label="Foto siguiente"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}

              <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white">
                {safeIndex + 1} / {total}
              </span>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
