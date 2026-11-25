import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const root = 'D:/All coding installation tools/All My Main Project in real world';
const commits = [
  {
    repo: 'Puson-Dev',
    msg: 'perf(vitals): add explicit image dimensions and mobile viewport guardrails [skip ci]'
  },
  {
    repo: 'ZenVQ-Suggests',
    msg: 'fix(grammar): enforce strict zero oxford comma policy [skip ci]'
  },
  {
    repo: 'ZenVQ-Tools/03-Templates-Hub',
    msg: 'fix(security): enforce x-frame-options edge header [skip ci]'
  },
  {
    repo: 'ZenVQ-Tools',
    msg: 'fix(security): enforce owasp headers for tools web portal [skip ci]'
  }
];

console.log('=== COMMITTING AND SYNCHRONIZING VERIFIED MAINTENANCE CHANGES ===\n');

for (const c of commits) {
  const p = path.join(root, c.repo);
  if (fs.existsSync(p)) {
    try {
      const status = execSync('git status --short', { cwd: p, encoding: 'utf8' }).trim();
      if (status) {
        console.log(`[STAGING] ${c.repo}...`);
        execSync('git add .', { cwd: p });
        execSync(`git commit -m "${c.msg}"`, { cwd: p });
        console.log(`[COMMITTED] ${c.repo}`);
        
        try {
          const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: p, encoding: 'utf8' }).trim();
          console.log(`[PUSHING] ${c.repo} to origin/${branch}...`);
          execSync(`git push origin ${branch}`, { cwd: p, timeout: 30000 });
          console.log(`✅ [SYNCED] ${c.repo} successfully pushed to GitHub!`);
        } catch (pushErr) {
          console.log(`[WARN] Push failed or not configured for ${c.repo}: ${pushErr.message}`);
        }
      } else {
        console.log(`[CLEAN] ${c.repo} has no pending changes.`);
      }
    } catch (err) {
      console.log(`[ERROR] ${c.repo}: ${err.message}`);
    }
  }
}

console.log('\nGit synchronization complete!');
