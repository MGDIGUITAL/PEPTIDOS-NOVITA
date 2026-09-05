import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { supabaseAdmin } from '@/lib/supabase/server';

const WelcomeEmailHtml = (userName: string) => `<!DOCTYPE html>
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
                ¡HOLA, ${(userName || 'INVESTIGADOR').toUpperCase()}!
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

    const bienvenidoPath = path.join(process.cwd(), 'public/correo/bienvenido.png');
    const attachments: any[] = [];
    if (fs.existsSync(bienvenidoPath)) {
      attachments.push({
        filename: 'bienvenido.png',
        path: bienvenidoPath,
        cid: 'bienvenido_img'
      });
    }

    const info = await transporter.sendMail({
      from: '"NOVA Performance" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: 'Bienvenido a Nova Performance',
      html: WelcomeEmailHtml(name || 'Cliente'),
      attachments
    });

    return NextResponse.json({ success: true, data: info });
  } catch (error: any) {
    console.error('Error enviando correo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
