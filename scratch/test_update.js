const { createClient } = require('@supabase/supabase-js');

// Copy exact config from server.ts
const supabaseUrl = 'https://qrhspijmfimjxemravyz.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaHNwaWptZmltanhlbXJhdnl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUxNDYyNiwiZXhwIjoyMTAzMDkwNjI2fQ.cWsGJFUY14juC5lpK-966uADtf9rrErcIFXIDR0c87k';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  const { data: orders, error: errFetch } = await supabaseAdmin.from('orders').select('id, status').limit(1);
  if (errFetch) {
    console.error("Error fetching:", errFetch);
    return;
  }

  if (orders.length === 0) {
    console.log("No orders found.");
    return;
  }

  const order = orders[0];
  console.log("Found order:", order);

  // Try updating
  const { data: updated, error: errUpdate } = await supabaseAdmin
    .from('orders')
    .update({ status: 'Enviado' })
    .eq('id', order.id)
    .select();

  if (errUpdate) {
    console.error("Error updating:", errUpdate);
  } else {
    console.log("Successfully updated order:", updated);
    
    // Revert back for safety
    await supabaseAdmin.from('orders').update({ status: order.status }).eq('id', order.id);
    console.log("Reverted back to original status.");
  }
}

run();
