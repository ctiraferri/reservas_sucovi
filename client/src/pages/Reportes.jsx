import { useState, useEffect } from 'react'
import api from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'

const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

function estadoClass(estado) {
  if (estado === 'Pagado') return 'text-green-700'
  if (estado === 'Cancelado') return 'text-red-700'
  return 'text-orange-600'
}

export default function Reportes() {
  const [fechas, setFechas] = useState([])
  const [selected, setSelected] = useState('')
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/reservas/fechas').then(res => setFechas(res.data)).catch(() => {})
  }, [])

  const load = async (fecha) => {
    setSelected(fecha)
    if (!fecha) return
    setLoading(true)
    try {
      const res = await api.get('/reservas/reportes?fecha=' + encodeURIComponent(fecha))
      setReservas(res.data)
    } catch { setReservas([]) }
    setLoading(false)
  }

  const activas = reservas.filter(r => r.estado !== 'Cancelado')
  const totalSum = activas.reduce((s, r) => s + r.total, 0)
  const abonoSum = activas.reduce((s, r) => s + r.abono, 0)
  const saldoSum = activas.reduce((s, r) => s + r.saldo, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="REPORTES RESERVAS SUCOVI" subtitle="Reportes por edición de feria" />
      <main className="flex justify-center px-4 py-6 pb-10">
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 text-center mb-1">Reportes</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Seleccioná una fecha de feria para ver las reservas registradas.</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Feria</label>
            <select value={selected} onChange={e => load(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15">
              <option value="">Seleccioná una fecha</option>
              {fechas.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {loading && <p className="text-center text-gray-400 py-6">Cargando reservas...</p>}

          {!loading && selected && reservas.length === 0 && (
            <p className="text-center text-gray-400 py-8">No hay reservas para esta fecha.</p>
          )}

          {/* Desktop table */}
          {reservas.length > 0 && (
            <>
              <div className="hidden md:block overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">ID</th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">Feriante</th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">Vendedor</th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">Items</th>
                      <th className="text-right px-2 py-2 font-semibold text-gray-700">Total</th>
                      <th className="text-right px-2 py-2 font-semibold text-gray-700">Abono</th>
                      <th className="text-right px-2 py-2 font-semibold text-gray-700">Saldo</th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">Pago</th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map(r => (
                      <tr key={r.idReserva} className="border-b border-gray-100">
                        <td className="px-2 py-2">{r.idReserva}</td>
                        <td className="px-2 py-2">{r.nombre}</td>
                        <td className="px-2 py-2">{r.vendedor}</td>
                        <td className="px-2 py-2 text-xs">{r.detalleItems}</td>
                        <td className="px-2 py-2 text-right">{fmt.format(r.total)}</td>
                        <td className="px-2 py-2 text-right">{fmt.format(r.abono)}</td>
                        <td className="px-2 py-2 text-right">{fmt.format(r.saldo)}</td>
                        <td className="px-2 py-2">{r.metodoPago}</td>
                        <td className={`px-2 py-2 font-semibold ${estadoClass(r.estado)}`}>{r.estado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3 mt-4">
                {reservas.map(r => (
                  <div key={r.idReserva} className={`bg-gray-50 rounded-lg p-3.5 border-l-4 ${r.estado === 'Cancelado' ? 'border-red-500 opacity-70' : 'border-green-600'}`}>
                    <div className="font-bold text-gray-800 mb-1.5 text-sm">{r.idReserva} - {r.nombre}</div>
                    <div className="flex justify-between text-xs py-0.5"><span className="text-gray-500 font-semibold">Vendedor</span><span>{r.vendedor}</span></div>
                    <div className="flex justify-between text-xs py-0.5"><span className="text-gray-500 font-semibold">Items</span><span className="text-right max-w-[60%]">{r.detalleItems}</span></div>
                    <div className="flex justify-between text-xs py-0.5"><span className="text-gray-500 font-semibold">Total</span><span>{fmt.format(r.total)}</span></div>
                    <div className="flex justify-between text-xs py-0.5"><span className="text-gray-500 font-semibold">Abono</span><span>{fmt.format(r.abono)}</span></div>
                    <div className="flex justify-between text-xs py-0.5"><span className="text-gray-500 font-semibold">Saldo</span><span>{fmt.format(r.saldo)}</span></div>
                    <div className="flex justify-between text-xs py-0.5"><span className="text-gray-500 font-semibold">Pago</span><span>{r.metodoPago}</span></div>
                    <div className="flex justify-between text-xs py-0.5"><span className="text-gray-500 font-semibold">Estado</span><span className={`font-semibold ${estadoClass(r.estado)}`}>{r.estado}</span></div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-green-50 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Resumen</h3>
                <div className="flex justify-between text-sm py-0.5"><span>Reservas</span><span>{activas.length}</span></div>
                <div className="flex justify-between text-sm py-0.5"><span>Total facturado</span><span>{fmt.format(totalSum)}</span></div>
                <div className="flex justify-between text-sm py-0.5"><span>Total cobrado</span><span>{fmt.format(abonoSum)}</span></div>
                <div className="flex justify-between text-base font-bold pt-2 mt-1 border-t-2 border-green-200"><span>Saldo pendiente</span><span>{fmt.format(saldoSum)}</span></div>
              </div>
            </>
          )}

          <Footer />
        </div>
      </main>
    </div>
  )
}
