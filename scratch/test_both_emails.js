require('dotenv').config({ path: 'd:/PEPTIDOS/.env' });
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// ─── 1. CORREO DE BIENVENIDA (SOLO BIENVENIDO.PNG — FORMATO 9:16 INMERSIVO) ─────
function buildWelcomeHtml(name) {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Nova Performance</title>
</head>
<body style="margin:0;padding:0;min-width:100%;background-color:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000000">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <!-- Canvas 9:16 Inmersivo (max-width 460px) -->
        <table role="presentation" width="100%" style="max-width:460px;background-color:#0A0A0A;border:1px solid #222222;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.9);" border="0" cellspacing="0" cellpadding="0">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="padding:22px 20px;text-align:center;background-color:#000000;border-bottom:1px solid #1A1A1A;">
              <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:4px;color:#FFFFFF;text-transform:uppercase;">NOVA PERFORMANCE®</span>
            </td>
          </tr>

          <!-- HERO IMAGE (BIENVENIDO 9:16) -->
          <tr>
            <td style="padding:0;background-color:#000000;">
              <img src="cid:bienvenido_img" alt="Bienvenido a Nova Performance" style="width:100%;height:auto;display:block;border:none;" />
            </td>
          </tr>

          <!-- CONTENIDO INMERSIVO -->
          <tr>
            <td style="padding:32px 28px 36px;text-align:center;background-color:#0A0A0A;">
              <p style="margin:0 0 10px;font-size:10px;letter-spacing:3px;color:#888888;text-transform:uppercase;font-weight:700;">BIENVENIDA OFICIAL</p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:900;letter-spacing:1px;color:#FFFFFF;text-transform:uppercase;line-height:1.25;">
                ¡HOLA, ${(name || 'INVESTIGADOR').toUpperCase()}!
              </h1>
              
              <p style="margin:0 0 22px;font-size:13.5px;line-height:1.65;color:#CCCCCC;font-weight:400;">
                Gracias por registrarte en <strong style="color:#FFFFFF;">NOVA Performance®</strong>.<br>
                Tu cuenta está activa. A partir de este momento tienes acceso preferencial a nuestro catálogo de compuestos de investigación biotecnológica de alta pureza.
              </p>

              <!-- CTA BUTTON -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:12px;margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="https://novaperformance.cl/auth/cliente" style="display:inline-block;width:84%;padding:16px 0;background-color:#FFFFFF;color:#000000;font-family:Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:2.5px;text-decoration:none;text-transform:uppercase;border-radius:8px;box-shadow:0 4px 20px rgba(255,255,255,0.15);">
                      ACCEDER A MI CUENTA →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:11px;color:#666666;line-height:1.5;">
                ¿Necesitas asistencia o cotizaciones personalizadas?<br>
                Escríbenos a <a href="mailto:Cnovoadrust@gmail.com" style="color:#888888;text-decoration:underline;">Cnovoadrust@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 24px;text-align:center;background-color:#050505;border-top:1px solid #1A1A1A;">
              <span style="font-size:10px;letter-spacing:3px;color:#555555;text-transform:uppercase;">novaperformance.cl</span><br>
              <span style="font-size:10px;color:#444444;margin-top:4px;display:block;">© ${new Date().getFullYear()} NOVA Performance®. Todos los derechos reservados.</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── 2. CORREO DE COMPROBANTE DE COMPRA (SOLO GRACIAS!.PNG — FORMATO 9:16) ─────
function buildPurchaseConfirmationHtml(order, items) {
  const orderNum = String(order.order_number || order.id).padStart(5, '0');
  const orderDate = new Date(order.created_at).toLocaleDateString('es-CL', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  const deliveryType = order.delivery_method === 'domicilio'
    ? 'Despacho a Domicilio'
    : 'Retiro en Punto Blue Express';
  const deliveryAddress = order.delivery_method === 'domicilio'
    ? `${order.shipping_address}, ${order.shipping_comuna}, ${order.shipping_region}`
    : (order.pickup_point_name || '—');

  const itemsRows = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #1E1E1E;vertical-align:top;">
        <span style="font-size:13px;color:#FFFFFF;display:block;font-weight:700;">${item.product_title}</span>
        ${item.size ? `<span style="font-size:11px;color:#888888;display:block;margin-top:2px;">Especificación: ${item.size}</span>` : ''}
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #1E1E1E;text-align:center;vertical-align:top;font-size:12px;color:#CCCCCC;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #1E1E1E;text-align:right;vertical-align:top;font-size:13px;color:#FFFFFF;font-weight:700;">$${(item.price * item.quantity).toLocaleString('es-CL')}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comprobante de Compra #${orderNum} — NOVA Performance</title>
</head>
<body style="margin:0;padding:0;min-width:100%;background-color:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000000">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <!-- Canvas 9:16 Inmersivo (max-width 460px) -->
        <table role="presentation" width="100%" style="max-width:460px;background-color:#0A0A0A;border:1px solid #222222;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.9);" border="0" cellspacing="0" cellpadding="0">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="padding:22px 20px;text-align:center;background-color:#000000;border-bottom:1px solid #1A1A1A;">
              <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:4px;color:#FFFFFF;text-transform:uppercase;">NOVA PERFORMANCE®</span>
            </td>
          </tr>

          <!-- HERO IMAGE (GRACIAS 9:16) -->
          <tr>
            <td style="padding:0;background-color:#000000;">
              <img src="cid:gracias_img" alt="¡Gracias por tu compra!" style="width:100%;height:auto;display:block;border:none;" />
            </td>
          </tr>

          <!-- BANDA DE ORDEN -->
          <tr>
            <td style="background-color:#111111;padding:16px 24px;border-bottom:1px solid #222222;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size:10px;color:#888888;display:block;letter-spacing:2px;text-transform:uppercase;">NÚMERO DE ORDEN</span>
                    <span style="font-size:16px;color:#FFFFFF;font-weight:900;letter-spacing:1px;">ORDEN #${orderNum}</span>
                  </td>
                  <td style="text-align:right;">
                    <span style="font-size:11px;color:#AAAAAA;">${orderDate}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DETALLE COMPLETO -->
          <tr>
            <td style="padding:28px 24px;">

              <!-- DATOS CLIENTE -->
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:2.5px;color:#888888;text-transform:uppercase;font-weight:700;border-bottom:1px solid #1E1E1E;padding-bottom:8px;">DATOS DEL CLIENTE</p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" style="padding:4px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#666666;display:block;text-transform:uppercase;">Nombre</span>
                    <span style="font-size:12.5px;color:#FFFFFF;font-weight:700;">${order.client_name}</span>
                  </td>
                  <td width="50%" style="padding:4px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#666666;display:block;text-transform:uppercase;">R.U.T.</span>
                    <span style="font-size:12.5px;color:#DDDDDD;">${order.client_rut || '—'}</span>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:4px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#666666;display:block;text-transform:uppercase;">Correo</span>
                    <span style="font-size:12.5px;color:#DDDDDD;">${order.client_email}</span>
                  </td>
                  <td width="50%" style="padding:4px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#666666;display:block;text-transform:uppercase;">Teléfono</span>
                    <span style="font-size:12.5px;color:#DDDDDD;">${order.client_phone || '—'}</span>
                  </td>
                </tr>
              </table>

              <!-- MÉTODO DE DESPACHO -->
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:2.5px;color:#888888;text-transform:uppercase;font-weight:700;border-bottom:1px solid #1E1E1E;padding-bottom:8px;">DESPACHO Y ENTREGA</p>
              <div style="background-color:#121212;border:1px solid #222222;border-radius:8px;padding:14px 16px;margin-bottom:24px;">
                <span style="font-size:10px;color:#888888;display:block;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">${deliveryType}</span>
                <span style="font-size:12.5px;color:#FFFFFF;font-weight:700;line-height:1.4;">${deliveryAddress}</span>
              </div>

              <!-- RESUMEN DE PRODUCTOS -->
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:2.5px;color:#888888;text-transform:uppercase;font-weight:700;border-bottom:1px solid #1E1E1E;padding-bottom:8px;">RESUMEN DE PRODUCTOS</p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
                <thead>
                  <tr>
                    <th style="text-align:left;font-size:10px;letter-spacing:1px;color:#666666;font-weight:normal;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid #1E1E1E;">Producto</th>
                    <th style="text-align:center;font-size:10px;letter-spacing:1px;color:#666666;font-weight:normal;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid #1E1E1E;">Cant.</th>
                    <th style="text-align:right;font-size:10px;letter-spacing:1px;color:#666666;font-weight:normal;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid #1E1E1E;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- TOTALES -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#121212;border:1px solid #222222;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
                <tr>
                  <td style="font-size:12px;color:#888888;padding-bottom:6px;">Subtotal</td>
                  <td style="font-size:12px;color:#DDDDDD;text-align:right;padding-bottom:6px;">$${(order.subtotal || 0).toLocaleString('es-CL')} CLP</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#888888;padding-bottom:10px;border-bottom:1px solid #222222;">Despacho</td>
                  <td style="font-size:12px;text-align:right;padding-bottom:10px;border-bottom:1px solid #222222;color:${order.shipping_cost === 0 ? '#4CAF50' : '#DDDDDD'};">
                    ${order.shipping_cost === 0 ? 'Sin costo (Gratis)' : `$${(order.shipping_cost || 0).toLocaleString('es-CL')} CLP`}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#FFFFFF;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding-top:10px;">TOTAL PAGADO</td>
                  <td style="font-size:16px;color:#FFFFFF;text-align:right;font-weight:900;padding-top:10px;">$${(order.total || 0).toLocaleString('es-CL')} CLP</td>
                </tr>
              </table>

              <p style="margin:0;font-size:11px;color:#666666;line-height:1.5;text-align:center;">
                Tu orden está siendo empaquetada con empaque neutro y discreto de alta seguridad.<br>
                Consultas: <a href="mailto:Cnovoadrust@gmail.com" style="color:#888888;text-decoration:underline;">Cnovoadrust@gmail.com</a>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 24px;text-align:center;background-color:#050505;border-top:1px solid #1A1A1A;">
              <span style="font-size:10px;letter-spacing:3px;color:#555555;text-transform:uppercase;">novaperformance.cl</span><br>
              <span style="font-size:10px;color:#444444;margin-top:4px;display:block;">© ${new Date().getFullYear()} NOVA Performance®. Todos los derechos reservados.</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendBothTestEmails() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  const toEmail = 'vision.code.vs@gmail.com';

  if (!user || !pass) {
    console.error('Faltan credenciales de Gmail');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  const bienvenidoPath = path.join(__dirname, '../public/correo/bienvenido.png');
  const graciasPath    = path.join(__dirname, '../public/correo/gracias.png');

  // 1. Enviar Correo de Bienvenida (SOLO BIENVENIDO.PNG)
  console.log('Enviando Correo 1: Bienvenida...');
  await transporter.sendMail({
    from: `"NOVA Performance" <${user}>`,
    to: toEmail,
    subject: 'Bienvenido a Nova Performance',
    html: buildWelcomeHtml('Vision Code'),
    attachments: [
      {
        filename: 'bienvenido.png',
        path: bienvenidoPath,
        cid: 'bienvenido_img'
      }
    ]
  });
  console.log('✓ Correo de Bienvenida enviado exitosamente a', toEmail);

  // 2. Enviar Correo de Comprobante de Compra (SOLO GRACIAS!.PNG)
  console.log('Enviando Correo 2: Comprobante de Compra...');
  const mockOrder = {
    id: 1054,
    order_number: 1054,
    created_at: new Date().toISOString(),
    client_name: 'Vision Code',
    client_rut: '19.876.543-2',
    client_email: toEmail,
    client_phone: '+56 9 8765 4321',
    delivery_method: 'domicilio',
    shipping_address: 'Av. Andrés Bello 2457, Depto 1202',
    shipping_comuna: 'Providencia',
    shipping_region: 'Región Metropolitana',
    subtotal: 140000,
    shipping_cost: 0,
    total: 140000
  };

  const mockItems = [
    { product_title: 'Retatrutide RT20', size: '20mg * 1 frasco', quantity: 1, price: 140000 }
  ];

  await transporter.sendMail({
    from: `"NOVA Performance®" <${user}>`,
    to: toEmail,
    subject: 'Comprobante de Compra #01054 — NOVA Performance®',
    html: buildPurchaseConfirmationHtml(mockOrder, mockItems),
    attachments: [
      {
        filename: 'gracias.png',
        path: graciasPath,
        cid: 'gracias_img'
      }
    ]
  });
  console.log('✓ Correo de Comprobante de Compra enviado exitosamente a', toEmail);
}

sendBothTestEmails().catch(console.error);
