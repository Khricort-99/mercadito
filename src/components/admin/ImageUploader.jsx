import { useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Link2,
  Loader2,
  Star,
  Trash2,
  UploadCloud
} from 'lucide-react'
import { MAX_IMAGES } from '../../data/catalog.js'
import { prepareImage } from '../../utils/images.js'
import { assetUrl } from '../../utils/assets.js'
import { isCloudinaryConfigured, uploadToCloudinary } from '../../services/cloudinary.js'
import { useToast } from '../../context/ToastContext.jsx'

function IconAction({ label, onClick, children, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid h-7 w-7 place-items-center rounded-md bg-white/95 shadow-sm transition ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-fb-ink hover:bg-fb-bg'
      }`}
    >
      {children}
    </button>
  )
}

export function ImageUploader({ images, onChange, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [dragIndex, setDragIndex] = useState(null)
  const { toast } = useToast()

  const addFiles = async (fileList) => {
    const files = Array.from(fileList ?? [])
    if (!files.length) return
    const room = MAX_IMAGES - images.length
    if (room <= 0) {
      toast(`Puedes subir hasta ${MAX_IMAGES} fotos.`, 'error')
      return
    }
    const selected = files.slice(0, room)
    if (files.length > room) {
      toast(`Solo se agregaron ${room} fotos por el límite de ${MAX_IMAGES}.`, 'info')
    }
    setProcessing(true)
    const prepared = []
    for (const file of selected) {
      let dataUrl
      try {
        dataUrl = await prepareImage(file)
      } catch (currentError) {
        toast(currentError?.message || 'No pudimos procesar una de las imágenes.', 'error')
        continue
      }
      if (!isCloudinaryConfigured()) {
        prepared.push(dataUrl)
        continue
      }
      try {
        prepared.push(await uploadToCloudinary(file))
      } catch {
        prepared.push(dataUrl)
        toast('No pudimos subir una imagen; se guardó localmente.', 'error')
      }
    }
    setProcessing(false)
    if (prepared.length) onChange([...images, ...prepared])
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDragging(false)
    addFiles(event.dataTransfer.files)
  }

  const addUrl = () => {
    const value = urlValue.trim()
    if (!value) return
    if (images.length >= MAX_IMAGES) {
      toast(`Puedes subir hasta ${MAX_IMAGES} fotos.`, 'error')
      return
    }
    try {
      const parsed = new URL(value)
      if (!/^https?:$/.test(parsed.protocol)) throw new Error('protocolo inválido')
    } catch {
      toast('Ingresa una URL de imagen válida (https://...).', 'error')
      return
    }
    onChange([...images, value])
    setUrlValue('')
  }

  const removeAt = (index) => {
    onChange(images.filter((_, imageIndex) => imageIndex !== index))
  }

  const moveAt = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const makeCover = (index) => {
    if (index === 0) return
    const next = [...images]
    const [item] = next.splice(index, 1)
    next.unshift(item)
    onChange(next)
  }

  const handleDragStart = (index) => (event) => {
    setDragIndex(index)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOverImage = (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnImage = (index) => (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      return
    }
    const next = [...images]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    onChange(next)
    setDragIndex(null)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => addFiles(event.target.files)}
      />

      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={`${image.slice(0, 32)}-${index}`}
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOverImage}
              onDrop={handleDropOnImage(index)}
              onDragEnd={() => setDragIndex(null)}
              className={`group relative aspect-square overflow-hidden rounded-xl border bg-fb-bg ${
                dragIndex === index ? 'border-fb-blue opacity-60' : 'border-fb-line'
              }`}
            >
              <img
                src={assetUrl(image)}
                alt={`Foto ${index + 1}`}
                draggable={false}
                className="h-full w-full object-cover"
              />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded bg-fb-blue px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Portada
                </span>
              )}
              <div className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                <IconAction label="Usar como portada" onClick={() => makeCover(index)}>
                  <Star size={13} />
                </IconAction>
                <IconAction label="Mover a la izquierda" onClick={() => moveAt(index, -1)}>
                  <ChevronLeft size={13} />
                </IconAction>
                <IconAction label="Mover a la derecha" onClick={() => moveAt(index, 1)}>
                  <ChevronRight size={13} />
                </IconAction>
                <IconAction label="Eliminar foto" onClick={() => removeAt(index)} danger>
                  <Trash2 size={13} />
                </IconAction>
              </div>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-fb-border bg-fb-bg/60 text-fb-gray transition hover:border-fb-blue hover:bg-fb-blue-soft/50 hover:text-fb-blue"
            >
              <ImagePlus size={22} />
              <span className="text-[11px] font-semibold">Agregar</span>
            </button>
          )}
        </div>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragging ? 'border-fb-blue bg-fb-blue-soft' : 'border-fb-border bg-fb-bg/60'
        }`}
      >
        {processing ? (
          <>
            <Loader2 size={24} className="animate-spin text-fb-blue" />
            <p className="mt-2 text-sm font-medium text-fb-ink">Optimizando imágenes...</p>
          </>
        ) : (
          <>
            <UploadCloud size={26} className="text-fb-gray" />
            <p className="mt-2 text-sm font-medium text-fb-ink">Arrastra tus fotos aquí</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm font-semibold text-fb-blue hover:text-fb-blue-dark"
            >
              o selecciona desde tu equipo
            </button>
            <p className="mt-1 text-[11px] text-fb-gray">
              Hasta {MAX_IMAGES} fotos · JPG, PNG o WEBP · La primera será la portada
            </p>
          </>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fb-gray" />
          <input
            value={urlValue}
            onChange={(event) => setUrlValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addUrl()
              }
            }}
            placeholder="También puedes pegar una URL de imagen"
            className="h-9 w-full rounded-lg border border-fb-border bg-white pl-9 pr-2 text-sm outline-none transition focus:border-fb-blue focus:ring-2 focus:ring-fb-blue/15"
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          disabled={images.length >= MAX_IMAGES}
          className="h-9 shrink-0 rounded-lg bg-fb-soft px-3 text-sm font-semibold text-fb-ink transition hover:bg-[#d8dadf] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agregar
        </button>
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
