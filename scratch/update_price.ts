import { supabaseAdmin } from '../lib/supabase/server.ts';

async function updatePrice() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, title, sale_price')
    .ilike('title', '%Agua Bacteriostática 3ml%');

  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No product found matching that title.');
    process.exit(0);
  }

  const product = data[0];
  console.log('Found product:', product.title, 'Current Price:', product.sale_price);

  const { error: updateError } = await supabaseAdmin
    .from('products')
    .update({ sale_price: 350 })
    .eq('id', product.id);

  if (updateError) {
    console.error('Error updating:', updateError);
  } else {
    console.log('Successfully updated price to 350!');
  }
}

updatePrice();
