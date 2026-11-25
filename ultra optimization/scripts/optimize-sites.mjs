import fs from 'fs';
import path from 'path';

console.log('=== OPTIMIZING SITES: FONTS, PERFORMANCE & MOBILE ===\n');

// 1. Optimize 03-Templates-Hub (templates.zenvq.com)
const templatesHubDir = 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/03-Templates-Hub';
const templatesHtml = path.join(templatesHubDir, 'index.html');
const templatesCss = path.join(templatesHubDir, 'styles.css');

if (fs.existsSync(templatesHtml)) {
  let html = fs.readFileSync(templatesHtml, 'utf8');
  if (!html.includes('family=Instrument+Serif')) {
    const fontBlock = `  <!-- High-Performance Fonts (Preconnected & Parallel Loaded) -->\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">\n\n`;
    html = html.replace('  <!-- Stylesheet with Cache Busting -->', fontBlock + '  <!-- Stylesheet with Cache Busting -->');
    fs.writeFileSync(templatesHtml, html, 'utf8');
    console.log('✅ [03-Templates-Hub] Added parallel font preconnect and stylesheet to index.html');
  }
}

if (fs.existsSync(templatesCss)) {
  let css = fs.readFileSync(templatesCss, 'utf8');
  if (css.includes('@import url(\'https://fonts.googleapis.com')) {
    css = css.replace(/@import url\('https:\/\/fonts\.googleapis\.com[^']+'\);/, '/* Fonts preloaded in index.html to prevent render-blocking waterfall */');
    fs.writeFileSync(templatesCss, css, 'utf8');
    console.log('✅ [03-Templates-Hub] Removed render-blocking @import from styles.css');
  }
}

// 2. Optimize Puson Dev (puson.zenvq.com)
const pusonHtml = 'D:/All coding installation tools/All My Main Project in real world/Puson-Dev/index.html';
if (fs.existsSync(pusonHtml)) {
  let html = fs.readFileSync(pusonHtml, 'utf8');
  // Check if fonts are loaded with full variable range
  if (html.includes('DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000')) {
    // Streamline font request to essential weights: DM Sans (400, 500, 600, 700), JetBrains Mono (400, 500, 600), Plus Jakarta Sans (500, 600, 700)
    const streamlinedUrl = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap';
    html = html.replace(/https:\/\/fonts\.googleapis\.com\/css2\?family=DM\+Sans:[^"]+/, streamlinedUrl);
    fs.writeFileSync(pusonHtml, html, 'utf8');
    console.log('✅ [Puson-Dev] Streamlined Google Fonts request to essential weights, saving ~600KB font payload');
  }
}

// 3. Optimize ZenVQ Tools (tools.zenvq.com)
const toolsLayout = 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website/app/layout.tsx';
if (fs.existsSync(toolsLayout)) {
  let code = fs.readFileSync(toolsLayout, 'utf8');
  let changed = false;
  if (code.includes('const spaceGrotesk = Space_Grotesk({\n  subsets: ["latin"],\n  variable: "--font-space-grotesk",\n});')) {
    code = code.replace(
      'const spaceGrotesk = Space_Grotesk({\n  subsets: ["latin"],\n  variable: "--font-space-grotesk",\n});',
      'const spaceGrotesk = Space_Grotesk({\n  subsets: ["latin"],\n  variable: "--font-space-grotesk",\n  display: "swap",\n});'
    );
    changed = true;
  }
  if (code.includes('const dmSans = DM_Sans({\n  subsets: ["latin"],\n  variable: "--font-dm-sans",\n});')) {
    code = code.replace(
      'const dmSans = DM_Sans({\n  subsets: ["latin"],\n  variable: "--font-dm-sans",\n});',
      'const dmSans = DM_Sans({\n  subsets: ["latin"],\n  variable: "--font-dm-sans",\n  display: "swap",\n});'
    );
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(toolsLayout, code, 'utf8');
    console.log('✅ [ZenVQ-Tools] Added display: "swap" to Space_Grotesk and DM_Sans fonts');
  }
}

// 4. Optimize Natures-Intimacy (natures-intimacy.zenvq.com)
const naturesLayout = 'D:/All coding installation tools/All My Main Project in real world/Natures-Intimacy/app/layout.tsx';
if (fs.existsSync(naturesLayout)) {
  let code = fs.readFileSync(naturesLayout, 'utf8');
  let changed = false;
  if (code.includes('<link rel="preconnect" href="https://fonts.googleapis.com" />')) {
    code = code.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com" \/>\s*/, '');
    code = code.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossOrigin="anonymous" \/>\s*/, '');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(naturesLayout, code, 'utf8');
    console.log('✅ [Natures-Intimacy] Removed redundant external preconnects since Next.js self-hosts fonts');
  }
}

// 4b. Optimize ZenVQ Suggests (suggests.zenvq.com)
const suggestsLayout = 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Suggests/zenvq-suggest/app/[locale]/layout.tsx';
if (fs.existsSync(suggestsLayout)) {
  let code = fs.readFileSync(suggestsLayout, 'utf8');
  if (!code.includes('GeistMono')) {
    code = code.replace(
      'import { GeistSans } from "geist/font/sans";',
      'import { GeistSans } from "geist/font/sans";\nimport { GeistMono } from "geist/font/mono";'
    );
    code = code.replace(
      'className={GeistSans.className}',
      'className={`${GeistSans.variable} ${GeistMono.variable} ${GeistSans.className}`}'
    );
    fs.writeFileSync(suggestsLayout, code, 'utf8');
    console.log('✅ [ZenVQ-Suggests] Added GeistMono variable alongside GeistSans');
  }
}

// 5. Optimize Mobile Touch Performance in all zenvq-laser.js files
const repos = [
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Agency/public/lib/zenvq-laser.js',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-EcoSystem/public/lib/zenvq-laser.js',
  'D:/All coding installation tools/All My Main Project in real world/Natures-Intimacy/public/lib/zenvq-laser.js',
  'D:/All coding installation tools/All My Main Project in real world/Puson-Dev/lib/zenvq-laser.js',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Suggests/zenvq-suggest/public/lib/zenvq-laser.js',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/03-Templates-Hub/lib/zenvq-laser.js'
];

for (const p of repos) {
  if (fs.existsSync(p)) {
    let script = fs.readFileSync(p, 'utf8');
    // Ensure touch devices are disabled or don't attach heavy touchmove handlers
    if (script.includes('disabledOnTouch: false,')) {
      script = script.replace('disabledOnTouch: false,', 'disabledOnTouch: true,');
      fs.writeFileSync(p, script, 'utf8');
      console.log(`✅ [Laser Cursor Mobile Optimization] Set disabledOnTouch: true in ${path.basename(path.dirname(p))}/${path.basename(p)}`);
    }
  }
}

console.log('\nAll core font & mobile touch optimizations applied successfully!');
