require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function tryPooler(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Trying ${host}...`);
  const pool = new Pool({
    host,
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: process.env.DATABASE_PASSWORD || process.env.SUPABASE_DB_PASSWORD || 'JoyasAdmin2026!',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log(`SUCCESS connected to ${host}!`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_carts (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        email text NOT NULL,
        full_name text,
        items jsonb NOT NULL DEFAULT '[]'::jsonb,
        subtotal numeric DEFAULT 0,
        status text NOT NULL DEFAULT 'active',
        email_sent boolean DEFAULT false,
        email_sent_at timestamptz,
        last_activity_at timestamptz DEFAULT now(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_user_carts_abandoned ON public.user_carts (status, email_sent, updated_at);
      ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_carts' AND policyname='Service role full access') THEN
          CREATE POLICY "Service role full access" ON public.user_carts FOR ALL TO service_role USING (true) WITH CHECK (true);
        END IF;
      END $$;
      NOTIFY pgrst, 'reload schema';
    `);
    console.log('✅ Table user_carts created!');
    client.release();
    await pool.end();
    return true;
  } catch (err) {
    // console.error(`Error on ${host}:`, err.message);
    await pool.end();
    return false;
  }
}

async function test() {
  console.log('Testing user_carts table with Supabase Admin...');
  const { data, error } = await supabaseAdmin.from('user_carts').select('*').limit(1);
  if (!error) {
    console.log('SUCCESS: Table user_carts already exists!', data);
    return;
  }

  const regions = ['sa-east-1', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1'];
  for (const r of regions) {
    if (await tryPooler(r)) break;
  }
}

test().catch(err => console.error(err));
