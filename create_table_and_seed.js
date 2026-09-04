/**
 * create_table_and_seed.js — Crea tabla products y seedea productos NOVA Performance®
 * Usa la Supabase REST API para ejecutar SQL DDL vía POST al endpoint de pg
 * Ejecutar con: node create_table_and_seed.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IMAGES_DIR = path.join(__dirname, 'PRODUCTOS', 'PRODUCTOS');
const BUCKET = 'product-images';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Ejecutar SQL raw via Supabase REST (endpoint /rest/v1/rpc no aplica para DDL)
// Usamos el endpoint de la API interna de Supabase para correr SQL
async function runSQL(sql) {
  const url = `${SUPABASE_URL}/rest/v1/`;
  // Para DDL usamos fetch directo al endpoint de postgres con service_role
  const response = await fetch(`${SUPABASE_URL}/pg`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ query: sql }),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL Error (${response.status}): ${text}`);
  }
  return response.json();
}

// ─── Datos de los 9 productos ──────────────────────────────────────────────
const PRODUCTS = [
  {
    title: 'Retatrutide 10mg — Péptido Triagonista GLP-1/GIP/Glucagón',
    sku: 'RT10', category: 'Péptidos GLP-1',
    sale_price: 139990, cost_price: 73000, stock: null, status: 'active',
    description: `Retatrutide 10mg (RT10) es un péptido triagonista de última generación que actúa sobre receptores GLP-1, GIP y Glucagón simultáneamente. Especificación: 10mg × 1 Vial liofilizado de alta pureza. Sin IVA. Uso exclusivo para investigación científica.

• SKU: RT10 | Especificación: 10mg × 1 vial
• Categoría: Péptidos GLP-1 / Triagonistas  
• Alta pureza de síntesis | Polvo liofilizado para reconstitución
• Palabras clave: retatrutide 10mg, RT10, péptido GLP-1, triagonista, liofilizado, péptidos chile`,
    image_file: 'Retatrutide_RT10-10MG.jpeg',
  },
  {
    title: 'Retatrutide 20mg — Péptido Triagonista GLP-1/GIP/Glucagón',
    sku: 'RT20', category: 'Péptidos GLP-1',
    sale_price: 209990, cost_price: 140000, stock: null, status: 'active',
    description: `Retatrutide 20mg (RT20) péptido triagonista de última generación, presentación de mayor rendimiento. Actúa sobre receptores GLP-1, GIP y Glucagón. Especificación: 20mg × 1 Vial liofilizado. Sin IVA.

• SKU: RT20 | Especificación: 20mg × 1 vial
• Categoría: Péptidos GLP-1 / Triagonistas
• Alta pureza de síntesis | Polvo liofilizado para reconstitución
• Palabras clave: retatrutide 20mg, RT20, péptido GLP-1, triagonista, liofilizado, péptidos chile`,
    image_file: 'RETATRUIDE-RT20-20MG.jpeg',
  },
  {
    title: 'GHK-Cu 100mg — Péptido de Cobre Anti-Aging y Regenerativo',
    sku: 'CU100', category: 'Péptidos Regenerativos',
    sale_price: 119990, cost_price: 63000, stock: null, status: 'active',
    description: `GHK-Cu 100mg (CU100) tripéptido de cobre presente en el cuerpo humano. Investigado por sus propiedades regenerativas, antioxidantes, anti-envejecimiento y síntesis de colágeno. Especificación: 100mg × 1 Vial liofilizado estéril. Sin IVA.

• SKU: CU100 | Especificación: 100mg × 1 vial
• Categoría: Péptidos Regenerativos / Anti-aging
• Alta pureza | Polvo liofilizado estéril
• Palabras clave: GHK-Cu, cobre péptido, CU100, anti-aging, regenerativo, colágeno, péptidos chile`,
    image_file: 'GHK-CU-CU100-100MG.jpeg',
  },
  {
    title: 'BPC-157 10mg — Péptido de Protección y Recuperación Tisular',
    sku: 'BC10', category: 'Péptidos Regenerativos',
    sale_price: 89990, cost_price: 60000, stock: null, status: 'active',
    description: `BPC-157 10mg (BC10) pentadecapéptido derivado de la proteína de protección gástrica. Investigado por potencial en recuperación tisular, protección gastrointestinal y regeneración musculoesquelética. Especificación: 10mg × 1 Vial. Sin IVA.

• SKU: BC10 | Especificación: 10mg × 1 vial
• Categoría: Péptidos Regenerativos
• Polvo liofilizado de alta pureza
• Palabras clave: BPC-157, BPC157, péptido regenerativo, BC10, recuperación tisular, péptidos chile`,
    image_file: 'BCP-157-BC10-10MG.jpeg',
  },
  {
    title: 'MOTS-c 10mg — Péptido Mitocondrial para el Metabolismo Energético',
    sku: 'MS10', category: 'Péptidos Mitocondriales',
    sale_price: 94990, cost_price: 65000, stock: null, status: 'active',
    description: `MOTS-c 10mg (MS10) péptido mitocondrial regulador del metabolismo y homeostasis energética celular. Derivado del ARN mitocondrial, investigado por influencia en metabolismo de glucosa, resistencia al ejercicio y longevidad celular. Especificación: 10mg × 1 Vial. Sin IVA.

• SKU: MS10 | Especificación: 10mg × 1 vial
• Categoría: Péptidos Mitocondriales
• Polvo liofilizado de alta pureza
• Palabras clave: MOTS-c, péptido mitocondrial, MS10, metabolismo, energía celular, glucosa, péptidos chile`,
    image_file: 'MOTS-c-MS10-10MG.jpeg',
  },
  {
    title: 'Tesamorelin 10mg — Análogo Sintético GHRH Hormona de Crecimiento',
    sku: 'TSM10', category: 'Péptidos GHRH',
    sale_price: 129990, cost_price: 100000, stock: null, status: 'active',
    description: `Tesamorelin 10mg (TSM10) análogo sintético del Factor Liberador de Hormona de Crecimiento (GHRH). Estimula secreción de GH de forma pulsátil y fisiológica sin elevar cortisol ni prolactina. Especificación: 10mg × 1 Vial. Sin IVA.

• SKU: TSM10 | Especificación: 10mg × 1 vial
• Categoría: Péptidos GHRH / Hormona de Crecimiento
• Polvo liofilizado de alta pureza para reconstitución
• Palabras clave: tesamorelin 10mg, TSM10, GHRH, hormona crecimiento, péptidos chile`,
    image_file: 'TESAMORELIN-TSM10-10MG.jpeg',
  },
  {
    title: 'Tesamorelin 20mg — Análogo Sintético GHRH Hormona de Crecimiento',
    sku: 'TSM20', category: 'Péptidos GHRH',
    sale_price: 190000, cost_price: 153000, stock: null, status: 'active',
    description: `Tesamorelin 20mg (TSM20) análogo sintético del GHRH en presentación de mayor rendimiento. Estimula secreción de GH de forma pulsátil y fisiológica. Especificación: 20mg × 1 Vial. Sin IVA.

• SKU: TSM20 | Especificación: 20mg × 1 vial
• Categoría: Péptidos GHRH / Hormona de Crecimiento
• Polvo liofilizado de alta pureza para reconstitución
• Palabras clave: tesamorelin 20mg, TSM20, GHRH, hormona crecimiento, péptidos chile`,
    image_file: 'TESAMORELIN-TSM20-20MG.jpeg',
  },
  {
    title: 'CJC-1295 sin DAC + Ipamorelin 10mg — Stack GHRH/GHRP Péptidos GH',
    sku: 'CJCIP', category: 'Péptidos GHRH',
    sale_price: 129990, cost_price: 67000, stock: null, status: 'active',
    description: `CJC-1295 sin DAC + Ipamorelin 10mg (CJCIP) combinación sinérgica de CJC-1295 (análogo GHRH) e Ipamorelin (secretagogo selectivo GH). Estimula liberación pulsátil de GH sin elevar cortisol ni prolactina. Especificación: 10mg × 1 Vial combinado. Sin IVA.

• SKU: CJCIP | Especificación: 10mg × 1 vial (combinación)
• Categoría: Péptidos GHRH / Stack GH
• Polvo liofilizado de alta pureza para reconstitución
• Palabras clave: CJC-1295, ipamorelin, CJCIP, GHRH, GHRP, stack péptidos, secretagogo GH, péptidos chile`,
    image_file: 'CJC-N-DAC+IPA-CJCIP-10MG.jpeg',
  },
  {
    title: 'Agua Bacteriostática 3ml — Solvente para Reconstitución de Péptidos',
    sku: 'BAC10', category: 'Accesorios',
    sale_price: 7990, cost_price: 6000, stock: null, status: 'active',
    description: `Agua Bacteriostática 3ml (BAC10) solvente estéril para reconstitución segura de péptidos liofilizados. Contiene alcohol bencílico 0.9% que previene crecimiento microbiano y permite extracciones múltiples asépticas. Especificación: 3ml × 1 vial estéril. Sin IVA.

• SKU: BAC10 | Especificación: 3ml × 1 vial estéril
• Categoría: Accesorios / Solventes para péptidos
• Compatible con todos los péptidos liofilizados NOVA Performance®
• Palabras clave: agua bacteriostática, solvente péptidos, reconstitución, BAC10, vial estéril, bencílico`,
    image_file: 'AGUA-BAC-BAC10-3ML.jpeg',
  },
];

// ─── Subir imagen a Storage ────────────────────────────────────────────────
async function uploadImage(imageFile, sku) {
  const filePath = path.join(IMAGES_DIR, imageFile);
  if (!fs.existsSync(filePath)) {
    console.warn(`   ⚠️  Imagen no encontrada: ${imageFile}`);
    return null;
  }
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(imageFile).toLowerCase().replace('.', '');
  const mimeType = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : `image/${ext}`;
  const storagePath = `products/${sku.toLowerCase()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: mimeType, upsert: true,
  });
  if (error) { console.error(`   ❌ Imagen: ${error.message}`); return null; }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  console.log(`   📸 ${publicUrl}`);
  return publicUrl;
}

// ─── Upsert producto via supabase-js ──────────────────────────────────────
async function upsertProduct(product, imageUrl) {
  const payload = {
    title:               product.title,
    description:         product.description,
    category:            product.category,
    sale_price:          product.sale_price,
    cost_price:          product.cost_price,
    sku:                 product.sku,
    stock:               product.stock,
    status:              product.status,
    image_url:           imageUrl || null,
    images:              imageUrl ? [imageUrl] : [],
    sizes:               [],
    shipping_profile_id: 'shipping_standard',
  };

  // Verificar si ya existe por SKU
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('sku', payload.sku)
    .maybeSingle();

  if (existing) {
    // Actualizar
    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('sku', payload.sku);
    if (error) {
      console.error(`   ❌ DB Error (update): ${error.message}`);
    } else {
      console.log(`   🔄 Actualizado en DB (id: ${existing.id})`);
    }
  } else {
    // Insertar
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select('id')
      .single();
    if (error) {
      console.error(`   ❌ DB Error (insert): ${error.message}`);
    } else {
      console.log(`   ✅ Insertado en DB (id: ${data.id})`);
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 NOVA Performance® — Create Table + Seed\n');
  console.log(`🔗 Supabase: ${SUPABASE_URL}\n`);

  // 1. Verificar si la tabla existe con un select simple
  console.log('🔍 Verificando tabla products...');
  const { error: checkError } = await supabase.from('products').select('id').limit(1);

  if (checkError && checkError.code === 'PGRST204') {
    console.log('   ✅ Tabla existe pero está vacía.');
  } else if (checkError) {
    console.error(`   ❌ La tabla no existe o hay error: ${checkError.message}`);
    console.log('\n⚠️  ACCIÓN REQUERIDA: Ejecuta el siguiente SQL en el SQL Editor de Supabase:');
    console.log('   https://supabase.com/dashboard/project/egkpwbyearfygmdiyswh/sql/new\n');
    console.log('─'.repeat(65));
    console.log(`CREATE TABLE IF NOT EXISTS public.products (
  id                  BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  title               TEXT NOT NULL,
  description         TEXT,
  sale_price          INTEGER NOT NULL,
  cost_price          INTEGER DEFAULT 0,
  stock               INTEGER,
  category            TEXT NOT NULL,
  image_url           TEXT,
  images              TEXT[] DEFAULT '{}',
  sizes               TEXT[] DEFAULT '{}',
  status              TEXT NOT NULL DEFAULT 'active',
  sku                 TEXT,
  shipping_profile_id TEXT DEFAULT 'shipping_standard',
  weight              NUMERIC,
  dimensions          TEXT,
  reference_image_url TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique_idx ON public.products (sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_status_idx ON public.products (status);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Productos visibles" ON public.products FOR SELECT TO anon, authenticated USING (status = 'active');
NOTIFY pgrst, 'reload schema';`);
    console.log('─'.repeat(65));
    console.log('\nDespués de ejecutar ese SQL, vuelve a correr: node create_table_and_seed.js\n');
    process.exit(0);
  } else {
    console.log('   ✅ Tabla products accesible.');
  }

  // 2. Seed productos
  console.log('\n📦 Cargando 9 productos...\n');
  let success = 0;

  for (const product of PRODUCTS) {
    console.log(`─── [${product.sku}] ${product.title}`);
    try {
      const imageUrl = await uploadImage(product.image_file, product.sku);
      await upsertProduct(product, imageUrl);
      success++;
    } catch (err) {
      console.error(`   ❌ Error inesperado: ${err.message}`);
    }
  }

  console.log(`\n${'─'.repeat(65)}`);
  console.log(`🎉 Completado: ${success}/${PRODUCTS.length} productos procesados`);
  console.log(`${'─'.repeat(65)}\n`);
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
