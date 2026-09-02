const { Client } = require('pg');

async function tryConnect(host, user, port) {
  const connectionString = `postgresql://${user}:JoyasAdmin2026!@${host}:${port}/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`Connected to ${host}`);

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number SERIAL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        client_name TEXT NOT NULL,
        client_rut TEXT NOT NULL,
        client_email TEXT NOT NULL,
        client_phone TEXT,
        
        delivery_method TEXT NOT NULL,
        shipping_region TEXT NOT NULL,
        shipping_comuna TEXT NOT NULL,
        shipping_address TEXT,
        pickup_point_name TEXT,
        pickup_point_address TEXT,
        
        subtotal INTEGER NOT NULL,
        shipping_cost INTEGER NOT NULL,
        total INTEGER NOT NULL,
        
        status TEXT NOT NULL DEFAULT 'Pendiente'
      );
    `);
    console.log("Table 'orders' ready.");

    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id BIGINT REFERENCES products(id),
        product_title TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL
      );
    `);
    console.log("Table 'order_items' ready.");

    // Reload schema
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
