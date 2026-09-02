require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function confirmUser() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    '17277376-3e06-4e81-bfe8-325c0d89f3de',
    { email_confirm: true }
  );

  if (error) {
    console.error('Error confirming user:', error);
  } else {
    console.log('Successfully confirmed user email for vision.code.vs@gmail.com!');
  }
}

confirmUser();
