import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ExternalLink, LayoutDashboard, LogOut, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { Logo } from '../common/Logo.jsx'
import { buttonClasses } from '../common/Button.jsx'

const navClass = ({ isActive }) =>
  `inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
    isActive ? 'bg-fb-blue-soft text-fb-blue-dark' : 'text-fb-gray hover:bg-fb-bg hover:text-fb-ink'
  }`

export function AdminLayout() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-fb-bg">
      <header className="sticky top-0 z-40 border-b border-fb-line bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
          <Logo to="/admin" />
          <span className="hidden rounded-full bg-fb-blue-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-fb-blue-dark sm:inline">
            Panel
          </span>
          <nav className="ml-2 hidden items-center gap-1 sm:flex">
            <NavLink to="/admin" end className={navClass}>
              <LayoutDashboard size={16} />
              Publicaciones
            </NavLink>
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-fb-gray transition hover:bg-fb-bg hover:text-fb-ink"
            >
              <ExternalLink size={16} />
              Ver sitio
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated && (
              <span className="hidden text-xs text-fb-gray md:inline">
                {user?.username}
              </span>
            )}
            <Link
              to="/admin/publicar"
              className={buttonClasses({ variant: 'primary', size: 'sm' })}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nueva publicación</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={buttonClasses({ variant: 'ghost', size: 'icon' })}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}
