const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function list() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, title, category, sale_price, created_at, status')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
  } else {
    console.log("DB Products:", JSON.stringify(data, null, 2));
  }
}

list();
