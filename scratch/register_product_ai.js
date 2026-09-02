const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function uploadImage(filePath) {
  const bucket = 'product-images';
  const ext = path.extname(filePath).slice(1) || 'jpg';
  const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const fileBuffer = fs.readFileSync(filePath);

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: ext === 'jpg' ? 'image/jpeg' : 'image/png'
    });

  if (error) {
    throw new Error(`Upload error: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

async function registerProduct() {
  const img1 = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\cd0786c4-d32a-4eee-9129-38ed86f01d6b\\media__1787640290808.jpg';
  const img2 = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\cd0786c4-d32a-4eee-9129-38ed86f01d6b\\media__1787640294515.jpg';

  console.log("Uploading main product image...");
  const imageUrl = await uploadImage(img1);
  console.log("Main image uploaded:", imageUrl);

  console.log("Uploading reference product image...");
  const referenceImageUrl = await uploadImage(img2);
  console.log("Reference image uploaded:", referenceImageUrl);

  const productData = {
    title: 'Anillo Coral Unakita Natural',
    description: 'Exclusiva joya de autor inspirada en la exuberancia de la naturaleza. Presenta una magnífica gema de unakita natural con matices botánicos en tonos verde y terracota, abrazada por intrincadas ramas doradas engastadas con refinadas micro-circonias. Confeccionado en bronce enchapado en oro de 18K, totalmente libre de níquel e hipoalergénico.',
    category: 'Anillos',
    sale_price: 15990,
    cost_price: 6500,
    sku: `ANK-${Math.floor(1000 + Math.random() * 9000)}`,
    stock: null, // Unlimited stock
    shipping_profile_id: 'shipping_standard',
    status: 'active',
    sizes: ['Talla Única'],
    image_url: imageUrl,
    reference_image_url: referenceImageUrl,
    created_at: new Date().toISOString()
  };

  console.log("Inserting product into Supabase database...");
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(productData)
    .select('id, title')
    .single();

  if (error) {
    console.error("Error inserting product:", error);
  } else {
    console.log("PRODUCT CREATED SUCCESSFULLY!", data);
  }
}

registerProduct();
