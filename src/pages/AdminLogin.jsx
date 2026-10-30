import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Logo } from '../components/common/Logo.jsx'
import { Button } from '../components/common/Button.jsx'
import { Field, TextInput } from '../components/common/FormControls.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function AdminLogin() {
  const { login, isAuthenticated, initializing } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  usePageTitle('Acceso administrador')

  if (initializing) {
    return (
      <div className="grid min-h-screen place-items-center bg-fb-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-fb-line border-t-fb-blue" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const from = location.state?.from?.pathname || '/admin'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (loading) return
    setError('')
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (currentError) {
      setError(currentError?.message || 'No pudimos iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-fb-bg">
      <header className="border-b border-fb-line bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-fb-gray transition hover:text-fb-ink"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-fb-line bg-white p-6 shadow-card sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-fb-blue-soft text-fb-blue">
              <ShieldCheck size={24} />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Acceso administrador</h1>
            <p className="mt-1 text-sm text-fb-gray">
              Inicia sesión para crear, editar y administrar las publicaciones del catálogo.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Correo electrónico" htmlFor="admin-email" required>
                <TextInput
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  autoFocus
                />
              </Field>

              <Field label="Contraseña" htmlFor="admin-pass" required>
                <div className="relative">
                  <TextInput
                    id="admin-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setError('')
                    }}
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-fb-gray transition hover:bg-fb-bg hover:text-fb-ink"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-fb-gray">
            Solo el administrador puede publicar. Los visitantes pueden explorar y contactar por
            WhatsApp.
          </p>
        </div>
      </main>
    </div>
  )
}
