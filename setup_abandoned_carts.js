require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERROR: Faltan credenciales de Supabase en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function setup() {
  console.log('Creando/verificando tabla user_carts en Supabase...');

  // 1. Crear tabla user_carts si no existe
  const createTableSql = `
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
  `;

  const { error: e1 } = await supabase.rpc('exec_sql', { sql: createTableSql });
  if (e1) console.log('Resultado tabla user_carts:', e1.message);
  else console.log('✓ Tabla user_carts verificada/creada');

  // 2. Habilitar RLS
  const { error: e2 } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;`
  });
  if (e2) console.log('RLS info:', e2.message);
  else console.log('✓ RLS habilitado en user_carts');

  // 3. Crear políticas RLS
  const rlsSql = `
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_carts' AND policyname='Service role full access') THEN
        CREATE POLICY "Service role full access" ON public.user_carts FOR ALL TO service_role USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `;
  const { error: e3 } = await supabase.rpc('exec_sql', { sql: rlsSql });
  if (e3) console.log('Policy info:', e3.message);
  else console.log('✓ Políticas RLS verificadas');

  // 4. Crear índice para acelerar consultas de carritos abandonados
  const indexSql = `
    CREATE INDEX IF NOT EXISTS idx_user_carts_abandoned 
    ON public.user_carts (status, email_sent, updated_at);
  `;
  const { error: e4 } = await supabase.rpc('exec_sql', { sql: indexSql });
  if (e4) console.log('Índice info:', e4.message);
  else console.log('✓ Índice de carritos abandonados creado');

  console.log('\n✅ Configuración de base de datos para carritos completada exitosamente.');
}

setup().catch(err => {
  console.error('Error en setup:', err);
});
