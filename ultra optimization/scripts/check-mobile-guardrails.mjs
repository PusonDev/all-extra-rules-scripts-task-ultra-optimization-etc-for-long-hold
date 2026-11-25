import fs from 'fs';
import path from 'path';

const cssFiles = [
  { name: 'ZenVQ-EcoSystem', file: 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-EcoSystem/src/app/globals.css' },
  { name: 'ZenVQ-Agency', file: 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Agency/app/globals.css' },
  { name: 'Puson-Dev', file: 'D:/All coding installation tools/All My Main Project in real world/Puson-Dev/studio.css' },
  { name: 'Natures-Intimacy', file: 'D:/All coding installation tools/All My Main Project in real world/Natures-Intimacy/app/globals.css' },
  { name: 'ZenVQ-Suggests', file: 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Suggests/zenvq-suggest/app/globals.css' },
  { name: 'ZenVQ-Tools', file: 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website/app/globals.css' },
  { name: '03-Templates-Hub', file: 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/03-Templates-Hub/styles.css' }
];

console.log('=== CHECKING MOBILE RESPONSIVENESS GUARDRAILS ===\n');

for (const c of cssFiles) {
  if (!fs.existsSync(c.file)) {
    console.log(`[SKIP] File not found: ${c.file}`);
    continue;
  }
  const content = fs.readFileSync(c.file, 'utf8');
  const hasOverflow = /overflow-x:\s*hidden/i.test(content);
  const hasTouchAction = /touch-action/i.test(content);
  const hasTextAdjust = /-webkit-text-size-adjust/i.test(content);

  console.log(`Site: ${c.name}`);
  console.log(`  - overflow-x: hidden: ${hasOverflow ? '✅' : '❌ MISSING'}`);
  console.log(`  - touch-action: pan-y: ${hasTouchAction ? '✅' : '❌ MISSING'}`);
  console.log(`  - -webkit-text-size-adjust: ${hasTextAdjust ? '✅' : '❌ MISSING'}`);
}
