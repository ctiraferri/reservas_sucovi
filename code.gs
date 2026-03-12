// Google Apps Script - Sistema de Reservas SUCOVI
// Sheet ID: 1HtbsVW0f5YsXcaGwUe4fQYxM7_DeKjeQlAhOw0jjQ-Q

const SHEET_ID = '1HtbsVW0f5YsXcaGwUe4fQYxM7_DeKjeQlAhOw0jjQ-Q';
const ADMIN_EMAIL = 'feriadelbaulcci@gmail.com';

function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getConfig') {
    return jsonResponse(getConfig());
  }
  if (action === 'getReportes') {
    return jsonResponse(getReportes(e.parameter.fecha));
  }
  if (action === 'getFechas') {
    return jsonResponse(getFechasUnicas());
  }
  if (action === 'verifyAdmin') {
    return jsonResponse(verifyAdmin(e.parameter.pass));
  }

  return jsonResponse({ error: 'Acción no válida' });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  if (action === 'saveReserva') {
    return jsonResponse(saveReserva(data));
  }
  if (action === 'updatePrecios') {
    if (!verifyAdmin(data.password).valid) return jsonResponse({ error: 'No autorizado' });
    return jsonResponse(updatePrecios(data.precios));
  }
  if (action === 'updateVendedores') {
    if (!verifyAdmin(data.password).valid) return jsonResponse({ error: 'No autorizado' });
    return jsonResponse(updateVendedores(data.vendedores));
  }
  if (action === 'updateFechasFeria') {
    if (!verifyAdmin(data.password).valid) return jsonResponse({ error: 'No autorizado' });
    return jsonResponse(updateFechasFeria(data.fechas));
  }

  return jsonResponse({ error: 'Acción no válida' });
}

function formatFecha(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return String(val);
}

// ── Lecturas ──

function getConfig() {
  const precios = [];
  const preciosSheet = getSheet('Precios');
  const preciosData = preciosSheet.getDataRange().getValues();
  for (let i = 0; i < preciosData.length; i++) {
    precios.push({ key: preciosData[i][0], nombre: preciosData[i][1], precio: preciosData[i][2] });
  }

  const vendedores = [];
  const allVendedores = [];
  const vendSheet = getSheet('Vendedores');
  const vendData = vendSheet.getDataRange().getValues();
  for (let i = 0; i < vendData.length; i++) {
    const activo = vendData[i][1] === true || vendData[i][1] === 'TRUE';
    allVendedores.push({ nombre: vendData[i][0], activo: activo });
    if (activo) {
      vendedores.push(vendData[i][0]);
    }
  }

  const fechasFeria = [];
  const fechasSheet = getSheet('FechasFeria');
  const fechasData = fechasSheet.getDataRange().getValues();
  for (let i = 0; i < fechasData.length; i++) {
    fechasFeria.push({
      fecha: formatFecha(fechasData[i][0]),
      activa: fechasData[i][1] === true || fechasData[i][1] === 'TRUE'
    });
  }

  return { precios, vendedores, allVendedores, fechasFeria };
}

function getReportes(fecha) {
  const sheet = getSheet('Reservas');
  const data = sheet.getDataRange().getValues();
  const reservas = [];
  for (let i = 1; i < data.length; i++) {
    if (formatFecha(data[i][4]) === fecha) {
      reservas.push({
        timestamp: data[i][0],
        vendedor: data[i][1],
        nombre: data[i][2],
        email: data[i][3],
        fechaFeria: data[i][4],
        itemsJSON: data[i][5],
        detalleItems: data[i][6],
        total: data[i][7],
        abono: data[i][8],
        saldo: data[i][9],
        metodoPago: data[i][10],
        estado: data[i][11],
        idReserva: data[i][12]
      });
    }
  }
  return reservas;
}

function getFechasUnicas() {
  const sheet = getSheet('FechasFeria');
  const data = sheet.getDataRange().getValues();
  const fechas = [];
  for (let i = 0; i < data.length; i++) {
    fechas.push(formatFecha(data[i][0]));
  }
  return fechas;
}

function verifyAdmin(pass) {
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'Admin123';
  return { valid: pass === ADMIN_PASS };
}

// ── Escrituras ──

function saveReserva(data) {
  const sheet = getSheet('Reservas');
  const lastRow = sheet.getLastRow();

  // Generar ID
  let nextNum = 1;
  if (lastRow > 1) {
    const lastId = sheet.getRange(lastRow, 13).getValue();
    if (lastId) {
      const match = lastId.toString().match(/R-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
  }
  const idReserva = 'R-' + String(nextNum).padStart(3, '0');

  const total = data.total;
  const abono = data.abono;
  const saldo = total - abono;

  // Generar detalle legible
  const items = data.items; // [{nombre, cantidad, precioUnit, subtotal}]
  const detalle = items.map(function(it) {
    return it.cantidad + 'x ' + it.nombre + ' ($' + it.precioUnit + ') = $' + it.subtotal;
  }).join(' | ');

  const timestamp = new Date();
  const row = [
    timestamp,
    data.vendedor,
    data.nombre,
    data.email,
    data.fechaFeria,
    JSON.stringify(items),
    detalle,
    total,
    abono,
    saldo,
    data.metodoPago,
    'Pendiente',
    idReserva
  ];

  sheet.appendRow(row);

  // Enviar email
  try {
    const asunto = 'Nueva Reserva SUCOVI - ' + data.nombre + ' - ' + data.fechaFeria;
    const cuerpo = [
      'Nueva Reserva registrada en SUCOVI',
      '================================',
      '',
      'ID Reserva: ' + idReserva,
      'Fecha/hora: ' + timestamp.toLocaleString('es-AR'),
      'Vendedor: ' + data.vendedor,
      '',
      'Feriante: ' + data.nombre,
      'Email: ' + data.email,
      'Fecha de Feria: ' + data.fechaFeria,
      '',
      'Items:',
      detalle.replace(/ \| /g, '\n'),
      '',
      'Total: $' + total,
      'Abonó: $' + abono,
      'Saldo: $' + saldo,
      'Método de Pago: ' + data.metodoPago,
      'Estado: Pendiente',
      '',
      '---',
      'Sistema de Reservas SUCOVI'
    ].join('\n');

    const destinatarios = data.email + ',' + ADMIN_EMAIL;
    GmailApp.sendEmail(destinatarios, asunto, cuerpo);
  } catch (err) {
    // Si falla el email, la reserva ya se guardó
  }

  return { success: true, idReserva: idReserva };
}

function updatePrecios(precios) {
  const sheet = getSheet('Precios');
  sheet.clearContents();
  for (let i = 0; i < precios.length; i++) {
    sheet.appendRow([precios[i].key, precios[i].nombre, precios[i].precio]);
  }
  return { success: true };
}

function updateVendedores(vendedores) {
  const sheet = getSheet('Vendedores');
  sheet.clearContents();
  for (let i = 0; i < vendedores.length; i++) {
    sheet.appendRow([vendedores[i].nombre, vendedores[i].activo]);
  }
  return { success: true };
}

function updateFechasFeria(fechas) {
  const sheet = getSheet('FechasFeria');
  sheet.clearContents();
  for (let i = 0; i < fechas.length; i++) {
    sheet.appendRow([fechas[i].fecha, fechas[i].activa]);
  }
  return { success: true };
}
