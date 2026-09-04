import { NextResponse } from 'next/server';
import { getFlowPaymentStatus, verifyFlowWebhook } from '@/lib/flow';
import { supabaseAdmin } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';


// ─── HTML de la Boleta / Comprobante de Compra ────────────────────────────────
function buildBoletaHtml(order: any, items: any[]) {
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
                      <a href="mailto:Cnovoadrust@gmail.com" style="color:#EEE;text-decoration:underline;">Cnovoadrust@gmail.com</a>
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

// ─── Rate Limiter en memoria (anti-spam / anti-DoS) ───────────────────────────
// Máximo 30 requests por IP por minuto. Se resetea cada 60 segundos.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX      = 30;
const RATE_LIMIT_WINDOW   = 60_000; // 1 minuto en ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

// ─── Headers de seguridad HTTP ─────────────────────────────────────────────────
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options':        'DENY',
  'Cache-Control':          'no-store, no-cache, must-revalidate',
};

// ─── Webhook principal (POST) ──────────────────────────────────────────────────
export async function POST(request: Request) {
  // 1. Rate limiting por IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: SECURITY_HEADERS }
    );
  }

  try {
    const formData = await request.formData();

    // Extraer TODOS los campos del formData para verificación HMAC
    const allParams: Record<string, string> = {};
    formData.forEach((value, key) => {
      allParams[key] = String(value);
    });

    const token = allParams['token'];

    if (!token) {
      return NextResponse.json(
        { error: 'Token no provisto' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // 2. Verificación HMAC-SHA256 del webhook (anti-hack)
    // Flow envía el campo 's' con la firma del payload.
    // Si no coincide con nuestra clave secreta, rechazamos la request.
    if (!verifyFlowWebhook(allParams)) {
      // Log de intento de manipulación
      console.error(`[Flow Webhook] ⚠️ Firma HMAC inválida — IP: ${ip} — token: ${token}`);

      try {
        await supabaseAdmin.from('security_events').insert({
          event_type:  'flow_webhook_invalid_signature',
          ip_address:  ip,
          payload:     JSON.stringify(allParams),
          created_at:  new Date().toISOString(),
        });
      } catch { /* Silencioso si la tabla no existe aún */ }

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // 3. Verificar estado del pago con Flow (fuente de verdad)
    const paymentStatus = await getFlowPaymentStatus(token);
    const orderId = paymentStatus.commerceOrder;

    let newStatus = 'Pendiente';
    if (paymentStatus.status === 2) newStatus = 'Pagado';
    else if (paymentStatus.status === 3 || paymentStatus.status === 4) newStatus = 'Cancelado';

    // 4. Actualizar orden en Supabase
    await supabaseAdmin
      .from('orders')
      .update({
        status:       newStatus,
        flow_token:   token,
        flow_status:  paymentStatus.status,
        flow_order:   paymentStatus.flowOrder,
        paid_at:      paymentStatus.status === 2 ? new Date().toISOString() : null,
      })
      .eq('id', orderId);

    // 5. Si el pago fue exitoso → enviar comprobante por email
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

          const orderNum = String(order.order_number || order.id).padStart(5, '0');

          await transporter.sendMail({
            from:    `"NOVA Performance®" <${process.env.GMAIL_USER}>`,
            to:      order.client_email,
            bcc:     'Christophernovoad@gmail.com', // Copia oculta al admin para notificación de venta
            subject: `Comprobante de Compra #${orderNum} — NOVA Performance®`,
            html:    buildBoletaHtml(order, items || [])
          });

          console.log(`[Flow Webhook] Comprobante enviado a ${order.client_email}`);
        }
      } catch (emailErr) {
        // Email falla silenciosamente — no bloqueamos la confirmación a Flow
        console.error('[Flow Webhook] Error enviando comprobante:', emailErr);
      }
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: SECURITY_HEADERS }
    );

  } catch (error: any) {
    console.error('[Flow Webhook] Error crítico:', error.message);
    // Devolver 200 igualmente para que Flow no reintente en bucle
    return NextResponse.json(
      { success: false, detail: 'Internal processing error' },
      { status: 200, headers: SECURITY_HEADERS }
    );
  }
}

