import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Car,
  ChevronRight,
  Loader2,
  Tag,
  X
} from 'lucide-react'
import {
  CATEGORIES,
  CONDITIONS,
  GENEROS,
  LISTING_TYPES,
  LOCATIONS,
  MAX_IMAGES
} from '../../data/catalog.js'
import { formatNumberInput, formatPrice, parseDigits } from '../../utils/format.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Button } from '../common/Button.jsx'
import { Field, Select, TextArea, TextInput } from '../common/FormControls.jsx'
import { ImageUploader } from './ImageUploader.jsx'
import { LivePreview } from './LivePreview.jsx'

const TYPE_ICONS = {
  articulo: Tag,
  vehiculo: Car,
  propiedad: Building2,
  empleo: Briefcase
}

const DEFAULT_FORM = {
  title: '',
  price: '',
  category: 'tecnologia',
  genero: '',
  condition: CONDITIONS[1],
  description: '',
  location: LOCATIONS[0],
  tags: '',
  availability: 'disponible',
  images: []
}

function toForm(product) {
  return {
    title: product.title ?? '',
    price: product.price ? String(product.price) : '',
    category: product.category ?? 'tecnologia',
    genero: product.genero ?? '',
    condition: product.condition ?? CONDITIONS[1],
    description: product.description ?? '',
    location: product.location ?? LOCATIONS[0],
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
    availability: product.availability ?? 'disponible',
    images: Array.isArray(product.images) ? [...product.images] : []
  }
}

