import { NextResponse } from 'next/server';
import { getFlowPaymentStatus } from '@/lib/flow';
import { supabaseAdmin } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';

// ─── Logo URL alojado en Supabase Storage (accesible desde email) ─────────────
const LOGO_URL = 'https://qrhspijmfimjxemravyz.supabase.co/storage/v1/object/public/email-assets/Amora_Jewelry_logo_header_480x114.png';

// ─── HTML de la Boleta / Comprobante de Compra ────────────────────────────────
function buildBoletaHtml(order: any, items: any[]) {
  const orderDate = new Date(order.created_at).toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const orderNum = String(order.id).padStart(5, '0');

  const deliveryType = order.delivery_method === 'domicilio'
    ? 'Despacho a Domicilio'
    : 'Retiro en Punto Blue Express';
  const deliveryAddress = order.delivery_method === 'domicilio'
    ? `${order.shipping_address}, ${order.shipping_comuna}, ${order.shipping_region}`
    : (order.pickup_point_name || '—');

  const itemsRows = items.map(item => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #F3F0E9;vertical-align:top;">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#101010;display:block;margin-bottom:3px;">${item.product_title}</span>
        ${item.size ? `<span style="font-size:11px;color:#7A7468;">Talla: ${item.size}</span>` : ''}
      </td>
      <td style="padding:14px 8px;border-bottom:1px solid #F3F0E9;text-align:center;vertical-align:top;font-size:13px;color:#7A7468;">${item.quantity}</td>
      <td style="padding:14px 0;border-bottom:1px solid #F3F0E9;text-align:right;vertical-align:top;font-size:13px;color:#7A7468;">$${item.price.toLocaleString('es-CL')} c/u</td>
      <td style="padding:14px 0;border-bottom:1px solid #F3F0E9;text-align:right;vertical-align:top;font-size:14px;color:#101010;font-weight:600;">$${(item.price * item.quantity).toLocaleString('es-CL')}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Comprobante de Compra #${orderNum} — Amora Jewelry</title>
</head>
<body style="margin:0;padding:0;min-width:100%;background-color:#F3F0E9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F3F0E9">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Contenedor principal -->
        <table role="presentation" width="100%" style="max-width:600px;" border="0" cellspacing="0" cellpadding="0">

          <!-- ══ CABECERA — Logo + Número de orden ══ -->
          <tr>
            <td style="background-color:#101010;padding:32px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${LOGO_URL}" alt="Amora Jewelry" width="160" height="auto"
                         style="display:block;border:0;outline:none;text-decoration:none;max-width:160px;filter:brightness(0) invert(1);" />
                  </td>
                  <td style="vertical-align:middle;text-align:right;">
                    <p style="margin:0;font-size:10px;letter-spacing:3px;color:#C8BBA8;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Comprobante</p>
                    <p style="margin:6px 0 0;font-size:22px;color:#B8975A;font-family:Georgia,'Times New Roman',serif;letter-spacing:1px;">#${orderNum}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#7A7468;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${orderDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ BANDA DE CONFIRMACIÓN ══ -->
          <tr>
            <td style="background-color:#F0FAF0;border-top:3px solid #4CAF50;padding:14px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <!-- Checkmark SVG inline -->
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="display:inline-table;vertical-align:middle;">
                      <tr>
                        <td style="width:22px;height:22px;border-radius:50%;background-color:#4CAF50;text-align:center;vertical-align:middle;padding:4px;">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Eo_circle_green_white_checkmark.svg/32px-Eo_circle_green_white_checkmark.svg.png" width="14" height="14" alt="OK" style="display:block;border:0;" />
                        </td>
                      </tr>
                    </table>
                    <span style="font-size:13px;color:#2E7D32;font-weight:700;margin-left:10px;vertical-align:middle;">Pago Procesado Correctamente</span>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="font-size:11px;color:#4CAF50;font-weight:500;">Flow · Webpay Plus</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ CUERPO PRINCIPAL ══ -->
          <tr>
            <td style="background-color:#FDFCF8;padding:40px 40px 0;">

              <!-- Saludo -->
              <p style="margin:0 0 8px;font-size:22px;color:#101010;font-family:Georgia,'Times New Roman',serif;font-weight:normal;letter-spacing:0.5px;">
                Estimada/o ${order.client_name.split(' ')[0]},
              </p>
              <p style="margin:0 0 32px;font-size:14px;color:#7A7468;line-height:1.8;">
                Hemos recibido tu pedido y está siendo preparado con el mayor cuidado.<br>
                A continuación encontrarás el detalle completo de tu compra.
              </p>

              <!-- Línea decorativa -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                <tr>
                  <td style="height:1px;background-color:#E3DBCC;line-height:1px;font-size:1px;">&nbsp;</td>
                  <td width="10" style="text-align:center;color:#B8975A;font-size:10px;padding:0 8px;">&#9670;</td>
                  <td style="height:1px;background-color:#E3DBCC;line-height:1px;font-size:1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- DATOS DEL CLIENTE -->
              <p style="margin:0 0 14px;font-size:10px;letter-spacing:3px;color:#7A7468;text-transform:uppercase;border-bottom:1px solid #E3DBCC;padding-bottom:10px;">Datos del Cliente</p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                <tr>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#C8BBA8;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Nombre</span>
                    <span style="font-size:13px;color:#101010;font-weight:500;">${order.client_name}</span>
                  </td>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#C8BBA8;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">R.U.T.</span>
                    <span style="font-size:13px;color:#101010;">${order.client_rut}</span>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#C8BBA8;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Correo</span>
                    <span style="font-size:13px;color:#101010;">${order.client_email}</span>
                  </td>
                  <td width="50%" style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#C8BBA8;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">Teléfono</span>
                    <span style="font-size:13px;color:#101010;">${order.client_phone || '—'}</span>
                  </td>
                </tr>
              </table>

              <!-- ENTREGA -->
              <p style="margin:0 0 14px;font-size:10px;letter-spacing:3px;color:#7A7468;text-transform:uppercase;border-bottom:1px solid #E3DBCC;padding-bottom:10px;">Método de Entrega</p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:32px;background-color:#F3F0E9;border-left:3px solid #B8975A;">
                <tr>
                  <td style="padding:14px 18px;">
                    <span style="font-size:11px;color:#7A7468;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${deliveryType}</span>
                    <span style="font-size:13px;color:#101010;font-weight:500;">${deliveryAddress}</span>
                  </td>
                </tr>
              </table>

              <!-- PRODUCTOS -->
              <p style="margin:0 0 14px;font-size:10px;letter-spacing:3px;color:#7A7468;text-transform:uppercase;border-bottom:1px solid #E3DBCC;padding-bottom:10px;">Detalle de Productos</p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:8px;">
                <thead>
                  <tr>
                    <th style="text-align:left;font-size:10px;letter-spacing:1.5px;color:#C8BBA8;font-weight:400;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #E3DBCC;">Producto</th>
                    <th style="text-align:center;font-size:10px;letter-spacing:1.5px;color:#C8BBA8;font-weight:400;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #E3DBCC;">Cant.</th>
                    <th style="text-align:right;font-size:10px;letter-spacing:1.5px;color:#C8BBA8;font-weight:400;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #E3DBCC;">P. Unit.</th>
                    <th style="text-align:right;font-size:10px;letter-spacing:1.5px;color:#C8BBA8;font-weight:400;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #E3DBCC;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- TOTALES -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:16px;margin-bottom:32px;">
                <tr>
                  <td style="width:55%;">&nbsp;</td>
                  <td style="width:45%;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:7px 0;font-size:13px;color:#7A7468;border-bottom:1px solid #F3F0E9;">Subtotal</td>
                        <td style="padding:7px 0;font-size:13px;color:#101010;text-align:right;border-bottom:1px solid #F3F0E9;">$${(order.subtotal || 0).toLocaleString('es-CL')} CLP</td>
                      </tr>
                      <tr>
                        <td style="padding:7px 0;font-size:13px;color:#7A7468;border-bottom:1px solid #F3F0E9;">Despacho</td>
                        <td style="padding:7px 0;font-size:13px;text-align:right;border-bottom:1px solid #F3F0E9;color:${order.shipping_cost === 0 ? '#2E7D32' : '#101010'};font-weight:${order.shipping_cost === 0 ? '600' : '400'};">
                          ${order.shipping_cost === 0 ? 'Sin costo' : `$${(order.shipping_cost || 0).toLocaleString('es-CL')} CLP`}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 0 0;font-size:13px;color:#101010;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Total Pagado</td>
                        <td style="padding:14px 0 0;font-size:18px;color:#101010;text-align:right;font-family:Georgia,'Times New Roman',serif;font-weight:bold;">$${(order.total || 0).toLocaleString('es-CL')} <span style="font-size:11px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:400;">CLP</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ══ NOTA INFORMATIVA ══ -->
          <tr>
            <td style="background-color:#FDFCF8;padding:0 40px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F3F0E9;border-left:2px solid #B8975A;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:12px;color:#7A7468;line-height:1.8;">
                      Tu pedido será gestionado y despachado a la brevedad. Para cualquier consulta sobre el estado de tu envío, por favor cita el número de orden
                      <strong style="color:#101010;">#${orderNum}</strong> al correo
                      <a href="mailto:amorajewelrychile@gmail.com" style="color:#B8975A;text-decoration:none;">amorajewelrychile@gmail.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ SEPARADOR ══ -->
          <tr>
            <td style="background-color:#FDFCF8;padding:0 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="height:1px;background-color:#E3DBCC;line-height:1px;font-size:1px;">&nbsp;</td>
                  <td width="10" style="text-align:center;color:#B8975A;font-size:10px;padding:0 8px;">&#9670;</td>
                  <td style="height:1px;background-color:#E3DBCC;line-height:1px;font-size:1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ PIE DE PÁGINA ══ -->
          <tr>
            <td style="background-color:#101010;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:16px;letter-spacing:5px;color:#FDFCF8;font-family:Georgia,'Times New Roman',serif;">AMORA</p>
              <p style="margin:0 0 14px;font-size:9px;letter-spacing:4px;color:#7A7468;text-transform:uppercase;">Tu Historia · Tu Brillo · Tu Amora</p>
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 12px;">
                    <a href="https://amorajewelry.cl" style="font-size:11px;color:#C8BBA8;text-decoration:none;letter-spacing:1px;">amorajewelry.cl</a>
                  </td>
                  <td style="color:#7A7468;font-size:11px;">|</td>
                  <td style="padding:0 12px;">
                    <a href="https://www.instagram.com/amorajewelrychile/" style="font-size:11px;color:#C8BBA8;text-decoration:none;letter-spacing:1px;">@amorajewelrychile</a>
                  </td>
                  <td style="color:#7A7468;font-size:11px;">|</td>
                  <td style="padding:0 12px;">
                    <a href="mailto:amorajewelrychile@gmail.com" style="font-size:11px;color:#C8BBA8;text-decoration:none;letter-spacing:1px;">amorajewelrychile@gmail.com</a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:10px;color:#7A7468;">
                &copy; ${new Date().getFullYear()} Amora Jewelry Chile. Todos los derechos reservados.
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

// ─── Webhook principal ─────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;

    if (!token) {
      return NextResponse.json({ error: 'Token no provisto' }, { status: 400 });
    }

    // 1. Verificar estado del pago con Flow
    const paymentStatus = await getFlowPaymentStatus(token);
    const orderId = paymentStatus.commerceOrder;

    let newStatus = 'Pendiente';
    if (paymentStatus.status === 2) newStatus = 'Pagado';
    else if (paymentStatus.status === 3 || paymentStatus.status === 4) newStatus = 'Cancelado';

    // 2. Actualizar orden en Supabase
    await supabaseAdmin
      .from('orders')
      .update({ status: newStatus, flow_token: token, flow_status: paymentStatus.status })
      .eq('id', orderId);

    // 3. Si el pago fue exitoso → enviar boleta por email
    if (paymentStatus.status === 2) {
      try {
        const { data: order } = await supabaseAdmin
          .from('orders').select('*').eq('id', orderId).single();
        const { data: items } = await supabaseAdmin
          .from('order_items').select('*').eq('order_id', orderId);

        if (order && process.env.GMAIL_USER && process.env.GMAIL_PASS) {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
          });

          const orderNum = String(order.id).padStart(5, '0');

          await transporter.sendMail({
            from: `"Amora Jewelry" <${process.env.GMAIL_USER}>`,
            to: order.client_email,
            subject: `Comprobante de Compra #${orderNum} — Amora Jewelry`,
            html: buildBoletaHtml(order, items || [])
          });

          console.log(`Boleta enviada correctamente a ${order.client_email}`);
        }
      } catch (emailErr) {
        // El email falla silenciosamente — no bloqueamos la confirmación a Flow
        console.error('Error enviando boleta por email:', emailErr);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error en Webhook de Flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
