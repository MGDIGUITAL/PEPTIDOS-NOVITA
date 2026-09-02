const { Client } = require('pg');

async function run() {
  const connectionString = `postgresql://postgres.qrhspijmfimjxemravyz:JoyasAdmin2026!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });

  try {
    await client.connect();
    console.log("Connected to Supabase.");

    // Create coupons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type VARCHAR(10) NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
        discount_value NUMERIC NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE,
        max_uses INT,
        max_uses_per_user INT DEFAULT 1,
        used_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log("Table 'coupons' created successfully.");

    // Create coupon_usages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupon_usages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        client_email VARCHAR(255) NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log("Table 'coupon_usages' created successfully.");

    // Alter orders table to record applied coupon and discount (optional but highly recommended!)
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS applied_coupon VARCHAR(50),
      ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
    `);
    console.log("Altered 'orders' table to include coupon info.");

    await client.query(`NOTIFY pgrst, 'reload schema';`);
    await client.end();
    console.log("Migration completed.");
  } catch (err) {
    console.error("Migration error:", err.message);
  }
}

run();
