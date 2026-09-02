import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { orderPayload, itemsPayload } = await request.json();

    // Insertar orden usando la service_role key (bypassa RLS)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Insertar items de la orden
    const itemsWithOrderId = itemsPayload.map((item: any) => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Track coupon usage if present
    if (orderPayload.applied_coupon) {
      try {
        const { data: coupon } = await supabaseAdmin
          .from('coupons')
          .select('id, used_count')
          .eq('code', String(orderPayload.applied_coupon).toUpperCase().trim())
          .single();

        if (coupon) {
          // Increment used_count
          await supabaseAdmin
            .from('coupons')
            .update({ used_count: (coupon.used_count || 0) + 1 })
            .eq('id', coupon.id);

          // Log redemption
          await supabaseAdmin.from('coupon_usages').insert({
            coupon_id: coupon.id,
            order_id: order.id,
            client_email: String(order.client_email).toLowerCase().trim()
          });
        }
      } catch (couponErr) {
        console.error('Error recording coupon usage:', couponErr);
      }
    }

    return NextResponse.json({ order });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
