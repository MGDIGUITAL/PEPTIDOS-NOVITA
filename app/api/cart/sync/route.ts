import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { userId, email, fullName, items, subtotal, status = 'active' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Falta el correo electrónico del cliente' }, { status: 400 });
    }

    // Buscar si ya existe un carrito activo para este usuario/email
    let query = supabaseAdmin.from('user_carts').select('id, status').eq('email', email.toLowerCase());
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: existingCarts, error: fetchErr } = await query.eq('status', 'active').maybeSingle();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.error('Error buscando carrito activo:', fetchErr);
    }

    const cartItems = Array.isArray(items) ? items : [];

    // Si el carrito está vacío o el estado es 'completed'
    if (cartItems.length === 0 || status === 'completed') {
      if (existingCarts?.id) {
        await supabaseAdmin
          .from('user_carts')
          .update({
            status: status === 'completed' ? 'completed' : 'cleared',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCarts.id);
      }
      return NextResponse.json({ success: true, message: 'Carrito actualizado / liberado' });
    }

    // Guardar o actualizar el carrito activo
    const payload = {
      user_id: userId || null,
      email: email.toLowerCase().trim(),
      full_name: fullName || null,
      items: cartItems,
      subtotal: subtotal || 0,
      status: 'active',
      email_sent: false,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingCarts?.id) {
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('user_carts')
        .update(payload)
        .eq('id', existingCarts.id)
        .select()
        .single();

      if (updateErr) {
        console.error('Error actualizando carrito activo:', updateErr);
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, cart: updated });
    } else {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from('user_carts')
        .insert(payload)
        .select()
        .single();

      if (insertErr) {
        console.error('Error registrando carrito activo:', insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, cart: inserted });
    }
  } catch (error: any) {
    console.error('Error en /api/cart/sync:', error);
    return NextResponse.json({ error: error.message || 'Error en servidor' }, { status: 500 });
  }
}
