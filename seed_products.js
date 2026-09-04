/**
 * seed_products.js — NOVA Performance® Product Seeder
 * Sube imágenes a Supabase Storage e inserta los 9 productos en la tabla `products`.
 * Ejecutar con: node seed_products.js
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
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── Datos completos de productos ──────────────────────────────────────────
const PRODUCTS = [
  {
    title: 'Retatrutide 10mg — Péptido Triagonista GLP-1/GIP/Glucagón',
    sku: 'RT10',
    category: 'Péptidos GLP-1',
    sale_price: 139990,
    cost_price: 73000,
    stock: null,
    status: 'active',
    description: `Retatrutide 10mg (RT10) es un péptido triagonista de última generación que actúa simultáneamente sobre los receptores GLP-1, GIP y Glucagón. Especificación: 10mg × 1 Vial liofilizado de alta pureza. Uso exclusivo para investigación científica. Sin IVA incluido.

• SKU: RT10 | Especificación: 10mg × 1 vial
• Categoría: Péptidos GLP-1 / Triagonistas
• Alta pureza de síntesis | Polvo liofilizado para reconstitución
• Keywords: retatrutide 10mg, RT10, péptido GLP-1, triagonista, liofilizado, péptidos chile`,
    image_file: 'Retatrutide_RT10-10MG.jpeg',
  },
  {
    title: 'Retatrutide 20mg — Péptido Triagonista GLP-1/GIP/Glucagón',
    sku: 'RT20',
    category: 'Péptidos GLP-1',
    sale_price: 209990,
    cost_price: 140000,
    stock: null,
    status: 'active',
    description: `Retatrutide 20mg (RT20) es un péptido triagonista de última generación que actúa simultáneamente sobre los receptores GLP-1, GIP y Glucagón. Presentación de mayor rendimiento para protocolos de investigación extendidos. Especificación: 20mg × 1 Vial liofilizado de alta pureza.

• SKU: RT20 | Especificación: 20mg × 1 vial
• Categoría: Péptidos GLP-1 / Triagonistas
• Alta pureza de síntesis | Polvo liofilizado para reconstitución
• Keywords: retatrutide 20mg, RT20, péptido GLP-1, triagonista, liofilizado, péptidos chile`,
    image_file: 'RETATRUIDE-RT20-20MG.jpeg',
  },
  {
    title: 'GHK-Cu 100mg — Péptido de Cobre Anti-Aging y Regenerativo',
    sku: 'CU100',
    category: 'Péptidos Regenerativos',
    sale_price: 119990,
    cost_price: 63000,
    stock: null,
    status: 'active',
    description: `GHK-Cu 100mg (CU100) es un tripéptido de cobre naturalmente presente en el cuerpo humano, conocido por sus propiedades regenerativas, antioxidantes y anti-envejecimiento. Ampliamente investigado para recuperación tisular, síntesis de colágeno y regeneración celular. Especificación: 100mg × 1 Vial.

• SKU: CU100 | Especificación: 100mg × 1 vial
• Categoría: Péptidos Regenerativos / Anti-aging
• Alta pureza de síntesis | Polvo liofilizado estéril
• Keywords: GHK-Cu, cobre péptido, CU100, anti-aging, regenerativo, colágeno, péptidos chile`,
    image_file: 'GHK-CU-CU100-100MG.jpeg',
  },
  {
    title: 'BPC-157 10mg — Péptido de Protección y Recuperación Tisular',
    sku: 'BC10',
    category: 'Péptidos Regenerativos',
    sale_price: 89990,
    cost_price: 60000,
    stock: null,
    status: 'active',
    description: `BPC-157 10mg (BC10) es un pentadecapéptido derivado de la proteína de protección gástrica, ampliamente estudiado en investigación por su potencial en recuperación tisular, protección gastrointestinal y regeneración musculoesquelética. Especificación: 10mg × 1 Vial liofilizado.

• SKU: BC10 | Especificación: 10mg × 1 vial
• Categoría: Péptidos Regenerativos
• Polvo liofilizado de alta pureza para reconstitución
• Keywords: BPC-157, BPC157, péptido regenerativo, BC10, recuperación tisular, péptidos chile`,
    image_file: 'BCP-157-BC10-10MG.jpeg',
  },
  {
    title: 'MOTS-c 10mg — Péptido Mitocondrial para el Metabolismo Energético',
    sku: 'MS10',
    category: 'Péptidos Mitocondriales',
    sale_price: 94990,
    cost_price: 65000,
    stock: null,
    status: 'active',
    description: `MOTS-c 10mg (MS10) es un péptido mitocondrial que actúa como regulador metabólico y de la homeostasis energética celular. Derivado del ARN mitocondrial, es estudiado por su influencia en el metabolismo de la glucosa, resistencia al ejercicio y longevidad celular. Especificación: 10mg × 1 Vial.

• SKU: MS10 | Especificación: 10mg × 1 vial
• Categoría: Péptidos Mitocondriales
• Polvo liofilizado de alta pureza
• Keywords: MOTS-c, péptido mitocondrial, MS10, metabolismo, energía celular, glucosa, péptidos chile`,
    image_file: 'MOTS-c-MS10-10MG.jpeg',
  },
  {
    title: 'Tesamorelin 10mg — Análogo Sintético GHRH Hormona de Crecimiento',
    sku: 'TSM10',
    category: 'Péptidos GHRH',
    sale_price: 129990,
    cost_price: 100000,
    stock: null,
    status: 'active',
    description: `Tesamorelin 10mg (TSM10) es un análogo sintético del Factor Liberador de Hormona de Crecimiento (GHRH), estudiado por su capacidad de estimular la secreción de GH de forma pulsátil y fisiológica, sin elevar cortisol ni prolactina. Especificación: 10mg × 1 Vial liofilizado.

• SKU: TSM10 | Especificación: 10mg × 1 vial
• Categoría: Péptidos GHRH / Hormona de Crecimiento
• Polvo liofilizado de alta pureza para reconstitución
• Keywords: tesamorelin 10mg, TSM10, GHRH, hormona crecimiento, péptidos chile, liofilizado`,
    image_file: 'TESAMORELIN-TSM10-10MG.jpeg',
  },
  {
    title: 'Tesamorelin 20mg — Análogo Sintético GHRH Hormona de Crecimiento',
    sku: 'TSM20',
    category: 'Péptidos GHRH',
    sale_price: 190000,
    cost_price: 153000,
    stock: null,
    status: 'active',
    description: `Tesamorelin 20mg (TSM20) es un análogo sintético del Factor Liberador de Hormona de Crecimiento (GHRH), en presentación de mayor rendimiento para protocolos de investigación extendidos. Estimula la secreción de GH de forma pulsátil y fisiológica. Especificación: 20mg × 1 Vial liofilizado.

• SKU: TSM20 | Especificación: 20mg × 1 vial
• Categoría: Péptidos GHRH / Hormona de Crecimiento
• Polvo liofilizado de alta pureza para reconstitución
• Keywords: tesamorelin 20mg, TSM20, GHRH, hormona crecimiento, péptidos chile, liofilizado`,
    image_file: 'TESAMORELIN-TSM20-20MG.jpeg',
  },
  {
    title: 'CJC-1295 sin DAC + Ipamorelin 10mg — Stack GHRH/GHRP Péptidos',
    sku: 'CJCIP',
    category: 'Péptidos GHRH',
    sale_price: 129990,
    cost_price: 67000,
    stock: null,
    status: 'active',
    description: `CJC-1295 sin DAC + Ipamorelin 10mg (CJCIP) es una combinación sinérgica de dos péptidos: CJC-1295 (análogo GHRH) e Ipamorelin (secretagogo selectivo de GH). Esta sinergia estimula una liberación pulsátil de hormona de crecimiento sin elevar cortisol ni prolactina. Especificación: 10mg × 1 Vial.

• SKU: CJCIP | Especificación: 10mg × 1 vial (combinación)
• Categoría: Péptidos GHRH / Stack GH
• Polvo liofilizado de alta pureza para reconstitución
• Keywords: CJC-1295, ipamorelin, CJCIP, GHRH, GHRP, stack péptidos, secretagogo GH, péptidos chile`,
    image_file: 'CJC-N-DAC+IPA-CJCIP-10MG.jpeg',
  },
  {
    title: 'Agua Bacteriostática 3ml — Solvente para Reconstitución de Péptidos',
    sku: 'BAC10',
    category: 'Accesorios',
    sale_price: 7990,
    cost_price: 6000,
    stock: null,
    status: 'active',
    description: `Agua Bacteriostática 3ml (BAC10) es el solvente estéril indispensable para la reconstitución segura de péptidos liofilizados. Contiene alcohol bencílico al 0.9% como agente bacteriostático que previene el crecimiento microbiano, permitiendo extracciones múltiples del vial de forma segura y aséptica.

• SKU: BAC10 | Especificación: 3ml × 1 vial estéril
• Categoría: Accesorios / Solventes
• Compatible con todos los péptidos liofilizados NOVA Performance®
• Keywords: agua bacteriostática, solvente péptidos, reconstitución, BAC10, vial estéril, bencílico`,
    image_file: 'AGUA-BAC-BAC10-3ML.jpeg',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.warn(`⚠️  No se pudo verificar buckets: ${error.message}. Continuando...`);
    return;
  }
  const exists = buckets?.some(b => b.name === BUCKET);
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (createErr) {
      console.warn(`⚠️  No se pudo crear el bucket (puede que ya exista): ${createErr.message}`);
    } else {
      console.log(`✅ Bucket "${BUCKET}" creado.`);
    }
  } else {
    console.log(`✔️  Bucket "${BUCKET}" ya existe.`);
  }
}

async function uploadImage(imageFile, sku) {
  const filePath = path.join(IMAGES_DIR, imageFile);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Imagen no encontrada: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(imageFile).toLowerCase().replace('.', '');
  const mimeType = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : `image/${ext}`;
  const storagePath = `products/${sku.toLowerCase()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: mimeType,
    upsert: true,
  });

  if (error) {
    console.error(`❌ Error subiendo ${imageFile}: ${error.message}`);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  console.log(`   📸 Imagen → ${publicUrl}`);
  return publicUrl;
}

async function upsertProduct(product, imageUrl) {
  // Verificar si ya existe por SKU para hacer upsert
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('sku', product.sku)
    .maybeSingle();

  const dbPayload = {
    title:              product.title,
    description:        product.description,
    category:           product.category,
    sale_price:         product.sale_price,
    cost_price:         product.cost_price,
    sku:                product.sku,
    stock:              product.stock,
    status:             product.status,
    image_url:          imageUrl || null,
    images:             imageUrl ? [imageUrl] : [],
    sizes:              [],
    shipping_profile_id: 'shipping_standard',
    created_at:         new Date().toISOString(),
  };

  if (existing) {
    // Actualizar (no tocar created_at)
    delete dbPayload.created_at;
    const { error } = await supabase.from('products').update(dbPayload).eq('sku', product.sku);
    if (error) {
      console.error(`   ❌ Error actualizando ${product.sku}: ${error.message}`);
    } else {
      console.log(`   🔄 Producto actualizado en DB.`);
    }
  } else {
    const { error } = await supabase.from('products').insert(dbPayload);
    if (error) {
      console.error(`   ❌ Error insertando ${product.sku}: ${error.message}`);
    } else {
      console.log(`   ✅ Producto insertado en DB.`);
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 NOVA Performance® — Iniciando carga de productos...\n');
  console.log(`🔗 Supabase: ${SUPABASE_URL}`);
  console.log(`📁 Imágenes: ${IMAGES_DIR}\n`);

  await ensureBucket();

  let success = 0;
  let failed = 0;

  for (const product of PRODUCTS) {
    console.log(`\n─── [${product.sku}] ${product.title}`);
    try {
      const imageUrl = await uploadImage(product.image_file, product.sku);
      await upsertProduct(product, imageUrl);
      success++;
    } catch (err) {
      console.error(`   ❌ Error inesperado: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`🎉 Completado: ${success} productos OK | ${failed} errores`);
  console.log(`${'─'.repeat(60)}\n`);
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
