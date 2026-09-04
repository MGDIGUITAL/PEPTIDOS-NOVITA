require('dotenv').config();
const nodemailer = require('nodemailer');

function buildBoletaHtml(order, items) {
  const orderDate = new Date(order.created_at).toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const orderNum = String(order.order_number || order.id).padStart(5, '0');

  const deliveryType = order.delivery_method === 'domicilio'
    ? 'Despacho a Domicilio'
    : 'Retiro en Punto Blue Express';
  const deliveryAddress = order.delivery_method === 'domicilio'
    ? `${order.shipping_address}, ${order.shipping_comuna}, ${order.shipping_region}`
    : (order.pickup_point_name || '—');

  const itemsRows = items.map(item => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #222;vertical-align:top;">
        <span style="font-family:'Courier New',Courier,monospace;font-size:14px;color:#FFF;display:block;margin-bottom:3px;font-weight:bold;">${item.product_title}</span>
        ${item.size ? `<span style="font-size:11px;color:#888;">Especificación: ${item.size}</span>` : ''}
      </td>
      <td style="padding:14px 8px;border-bottom:1px solid #222;text-align:center;vertical-align:top;font-size:13px;color:#CCC;">${item.quantity}</td>
      <td style="padding:14px 0;border-bottom:1px solid #222;text-align:right;vertical-align:top;font-size:13px;color:#CCC;">$${item.price.toLocaleString('es-CL')} c/u</td>
      <td style="padding:14px 0;border-bottom:1px solid #222;text-align:right;vertical-align:top;font-size:14px;color:#FFF;font-weight:bold;">$${(item.price * item.quantity).toLocaleString('es-CL')}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comprobante de Compra #${orderNum} — NOVA Performance</title>
</head>
<body style="margin:0;padding:0;min-width:100%;background-color:#050505;font-family:Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#050505">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Contenedor principal -->
        <table role="presentation" width="100%" style="max-width:600px;background-color:#0A0A0A;border:1px solid #222;" border="0" cellspacing="0" cellpadding="0">

          <!-- ══ HERO / BANNER AGRADECIMIENTO ══ -->
          <tr>
            <td style="padding:50px 40px;text-align:center;background-image:linear-gradient(135deg, #0A0A0A 0%, #151515 100%);border-bottom:1px solid #333;">
              
              <h1 style="margin:0;font-size:42px;color:#FFF;font-family:Arial,sans-serif;font-weight:900;letter-spacing:2px;text-transform:uppercase;">NOVA<span style="font-size:14px;vertical-align:top;">®</span></h1>
              <p style="margin:4px 0 40px;font-size:11px;letter-spacing:6px;color:#888;text-transform:uppercase;">P E R F O R M A N C E</p>

              <h2 style="margin:0 0 25px;font-size:28px;color:#FFF;font-family:Arial,sans-serif;font-weight:900;letter-spacing:2px;text-transform:uppercase;line-height:1.2;">¡GRACIAS POR<br>TU COMPRA!</h2>
              
              <p style="margin:0 0 25px;font-size:11px;letter-spacing:5px;color:#AAA;text-transform:uppercase;border-top:1px solid #333;border-bottom:1px solid #333;padding:16px 0;display:inline-block;">BIENVENIDO A<br><span style="color:#FFF;font-weight:bold;margin-top:8px;display:block;letter-spacing:8px;">NOVA PERFORMANCE</span></p>

              <p style="margin:0;font-size:13px;color:#999;line-height:1.6;">Gracias por confiar en nosotros.<br>Tu compra ya es parte de <strong style="color:#FFF;">nuestra comunidad.</strong></p>
            </td>
          </tr>

          <!-- ══ BANDA DE CONFIRMACIÓN ══ -->
          <tr>
            <td style="background-color:#111;padding:14px 40px;border-bottom:1px solid #222;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-size:13px;color:#FFF;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Orden #${orderNum}</span>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="font-size:11px;color:#888;">${orderDate}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ CUERPO PRINCIPAL ══ -->
          <tr>
            <td style="padding:40px 40px 10px;">

              <!-- DATOS DEL CLIENTE -->
              <p style="margin:0 0 14px;font-size:10px;letter-spacing:3px;color:#888;text-transform:uppercase;border-bottom:1px solid #222;padding-bottom:10px;">Datos del Cliente</p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                <tr>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#666;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Nombre</span>
                    <span style="font-size:13px;color:#EEE;font-weight:bold;">${order.client_name}</span>
                  </td>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#666;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">R.U.T.</span>
                    <span style="font-size:13px;color:#EEE;">${order.client_rut}</span>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#666;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Correo</span>
                    <span style="font-size:13px;color:#EEE;">${order.client_email}</span>
                  </td>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#666;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Teléfono</span>
                    <span style="font-size:13px;color:#EEE;">${order.client_phone || '—'}</span>
                  </td>
                </tr>
              </table>

              <!-- ENTREGA -->
              <p style="margin:0 0 14px;font-size:10px;letter-spacing:3px;color:#888;text-transform:uppercase;border-bottom:1px solid #222;padding-bottom:10px;">Método de Entrega</p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:32px;background-color:#111;border-left:3px solid #555;">
                <tr>
                  <td style="padding:14px 18px;">
                    <span style="font-size:11px;color:#888;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${deliveryType}</span>
                    <span style="font-size:13px;color:#FFF;font-weight:bold;">${deliveryAddress}</span>
                  </td>
                </tr>
              </table>

              <!-- PRODUCTOS -->
              <p style="margin:0 0 14px;font-size:10px;letter-spacing:3px;color:#888;text-transform:uppercase;border-bottom:1px solid #222;padding-bottom:10px;">Detalle de Productos</p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:8px;">
                <thead>
                  <tr>
                    <th style="text-align:left;font-size:10px;letter-spacing:1.5px;color:#666;font-weight:normal;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #222;">Producto</th>
                    <th style="text-align:center;font-size:10px;letter-spacing:1.5px;color:#666;font-weight:normal;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #222;">Cant.</th>
                    <th style="text-align:right;font-size:10px;letter-spacing:1.5px;color:#666;font-weight:normal;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #222;">P. Unit.</th>
                    <th style="text-align:right;font-size:10px;letter-spacing:1.5px;color:#666;font-weight:normal;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #222;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- TOTALES -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:16px;margin-bottom:32px;">
                <tr>
                  <td style="width:40%;">&nbsp;</td>
                  <td style="width:60%;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:7px 0;font-size:13px;color:#888;border-bottom:1px solid #222;">Subtotal</td>
                        <td style="padding:7px 0;font-size:13px;color:#EEE;text-align:right;border-bottom:1px solid #222;">$${(order.subtotal || 0).toLocaleString('es-CL')} CLP</td>
                      </tr>
                      <tr>
                        <td style="padding:7px 0;font-size:13px;color:#888;border-bottom:1px solid #222;">Despacho</td>
                        <td style="padding:7px 0;font-size:13px;text-align:right;border-bottom:1px solid #222;color:${order.shipping_cost === 0 ? '#4CAF50' : '#EEE'};">
                          ${order.shipping_cost === 0 ? 'Sin costo' : `$${(order.shipping_cost || 0).toLocaleString('es-CL')} CLP`}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 0 0;font-size:13px;color:#FFF;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Total Pagado</td>
                        <td style="padding:14px 0 0;font-size:18px;color:#FFF;text-align:right;font-weight:bold;">$${(order.total || 0).toLocaleString('es-CL')} <span style="font-size:11px;font-weight:normal;color:#888;">CLP</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ══ NOTA INFORMATIVA ══ -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#111;border-left:2px solid #444;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
                      Tu pedido será gestionado a la brevedad. Para cualquier consulta sobre tu envío, por favor cita el número de orden
                      <strong style="color:#FFF;">#${orderNum}</strong> al correo
                      <a href="mailto:peptidosnovita@gmail.com" style="color:#EEE;text-decoration:underline;">peptidosnovita@gmail.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ PIE DE PÁGINA ══ -->
          <tr>
            <td style="background-color:#050505;padding:28px 40px;text-align:center;border-top:1px solid #222;">
              <p style="margin:0 0 10px;font-size:10px;letter-spacing:4px;color:#666;text-transform:uppercase;">novaperformance.cl</p>
              <p style="margin:0;font-size:10px;color:#555;">
                &copy; ${new Date().getFullYear()} NOVA Performance®. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
        <!-- Fin contenedor principal -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

const mockOrder = {
  id: 1054,
  created_at: new Date().toISOString(),
  client_name: "Cliente Prueba",
  client_rut: "19.222.333-4",
  client_email: "mpeg.logistica@gmail.com",
  client_phone: "+569 98765432",
  delivery_method: "domicilio",
  shipping_address: "Av. Las Condes 1234, Depto 50",
  shipping_comuna: "Las Condes",
  shipping_region: "Región Metropolitana",
  subtotal: 140000,
  shipping_cost: 0,
  total: 140000
};

const mockItems = [
  {
    product_title: "Retatrutide RT20",
    size: "20mg*1",
    quantity: 1,
    price: 140000
  }
];

async function sendTest() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  
  if (!user || !pass) {
    console.error("Faltan credenciales de Gmail en .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  const html = buildBoletaHtml(mockOrder, mockItems);

  try {
    await transporter.sendMail({
      from: `"NOVA Performance®" <${user}>`,
      to: "mpeg.logistica@gmail.com",
      bcc: "Christophernovoad@gmail.com",
      subject: "Comprobante de Compra #01054 — NOVA Performance® (PRUEBA)",
      html
    });
    console.log("Correo enviado a mpeg.logistica@gmail.com");
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
}

sendTest();
