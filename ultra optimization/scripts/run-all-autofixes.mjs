import { autoFixGitHygiene, autoFixReturnGateway } from '../auto-fixer.mjs';

const domains = [
  'zenvq.com',
  'agency.zenvq.com',
  'templates.zenvq.com',
  'puson.zenvq.com',
  'natures-intimacy.zenvq.com',
  'tools.zenvq.com',
  'suggests.zenvq.com',
  'rafij.zenvq.com'
];

console.log('=== APPLYING AUTO-FIXES (GIT HYGIENE & RETURN GATEWAY) ===\n');

for (const d of domains) {
  const gitFix = autoFixGitHygiene(d);
  console.log(`[GIT HYGIENE] ${d}: ${gitFix.action || gitFix.reason}`);
}

const gatewayFix = autoFixReturnGateway('natures-intimacy.zenvq.com');
console.log(`[GATEWAY FIX] natures-intimacy: ${gatewayFix.action || gatewayFix.reason}`);

console.log('\nAuto-fixes applied successfully!');
