import { supabaseAdmin } from '../lib/supabase/server.ts';

async function listColumns() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  }
}

listColumns();
