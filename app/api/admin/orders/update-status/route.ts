import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { orderId, status, trackingNumber } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId y status son requeridos' }, { status: 400 });
    }

    const updatePayload: any = { status };
    if (trackingNumber !== undefined) {
      updatePayload.tracking_number = trackingNumber;
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Error updating order status in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('API Error in update-status route:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
