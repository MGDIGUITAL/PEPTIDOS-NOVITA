import { supabaseAdmin } from '../lib/supabase/server.ts';

async function checkSchema() {
  const { data, error } = await supabaseAdmin.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log('Orders sample record keys:', data && data.length > 0 ? Object.keys(data[0]) : 'Table is empty');
  }
}

checkSchema();
