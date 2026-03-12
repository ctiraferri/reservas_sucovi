import { Link, useLocation } from 'react-router-dom'

export default function Footer() {
  const { pathname } = useLocation()

  return (
    <div className="text-center py-4 text-sm text-gray-500">
      {pathname !== '/' && <Link to="/" className="text-green-700 no-underline mx-2 hover:underline">Reserva</Link>}
      {pathname !== '/reportes' && <Link to="/reportes" className="text-green-700 no-underline mx-2 hover:underline">Reportes</Link>}
      {!pathname.startsWith('/admin') && <Link to="/admin/login" className="text-green-700 no-underline mx-2 hover:underline">Admin</Link>}
    </div>
  )
}
