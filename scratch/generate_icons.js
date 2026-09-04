const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#000000"/>
  <rect x="16" y="16" width="480" height="480" rx="80" fill="none" stroke="#222222" stroke-width="8"/>
  <!-- Stylized N for NOVA Performance -->
  <path d="M 124 372 V 140 H 184 L 328 308 V 140 H 388 V 372 H 328 L 184 204 V 372 Z" fill="#FFFFFF"/>
  <rect x="124" y="376" width="264" height="12" fill="#E6E2D3" rx="4"/>
</svg>`;

  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svgContent);
  console.log('Saved public/favicon.svg');

  const png512 = await sharp(Buffer.from(svgContent)).resize(512, 512).toBuffer();
  const png180 = await sharp(Buffer.from(svgContent)).resize(180, 180).toBuffer();
  const png32 = await sharp(Buffer.from(svgContent)).resize(32, 32).toBuffer();

  fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), png512);
  fs.writeFileSync(path.join(__dirname, '../public/icon.png'), png512);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-icon.png'), png180);
  fs.writeFileSync(path.join(__dirname, '../public/favicon-32.png'), png32);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), png32);

  fs.writeFileSync(path.join(__dirname, '../app/icon.png'), png512);
  fs.writeFileSync(path.join(__dirname, '../app/apple-icon.png'), png180);
  fs.writeFileSync(path.join(__dirname, '../app/favicon.ico'), png32);

  console.log('Successfully generated all NOVA Performance favicons!');
}

main().catch(console.error);
