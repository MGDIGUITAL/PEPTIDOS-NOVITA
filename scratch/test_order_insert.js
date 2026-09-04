import { supabaseAdmin } from '../lib/supabase/server.ts';

async function testInsert() {
  const cleanOrderPayload = {
    client_name: 'Test Client',
    client_rut: '12345678-9',
    client_email: 'test@novaperformance.cl',
    client_phone: '+56912345678',
    delivery_method: 'domicilio',
    shipping_region: 'Valparaíso',
    shipping_comuna: 'Viña del Mar',
    shipping_address: 'Calle Test 123',
    subtotal: 100000,
    shipping_cost: 0,
    total: 100000,
    status: 'Pendiente'
  };

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert(cleanOrderPayload)
    .select()
    .single();

  if (error) {
    console.error('FAILED TO INSERT ORDER:', error);
  } else {
    console.log('ORDER INSERTED SUCCESSFULLY:', order.id);
    // Clean up test order
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    console.log('Test order cleaned up.');
  }
}

testInsert();
