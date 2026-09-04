import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { orderPayload, itemsPayload } = await request.json();

    const cleanOrderPayload = {
      client_name: orderPayload.client_name,
      client_rut: orderPayload.client_rut,
      client_email: orderPayload.client_email,
      client_phone: orderPayload.client_phone,
      delivery_method: orderPayload.delivery_method || 'domicilio',
      shipping_region: orderPayload.shipping_region,
      shipping_comuna: orderPayload.shipping_comuna,
      shipping_address: orderPayload.shipping_address,
      pickup_point_name: orderPayload.pickup_point_name || null,
      pickup_point_address: orderPayload.pickup_point_address || null,
      subtotal: orderPayload.subtotal,
      shipping_cost: orderPayload.shipping_cost,
      total: orderPayload.total,
      status: orderPayload.status || 'Pendiente'
    };

    // Insertar orden usando la service_role key (bypassa RLS)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(cleanOrderPayload)
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

    return NextResponse.json({ order });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
