'use server';

import { supabaseAdmin } from '@/lib/supabase/server';

export async function createOrderSecurely(orderData: any, itemsData: any[]) {
  // Bypasses RLS to insert the order and items safely
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (orderError) {
    throw new Error('Error al crear orden: ' + orderError.message);
  }

  const itemsToInsert = itemsData.map(item => ({
    ...item,
    order_id: order.id
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    throw new Error('Error al guardar los ítems: ' + itemsError.message);
  }

  return order;
}
