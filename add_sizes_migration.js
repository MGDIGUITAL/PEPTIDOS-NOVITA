const { Client } = require('pg');

async function tryConnect(host, user, port) {
  const connectionString = `postgresql://${user}:JoyasAdmin2026!@${host}:${port}/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`Connected to ${host}`);

    // Add sizes column to products
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT NULL;
    `);
    console.log("Column 'sizes' added to 'products'.");

    // Add size column to order_items
    await client.query(`
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size text DEFAULT NULL;
    `);
    console.log("Column 'size' added to 'order_items'.");

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
