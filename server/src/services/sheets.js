// Mirror de reservas a Google Sheets (fire-and-forget)
async function syncToSheet(reservaData) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mirrorReserva',
        ...reservaData,
      }),
    });
    console.log('[SHEETS] Sincronizado');
  } catch (err) {
    console.error('[SHEETS] Error sincronizando:', err.message);
  }
}

module.exports = { syncToSheet };
