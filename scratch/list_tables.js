const { Client } = require('pg');

async function run() {
  const connectionString = `postgresql://postgres.qrhspijmfimjxemravyz:JoyasAdmin2026!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });

  try {
    await client.connect();
    console.log("Connected to Supabase.");

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log("Tables:", res.rows.map(r => r.table_name));
    await client.end();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
