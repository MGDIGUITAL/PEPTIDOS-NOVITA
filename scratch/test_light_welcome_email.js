require('dotenv').config({ path: 'd:/PEPTIDOS/.env' });
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

function buildLightWelcomeHtml(userName) {
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
<body style="margin:0;padding:0;min-width:100%;background-color:#EEEEEE;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#000000;">
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#EEEEEE" style="background-color:#EEEEEE;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        
        <!-- Canvas 9:16 Inmersivo de Alta Gama (max-width 480px) -->
        <table role="presentation" width="100%" style="max-width:480px;background-color:#FFFFFF;border:1px solid #E6E2D3;border-radius:18px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.08);" border="0" cellspacing="0" cellpadding="0">
          
          <!-- HEADER SUPERIOR CON IDENTIDAD DE MARCA -->
          <tr>
            <td style="padding:22px 24px;text-align:center;background-color:#000000;border-bottom:2px solid #E6E2D3;">
              <span style="font-family:Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:5px;color:#FFFFFF;text-transform:uppercase;display:block;">NOVA PERFORMANCE®</span>
              <span style="font-size:8.5px;letter-spacing:3px;color:#E6E2D3;text-transform:uppercase;margin-top:4px;display:block;">BIOTECHNOLOGY & SCIENTIFIC RESEARCH</span>
            </td>
          </tr>

          <!-- HERO GRAPHIC 9:16 (BIENVENIDO.PNG) -->
          <tr>
            <td style="padding:0;background-color:#FFFFFF;">
              <img src="cid:bienvenido_img" alt="¡Bienvenido a Nuestra Plataforma! — NOVA Performance" style="width:100%;height:auto;display:block;border:none;outline:none;" />
            </td>
          </tr>

          <!-- SECCIÓN DE BIENVENIDA PERSONALIZADA -->
          <tr>
            <td style="padding:32px 28px 36px;background-color:#FFFFFF;text-align:center;">
              
              <!-- INSIGNIA DE MEMBRESÍA MARFIL -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="background-color:#E6E2D3;border-radius:20px;padding:6px 18px;text-align:center;">
                    <span style="font-size:9.5px;font-weight:900;letter-spacing:2.5px;color:#000000;text-transform:uppercase;">✦ MIEMBRO REGISTRADO ✦</span>
                  </td>
                </tr>
              </table>

              <!-- SALUDO OFICIAL -->
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:900;letter-spacing:1px;color:#000000;text-transform:uppercase;line-height:1.25;">
                ¡HOLA, ${(userName || 'INVESTIGADOR').toUpperCase()}!
              </h1>
              
              <p style="margin:0 0 26px;font-size:13.5px;line-height:1.65;color:#444444;font-weight:400;">
                Gracias por unirte a <strong style="color:#000000;">NOVA Performance®</strong>. Tu cuenta ha sido activada en nuestra plataforma científica de vanguardia biotecnológica.
              </p>

              <!-- GRID DE CARACTERÍSTICAS CON ICONOS VECTORIALES LIMPIOS (SIN EMOJIS) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                <tr>
                  <td width="50%" style="padding:5px;vertical-align:top;">
                    <div style="background-color:#F8F7F3;border:1px solid #E6E2D3;border-radius:12px;padding:18px 12px;height:100%;box-sizing:border-box;text-align:center;">
                      <!-- Icono 1: Matraz / Pureza -->
                      <div style="margin-bottom:8px;display:inline-block;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 3H15M10 3V8.26L4.3 17.8C3.76 18.7 4.41 19.86 5.46 19.86H18.54C19.59 19.86 20.24 18.7 19.7 17.8L14 8.26V3" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7 14.5H17" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                      </div>
                      <div style="font-size:10.5px;font-weight:900;color:#000000;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:4px;">PUREZA >99%</div>
                      <div style="font-size:10.5px;color:#666666;line-height:1.4;">Compuestos analíticos con certificado HPLC.</div>
                    </div>
                  </td>
                  <td width="50%" style="padding:5px;vertical-align:top;">
                    <div style="background-color:#F8F7F3;border:1px solid #E6E2D3;border-radius:12px;padding:18px 12px;height:100%;box-sizing:border-box;text-align:center;">
                      <!-- Icono 2: Envío / Rayo -->
                      <div style="margin-bottom:8px;display:inline-block;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div style="font-size:10.5px;font-weight:900;color:#000000;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:4px;">DESPACHO EXPRÉS</div>
                      <div style="font-size:10.5px;color:#666666;line-height:1.4;">Envíos prioritarios a todo Chile en 24-48h.</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:5px;vertical-align:top;">
                    <div style="background-color:#F8F7F3;border:1px solid #E6E2D3;border-radius:12px;padding:18px 12px;height:100%;box-sizing:border-box;text-align:center;">
                      <!-- Icono 3: Escudo / Empaque Seguro -->
                      <div style="margin-bottom:8px;display:inline-block;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22S19 18 19 12V5L12 2L5 5V12C5 18 12 22 12 22Z" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M9 12L11 14L15 10" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div style="font-size:10.5px;font-weight:900;color:#000000;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:4px;">EMPAQUE SEGURO</div>
                      <div style="font-size:10.5px;color:#666666;line-height:1.4;">Despacho neutro y máxima confidencialidad.</div>
                    </div>
                  </td>
                  <td width="50%" style="padding:5px;vertical-align:top;">
                    <div style="background-color:#F8F7F3;border:1px solid #E6E2D3;border-radius:12px;padding:18px 12px;height:100%;box-sizing:border-box;text-align:center;">
                      <!-- Icono 4: Regalo / Envío Gratis -->
                      <div style="margin-bottom:8px;display:inline-block;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 12V22H4V12" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M22 7H2V12H22V7Z" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 7V22" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div style="font-size:10.5px;font-weight:900;color:#000000;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:4px;">ENVÍO GRATIS</div>
                      <div style="font-size:10.5px;color:#666666;line-height:1.4;">En compras de 2 o más productos.</div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- BOTÓN CTA PRINCIPAL EN NEGRO SÓLIDO (DISEÑO ALTA GAMA) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:22px;">
                <tr>
                  <td align="center">
                    <a href="https://novaperformance.cl" target="_blank" style="display:block;width:100%;padding:18px 0;background-color:#000000;color:#E6E2D3;font-family:Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:3px;text-decoration:none;text-transform:uppercase;border-radius:10px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.18);">
                      EXPLORAR CATÁLOGO EXCLUSIVO →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:11.5px;color:#666666;text-align:center;line-height:1.5;">
                ¿Dudas o requerimientos especiales? Escríbenos directamente a<br>
                <a href="mailto:Cnovoadrust@gmail.com" style="color:#000000;font-weight:700;text-decoration:underline;">Cnovoadrust@gmail.com</a>
              </p>

            </td>
          </tr>

          <!-- FOOTER CLARO Y PROFESIONAL -->
          <tr>
            <td style="padding:24px;text-align:center;background-color:#F4F4F0;border-top:1px solid #E6E2D3;">
              <span style="font-size:10px;letter-spacing:4px;color:#000000;text-transform:uppercase;font-weight:900;">NOVAPERFORMANCE.CL</span>
              <p style="margin:8px 0 0;font-size:10px;color:#777777;line-height:1.5;">
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

  console.log('Enviando correo claro/elegante (White & Ivory 9:16 con SVG icons) a', toEmail);
  await transporter.sendMail({
    from: `"NOVA Performance®" <${user}>`,
    to: toEmail,
    subject: 'Bienvenido a NOVA Performance®',
    html: buildLightWelcomeHtml('Vision Code'),
    attachments: [
      {
        filename: 'bienvenido.png',
        path: bienvenidoPath,
        cid: 'bienvenido_img'
      }
    ]
  });
  console.log('✓ Correo claro/elegante enviado exitosamente a', toEmail);
}

sendTest().catch(console.error);
