require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://egkpwbyearfygmdiyswh.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("No service role key found.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function run() {
  console.log("Conectando a Supabase URL:", supabaseUrl);
  
  // Create products storage bucket if not exists
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.error("Error al listar buckets:", bErr.message);
  } else {
    console.log("Buckets existentes:", buckets.map(b => b.name));
    const exists = buckets.some(b => b.name === 'products');
    if (!exists) {
      console.log("Creando bucket 'products'...");
      const { data: newBucket, error: createErr } = await supabase.storage.createBucket('products', { public: true });
      if (createErr) console.error("Error al crear bucket:", createErr.message);
      else console.log("✓ Bucket 'products' creado exitosamente como PÚBLICO.");
    } else {
      console.log("✓ El bucket 'products' ya existe.");
    }
  }
}

run().catch(console.error);
