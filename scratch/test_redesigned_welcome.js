require('dotenv').config({ path: 'd:/PEPTIDOS/.env' });
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

function buildRedesignedWelcomeHtml(userName) {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a NOVA Performance®</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;min-width:100%;background-color:#050505;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#FFFFFF;">
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#050505" style="background-color:#050505;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        
        <!-- Contenedor Principal (Ancho óptimo 480px) -->
        <table role="presentation" width="100%" style="max-width:480px;background-color:#0D0D0D;border:1px solid #222222;border-radius:20px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.95);" border="0" cellspacing="0" cellpadding="0">
          
          <!-- TOP HEADER BRAND -->
          <tr>
            <td style="padding:20px 24px;text-align:center;background-color:#000000;border-bottom:1px solid #1F1F1F;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:900;letter-spacing:5px;color:#E6E2D3;text-transform:uppercase;display:block;">NOVA PERFORMANCE®</span>
                    <span style="font-size:9px;letter-spacing:3px;color:#666666;text-transform:uppercase;margin-top:3px;display:block;">BIOTECHNOLOGY & SCIENTIFIC RESEARCH</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO GRAPHIC (BIENVENIDO 9:16) -->
          <tr>
            <td style="padding:0;background-color:#000000;">
              <img src="cid:bienvenido_img" alt="¡Bienvenido a Nuestra Plataforma! — NOVA Performance" style="width:100%;height:auto;display:block;border:none;outline:none;" />
            </td>
          </tr>

          <!-- TARJETA VIP DE BIENVENIDA -->
          <tr>
            <td style="padding:32px 28px;background:linear-gradient(180deg, #0A0A0A 0%, #111111 100%);">
              
              <!-- BADGE VIP -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="background-color:#1A1813;border:1px solid #C4BFA9;border-radius:20px;padding:6px 16px;text-align:center;">
                    <span style="font-size:10px;font-weight:800;letter-spacing:2.5px;color:#E6E2D3;text-transform:uppercase;">✦ MIEMBRO REGISTRADO ✦</span>
                  </td>
                </tr>
              </table>

              <!-- SALUDO PERSONALIZADO -->
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:900;letter-spacing:1px;color:#FFFFFF;text-align:center;text-transform:uppercase;line-height:1.2;">
                ¡HOLA, <span style="color:#E6E2D3;">${(userName || 'INVESTIGADOR').toUpperCase()}</span>!
              </h1>
              
              <p style="margin:0 0 24px;font-size:13.5px;line-height:1.65;color:#BBBBBB;text-align:center;">
                Gracias por unirte a <strong style="color:#FFFFFF;">NOVA Performance®</strong>. Tu cuenta ha sido activada correctamente en nuestra plataforma de vanguardia biotecnológica.
              </p>

              <!-- GRID DE BENEFICIOS DE LA PLATAFORMA -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                <tr>
                  <td width="50%" style="padding:5px;vertical-align:top;">
                    <div style="background-color:#141414;border:1px solid #222222;border-radius:10px;padding:16px 12px;height:100%;box-sizing:border-box;text-align:center;">
                      <div style="font-size:18px;margin-bottom:6px;">🧪</div>
                      <div style="font-size:10.5px;font-weight:800;color:#FFFFFF;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">PUREZA >99%</div>
                      <div style="font-size:10.5px;color:#888888;line-height:1.4;">Compuestos analíticos con certificado HPLC.</div>
                    </div>
                  </td>
                  <td width="50%" style="padding:5px;vertical-align:top;">
                    <div style="background-color:#141414;border:1px solid #222222;border-radius:10px;padding:16px 12px;height:100%;box-sizing:border-box;text-align:center;">
                      <div style="font-size:18px;margin-bottom:6px;">⚡</div>
                      <div style="font-size:10.5px;font-weight:800;color:#FFFFFF;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">DESPACHO EXPRÉS</div>
                      <div style="font-size:10.5px;color:#888888;line-height:1.4;">Envíos prioritarios a todo Chile en 24-48h.</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:5px;vertical-align:top;">
                    <div style="background-color:#141414;border:1px solid #222222;border-radius:10px;padding:16px 12px;height:100%;box-sizing:border-box;text-align:center;">
                      <div style="font-size:18px;margin-bottom:6px;">🔒</div>
                      <div style="font-size:10.5px;font-weight:800;color:#FFFFFF;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">EMPAQUE SEGURO</div>
                      <div style="font-size:10.5px;color:#888888;line-height:1.4;">Despacho neutro y máxima confidencialidad.</div>
                    </div>
                  </td>
                  <td width="50%" style="padding:5px;vertical-align:top;">
                    <div style="background-color:#141414;border:1px solid #222222;border-radius:10px;padding:16px 12px;height:100%;box-sizing:border-box;text-align:center;">
                      <div style="font-size:18px;margin-bottom:6px;">🎁</div>
                      <div style="font-size:10.5px;font-weight:800;color:#FFFFFF;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">ENVÍO GRATIS</div>
                      <div style="font-size:10.5px;color:#888888;line-height:1.4;">En compras de 2 o más productos.</div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- BOTÓN CTA PRINCIPAL ELEGANTE -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="https://novaperformance.cl" target="_blank" style="display:block;width:100%;padding:18px 0;background:linear-gradient(135deg, #FFFFFF 0%, #E6E2D3 100%);color:#000000;font-family:Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:3px;text-decoration:none;text-transform:uppercase;border-radius:10px;text-align:center;box-shadow:0 6px 24px rgba(230,226,211,0.25);">
                      EXPLORAR CATÁLOGO EXCLUSIVO →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:11.5px;color:#777777;text-align:center;line-height:1.5;">
                ¿Dudas o requerimientos especiales? Escríbenos directamente a<br>
                <a href="mailto:Cnovoadrust@gmail.com" style="color:#E6E2D3;text-decoration:underline;">Cnovoadrust@gmail.com</a>
              </p>

            </td>
          </tr>

          <!-- FOOTER PREMIUM -->
          <tr>
            <td style="padding:24px;text-align:center;background-color:#050505;border-top:1px solid #1F1F1F;">
              <span style="font-size:10px;letter-spacing:4px;color:#888888;text-transform:uppercase;font-weight:700;">NOVAPERFORMANCE.CL</span>
              <p style="margin:8px 0 0;font-size:10px;color:#555555;line-height:1.5;">
                Compuestos de Investigación Biotecnológica de Alta Pureza.<br>
                © ${new Date().getFullYear()} NOVA Performance®. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendTest() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  const toEmail = 'vision.code.vs@gmail.com';

  if (!user || !pass) {
    console.error('Faltan credenciales');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  const bienvenidoPath = path.join(__dirname, '../public/correo/bienvenido.png');

  console.log('Enviando correo rediseñado de bienvenida a', toEmail);
  await transporter.sendMail({
    from: `"NOVA Performance®" <${user}>`,
    to: toEmail,
    subject: 'Bienvenido a NOVA Performance®',
    html: buildRedesignedWelcomeHtml('Vision Code'),
    attachments: [
      {
        filename: 'bienvenido.png',
        path: bienvenidoPath,
        cid: 'bienvenido_img'
      }
    ]
  });
  console.log('✓ Correo de bienvenida rediseñado enviado exitosamente a', toEmail);
}

sendTest().catch(console.error);
