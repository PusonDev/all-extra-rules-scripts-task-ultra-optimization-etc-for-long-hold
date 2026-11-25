import fs from 'fs';
import path from 'path';

const root = 'D:/All coding installation tools/All My Main Project in real world';

function dirSize(d) {
  let s = 0;
  if (!fs.existsSync(d)) return 0;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) s += dirSize(f);
    else try { s += fs.statSync(f).size; } catch {}
  }
  return s;
}

function safeRemove(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) {
    console.log(`[SKIP] Already clean: ${relPath}`);
    return 0;
  }
  const stat = fs.statSync(full);
  const bytes = stat.isDirectory() ? dirSize(full) : stat.size;
  fs.rmSync(full, { recursive: true, force: true });
  console.log(`🗑️  [REMOVED] ${relPath} (${(bytes / 1024 / 1024).toFixed(2)} MB freed)`);
  return bytes;
}

console.log('=== PHASE 1: SAFE DEDUPLICATION & CLEANUP ===\n');
let totalFreed = 0;

// 1. Safe-merge email collection ledger if newer
const rootEmail = path.join(root, 'zenvq-scripting-email-collection');
const canonEmail = path.join(root, 'all extra rules, scripts, task etc for long hold/zenvq-scripting-email-collection');
if (fs.existsSync(rootEmail) && fs.existsSync(canonEmail)) {
  const srcLedger = path.join(rootEmail, 'usage-ledger.json');
  const dstLedger = path.join(canonEmail, 'usage-ledger.json');
  if (fs.existsSync(srcLedger)) {
    if (!fs.existsSync(dstLedger) || fs.statSync(srcLedger).mtimeMs > fs.statSync(dstLedger).mtimeMs) {
      fs.copyFileSync(srcLedger, dstLedger);
      console.log('✅ [MERGED] Newer usage-ledger.json into canonical zenvq-scripting-email-collection');
    }
  }
  totalFreed += safeRemove('zenvq-scripting-email-collection');
}

// 2. Remove verified duplicate & old backup folders
const targets = [
  'ZenVQ-Tools/03-Templates-Hub/templetes-zenvq main',
  'ZenVQ-Tools/03-Templates-Hub/Dr Jerin-Dental Point/drjarins-build',
  'ZenVQ-Tools/01-OneApp-Ecosystem/06-Backups',
  'ZenVQ-Tools/01-OneApp-Ecosystem/01-Apps/oneapp-website/.chrome_temp',
  'ZenVQ-Tools/01-OneApp-Ecosystem/oneapp-android',
  'ZenVQ-Tools/mediadrop-android',
  'Puson-Dev/backup-original-v1',
  'ZenVQ-EcoSystem/backups',
  'ZenVQ-EcoSystem/archive',
  'ZenVQ-Agency/public/portfolio/creative/roll-typography-motion.png',
  'ZenVQ-Agency/public/portfolio/creative/codecraft-editorial.png'
];

for (const t of targets) {
  totalFreed += safeRemove(t);
}

console.log(`\n🎉 TOTAL LOCAL DISK SPACE FREED: ${(totalFreed / 1024 / 1024).toFixed(2)} MB`);
