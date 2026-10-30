import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Navbar } from '../components/common/Navbar.jsx'
import { Button } from '../components/common/Button.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function NotFound() {
  usePageTitle('Página no encontrada')

  return (
    <div className="min-h-screen bg-fb-bg">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-fb-blue shadow-card">
          <Compass size={30} />
        </span>
        <p className="mt-5 text-sm font-bold uppercase tracking-widest text-fb-gray">Error 404</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">No encontramos esta página</h1>
        <p className="mt-1 text-sm text-fb-gray">
          El enlace puede estar roto o la publicación pudo haber sido eliminada.
        </p>
        <Link to="/">
          <Button className="mt-5">Ir a Mercadito</Button>
        </Link>
      </main>
    </div>
  )
}
