import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAbandonedCartEmailHtml } from '@/lib/emails/abandoned-cart-template';

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('test_email');
    const secret = searchParams.get('secret');

    // Validación opcional de secret si está configurado en env
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return NextResponse.json({ error: 'Credenciales GMAIL_USER o GMAIL_PASS no configuradas' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Adjunto de la imagen de reserva (public/correo/reserva.png o CORREO/reserva.png)
    const attachments: any[] = [];
    const reservaPath = path.join(process.cwd(), 'public/correo/reserva.png');
    const fallbackPath = path.join(process.cwd(), 'CORREO/reserva.png');
    const targetPath = fs.existsSync(reservaPath) ? reservaPath : (fs.existsSync(fallbackPath) ? fallbackPath : null);

    if (targetPath) {
      attachments.push({
        filename: 'reserva.png',
        path: targetPath,
        cid: 'reserva_img'
      });
    }

    // Si se pasa test_email en query param, enviar un correo de prueba directo
    if (testEmail) {
      const html = getAbandonedCartEmailHtml({
        clientName: 'Cliente de Prueba',
        items: [
          { title: 'Retatrutide 20mg', size: '20mg*1', quantity: 1, price: 209990 },
          { title: 'Agua Bacteriostática 3ml', size: '3ml*1', quantity: 1, price: 7990 }
        ],
        subtotal: 217980,
        checkoutUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://novaperformance.cl'}/checkout`,
      });

      const info = await transporter.sendMail({
        from: `"NOVA Performance®" <${process.env.GMAIL_USER}>`,
        to: testEmail,
        subject: '✦ Tus productos te siguen esperando en NOVA Performance®',
        html,
        attachments,
      });

      return NextResponse.json({ success: true, message: `Correo de prueba enviado a ${testEmail}`, messageId: info.messageId });
    }

    // Buscar carritos activos no enviados y sin actividad por más de 15 minutos (900 segundos)
    const minutesThreshold = 15;
    const cutoffDate = new Date(Date.now() - minutesThreshold * 60 * 1000).toISOString();

    const { data: abandonedCarts, error: fetchErr } = await supabaseAdmin
      .from('user_carts')
      .select('*')
      .eq('status', 'active')
      .eq('email_sent', false)
      .lt('updated_at', cutoffDate)
      .limit(20);

    if (fetchErr) {
      console.error('Error obteniendo carritos abandonados:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No hay carritos abandonados pendientes' });
    }

    let processedCount = 0;
    const results: any[] = [];

    for (const cart of abandonedCarts) {
      // Verificar si el usuario ya realizó una orden reciente
      const { data: recentOrders } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('client_email', cart.email)
        .gte('created_at', cart.created_at)
        .limit(1);

      if (recentOrders && recentOrders.length > 0) {
        // El cliente ya compró -> marcar el carrito como completado
        await supabaseAdmin
          .from('user_carts')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', cart.id);
        continue;
      }

      // Renderizar plantilla HTML
      const html = getAbandonedCartEmailHtml({
        clientName: cart.full_name || 'Cliente Nova',
        items: cart.items || [],
        subtotal: cart.subtotal || 0,
        checkoutUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://novaperformance.cl'}/checkout`,
      });

      try {
        const info = await transporter.sendMail({
          from: `"NOVA Performance®" <${process.env.GMAIL_USER}>`,
          to: cart.email,
          subject: '✦ Tus productos te siguen esperando en NOVA Performance®',
          html,
          attachments,
        });

        // Actualizar el carrito a 'abandoned' y marcar email enviado
        await supabaseAdmin
          .from('user_carts')
          .update({
            status: 'abandoned',
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', cart.id);

        processedCount++;
        results.push({ email: cart.email, messageId: info.messageId });
      } catch (sendErr: any) {
        console.error(`Error enviando correo a ${cart.email}:`, sendErr);
      }
    }

    return NextResponse.json({
      success: true,
      processedCount,
      totalCandidates: abandonedCarts.length,
      results,
    });
  } catch (error: any) {
    console.error('Error en cron de carritos abandonados:', error);
    return NextResponse.json({ error: error.message || 'Error en cron' }, { status: 500 });
  }
}
