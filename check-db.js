require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  const { data, error } = await supabase.from('orders').select('id').limit(1);
  if (error) {
    console.error("Error en tabla orders:", error.message);
  } else {
    console.log("Tabla orders existe, datos:", data);
  }
}
checkOrders();
