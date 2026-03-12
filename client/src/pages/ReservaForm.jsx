import { useState, useEffect } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'

const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

export default function ReservaForm() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [vendedor, setVendedor] = useState('')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [fechaFeria, setFechaFeria] = useState('')
  const [cantidades, setCantidades] = useState([])
  const [abono, setAbono] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    api.get('/config')
      .then(res => {
        setConfig(res.data)
        setCantidades(res.data.precios.map(() => 0))
        setLoading(false)
      })
      .catch(() => {
        setError('Error al cargar configuración.')
        setLoading(false)
      })
  }, [])

  const changeQty = (idx, delta) => {
    setCantidades(prev => prev.map((q, i) => i === idx ? Math.max(0, q + delta) : q))
  }

  const total = config ? config.precios.reduce((sum, item, idx) => sum + item.precio * cantidades[idx], 0) : 0
  const abonoNum = parseFloat(abono) || 0
  const saldo = total - abonoNum

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)

    if (!vendedor || !nombre || !email || !fechaFeria || !metodoPago) {
      setMsg({ type: 'error', text: 'Completá todos los campos obligatorios.' })
      return
    }

    const items = config.precios
      .map((item, idx) => ({ nombre: item.nombre, cantidad: cantidades[idx], precioUnit: item.precio, subtotal: cantidades[idx] * item.precio }))
      .filter(it => it.cantidad > 0)

    if (items.length === 0) {
      setMsg({ type: 'error', text: 'Seleccioná al menos un item.' })
      return
    }

    if (total <= 0) {
      setMsg({ type: 'error', text: 'El total debe ser mayor a cero.' })
      return
    }

    const minAbono = Math.ceil(total * 0.5)
    if (abonoNum < minAbono) {
      setMsg({ type: 'error', text: `El abono mínimo es del 50% del total: ${fmt.format(minAbono)}` })
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/reservas', { vendedor, nombre, email, fechaFeria, items, total, abono: abonoNum, metodoPago })
      if (res.data.success) {
        setMsg({ type: 'success', text: `Reserva guardada! ID: ${res.data.idReserva}. Se envió confirmación por email.` })
        // Reset form
        setVendedor(''); setNombre(''); setEmail(''); setFechaFeria(''); setAbono(''); setMetodoPago('')
        setCantidades(config.precios.map(() => 0))
      } else {
        setMsg({ type: 'error', text: res.data.error || 'Error al guardar.' })
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error de conexión.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="RESERVAS FERIA SUCOVI" subtitle="Sistema de reservas" />
      <main className="flex justify-center px-4 py-6 pb-10">
        <div className="bg-white w-full max-w-xl rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 text-center mb-1">Nueva Reserva</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Completá los datos del feriante y los items a reservar.</p>

          {loading && <p className="text-center text-gray-400 py-8">Cargando configuración...</p>}
          {error && <p className="text-center text-red-600 py-8">{error}</p>}

          {config && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vendedor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Vendedor <span className="text-red-500">*</span></label>
                <select value={vendedor} onChange={e => setVendedor(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15">
                  <option value="">Seleccioná un vendedor</option>
                  {config.vendedores.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre y Apellido del Feriante <span className="text-red-500">*</span></label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email del Feriante <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
              </div>

              {/* Fecha Feria */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Feria <span className="text-red-500">*</span></label>
                <select value={fechaFeria} onChange={e => setFechaFeria(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15">
                  <option value="">Seleccioná una fecha</option>
                  {config.fechasFeria.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Items table */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Items a reservar</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-2 py-2 font-semibold text-gray-700">Item</th>
                        <th className="text-right px-2 py-2 font-semibold text-gray-700">Precio</th>
                        <th className="text-center px-2 py-2 font-semibold text-gray-700">Cantidad</th>
                        <th className="text-right px-2 py-2 font-semibold text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.precios.map((item, idx) => (
                        <tr key={item.key} className="border-b border-gray-100">
                          <td className="px-2 py-2">{item.nombre}</td>
                          <td className="px-2 py-2 text-right">{fmt.format(item.precio)}</td>
                          <td className="px-2 py-2">
                            <div className="flex items-center justify-center gap-1">
                              <button type="button" onClick={() => changeQty(idx, -1)} className="w-7 h-7 border border-gray-300 rounded-md bg-white text-base flex items-center justify-center hover:bg-green-50 hover:border-green-600">-</button>
                              <input type="number" value={cantidades[idx]} onChange={e => { const val = Math.max(0, parseInt(e.target.value) || 0); setCantidades(prev => prev.map((q, i) => i === idx ? val : q)) }} className="w-10 text-center border border-gray-300 rounded-md text-sm py-1 focus:outline-none focus:border-green-600" />
                              <button type="button" onClick={() => changeQty(idx, 1)} className="w-7 h-7 border border-gray-300 rounded-md bg-white text-base flex items-center justify-center hover:bg-green-50 hover:border-green-600">+</button>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-right font-semibold">{fmt.format(item.precio * cantidades[idx])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-base font-bold text-gray-800 border-t-2 border-gray-200 pt-2">
                  <span>Total</span>
                  <span>{fmt.format(total)}</span>
                </div>
              </div>

              {/* Abono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Monto que abona (seña) <span className="text-red-500">*</span></label>
                <input type="number" value={abono} onChange={e => setAbono(e.target.value)} min="0" placeholder="Mínimo 50% del total" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
              </div>

              {/* Resumen abono/saldo */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Abona</span>
                  <span>{fmt.format(abonoNum)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-red-600">
                  <span>Saldo restante</span>
                  <span>{fmt.format(saldo)}</span>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Método de Pago <span className="text-red-500">*</span></label>
                <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15">
                  <option value="">Seleccioná método</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>

              <button type="submit" disabled={submitting} className="w-full py-3 bg-green-700 text-white rounded-lg font-bold text-sm tracking-wide hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                {submitting ? 'Guardando...' : 'Guardar Reserva'}
              </button>
            </form>
          )}

          {msg && (
            <div className={`mt-4 p-4 rounded-lg text-sm text-center ${msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
              {msg.text}
            </div>
          )}

          <Footer />
        </div>
      </main>
    </div>
  )
}
