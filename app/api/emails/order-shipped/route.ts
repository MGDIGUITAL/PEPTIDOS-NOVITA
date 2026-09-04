import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const OrderShippedHtml = (orderId: string, name: string, method: string, address: string, trackingNumber?: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Orden va en Camino - NOVA Performance</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FFFFFF; }
    .container { max-width: 600px; margin: 0 auto; background-color: #121212; border: 1px solid #222222; border-radius: 8px; overflow: hidden; }
    .header { text-align: center; padding: 36px 20px; background-color: #000000; border-bottom: 1px solid #222222; }
    .header h2 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase; }
    .content { padding: 40px 30px; text-align: center; color: #EEEEEE; }
    h1 { font-size: 20px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; color: #FFFFFF; }
    .order-number { font-size: 18px; color: #E6E2D3; font-weight: bold; margin-bottom: 24px; }
    p { font-size: 14px; line-height: 1.6; color: #A0A0A0; margin-bottom: 20px; }
    .details { text-align: left; background: #1A1A1A; padding: 20px; border-radius: 8px; border: 1px solid #282828; margin-bottom: 30px; }
    .details h3 { margin-top: 0; font-size: 13px; text-transform: uppercase; color: #E6E2D3; letter-spacing: 1px; }
    .tracking-box { background: #181818; border: 1px dashed #E6E2D3; padding: 20px; border-radius: 6px; margin: 24px 0; text-align: center; }
    .tracking-code { font-family: monospace; font-size: 20px; font-weight: bold; color: #FFFFFF; letter-spacing: 2px; }
    .btn-track { display: inline-block; background-color: #FFFFFF; color: #000000 !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 800; font-size: 13px; margin-top: 16px; text-transform: uppercase; letter-spacing: 1px; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #666666; border-top: 1px solid #222222; background-color: #0A0A0A; }
  </style>
</head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#0A0A0A">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h2>NOVA Performance®</h2>
          </div>
          
          <!-- Contenido -->
          <div class="content">
            <h1>¡Tu paquete ha sido despachado, ${name}!</h1>
            <div class="order-number">Orden #${orderId}</div>
            
            <p>Tu orden ha sido procesada y entregada exitosamente al servicio de Courier <strong>Blue Express</strong>. Va oficialmente en camino.</p>
            
            ${trackingNumber ? `
              <div class="tracking-box">
                <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Número de Seguimiento Blue Express</p>
                <div class="tracking-code">${trackingNumber}</div>
                <a href="https://www.blue.cl/" target="_blank" class="btn-track">Rastrear Envío en Blue Express</a>
              </div>
            ` : `
              <p>El código de seguimiento en línea se activará durante las próximas horas.</p>
            `}

            <div class="details">
              <h3>Destino del Envío</h3>
              <p style="margin: 6px 0; color: #FFFFFF;"><strong>Método de Entrega:</strong> Despacho a Domicilio Priority (Blue Express)</p>
              <p style="margin: 6px 0; color: #FFFFFF;"><strong>Dirección / Punto:</strong> ${address}</p>
            </div>
            
            <p style="font-size: 12px; color: #888888;">Si tienes dudas con el estado de tu despacho, escríbenos a <a href="mailto:Cnovoadrust@gmail.com" style="color: #E6E2D3; text-decoration: underline;">Cnovoadrust@gmail.com</a></p>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            © ${new Date().getFullYear()} NOVA Performance® · Péptidos Novita.<br>
            Chile
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export async function POST(request: Request) {
  try {
    const { email, orderId, name, method, address, trackingNumber } = await request.json();

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

    const recipientList = [email, 'mpeg.logistica@gmail.com', 'Christophernovoad@gmail.com'].filter(Boolean).join(', ');

    const info = await transporter.sendMail({
      from: '"NOVA Performance" <' + process.env.GMAIL_USER + '>',
      to: recipientList,
      subject: `Tu pedido #${orderId} de NOVA Performance va en camino 📦`,
      html: OrderShippedHtml(orderId, name, method, address, trackingNumber),
    });

    return NextResponse.json({ success: true, data: info });
  } catch (error: any) {
    console.error('Error enviando correo de despacho:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
