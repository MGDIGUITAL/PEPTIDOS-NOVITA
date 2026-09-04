const { execSync } = require('child_process');

try {
  console.log('Eliminando variable antigua NEXT_PUBLIC_BASE_URL de Vercel...');
  try {
    execSync('npx vercel env rm NEXT_PUBLIC_BASE_URL production -y', { stdio: 'inherit' });
  } catch (e) {
    console.log('No se pudo eliminar o no existía previamente.');
  }

  console.log('Agregando NEXT_PUBLIC_BASE_URL=https://novaperformance.cl a Vercel...');
  execSync('powershell -Command "echo https://novaperformance.cl | npx vercel env add NEXT_PUBLIC_BASE_URL production"', { stdio: 'inherit' });

  console.log('✅ Variable NEXT_PUBLIC_BASE_URL actualizada exitosamente a https://novaperformance.cl en Vercel.');
} catch (err) {
  console.error('Error actualizando la variable:', err.message);
}
