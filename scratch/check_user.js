require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkUser() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  
  console.log(`Found ${users.length} users in auth.users:`);
  users.forEach(u => {
    console.log(`- ID: ${u.id} | Email: ${u.email} | ConfirmedAt: ${u.email_confirmed_at} | CreatedAt: ${u.created_at}`);
    console.log(`  User Metadata:`, u.user_metadata);
  });
}

checkUser();
