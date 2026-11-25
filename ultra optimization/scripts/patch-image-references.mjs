import fs from 'fs';

console.log('=== PATCHING CODE REFERENCES TO USE COMPACT WebP ===\n');

// 1. mediadrop-website templates/page.tsx
const mediaDropTemplates = 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website/app/templates/page.tsx';
if (fs.existsSync(mediaDropTemplates)) {
  let content = fs.readFileSync(mediaDropTemplates, 'utf8');
  content = content.replace(/\/images\/boutique_mobile\.png\?v=4/g, '/images/boutique_mobile.webp?v=5');
  content = content.replace(/\/images\/boutique_tablet\.png\?v=4/g, '/images/boutique_tablet.webp?v=5');
  content = content.replace(/\/images\/boutique_preview\.png\?v=4/g, '/images/boutique_preview.webp?v=5');
  content = content.replace(/\/images\/dental_mobile\.png\?v=4/g, '/images/dental_mobile.webp?v=5');
  content = content.replace(/\/images\/dental_tablet\.png\?v=4/g, '/images/dental_tablet.webp?v=5');
  content = content.replace(/\/images\/dental_preview\.png\?v=4/g, '/images/dental_preview.webp?v=5');
  fs.writeFileSync(mediaDropTemplates, content, 'utf8');
  console.log('✅ [mediadrop-website] Updated templates/page.tsx to use .webp images');
}

// 2. ZenVQ-Agency demo-data.ts
const agencyDemoData = 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Agency/lib/demo-data.ts';
if (fs.existsSync(agencyDemoData)) {
  let content = fs.readFileSync(agencyDemoData, 'utf8');
  content = content.replace(/\/portfolio\/creative\/codecraft-editorial\.png/g, '/portfolio/creative/codecraft-editorial.webp');
  content = content.replace(/\/portfolio\/creative\/roll-typography-motion\.png/g, '/portfolio/creative/roll-typography-motion.webp');
  fs.writeFileSync(agencyDemoData, content, 'utf8');
  console.log('✅ [ZenVQ-Agency] Updated demo-data.ts to use .webp images');
}

// 3. 03-Templates-Hub index.html
const templatesHubHtml = 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/03-Templates-Hub/index.html';
if (fs.existsSync(templatesHubHtml)) {
  let content = fs.readFileSync(templatesHubHtml, 'utf8');
  if (content.includes('boutique_preview.png')) {
    content = content.replace(/boutique_preview\.png/g, 'boutique_preview.webp');
    fs.writeFileSync(templatesHubHtml, content, 'utf8');
    console.log('✅ [03-Templates-Hub] Updated index.html to use boutique_preview.webp');
  }
}

console.log('\nAll code references successfully patched to WebP!');
