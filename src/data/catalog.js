import {
  Baby,
  Building2,
  Car,
  Dumbbell,
  Gamepad2,
  Laptop,
  Package,
  Shirt,
  Sofa,
  Wrench
} from 'lucide-react'

export const CATEGORIES = [
  { id: 'tecnologia', label: 'Tecnología', icon: Laptop },
  { id: 'ropa', label: 'Ropa y accesorios', icon: Shirt },
  { id: 'hogar', label: 'Hogar y jardín', icon: Sofa },
  { id: 'vehiculos', label: 'Vehículos', icon: Car },
  { id: 'deportes', label: 'Deportes y fitness', icon: Dumbbell },
  { id: 'entretenimiento', label: 'Entretenimiento', icon: Gamepad2 },
  { id: 'familia', label: 'Familia y bebés', icon: Baby },
  { id: 'herramientas', label: 'Herramientas', icon: Wrench },
  { id: 'propiedades', label: 'Propiedades', icon: Building2 },
  { id: 'otros', label: 'Otros', icon: Package }
]

const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category])
)

export const CONDITIONS = [
  'Nuevo',
  'Usado - Como nuevo',
  'Usado - Buen estado',
  'Usado - Aceptable'
]

export const CONDITION_STYLES = {
  Nuevo: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Usado - Como nuevo': 'bg-fb-blue-soft text-fb-blue-dark ring-blue-200',
  'Usado - Buen estado': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Usado - Aceptable': 'bg-fb-bg text-fb-gray ring-fb-line'
}

export const GENEROS = [
  { id: 'hombre', label: 'Hombre' },
  { id: 'mujer', label: 'Mujer' }
]

export const LOCATIONS = [
  'La Serena, Región de Coquimbo',
  'Coquimbo, Región de Coquimbo'
]

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: de menor a mayor' },
  { value: 'price_desc', label: 'Precio: de mayor a menor' }
]

export const MAX_IMAGES = 8

export const LISTING_TYPES = [
  { id: 'articulo', label: 'Artículo en venta', available: true },
  { id: 'vehiculo', label: 'Vehículo en venta', available: false },
  { id: 'propiedad', label: 'Alquiler de propiedad', available: false },
  { id: 'empleo', label: 'Oferta de empleo', available: false }
]

export function getCategory(id) {
  return CATEGORY_MAP[id] || CATEGORY_MAP.otros
}
