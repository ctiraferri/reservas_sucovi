// Google Apps Script - Mirror de reservas desde el backend Node.js
// Solo recibe datos y los escribe en el Sheet
const SHEET_ID = '1HtbsVW0f5YsXcaGwUe4fQYxM7_DeKjeQlAhOw0jjQ-Q';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'mirrorReserva') {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Reservas');
    sheet.appendRow([
      data.timestamp,
      data.idReserva,
      data.vendedor,
      data.nombre,
      data.email,
      data.fechaFeria,
      data.detalle,
      data.total,
      data.abono,
      data.saldo,
      data.metodoPago,
      data.estado
    ]);
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Acción no válida' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput('Reservas SUCOVI - Mirror activo')
    .setMimeType(ContentService.MimeType.TEXT);
}
