-- Base de datos: reservas
-- Crear con: createdb -U postgres reservas
-- Ejecutar con: psql -U postgres -d reservas -f schema.sql

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vendedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS fechas_feria (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  id_reserva VARCHAR(10) UNIQUE NOT NULL,
  vendedor VARCHAR(100) NOT NULL,
  nombre_feriante VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  fecha_feria VARCHAR(100) NOT NULL,
  items_json JSONB NOT NULL,
  detalle_items TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  abono NUMERIC(10,2) NOT NULL,
  saldo NUMERIC(10,2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO items (key, nombre, precio) VALUES
  ('silla', 'Silla', 5000),
  ('mesa', 'Mesa', 15000),
  ('pupitre_grande', 'Pupitre Grande', 8000),
  ('pupitre_chico', 'Pupitre Chico', 5000),
  ('combo_mesa_silla', 'Combo Mesa + Silla', 18000),
  ('pupitre_2g_silla', 'Pupitre 2G + Silla', 16000),
  ('pupitre_2ch_silla', 'Pupitre 2CH + Silla', 13000)
ON CONFLICT (key) DO NOTHING;

INSERT INTO vendedores (nombre, activo) VALUES
  ('Adrian', true),
  ('Silvina', true),
  ('Laura', true),
  ('Mariana', true),
  ('Eugenia', true),
  ('Ezequiel', true),
  ('Julieta', true),
  ('Guadalupe', true)
ON CONFLICT DO NOTHING;

INSERT INTO fechas_feria (nombre, activa) VALUES
  ('12/04/2026', true)
ON CONFLICT DO NOTHING;
