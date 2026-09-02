/**
 * Regenera todos los favicons y PWA icons desde icon-512.png (la "A" dorada)
 * Ejecutar: node scratch/regen_favicons.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../public/icon-512.png');
const PUB = path.join(__dirname, '../public');
const APP = path.join(__dirname, '../app');

async function resizePng(src, dest, size) {
  await sharp(src).resize(size, size, { fit: 'cover' }).png().toFile(dest);
  console.log(`✓ ${path.basename(dest)} (${size}x${size})`);
}

async function main() {
  // 1. favicon.ico → requiere un PNG 32x32 renombrado como .ico (Chrome/Firefox leen PNG dentro de .ico)
  //    Usamos el PNG directamente como .ico (es soportado por todos los browsers modernos y Googlebot)
  await sharp(SRC).resize(48, 48).png().toFile(path.join(PUB, 'favicon.ico'));
  await sharp(SRC).resize(48, 48).png().toFile(path.join(APP, 'favicon.ico'));
  console.log('✓ favicon.ico (48x48)');

  // 2. icon.png 192x192 (PWA / Android / Googlebot)
  await resizePng(SRC, path.join(PUB, 'icon.png'), 192);
  await resizePng(SRC, path.join(APP, 'icon.png'), 192);

  // 3. apple-touch-icon 180x180 (iOS)
  await resizePng(SRC, path.join(PUB, 'apple-touch-icon.png'), 180);
  await resizePng(SRC, path.join(PUB, 'apple-icon.png'), 180);
  await resizePng(SRC, path.join(APP, 'apple-icon.png'), 180);

  // 4. icon-512.png queda igual (ya es correcto)
  console.log('✓ icon-512.png (sin cambios, ya es correcto)');

  // 5. favicon.svg (fallback SVG simple basado en la "A" de Amora con fondo oscuro)
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1A1A1A"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F4E0A5"/>
      <stop offset="50%" stop-color="#D4B878"/>
      <stop offset="100%" stop-color="#B8975A"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="10" fill="url(#bg)"/>
  <path d="M 24 8 L 8 40 L 13 40 L 17.5 28 L 30.5 28 L 35 40 L 40 40 L 24 8 Z M 19.5 24 L 24 14 L 28.5 24 Z" fill="url(#gold)"/>
</svg>`;
  fs.writeFileSync(path.join(PUB, 'favicon.svg'), svgContent);
  console.log('✓ favicon.svg actualizado');

  console.log('\n🎉 Todos los favicons regenerados correctamente desde icon-512.png');
}

main().catch(console.error);
