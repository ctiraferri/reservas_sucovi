const { Router } = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = Router();

// Público: config activa para el formulario
router.get('/', async (req, res, next) => {
  try {
    const [itemsRes, vendRes, fechasRes] = await Promise.all([
      db.query('SELECT key, nombre, precio FROM items ORDER BY id'),
      db.query("SELECT nombre FROM vendedores WHERE activo = true ORDER BY nombre"),
      db.query("SELECT nombre FROM fechas_feria WHERE activa = true ORDER BY id"),
    ]);

    res.json({
      precios: itemsRes.rows.map(r => ({ key: r.key, nombre: r.nombre, precio: Number(r.precio) })),
      vendedores: vendRes.rows.map(r => r.nombre),
      fechasFeria: fechasRes.rows.map(r => r.nombre),
    });
  } catch (err) { next(err); }
});

// Admin: config completa
router.get('/admin', auth, async (req, res, next) => {
  try {
    const [itemsRes, vendRes, fechasRes] = await Promise.all([
      db.query('SELECT key, nombre, precio FROM items ORDER BY id'),
      db.query('SELECT nombre, activo FROM vendedores ORDER BY id'),
      db.query('SELECT id, nombre, activa FROM fechas_feria ORDER BY id'),
    ]);

    res.json({
      precios: itemsRes.rows.map(r => ({ key: r.key, nombre: r.nombre, precio: Number(r.precio) })),
      vendedores: vendRes.rows.map(r => ({ nombre: r.nombre, activo: r.activo })),
      fechasFeria: fechasRes.rows.map(r => ({ id: r.id, nombre: r.nombre, activa: r.activa })),
    });
  } catch (err) { next(err); }
});

// Admin: guardar precios
router.put('/precios', auth, async (req, res, next) => {
  try {
    const { precios } = req.body;
    for (const p of precios) {
      await db.query('UPDATE items SET nombre = $1, precio = $2 WHERE key = $3', [p.nombre, p.precio, p.key]);
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Admin: guardar vendedores (bulk replace)
router.put('/vendedores', auth, async (req, res, next) => {
  try {
    const { vendedores } = req.body;
    await db.query('DELETE FROM vendedores');
    for (const v of vendedores) {
      await db.query('INSERT INTO vendedores (nombre, activo) VALUES ($1, $2)', [v.nombre, v.activo]);
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Admin: guardar fechas (bulk replace)
router.put('/fechas', auth, async (req, res, next) => {
  try {
    const { fechas } = req.body;
    await db.query('DELETE FROM fechas_feria');
    for (const f of fechas) {
      await db.query('INSERT INTO fechas_feria (nombre, activa) VALUES ($1, $2)', [f.nombre, f.activa]);
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
