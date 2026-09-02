const { Client } = require('pg');

async function tryConnect(host, user, port) {
  const connectionString = `postgresql://${user}:JoyasAdmin2026!@${host}:${port}/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`Connected to ${host}`);

    // 1. Añadir columnas a 'orders' si no existen
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS tracking_number TEXT,
      ADD COLUMN IF NOT EXISTS courier TEXT DEFAULT 'Blue Express';
    `);
    console.log("Updated 'orders' table.");

    // 2. Añadir 'cost_price' a 'products' si no existe
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS cost_price INTEGER DEFAULT 0;
    `);
    console.log("Updated 'products' table.");

    // 3. Crear tabla 'expenses' para Centros de Costos
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT DEFAULT 'Pagado'
      );
    `);
    console.log("Table 'expenses' ready.");

    // 4. Insertar datos ficticios (Fake Data) para probar el ERP
    // Eliminar gastos anteriores para no duplicar
    await client.query(`DELETE FROM expenses;`);
    
    // Insertar gastos
    await client.query(`
      INSERT INTO expenses (date, category, description, amount) VALUES
      (CURRENT_DATE - INTERVAL '2 days', 'Marketing', 'Campaña Instagram Ads', 45000),
      (CURRENT_DATE - INTERVAL '5 days', 'Logística', 'Cajas de embalaje premium', 120000),
      (CURRENT_DATE - INTERVAL '10 days', 'Suscripciones', 'Shopify / Vercel', 25000),
      (CURRENT_DATE - INTERVAL '15 days', 'Marketing', 'Facebook Ads', 60000),
      (CURRENT_DATE - INTERVAL '1 month', 'Sueldos', 'Sueldo Empacador', 350000);
    `);
    console.log("Inserted fake expenses.");

    // Asegurarse de que los productos tengan un costo base (ejemplo: 40% del sale_price)
    await client.query(`
      UPDATE products SET cost_price = CAST(sale_price * 0.4 AS INTEGER) WHERE cost_price = 0 OR cost_price IS NULL;
    `);
    console.log("Updated cost_prices for products.");

    // Recargar schema de PostgREST para Supabase
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log("Reloaded schema cache.");

    await client.end();
    return true;
  } catch (err) {
    console.log("Error on", host, err.message);
    return false;
  }
}

async function run() {
  const ref = 'qrhspijmfimjxemravyz';
  const regions = ['sa-east-1', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1'];
  
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const user = `postgres.${ref}`;
    console.log(`Trying ${host}...`);
    if (await tryConnect(host, user, 6543)) {
      console.log("SUCCESS!");
      return;
    }
  }
  console.log("Could not connect via poolers.");
}

run();