export function ListingWizard({ initialProduct, onSubmit, onCancel }) {
  const editing = Boolean(initialProduct)
  const [step, setStep] = useState(editing ? 'details' : 'type')
  const [form, setForm] = useState(() => (initialProduct ? toForm(initialProduct) : DEFAULT_FORM))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const parsedTags = useMemo(
    () =>
      form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 10),
    [form.tags]
  )

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const validate = () => {
    const next = {}
    if (!form.images.length) next.images = 'Agrega al menos una foto del producto.'
    if (form.category === 'ropa' && !form.genero) next.genero = 'Selecciona hombre o mujer.'
    const title = form.title.trim()
    if (title.length < 4) next.title = 'Escribe un título de al menos 4 caracteres.'
    else if (title.length > 100) next.title = 'El título no puede superar los 100 caracteres.'
    const price = Number(form.price)
    if (!form.price || !Number.isFinite(price) || price <= 0) {
      next.price = 'Ingresa un precio válido mayor a 0.'
    }
    const description = form.description.trim()
    if (description.length < 15) {
      next.description = 'Agrega una descripción de al menos 15 caracteres.'
    } else if (form.description.length > 1500) {
      next.description = 'La descripción no puede superar los 1500 caracteres.'
    }
    if (!form.location) next.location = 'Selecciona una ubicación.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving) return
    if (!validate()) {
      toast('Revisa los campos marcados antes de publicar.', 'error')
      return
    }
    setSaving(true)
    try {
      await onSubmit({
        title: form.title.trim(),
        price: Number(form.price),
        category: form.category,
        genero: form.category === 'ropa' ? form.genero : '',
        condition: form.condition,
        description: form.description.trim(),
        location: form.location,
        tags: parsedTags,
        images: form.images,
        availability: form.availability
      })
    } catch (error) {
      toast(error?.message || 'No pudimos guardar la publicación.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-fb-line bg-white shadow-card">
      <header className="flex items-center gap-3 border-b border-fb-line px-4 py-3 sm:px-6">
        {step === 'details' && !editing ? (
          <button
            type="button"
            onClick={() => setStep('type')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-fb-gray transition hover:bg-fb-bg hover:text-fb-ink"
            aria-label="Volver al tipo de publicación"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fb-blue-soft text-fb-blue">
            <Tag size={20} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold leading-tight">
            {editing ? 'Editar publicación' : 'Crear publicación'}
          </h1>
          <p className="text-xs text-fb-gray">
            {step === 'type' ? 'Selecciona el tipo de publicación' : 'Artículo en venta'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-fb-gray transition hover:bg-fb-bg hover:text-fb-ink"
          aria-label="Cerrar"
        >
          <X size={19} />
        </button>
      </header>

      {step === 'type' ? (
        <div className="p-5 sm:p-8">
          <div className="mx-auto max-w-xl space-y-3">
            <p className="text-sm text-fb-gray">
              Elige el tipo de publicación que quieres crear en Mercadito.
            </p>
            {LISTING_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type.id] || Tag
              return (
                <button
                  key={type.id}
                  type="button"
                  disabled={!type.available}
                  onClick={() => setStep('details')}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                    type.available
                      ? 'border-fb-border hover:border-fb-blue hover:bg-fb-blue-soft/40'
                      : 'cursor-not-allowed border-fb-line opacity-60'
                  }`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fb-soft text-fb-ink">
                    <Icon size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-fb-ink">{type.label}</span>
                    <span className="block text-xs text-fb-gray">
                      {type.available
                        ? 'Publica un producto para venderlo en tu comunidad'
                        : 'Disponible próximamente'}
                    </span>
                  </span>
                  {type.available ? (
                    <ChevronRight size={20} className="shrink-0 text-fb-gray" />
                  ) : (
                    <span className="shrink-0 rounded-full bg-fb-bg px-2 py-1 text-[10px] font-bold uppercase text-fb-gray">
                      Pronto
                    </span>
                  )}
                </button>
              )
            })}
            <p className="pt-2 text-center text-xs text-fb-gray">
              Los clientes podrán contactarte directamente por WhatsApp.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
            <div className="min-w-0 space-y-6">
              <section>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-[15px] font-bold">
                    Fotos{' '}
                    <span className="font-normal text-fb-gray">
                      ({form.images.length}/{MAX_IMAGES})
                    </span>
                  </h2>
                  <span className="text-xs text-fb-gray">La primera será la portada</span>
                </div>
                <ImageUploader
                  images={form.images}
                  onChange={(images) => setField('images', images)}
                  error={errors.images}
                />
              </section>

              <section className="space-y-4 border-t border-fb-line pt-5">
                <h2 className="text-[15px] font-bold">Detalles del artículo</h2>

                <Field
                  label="Título"
                  htmlFor="listing-title"
                  required
                  error={errors.title}
                  hint={`${form.title.length}/100 caracteres`}
                >
                  <TextInput
                    id="listing-title"
                    value={form.title}
                    onChange={(event) => setField('title', event.target.value)}
                    maxLength={100}
                    placeholder="Ej: iPhone 13 128 GB en excelente estado"
                    error={Boolean(errors.title)}
                  />
                </Field>

                <Field
                  label="Precio"
                  htmlFor="listing-price"
                  required
                  error={errors.price}
                  hint={form.price ? formatPrice(form.price) : 'En pesos chilenos (CLP)'}
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fb-gray">
                      $
                    </span>
                    <TextInput
                      id="listing-price"
                      inputMode="numeric"
                      value={formatNumberInput(form.price)}
                      onChange={(event) =>
                        setField('price', parseDigits(event.target.value).slice(0, 9))
                      }
                      placeholder="0"
                      className="pl-7"
                      error={Boolean(errors.price)}
                    />
                  </div>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Categoría" htmlFor="listing-category" required>
                    <Select
                      id="listing-category"
                      value={form.category}
                      onChange={(event) => setField('category', event.target.value)}
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Estado" htmlFor="listing-condition" required>
                    <Select
                      id="listing-condition"
                      value={form.condition}
                      onChange={(event) => setField('condition', event.target.value)}
                    >
                      {CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                {form.category === 'ropa' && (
                  <Field label="Género" htmlFor="listing-genero" required error={errors.genero}>
                    <Select
                      id="listing-genero"
                      value={form.genero}
                      onChange={(event) => setField('genero', event.target.value)}
                      error={Boolean(errors.genero)}
                    >
                      <option value="">Selecciona hombre o mujer</option>
                      {GENEROS.map((genero) => (
                        <option key={genero.id} value={genero.id}>
                          {genero.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Ubicación"
                    htmlFor="listing-location"
                    required
                    error={errors.location}
                  >
                    <Select
                      id="listing-location"
                      value={form.location}
                      onChange={(event) => setField('location', event.target.value)}
                      error={Boolean(errors.location)}
                    >
                      {LOCATIONS.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Disponibilidad" required>
                    <div className="grid h-11 grid-cols-2 gap-1 rounded-lg bg-fb-bg p-1">
                      {[
                        ['disponible', 'Disponible'],
                        ['vendido', 'Vendido']
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setField('availability', value)}
                          className={`rounded-md text-sm font-semibold transition ${
                            form.availability === value
                              ? 'bg-white text-fb-ink shadow-card'
                              : 'text-fb-gray hover:text-fb-ink'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <Field
                  label="Etiquetas de producto"
                  htmlFor="listing-tags"
                  hint="Sepáralas con comas para mejorar la búsqueda"
                >
                  <TextInput
                    id="listing-tags"
                    value={form.tags}
                    onChange={(event) => setField('tags', event.target.value)}
                    placeholder="iPhone, Apple, 128 GB"
                  />
                </Field>

                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-fb-soft px-2.5 py-1 text-xs font-medium text-fb-gray"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              <section className="border-t border-fb-line pt-5">
                <Field
                  label="Descripción"
                  htmlFor="listing-description"
                  required
                  error={errors.description}
                  hint={`${form.description.length}/1500 · Puedes usar emojis y saltos de línea`}
                >
                  <TextArea
                    id="listing-description"
                    rows={7}
                    value={form.description}
                    onChange={(event) => setField('description', event.target.value)}
                    maxLength={1500}
                    placeholder="Describe el estado, lo que incluye y las condiciones de entrega..."
                    error={Boolean(errors.description)}
                  />
                </Field>
              </section>
            </div>

            <div className="min-w-0">
              <LivePreview form={form} />
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-fb-line bg-fb-bg/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <Button variant="ghost" onClick={onCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={saving} className="sm:min-w-44">
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : editing ? (
                'Guardar cambios'
              ) : (
                'Publicar'
              )}
            </Button>
          </footer>
        </form>
      )}
    </div>
  )
}
