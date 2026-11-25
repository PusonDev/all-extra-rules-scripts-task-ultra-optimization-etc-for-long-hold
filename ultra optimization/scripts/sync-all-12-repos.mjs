import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const root = 'D:/All coding installation tools/All My Main Project in real world';
const repos = [
  'ZenVQ-EcoSystem',
  'ZenVQ-Agency',
  'Puson-Dev',
  'Natures-Intimacy',
  'ZenVQ-Suggests',
  'ZenVQ-Tools/03-Templates-Hub/Dr Jerin-Dental Point',
  'ZenVQ-Tools/03-Templates-Hub/Rafij-portfolio',
  'ZenVQ-Tools/03-Templates-Hub/Boutique-Templates',
  'ZenVQ-Tools/03-Templates-Hub/Saif-portfolio',
  'ZenVQ-Tools/03-Templates-Hub/Kawsar.design',
  'ZenVQ-Tools/03-Templates-Hub',
  'ZenVQ-Tools'
];

console.log('=== PHASE 3: SYNCING ALL 12 CLEANED REPOS TO GITHUB ===\n');

for (const r of repos) {
  const full = path.join(root, r);
  if (!fs.existsSync(full)) continue;
  try {
    const st = execSync('git status --short', { cwd: full, encoding: 'utf8' }).trim();
    if (!st) {
      console.log(`[CLEAN] ${r}`);
      continue;
    }
    execSync('git add -A', { cwd: full });
    try {
      execSync('git commit -m "chore(optimize): deduplicate clutter, harden gitignore and sync clean assets [skip ci]"', { cwd: full, stdio: 'pipe' });
    } catch (ce) {
      // ignore if nothing to commit
    }
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: full, encoding: 'utf8' }).trim();
    execSync(`git push origin ${branch}`, { cwd: full, timeout: 45000, stdio: 'pipe' });
    console.log(`✅ [SYNCED] ${r} -> origin/${branch}`);
  } catch (err) {
    console.log(`⚠️  [WARN] ${r}: ${err.message.split('\n')[0]}`);
  }
}
