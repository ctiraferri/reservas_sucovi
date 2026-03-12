import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Admin() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [precios, setPrecios] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [fechas, setFechas] = useState([])
  const [newVendedor, setNewVendedor] = useState('')
  const [newFecha, setNewFecha] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    api.get('/config/admin').then(res => {
      setPrecios(res.data.precios)
      setVendedores(res.data.vendedores)
      setFechas(res.data.fechasFeria)
    }).catch(() => {})
  }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleLogout = () => { logout(); navigate('/admin/login') }

  // Precios
  const updatePrecio = (idx, field, value) => {
    setPrecios(prev => prev.map((p, i) => i === idx ? { ...p, [field]: field === 'precio' ? Number(value) : value } : p))
  }

  const savePrecios = async () => {
    try {
      await api.put('/config/precios', { precios })
      showMsg('success', 'Precios guardados.')
    } catch { showMsg('error', 'Error al guardar precios.') }
  }

  // Vendedores
  const toggleVendedor = (idx) => {
    setVendedores(prev => prev.map((v, i) => i === idx ? { ...v, activo: !v.activo } : v))
  }

  const addVendedor = () => {
    if (!newVendedor.trim()) return
    setVendedores(prev => [...prev, { nombre: newVendedor.trim(), activo: true }])
    setNewVendedor('')
  }

  const saveVendedores = async () => {
    try {
      await api.put('/config/vendedores', { vendedores })
      showMsg('success', 'Vendedores guardados.')
    } catch { showMsg('error', 'Error al guardar vendedores.') }
  }

  // Fechas
  const toggleFecha = (idx) => {
    setFechas(prev => prev.map((f, i) => i === idx ? { ...f, activa: !f.activa } : f))
  }

  const addFecha = () => {
    if (!newFecha.trim()) return
    setFechas(prev => [...prev, { nombre: newFecha.trim(), activa: true }])
    setNewFecha('')
  }

  const saveFechas = async () => {
    try {
      await api.put('/config/fechas', { fechas })
      showMsg('success', 'Fechas guardadas.')
    } catch { showMsg('error', 'Error al guardar fechas.') }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="ADMIN RESERVAS SUCOVI" subtitle="Panel de administración" />
      <main className="flex justify-center px-4 py-6 pb-10">
        <div className="bg-white w-full max-w-xl rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Panel de Administración</h2>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Cerrar sesión</button>
          </div>

          {msg && (
            <div className={`mb-4 p-3 rounded-lg text-sm text-center ${msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
              {msg.text}
            </div>
          )}

          {/* Precios */}
          <section className="border-t border-gray-200 pt-5 mt-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Precios de Items</h3>
            <table className="w-full text-sm border-collapse mb-3">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-2 py-2 font-semibold text-gray-700">Key</th>
                  <th className="text-left px-2 py-2 font-semibold text-gray-700">Nombre</th>
                  <th className="text-left px-2 py-2 font-semibold text-gray-700">Precio</th>
                </tr>
              </thead>
              <tbody>
                {precios.map((p, idx) => (
                  <tr key={p.key} className="border-b border-gray-100">
                    <td className="px-2 py-2 text-gray-500">{p.key}</td>
                    <td className="px-2 py-2"><input value={p.nombre} onChange={e => updatePrecio(idx, 'nombre', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-600" /></td>
                    <td className="px-2 py-2"><input type="number" value={p.precio} onChange={e => updatePrecio(idx, 'precio', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-600" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={savePrecios} className="w-full py-2.5 bg-green-700 text-white rounded-lg font-bold text-sm hover:bg-green-800 transition-colors">Guardar Precios</button>
          </section>

          {/* Vendedores */}
          <section className="border-t border-gray-200 pt-5 mt-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Vendedores</h3>
            <table className="w-full text-sm border-collapse mb-3">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-2 py-2 font-semibold text-gray-700">Nombre</th>
                  <th className="text-left px-2 py-2 font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {vendedores.map((v, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="px-2 py-2">{v.nombre}</td>
                    <td className="px-2 py-2">
                      <button onClick={() => toggleVendedor(idx)} className={`px-3 py-1 text-xs font-semibold rounded border ${v.activo ? 'bg-green-50 border-green-600 text-green-700' : 'bg-red-50 border-red-400 text-red-700'}`}>
                        {v.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 mb-3">
              <input value={newVendedor} onChange={e => setNewVendedor(e.target.value)} placeholder="Nombre del nuevo vendedor" onKeyDown={e => e.key === 'Enter' && addVendedor()} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              <button onClick={addVendedor} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800">Agregar</button>
            </div>
            <button onClick={saveVendedores} className="w-full py-2.5 bg-green-700 text-white rounded-lg font-bold text-sm hover:bg-green-800 transition-colors">Guardar Vendedores</button>
          </section>

          {/* Fechas */}
          <section className="border-t border-gray-200 pt-5 mt-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Fechas de Feria</h3>
            <table className="w-full text-sm border-collapse mb-3">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-2 py-2 font-semibold text-gray-700">Fecha / Nombre</th>
                  <th className="text-left px-2 py-2 font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {fechas.map((f, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="px-2 py-2">{f.nombre}</td>
                    <td className="px-2 py-2">
                      <button onClick={() => toggleFecha(idx)} className={`px-3 py-1 text-xs font-semibold rounded border ${f.activa ? 'bg-green-50 border-green-600 text-green-700' : 'bg-red-50 border-red-400 text-red-700'}`}>
                        {f.activa ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 mb-3">
              <input value={newFecha} onChange={e => setNewFecha(e.target.value)} placeholder="Ej: Feria 15/03/2026" onKeyDown={e => e.key === 'Enter' && addFecha()} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              <button onClick={addFecha} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800">Agregar</button>
            </div>
            <button onClick={saveFechas} className="w-full py-2.5 bg-green-700 text-white rounded-lg font-bold text-sm hover:bg-green-800 transition-colors">Guardar Fechas</button>
          </section>

          <Footer />
        </div>
      </main>
    </div>
  )
}
