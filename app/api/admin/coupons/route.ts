import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET: List all coupons
export async function GET() {
  try {
    const { data: coupons, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coupons });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new coupon
export async function POST(req: Request) {
  try {
    const { code, discount_type, discount_value, expires_at, max_uses, max_uses_per_user } = await req.json();

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert([
        {
          code: String(code).toUpperCase().trim(),
          discount_type,
          discount_value: Number(discount_value),
          expires_at: expires_at || null,
          max_uses: max_uses ? Number(max_uses) : null,
          max_uses_per_user: max_uses_per_user ? Number(max_uses_per_user) : 1,
          used_count: 0,
          is_active: true
        }
      ])
      .select();

    if (error) {
      console.error('Error creating coupon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
