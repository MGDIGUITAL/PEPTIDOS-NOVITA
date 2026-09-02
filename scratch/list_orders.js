const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qrhspijmfimjxemravyz.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaHNwaWptZmltanhlbXJhdnl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUxNDYyNiwiZXhwIjoyMTAzMDkwNjI2fQ.cWsGJFUY14juC5lpK-966uADtf9rrErcIFXIDR0c87k';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  const { data: orders } = await supabaseAdmin.from('orders').select('id, client_name, status');
  console.log("Database Orders:", orders);
}

run();
