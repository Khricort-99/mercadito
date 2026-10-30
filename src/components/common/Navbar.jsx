import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronDown,
  LogOut,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Store,
  X
} from 'lucide-react'
import { LOCATIONS } from '../../data/catalog.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'
import { Logo } from './Logo.jsx'
import { buttonClasses } from './Button.jsx'

function MenuLink({ to, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-fb-ink transition hover:bg-fb-bg"
    >
      <Icon size={16} className="text-fb-gray" />
      {children}
    </Link>
  )
}

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const currentQuery = searchParams.get('q') ?? ''
  const selectedLocation = searchParams.get('ubicacion') ?? ''

  const [term, setTerm] = useState(currentQuery)
  const [focused, setFocused] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const debouncedTerm = useDebounce(term, 320)
  const menuRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    if (!focused) setTerm(currentQuery)
  }, [currentQuery, focused])

  useEffect(() => {
    if (!isHome) return
    const trimmed = debouncedTerm.trim()
    if (trimmed === currentQuery.trim()) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (trimmed) next.set('q', trimmed)
        else next.delete('q')
        return next
      },
      { replace: true }
    )
  }, [debouncedTerm, currentQuery, isHome, setSearchParams])

  useEffect(() => {
    if (!menuOpen) return undefined
    const handlePointer = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    return () => document.removeEventListener('mousedown', handlePointer)
  }, [menuOpen])

  const submitSearch = (event) => {
    event.preventDefault()
    const trimmed = term.trim()
    if (isHome) {
      if (trimmed === currentQuery.trim()) return
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (trimmed) next.set('q', trimmed)
          else next.delete('q')
          return next
        },
        { replace: true }
      )
      return
    }
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/')
  }

  const handleBlur = () => {
    setFocused(false)
    if (!isHome) return
    const trimmed = term.trim()
    if (trimmed === currentQuery.trim()) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (trimmed) next.set('q', trimmed)
        else next.delete('q')
        return next
      },
      { replace: true }
    )
  }

  const clearSearch = () => {
    setTerm('')
    if (isHome) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('q')
          return next
        },
        { replace: true }
      )
    }
    window.requestAnimationFrame(() => searchRef.current?.focus())
  }

  const handleLocationChange = (value) => {
    if (isHome) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set('ubicacion', value)
          else next.delete('ubicacion')
          return next
        },
        { replace: true }
      )
      return
    }
    const next = new URLSearchParams()
    if (currentQuery) next.set('q', currentQuery)
    if (value) next.set('ubicacion', value)
    navigate(next.toString() ? `/?${next.toString()}` : '/')
  }

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    if (location.pathname.startsWith('/admin')) navigate('/admin/login', { replace: true })
  }

  const initial = (user?.username || 'A').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-fb-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4">
        <Logo />

        <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fb-gray"
            />
            <input
              ref={searchRef}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={handleBlur}
              placeholder="Buscar en Mercadito"
              aria-label="Buscar productos"
              className="h-10 w-full rounded-full border border-transparent bg-fb-bg pl-10 pr-9 text-[15px] text-fb-ink outline-none transition placeholder:text-fb-gray focus:border-fb-blue/30 focus:bg-white focus:ring-2 focus:ring-fb-blue/20"
            />
            {term && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-fb-gray transition hover:bg-fb-soft hover:text-fb-ink"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative flex shrink-0 items-center gap-1.5 border-l border-fb-line pl-2">
            <MapPin size={16} className="text-fb-gray" />
            <select
              value={selectedLocation}
              onChange={(event) => handleLocationChange(event.target.value)}
              aria-label="Filtrar por ubicación"
              className="max-w-44 cursor-pointer appearance-none bg-transparent py-2 pr-5 text-sm font-medium text-fb-ink outline-none"
            >
              <option value="">Todas las ubicaciones</option>
              {LOCATIONS.map((item) => (
                <option key={item} value={item}>
                  {item.split(',')[0]}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-1 text-fb-gray" />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          {isAuthenticated && (
            <Link
              to="/admin/publicar"
              className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'shrink-0' })}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Vender</span>
            </Link>
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-fb-soft text-sm font-bold text-fb-ink transition hover:bg-[#d8dadf]"
              aria-label="Abrir menú de cuenta"
              aria-expanded={menuOpen}
            >
              {isAuthenticated ? initial : <ShieldCheck size={18} className="text-fb-gray" />}
            </button>

            {menuOpen && (
              <div className="animate-scale-in absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-fb-line bg-white py-1 shadow-pop">
                <div className="border-b border-fb-line px-3 py-2">
                  <p className="text-xs text-fb-gray">
                    {isAuthenticated ? 'Sesión iniciada como' : 'Bienvenido a Mercadito'}
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {user?.username || 'Visitante'}
                  </p>
                </div>
                {isAuthenticated ? (
                  <>
                    <MenuLink to="/admin" icon={ShieldCheck} onClick={() => setMenuOpen(false)}>
                      Panel de administración
                    </MenuLink>
                    <MenuLink to="/" icon={Store} onClick={() => setMenuOpen(false)}>
                      Ver Mercadito
                    </MenuLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <MenuLink to="/admin/login" icon={ShieldCheck} onClick={() => setMenuOpen(false)}>
                      Acceso administrador
                    </MenuLink>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-fb-line px-4 py-2 md:hidden">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fb-gray"
            />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={handleBlur}
              placeholder="Buscar en Mercadito"
              aria-label="Buscar productos"
              className="h-10 w-full rounded-full border border-transparent bg-fb-bg pl-9 pr-8 text-sm text-fb-ink outline-none focus:border-fb-blue/30 focus:bg-white"
            />
            {term && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-fb-gray"
                aria-label="Limpiar búsqueda"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fb-blue text-white transition hover:bg-fb-blue-dark"
            aria-label="Buscar"
          >
            <Search size={17} />
          </button>
        </form>
        <div className="relative mt-2 flex items-center gap-1.5 text-sm">
          <MapPin size={15} className="text-fb-gray" />
          <select
            value={selectedLocation}
            onChange={(event) => handleLocationChange(event.target.value)}
            aria-label="Filtrar por ubicación"
            className="w-full cursor-pointer appearance-none bg-transparent py-1 pr-5 text-sm font-medium text-fb-ink outline-none"
          >
            <option value="">Todas las ubicaciones</option>
            {LOCATIONS.map((item) => (
              <option key={item} value={item}>
                {item.split(',')[0]}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-1 text-fb-gray" />
        </div>
      </div>
    </header>
  )
}
