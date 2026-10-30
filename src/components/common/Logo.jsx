import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

export function Logo({ to = '/', size = 'md', showText = true }) {
  const large = size === 'lg'
  return (
    <Link to={to} className="flex shrink-0 items-center gap-2" aria-label="Mercadito, ir al inicio">
      <span
        className={`grid place-items-center rounded-full bg-fb-blue text-white shadow-sm ${
          large ? 'h-12 w-12' : 'h-10 w-10'
        }`}
      >
        <ShoppingBag size={large ? 26 : 22} strokeWidth={2.2} />
      </span>
      {showText && (
        <span
          className={`font-bold tracking-tight text-fb-blue ${
            large ? 'text-3xl' : 'hidden text-2xl sm:block'
          }`}
        >
          Mercadito
        </span>
      )}
    </Link>
  )
}
