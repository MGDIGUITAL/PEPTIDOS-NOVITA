import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabase/server';

const WelcomeEmailHtml = (userName: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a NOVA Performance</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FFFFFF; }
    .container { max-width: 600px; margin: 0 auto; background-color: #121212; border: 1px solid #222222; border-radius: 8px; overflow: hidden; }
    .header { text-align: center; padding: 36px 20px; background-color: #000000; border-bottom: 1px solid #222222; }
    .header h2 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase; }
    .content { padding: 40px 30px; text-align: center; color: #EEEEEE; }
    h1 { font-size: 22px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; color: #FFFFFF; }
    p { font-size: 14px; line-height: 1.6; color: #A0A0A0; margin-bottom: 20px; }
    .coupon-box { background: #1A1A1A; border: 1px solid #282828; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center; }
    .coupon-code { font-size: 20px; color: #E6E2D3; font-weight: bold; letter-spacing: 3px; font-family: monospace; }
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
            <h1>¡Bienvenido(a), ${userName}!</h1>
            <p>Tu cuenta ha sido creada exitosamente en <strong>NOVA Performance® (Péptidos Novita)</strong>.</p>
            <p>A partir de ahora tienes acceso a nuestro catálogo exclusivo de péptidos de investigación analítica con certificados de pureza comprobada &gt;99% y despachos prioritarios discretos.</p>
            
            <div class="coupon-box">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Regalo de Bienvenida</p>
              <div class="coupon-code">CUPÓN: NOVA10</div>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #FFFFFF;">Obtén un <strong>10% de descuento</strong> en tu primera orden.</p>
            </div>
            
            <p style="font-size: 12px; color: #888888;">Si tienes alguna pregunta, contáctanos a <a href="mailto:Cnovoadrust@gmail.com" style="color: #E6E2D3; text-decoration: underline;">Cnovoadrust@gmail.com</a></p>
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
    const { email, name, userId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Falta el correo' }, { status: 400 });
    }

    // Auto-confirmar usuario en Supabase Auth
    try {
      if (userId) {
        await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });
      } else {
        const { data } = await supabaseAdmin.auth.admin.listUsers();
        const target = data?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        if (target) {
          await supabaseAdmin.auth.admin.updateUserById(target.id, { email_confirm: true });
        }
      }
    } catch (authErr) {
      console.error('Error auto-confirmando usuario en Supabase:', authErr);
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.log('--- SIMULANDO ENVÍO DE CORREO (Faltan credenciales de Gmail) ---');
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
      from: '"NOVA Performance" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: 'Bienvenido a NOVA Performance',
      html: WelcomeEmailHtml(name || 'Investigador'),
    });

    return NextResponse.json({ success: true, data: info });
  } catch (error: any) {
    console.error('Error enviando correo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
