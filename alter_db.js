const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://postgres:JoyasAdmin2026!@db.qrhspijmfimjxemravyz.supabase.co:5432/postgres';
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    // Add column if not exists
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS reference_image_url TEXT;`);
    console.log("Added column reference_image_url.");

    // Reload schema cache
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log("Reloaded schema cache.");

  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

run();
