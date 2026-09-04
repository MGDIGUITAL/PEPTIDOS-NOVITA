const fs = require('fs');
const { execSync } = require('child_process');

const envFile = fs.readFileSync('.env', 'utf-8');
const lines = envFile.split('\n');

const envs = {};
for (const line of lines) {
  if (line.trim() && !line.startsWith('#')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      if (key && val) {
        envs[key] = val;
      }
    }
  }
}

// Add the missing NEXT_PUBLIC_BASE_URL if not in .env
if (!envs['NEXT_PUBLIC_BASE_URL']) {
  envs['NEXT_PUBLIC_BASE_URL'] = 'https://peptidosnovita.cl';
}

const keysToUpload = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'FLOW_API_KEY',
  'FLOW_SECRET_KEY',
  'GMAIL_USER',
  'GMAIL_PASS',
  'NEXT_PUBLIC_BASE_URL'
];

console.log('Subiendo variables a Vercel...');

for (const key of keysToUpload) {
  if (envs[key]) {
    try {
      console.log(`Subiendo ${key}...`);
      // Use powershell to echo the value and pipe to vercel env add
      // We use add and answer yes to overwrite if exists
      execSync(`powershell -Command "Write-Output '${envs[key]}' | npx vercel env add ${key} production"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Error subiendo ${key}`);
    }
  }
}

console.log('¡Todas las variables subidas!');
