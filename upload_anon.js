const fs = require('fs');
const { execSync } = require('child_process');

const envFile = fs.readFileSync('.env', 'utf-8');
const anonLine = envFile.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='));
if (anonLine) {
  const val = anonLine.split('=')[1].trim();
  console.log('Subiendo NEXT_PUBLIC_SUPABASE_ANON_KEY...');
  execSync(`powershell -Command "Write-Output '${val}' | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --type config"`, { stdio: 'inherit' });
}
