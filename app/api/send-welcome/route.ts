import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabase/server';

const WelcomeEmailHtml = (userName: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Amora Jewelry</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3F0E9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FDFCF8; }
    .header { text-align: center; padding: 30px 20px; border-bottom: 1px solid #E3DBCC; }
    .header img { max-width: 200px; }
    .hero-image { width: 100%; display: block; }
    .content { padding: 40px 30px; text-align: center; color: #1E1E1E; }
    h1 { font-size: 24px; font-weight: normal; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; color: #101010; }
    p { font-size: 15px; line-height: 1.6; color: #7A7468; margin-bottom: 20px; }
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
          
          <!-- Imagen Principal (GRACIAS!) -->
          <img src="https://qrhspijmfimjxemravyz.supabase.co/storage/v1/object/public/email-assets/amora_gracias.png" alt="¡Gracias!" class="hero-image" />
          
          <!-- Contenido -->
          <div class="content">
            <h1>¡Hola, ${userName}!</h1>
            <p>Es un honor darte la bienvenida al mundo de <strong>Amora Jewelry</strong>.</p>
            <p>Tu cuenta ha sido creada exitosamente. A partir de ahora, tendrás acceso a nuestras colecciones exclusivas, beneficios únicos y un proceso de compra rápido y seguro.</p>
            <div style="background: #F3F0E9; border: 1px solid #E3DBCC; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #7A7468; text-transform: uppercase; letter-spacing: 1px;">Regalo de Bienvenida</p>
              <p style="margin: 0; font-size: 18px; color: #B8975A; font-weight: bold; letter-spacing: 2px;">CUPÓN: AMORAJEWELRY</p>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #101010;">Obtén un <strong>10% de descuento</strong> en tu primera compra.</p>
            </div>
            <p>Descubre el poder de la joyería atemporal.</p>
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
      from: '"Amora Jewelry" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: 'Bienvenido a Amora Jewelry',
      html: WelcomeEmailHtml(name || 'Amante de las Joyas'),
    });

    return NextResponse.json({ success: true, data: info });
  } catch (error: any) {
    console.error('Error enviando correo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
