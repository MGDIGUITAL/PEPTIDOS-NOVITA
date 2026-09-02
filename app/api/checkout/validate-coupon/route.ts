import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { code, email } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Código de cupón es requerido' }, { status: 400 });
    }

    const uppercaseCode = String(code).toUpperCase().trim();

    // 1. Fetch coupon
    const { data: coupon, error: couponErr } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', uppercaseCode)
      .single();

    if (couponErr || !coupon) {
      return NextResponse.json({ error: 'El cupón ingresado no existe' }, { status: 404 });
    }

    // 2. Check if active
    if (!coupon.is_active) {
      return NextResponse.json({ error: 'El cupón no está activo' }, { status: 400 });
    }

    // 3. Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'El cupón ha expirado' }, { status: 400 });
    }

    // 4. Check global usage limit
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'El cupón ya ha sido utilizado en su totalidad' }, { status: 400 });
    }

    // 5. Check per-user/email usage limit (if email is provided)
    if (email) {
      const cleanEmail = String(email).toLowerCase().trim();

      const { count, error: countErr } = await supabaseAdmin
        .from('coupon_usages')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)
        .eq('client_email', cleanEmail);

      if (countErr) {
        console.error('Error fetching coupon usages:', countErr);
      }

      if (count !== null && count >= (coupon.max_uses_per_user || 1)) {
        return NextResponse.json({ 
          error: `Has alcanzado el límite de usos (${coupon.max_uses_per_user || 1}) para este cupón` 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      } 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
