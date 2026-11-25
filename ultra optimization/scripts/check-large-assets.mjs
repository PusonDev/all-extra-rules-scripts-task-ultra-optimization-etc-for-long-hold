import fs from 'fs';
import path from 'path';

const repos = [
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-EcoSystem',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Agency',
  'D:/All coding installation tools/All My Main Project in real world/Puson-Dev',
  'D:/All coding installation tools/All My Main Project in real world/Natures-Intimacy',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Suggests',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/03-Templates-Hub'
];

function scanAssets(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    if (['node_modules', '.git', '.next', 'out', 'build', '.wrangler'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      scanAssets(full, results);
    } else {
      const ext = path.extname(item.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.webp'].includes(ext)) {
        try {
          const stat = fs.statSync(full);
          if (stat.size > 500 * 1024) { // > 500KB
            results.push({
              file: full,
              sizeKB: Math.round(stat.size / 1024),
              sizeMB: (stat.size / (1024 * 1024)).toFixed(2)
            });
          }
        } catch (e) {}
      }
    }
  }
  return results;
}

console.log('=== SCANNING FOR HEAVY ASSETS (> 500KB) ACROSS ALL SITES ===\n');
let allHeavy = [];
for (const r of repos) {
  const h = scanAssets(r);
  allHeavy = allHeavy.concat(h);
}

allHeavy.sort((a, b) => b.sizeKB - a.sizeKB);

if (allHeavy.length === 0) {
  console.log('✅ No assets exceeding 500KB found! All image assets are lightweight.');
} else {
  console.log(`Found ${allHeavy.length} heavy assets (>500KB):`);
  allHeavy.slice(0, 20).forEach(x => {
    console.log(`  - [${x.sizeMB} MB] ${x.file}`);
  });
}
