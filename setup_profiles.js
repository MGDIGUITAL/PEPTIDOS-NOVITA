// Script para crear tabla profiles y trigger en Supabase
// Ejecutar: node setup_profiles.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qrhspijmfimjxemravyz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaHNwaWptZmltanhlbXJhdnl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUxNDYyNiwiZXhwIjoyMTAzMDkwNjI2fQ.cWsGJFUY14juC5lpK-966uADtf9rrErcIFXIDR0c87k';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function setup() {
  console.log('Creando tabla profiles...');

  // Step 1: Create profiles table
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        full_name text,
        phone text,
        rut text,
        role text NOT NULL DEFAULT 'cliente',
        created_at timestamptz DEFAULT now()
      );
    `
  });
  if (e1) console.log('Tabla ya existe o creada:', e1.message);
  else console.log('✓ Tabla profiles creada');

  // Step 2: Enable RLS
  const { error: e2 } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`
  });
  if (e2) console.log('RLS info:', e2.message);
  else console.log('✓ RLS activado');

  // Step 3: RLS Policy
  const { error: e3 } = await supabase.rpc('exec_sql', {
    sql: `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Perfil propio') THEN
          CREATE POLICY "Perfil propio" ON public.profiles FOR ALL TO authenticated
          USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);
        END IF;
      END $$;
    `
  });
  if (e3) console.log('Policy info:', e3.message);
  else console.log('✓ RLS policy creada');

  // Step 4: Trigger function
  const { error: e4 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS
      $$
      BEGIN
        INSERT INTO public.profiles (id, full_name, phone, rut, role)
        VALUES (
          NEW.id,
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'phone',
          NEW.raw_user_meta_data->>'rut',
          COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
        );
        RETURN NEW;
      END;
      $$;
    `
  });
  if (e4) console.log('Function info:', e4.message);
  else console.log('✓ Función trigger creada');

  // Step 5: Create trigger
  const { error: e5 } = await supabase.rpc('exec_sql', {
    sql: `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `
  });
  if (e5) console.log('Trigger info:', e5.message);
  else console.log('✓ Trigger creado');

  console.log('\nEjecución completada. Revisa los resultados arriba.');
}

setup().catch(console.error);
