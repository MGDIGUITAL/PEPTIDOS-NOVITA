import { supabaseAdmin } from '../lib/supabase/server.ts';

async function listProducts() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, title, sale_price');
  
  if (error) {
    console.error('Error:', error);
  } else {
    data.forEach(p => console.log(p.title, p.sale_price));
  }
}

listProducts();
