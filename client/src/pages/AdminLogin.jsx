import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Header from '../components/Header'

export default function AdminLogin() {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/login', { user, password })
      login(res.data.token)
      navigate('/admin')
    } catch {
      setError('Credenciales inválidas.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="ADMIN RESERVAS SUCOVI" subtitle="Panel de administración" />
      <main className="flex justify-center items-center px-4 py-12">
        <div className="bg-white w-full max-w-sm rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 text-center mb-6">Acceso Admin</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Usuario</label>
              <input type="text" value={user} onChange={e => setUser(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full py-3 bg-green-700 text-white rounded-lg font-bold text-sm hover:bg-green-800 transition-colors">Ingresar</button>
          </form>
        </div>
      </main>
    </div>
  )
}
