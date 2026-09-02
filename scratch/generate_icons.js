const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#1A1A1A"/>
          <stop offset="100%" stop-color="#050505"/>
        </radialGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F4E0A5"/>
          <stop offset="50%" stop-color="#D4B878"/>
          <stop offset="100%" stop-color="#B8975A"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="100" fill="url(#bgGrad)"/>
      <rect x="12" y="12" width="488" height="488" rx="88" fill="none" stroke="url(#goldGrad)" stroke-width="6" opacity="0.7"/>
      
      <path d="M 390 120 Q 390 150 420 150 Q 390 150 390 180 Q 390 150 360 150 Q 390 150 390 120 Z" fill="url(#goldGrad)"/>
      <path d="M 120 370 Q 120 385 135 385 Q 120 385 120 400 Q 120 385 105 385 Q 120 385 120 370 Z" fill="url(#goldGrad)" opacity="0.8"/>

      <g fill="url(#goldGrad)">
        <path d="M 205 130 L 110 390 L 155 390 L 195 275 L 317 275 L 357 390 L 402 390 L 307 130 Z M 210 232 L 256 160 L 302 232 Z" />
        <path d="M 256 310 Q 256 345 291 345 Q 256 345 256 380 Q 256 345 221 345 Q 256 345 256 310 Z" />
      </g>

      <text x="256" y="445" font-family="'Georgia', 'Times New Roman', serif" font-size="36" font-weight="700" letter-spacing="9" fill="#FDFCF8" text-anchor="middle">AMORA</text>
    </svg>
  `;

  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svgIcon);

  async function renderToBuffer(html, width, height) {
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    return await page.screenshot({ type: 'png', omitBackground: false });
  }

  const iconHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #080808; display: flex; align-items: center; justify-content: center; }
          svg { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        ${svgIcon}
      </body>
    </html>
  `;

  const png512 = await renderToBuffer(iconHtml, 512, 512);
  fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), png512);
  fs.writeFileSync(path.join(__dirname, '../public/icon.png'), png512);
  fs.writeFileSync(path.join(__dirname, '../app/icon.png'), png512);

  const png180 = await renderToBuffer(iconHtml, 180, 180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-icon.png'), png180);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(__dirname, '../app/apple-icon.png'), png180);

  const png32 = await renderToBuffer(iconHtml, 32, 32);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), png32);
  fs.writeFileSync(path.join(__dirname, '../app/favicon.ico'), png32);

  const ogHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0; padding: 0; width: 1200px; height: 630px;
            background: linear-gradient(135deg, #0D0D0D 0%, #050505 100%);
            color: #FFFFFF; font-family: 'Georgia', 'Times New Roman', serif;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            position: relative; box-sizing: border-box; border: 12px solid #1A1A1A;
          }
          .gold-border {
            position: absolute; inset: 24px; border: 1px solid rgba(184, 151, 90, 0.4);
            pointer-events: none;
          }
          .sparkle-top {
            position: absolute; top: 40px; right: 60px; color: #D4B878; font-size: 28px;
          }
          .sparkle-bottom {
            position: absolute; bottom: 40px; left: 60px; color: #D4B878; font-size: 24px;
          }
          .logo-mark {
            font-size: 64px; letter-spacing: 0.35em;
            color: #FDFCF8; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;
            text-shadow: 0 4px 20px rgba(0,0,0,0.8);
          }
          .sub-title {
            font-size: 20px; letter-spacing: 0.5em;
            color: #B8975A; text-transform: uppercase; margin-bottom: 40px;
          }
          .divider {
            width: 120px; height: 1px; background: linear-gradient(90deg, transparent, #B8975A, transparent);
            margin-bottom: 32px;
          }
          .headline {
            font-size: 32px; font-weight: 400;
            color: rgba(253, 252, 248, 0.9); margin-bottom: 16px; text-align: center;
          }
          .tagline {
            font-size: 18px; color: #A09A8E; letter-spacing: 0.08em; text-transform: uppercase; font-family: sans-serif;
          }
          .badge {
            margin-top: 36px; padding: 10px 28px; border: 1px solid #B8975A;
            color: #D4B878; font-size: 14px; letter-spacing: 0.2em;
            background: rgba(184, 151, 90, 0.08); border-radius: 4px; font-family: sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="gold-border"></div>
        <div class="sparkle-top">✦</div>
        <div class="sparkle-bottom">✦</div>

        <div class="logo-mark">AMORA</div>
        <div class="sub-title">✦ JEWELRY ✦</div>
        <div class="divider"></div>
        <div class="headline">Alta Joyería Premium en Chile</div>
        <div class="tagline">Anillos • Collares • Pulseras • Aros de Lujo</div>
        <div class="badge">ENVÍOS A TODO CHILE | AMORAJEWELRY.CL</div>
      </body>
    </html>
  `;

  const ogBuffer = await renderToBuffer(ogHtml, 1200, 630);
  fs.writeFileSync(path.join(__dirname, '../public/og-image.png'), ogBuffer);
  console.log('ALL ICONS AND OG-IMAGE GENERATED SUCCESSFULLY');

  await browser.close();
})();
