require('dotenv').config({ path: 'd:/PEPTIDOS/.env' });
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

async function main() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  console.log('GMAIL_USER:', user);
  console.log('GMAIL_PASS:', pass ? '***' : 'NOT SET');

  if (!user || !pass) {
    console.error('Error: Credenciales de Gmail no encontradas.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  const bienvenidoPath = path.join(__dirname, '../public/correo/bienvenido.png');
  const graciasPath    = path.join(__dirname, '../public/correo/gracias.png');

  console.log('Bienvenido path exists:', fs.existsSync(bienvenidoPath));
  console.log('Gracias path exists:', fs.existsSync(graciasPath));

  const userName = 'Vision Code';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Nova Performance</title>
  <style>
    body { margin: 0; padding: 0; background-color: #050505; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FFFFFF; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid #222222; border-radius: 12px; overflow: hidden; }
    .header { text-align: center; padding: 28px 20px; background-color: #000000; border-bottom: 1px solid #222222; }
    .header h2 { margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 3px; color: #FFFFFF; text-transform: uppercase; }
    .banner-img { width: 100%; height: auto; display: block; }
    .content { padding: 36px 30px; text-align: center; color: #CCCCCC; }
    h1 { font-size: 22px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 16px; color: #FFFFFF; }
    p { font-size: 14.5px; line-height: 1.7; color: #AAAAAA; margin: 0 0 20px; }
    .gracias-img { width: 100%; height: auto; display: block; margin: 24px 0; border-radius: 8px; }
    .btn { display: inline-block; padding: 14px 28px; background-color: #FFFFFF; color: #000000; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 6px; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 10px; }
    .footer { text-align: center; padding: 24px; font-size: 11px; color: #666666; border-top: 1px solid #222222; background-color: #050505; letter-spacing: 1px; }
  </style>
</head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#050505">
    <tr>
      <td align="center" style="padding: 30px 15px;">
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h2>NOVA PERFORMANCE®</h2>
          </div>

          <!-- Imagen 1: Bienvenido -->
          <img src="cid:bienvenido_img" alt="Bienvenido a Nova Performance" class="banner-img" />

          <!-- Contenido -->
          <div class="content">
            <h1>¡Bienvenido(a), ${userName}!</h1>
            <p>Muchas gracias por registrarte en <strong>NOVA Performance®</strong>.</p>
            <p>Tu cuenta ha sido creada con éxito. A partir de ahora tienes acceso a nuestro catálogo exclusivo de compuestos de vanguardia biotecnológica y alta pureza para investigación científica.</p>

            <!-- Imagen 2: Gracias -->
            <img src="cid:gracias_img" alt="¡Gracias por preferirnos!" class="gracias-img" />

            <p style="font-size: 13px; color: #888888;">
              Puedes acceder a tu panel de cliente en cualquier momento para revisar tus órdenes y gestionar tu perfil.
            </p>

            <a href="https://novaperformance.cl/auth/cliente" class="btn">Ir a mi Cuenta</a>
          </div>

          <!-- Footer -->
          <div class="footer">
            © ${new Date().getFullYear()} NOVA Performance® · Todos los derechos reservados.<br>Chile
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const info = await transporter.sendMail({
      from: '"NOVA Performance" <' + user + '>',
      to: 'vision.code.vs@gmail.com',
      subject: 'Bienvenido a Nova Performance',
      html,
      attachments: [
        {
          filename: 'bienvenido.png',
          path: bienvenidoPath,
          cid: 'bienvenido_img'
        },
        {
          filename: 'gracias.png',
          path: graciasPath,
          cid: 'gracias_img'
        }
      ]
    });

    console.log('SUCCESS! Email enviado correctamente:', info.messageId);
  } catch (err) {
    console.error('ERROR enviando correo:', err);
  }
}

main();
