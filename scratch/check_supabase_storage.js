const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log("Checking Supabase Storage buckets...");
  const { data: buckets, error: bError } = await supabaseAdmin.storage.listBuckets();
  
  if (bError) {
    console.error("Error listing buckets:", bError);
  } else {
    console.log("Existing buckets:", buckets.map(b => b.name));
    const exists = buckets.some(b => b.name === 'product-images');
    if (!exists) {
      console.log("Creating 'product-images' bucket...");
      const { data, error: createErr } = await supabaseAdmin.storage.createBucket('product-images', {
        public: true
      });
      if (createErr) {
        console.error("Error creating bucket:", createErr);
      } else {
        console.log("'product-images' bucket created successfully!");
      }
    } else {
      console.log("'product-images' bucket already exists.");
    }
  }

  console.log("\nTesting products table columns...");
  const { data: products, error: pError } = await supabaseAdmin
    .from('products')
    .select('*')
    .limit(1);
    
  if (pError) {
    console.error("Error querying products:", pError);
  } else {
    console.log("Products table accessible. Sample columns:", products.length > 0 ? Object.keys(products[0]) : "Table is empty");
  }
}

check();
