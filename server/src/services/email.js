const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const logoPath = path.join(__dirname, '..', '..', '..', 'client', 'public', 'logoSUCOVI.jpeg');

async function sendReservaEmail({ email, nombre, vendedor, fechaFeria, detalle, total, abono, saldo, metodoPago, idReserva }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 16px;">
        <img src="cid:logoSUCOVI" alt="SUCOVI" style="width: 100px; height: 100px; object-fit: contain;" />
      </div>
      <h2 style="color: #009246; text-align: center;">Reserva Confirmada</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Tu reserva para la feria <strong>${fechaFeria}</strong> ha sido registrada exitosamente.</p>
      <div style="background: #f8f8f8; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 4px;"><strong>ID Reserva:</strong> ${idReserva}</p>
        <p style="margin: 0 0 4px;"><strong>Vendedor:</strong> ${vendedor}</p>
        <p style="margin: 0 0 4px;"><strong>Fecha de Feria:</strong> ${fechaFeria}</p>
      </div>
      <div style="background: #f8f8f8; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 8px;"><strong>Detalle:</strong></p>
        ${detalle.split(' | ').map(item => `<p style="margin: 0 0 4px;">• ${item}</p>`).join('')}
      </div>
      <div style="background: #e8f5e9; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
        <p style="margin: 0 0 4px; font-size: 18px;"><strong>Total:</strong> $${total}</p>
        <p style="margin: 0 0 4px;"><strong>Abonó:</strong> $${abono} (${metodoPago})</p>
        <p style="margin: 0; color: #ce2b37;"><strong>Saldo:</strong> $${saldo}</p>
      </div>
      <p style="color: #888; font-size: 13px; text-align: center;">Sistema de Reservas - Feria SUCOVI</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: `${email}, ${process.env.SMTP_FROM}`,
      subject: `Reserva ${idReserva} - ${nombre} - Feria ${fechaFeria}`,
      html,
      attachments: [{ filename: 'logoSUCOVI.jpeg', path: logoPath, cid: 'logoSUCOVI' }],
    });
    console.log(`[EMAIL] Enviado a ${email}`);
  } catch (err) {
    console.error(`[EMAIL] Error enviando a ${email}:`, err.message);
  }
}

module.exports = { sendReservaEmail };
