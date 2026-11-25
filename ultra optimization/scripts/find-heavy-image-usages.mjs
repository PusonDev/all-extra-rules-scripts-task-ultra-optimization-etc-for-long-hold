import fs from 'fs';
import path from 'path';

const searchDirs = [
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/03-Templates-Hub',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Agency',
  'D:/All coding installation tools/All My Main Project in real world/Puson-Dev'
];

const heavyNames = [
  'boutique_tablet',
  'boutique_preview',
  'boutique_mobile',
  'dental_tablet',
  'dental_mobile',
  'dental_preview',
  'dental_logo',
  'roll-typography-motion',
  'codecraft-editorial'
];

function searchInFiles(dir) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    if (['node_modules', '.git', '.next', 'out', 'build', '.wrangler'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      searchInFiles(full);
    } else if (['.tsx', '.ts', '.jsx', '.js', '.html', '.css', '.json'].includes(path.extname(item.name))) {
      try {
        const content = fs.readFileSync(full, 'utf8');
        for (const name of heavyNames) {
          if (content.includes(name)) {
            console.log(`[FOUND ${name}] in: ${full}`);
          }
        }
      } catch (e) {}
    }
  }
}

for (const d of searchDirs) {
  if (fs.existsSync(d)) searchInFiles(d);
}
