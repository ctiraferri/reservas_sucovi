const { Router } = require('express');
const db = require('../config/db');
const { sendReservaEmail } = require('../services/email');
const { syncToSheet } = require('../services/sheets');

const router = Router();

// Crear reserva (público)
router.post('/', async (req, res, next) => {
  try {
    const { vendedor, nombre, email, fechaFeria, items, total, abono, metodoPago } = req.body;

    // Validaciones
    if (!vendedor || !nombre || !email || !fechaFeria || !items?.length || !total || !abono || !metodoPago) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const minAbono = Math.ceil(total * 0.5);
    if (abono < minAbono) {
      return res.status(400).json({ error: `El abono mínimo es del 50% del total: $${minAbono}` });
    }

    // Generar ID
    const lastRes = await db.query("SELECT id_reserva FROM reservas ORDER BY id DESC LIMIT 1");
    let nextNum = 1;
    if (lastRes.rows.length > 0) {
      const match = lastRes.rows[0].id_reserva.match(/R-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const idReserva = 'R-' + String(nextNum).padStart(3, '0');

    const saldo = total - abono;
    const detalle = items.map(it => `${it.cantidad}x ${it.nombre} ($${it.precioUnit}) = $${it.subtotal}`).join(' | ');

    const result = await db.query(
      `INSERT INTO reservas (id_reserva, vendedor, nombre_feriante, email, fecha_feria, items_json, detalle_items, total, abono, saldo, metodo_pago)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [idReserva, vendedor, nombre, email, fechaFeria, JSON.stringify(items), detalle, total, abono, saldo, metodoPago]
    );

    // Email (fire-and-forget)
    sendReservaEmail({ email, nombre, vendedor, fechaFeria, detalle, total, abono, saldo, metodoPago, idReserva });

    // Sheets mirror (fire-and-forget)
    syncToSheet({
      timestamp: new Date().toISOString(),
      idReserva, vendedor, nombre, email, fechaFeria, detalle,
      total, abono, saldo, metodoPago, estado: 'Pendiente',
    });

    res.json({ success: true, idReserva });
  } catch (err) { next(err); }
});

// Reportes por fecha
router.get('/reportes', async (req, res, next) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.json([]);

    const result = await db.query(
      `SELECT id_reserva, vendedor, nombre_feriante as nombre, email, fecha_feria, detalle_items, total, abono, saldo, metodo_pago, estado, created_at
       FROM reservas WHERE fecha_feria = $1 ORDER BY created_at`,
      [fecha]
    );

    res.json(result.rows.map(r => ({
      idReserva: r.id_reserva,
      vendedor: r.vendedor,
      nombre: r.nombre,
      email: r.email,
      fechaFeria: r.fecha_feria,
      detalleItems: r.detalle_items,
      total: Number(r.total),
      abono: Number(r.abono),
      saldo: Number(r.saldo),
      metodoPago: r.metodo_pago,
      estado: r.estado,
      timestamp: r.created_at,
    })));
  } catch (err) { next(err); }
});

// Fechas disponibles (para dropdown de reportes)
router.get('/fechas', async (req, res, next) => {
  try {
    const result = await db.query('SELECT DISTINCT nombre FROM fechas_feria ORDER BY nombre');
    res.json(result.rows.map(r => r.nombre));
  } catch (err) { next(err); }
});

module.exports = router;
