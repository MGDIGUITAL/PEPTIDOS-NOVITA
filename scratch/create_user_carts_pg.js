require('dotenv').config();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  console.log('Sending DDL via /pg endpoint...');
  const res = await fetch(`${SUPABASE_URL}/pg`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      query: `
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
      `
    })
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

run();
