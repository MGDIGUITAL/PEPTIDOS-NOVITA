import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

const OrderConfirmationHtml = (orderId: string, name: string, total: number, method: string, address: string) => `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comprobante de Compra #${orderId} — NOVA Performance</title>
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
                    <span style="font-size:16px;color:#FFFFFF;font-weight:900;letter-spacing:1px;">ORDEN #${orderId}</span>
                  </td>
                  <td style="text-align:right;">
                    <span style="font-size:11px;color:#AAAAAA;">${new Date().toLocaleDateString('es-CL')}</span>
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
                  <td width="100%" style="padding:4px 0;vertical-align:top;">
                    <span style="font-size:10px;color:#666666;display:block;text-transform:uppercase;">Nombre</span>
                    <span style="font-size:12.5px;color:#FFFFFF;font-weight:700;">${name}</span>
                  </td>
                </tr>
              </table>

              <!-- MÉTODO DE DESPACHO -->
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:2.5px;color:#888888;text-transform:uppercase;font-weight:700;border-bottom:1px solid #1E1E1E;padding-bottom:8px;">DESPACHO Y ENTREGA</p>
              <div style="background-color:#121212;border:1px solid #222222;border-radius:8px;padding:14px 16px;margin-bottom:24px;">
                <span style="font-size:10px;color:#888888;display:block;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">${method || 'Despacho a Domicilio'}</span>
                <span style="font-size:12.5px;color:#FFFFFF;font-weight:700;line-height:1.4;">${address}</span>
              </div>

              <!-- TOTALES -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#121212;border:1px solid #222222;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
                <tr>
                  <td style="font-size:13px;color:#FFFFFF;font-weight:900;letter-spacing:1px;text-transform:uppercase;">TOTAL PAGADO</td>
                  <td style="font-size:16px;color:#FFFFFF;text-align:right;font-weight:900;">$${total.toLocaleString('es-CL')} CLP</td>
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

export async function POST(request: Request) {
  try {
    const { email, orderId, name, total, method, address } = await request.json();

    if (!email || !orderId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return NextResponse.json({ success: true, mocked: true });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const graciasPath = path.join(process.cwd(), 'public/correo/gracias.png');
    const attachments: any[] = [];
    if (fs.existsSync(graciasPath)) {
      attachments.push({
        filename: 'gracias.png',
        path: graciasPath,
        cid: 'gracias_img'
      });
    }

    const recipientList = [email, 'mpeg.logistica@gmail.com', 'Christophernovoad@gmail.com'].filter(Boolean).join(', ');

    const info = await transporter.sendMail({
      from: '"NOVA Performance" <' + process.env.GMAIL_USER + '>',
      to: recipientList,
      subject: `Confirmación de Pedido #${orderId} - NOVA Performance`,
      html: OrderConfirmationHtml(orderId, name, total, method, address),
      attachments
    });

    return NextResponse.json({ success: true, data: info });
  } catch (error: any) {
    console.error('Error enviando correo de confirmación:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
