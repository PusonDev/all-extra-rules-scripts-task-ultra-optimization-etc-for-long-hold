import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const sharp = require('D:/All coding installation tools/All My Main Project in real world/Natures-Intimacy/node_modules/sharp');

const imagesToConvert = [
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website/public/images/boutique_tablet.png',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website/public/images/boutique_preview.png',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website/public/images/boutique_mobile.png',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website/public/images/dental_tablet.png',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website/public/images/dental_mobile.png',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/01-MediaDrop-Downloader/mediadrop-website/public/images/dental_preview.png',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/03-Templates-Hub/templetes-zenvq main/assets/images/boutique_preview.png',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/03-Templates-Hub/assets/images/boutique_preview.png',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Agency/public/portfolio/creative/roll-typography-motion.png',
  'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Agency/public/portfolio/creative/codecraft-editorial.png'
];

async function run() {
  console.log('=== CONVERTING HEAVY RAW PNGs TO COMPACT WebP (TARGET >90% REDUCTION) ===\n');

  let totalBefore = 0;
  let totalAfter = 0;

  for (const src of imagesToConvert) {
    if (!fs.existsSync(src)) {
      console.log(`[SKIP] Not found: ${src}`);
      continue;
    }
    const statBefore = fs.statSync(src);
    totalBefore += statBefore.size;

    const dest = src.replace(/\.png$/i, '.webp');

    try {
      const meta = await sharp(src).metadata();
      let pipeline = sharp(src);

      // WebP format constraint: max width/height is 16383px
      if (meta.height > 16000 || meta.width > 16000) {
        const scale = 15000 / Math.max(meta.height, meta.width);
        const newW = Math.round(meta.width * scale);
        const newH = Math.round(meta.height * scale);
        pipeline = pipeline.resize(newW, newH);
        console.log(`[RESIZE] ${path.basename(src)} constrained from ${meta.width}x${meta.height} to ${newW}x${newH}`);
      }

      await pipeline.webp({ quality: 82, effort: 6 }).toFile(dest);

      const statAfter = fs.statSync(dest);
      totalAfter += statAfter.size;

      const reduction = ((1 - statAfter.size / statBefore.size) * 100).toFixed(1);
      console.log(`✅ [CONVERTED] ${path.basename(src)}: ${(statBefore.size / 1024 / 1024).toFixed(2)} MB -> ${(statAfter.size / 1024).toFixed(0)} KB (-${reduction}%)`);
    } catch (err) {
      console.error(`❌ Error on ${src}: ${err.message}`);
    }
  }

  console.log(`\n🎉 TOTAL SIZE REDUCTION: ${(totalBefore / 1024 / 1024).toFixed(2)} MB -> ${(totalAfter / 1024 / 1024).toFixed(2)} MB (-${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)!`);
}

run().catch(console.error);
