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
  'ZenVQ-Tools'
];

console.log('=== CHECKING GIT STATUS ACROSS ALL REPOSITORIES ===\n');

for (const r of repos) {
  const p = path.join(root, r);
  if (fs.existsSync(p)) {
    try {
      const status = execSync('git status --short', { cwd: p, encoding: 'utf8' }).trim();
      console.log(`Repository: ${r}`);
      if (status) {
        console.log(status.split('\n').map(l => '  ' + l).join('\n'));
      } else {
        console.log('  Clean (No changes)');
      }
    } catch (e) {
      console.log(`  [WARN] Not a git repo or git error: ${e.message}`);
    }
  }
}
