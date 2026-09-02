import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const OrderShippedHtml = (orderId: string, name: string, method: string, address: string, trackingNumber?: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Orden va en Camino</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3F0E9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FDFCF8; }
    .header { text-align: center; padding: 30px 20px; border-bottom: 1px solid #E3DBCC; }
    .header img { max-width: 200px; }
    .content { padding: 40px 30px; text-align: center; color: #1E1E1E; }
    h1 { font-size: 22px; font-weight: normal; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; color: #101010; }
    .order-number { font-size: 18px; color: #B8975A; font-weight: bold; margin-bottom: 30px; }
    p { font-size: 15px; line-height: 1.6; color: #7A7468; margin-bottom: 20px; }
    .details { text-align: left; background: #F3F0E9; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .details h3 { margin-top: 0; font-size: 14px; text-transform: uppercase; color: #101010; letter-spacing: 1px; }
    .tracking-box { background: #FDFCF8; border: 1px dashed #B8975A; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
    .tracking-code { font-family: monospace; font-size: 18px; font-weight: bold; color: #101010; letter-spacing: 1px; }
    .btn-track { display: inline-block; background-color: #101010; color: #B8975A !important; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; font-size: 14px; margin-top: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #C8BBA8; border-top: 1px solid #E3DBCC; background-color: #F3F0E9; }
  </style>
</head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F3F0E9">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <div class="container">
          <!-- Logo -->
          <div class="header">
            <img src="https://qrhspijmfimjxemravyz.supabase.co/storage/v1/object/public/email-assets/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" />
          </div>
          
          <!-- Contenido -->
          <div class="content">
            <h1>¡Excelentes noticias, ${name}!</h1>
            <div class="order-number">Orden #${orderId}</div>
            
            <p>Tu paquete ya ha sido preparado y entregado a <strong>Blue Express</strong>. Va oficialmente en camino.</p>
            
            ${trackingNumber ? `
              <div class="tracking-box">
                <p style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #7A7468;">Número de Seguimiento Blue Express</p>
                <div class="tracking-code">${trackingNumber}</div>
                <a href="https://www.blue.cl/" target="_blank" class="btn-track">Rastrear mi pedido</a>
              </div>
            ` : `
              <p>El número de seguimiento estará disponible en las próximas horas.</p>
            `}

            <div class="details">
              <h3>Destino del Envío</h3>
              <p style="margin: 5px 0;"><strong>Método de Entrega:</strong> ${method === 'domicilio' ? 'Despacho a Domicilio' : 'Retiro en Blue Express'}</p>
              <p style="margin: 5px 0;"><strong>Dirección/Punto:</strong> ${address}</p>
            </div>
            
            <p>Gracias por confiar en nosotros para resaltar tu estilo.</p>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            © ${new Date().getFullYear()} Amora Jewelry. Todos los derechos reservados.<br>
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

    const info = await transporter.sendMail({
      from: '"Amora Jewelry" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: `Tu pedido #${orderId} va en camino 📦`,
      html: OrderShippedHtml(orderId, name, method, address, trackingNumber),
    });

    return NextResponse.json({ success: true, data: info });
  } catch (error: any) {
    console.error('Error enviando correo de despacho:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
