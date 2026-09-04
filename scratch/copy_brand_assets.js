const fs = require('fs');
const path = require('path');

const baseDir = 'd:/PEPTIDOS';
const publicDir = path.join(baseDir, 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Copy Logos
const logoSrc1 = path.join(baseDir, 'LOGO', 'LOGO SIN FONDO.png');
const logoDest1 = path.join(publicDir, 'logo-nova-white.png');

const logoSrc2 = path.join(baseDir, 'LOGO', 'Logotipo NOVA Performance en Blanco y Negro.png');
const logoDest2 = path.join(publicDir, 'logo-nova-bw.png');

const paletteSrc = path.join(baseDir, 'LOGO', 'paleta de colores.png');
const paletteDest = path.join(publicDir, 'paleta-colores.png');

const iconsSrc = path.join(baseDir, 'LOGO', 'iconos.png');
const iconsDest = path.join(publicDir, 'iconos-nova.png');

if (fs.existsSync(logoSrc1)) {
  fs.copyFileSync(logoSrc1, logoDest1);
  console.log("✓ Copiado logo-nova-white.png");
}

if (fs.existsSync(logoSrc2)) {
  fs.copyFileSync(logoSrc2, logoDest2);
  console.log("✓ Copiado logo-nova-bw.png");
}

if (fs.existsSync(paletteSrc)) {
  fs.copyFileSync(paletteSrc, paletteDest);
  console.log("✓ Copiado paleta-colores.png");
}

if (fs.existsSync(iconsSrc)) {
  fs.copyFileSync(iconsSrc, iconsDest);
  console.log("✓ Copiado iconos-nova.png");
}

// 2. Copy Backgrounds from Fondos/
const fondosDir = path.join(baseDir, 'Fondos');
if (fs.existsSync(fondosDir)) {
  const files = fs.readdirSync(fondosDir);
  files.forEach(file => {
    const srcFile = path.join(fondosDir, file);
    // sanitize filename for URL
    const destName = file.toLowerCase().replace(/\s+/g, '-');
    const destFile = path.join(publicDir, destName);
    fs.copyFileSync(srcFile, destFile);
    console.log(`✓ Copiado fondo: ${destName}`);
  });
}
