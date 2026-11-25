/**
 * ZenVQ Ultra Optimization CLI Runner
 * Interactive terminal command for 1-click A-Z audit across all ecosystem sites.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runUltraAudit, generateHtmlReport } from './engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Terminal ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

async function main() {
  console.log(`\n${BOLD}${CYAN}${'='.repeat(75)}${RESET}`);
  console.log(`${BOLD}${CYAN} 🛡️  ZENVQ ULTRA OPTIMIZATION & UNIFIED AUTO-AUDIT ENGINE${RESET}`);
  console.log(`${GRAY} Operating Autonomously across the 11 ZenVQ Ecosystem Sites${RESET}`);
  console.log(`${BOLD}${CYAN}${'='.repeat(75)}${RESET}\n`);

  console.log(`${GRAY}[1/2] Executing Multi-Vector Audits (Network, Security, SEO, GEO, Speed, Theme & Content)...${RESET}`);
  const summary = await runUltraAudit();

  console.log(`\n${BOLD}📋 ECOSYSTEM AUDIT RESULTS (Completed in ${summary.durationMs}ms)${RESET}\n`);

  // Table header
  console.log(`┌──────────────────────────────┬────────┬─────────┬──────────┬──────────┬──────────┬────────┐`);
  console.log(`│ ${BOLD}Site Name${RESET}                    │ ${BOLD}Score${RESET}  │ ${BOLD}Latency${RESET} │ ${BOLD}Security${RESET} │ ${BOLD}SEO${RESET}      │ ${BOLD}Speed${RESET}    │ ${BOLD}Status${RESET} │`);
  console.log(`├──────────────────────────────┼────────┼─────────┼──────────┼──────────┼──────────┼────────┤`);

  for (const s of summary.sites) {
    const namePadded = s.site.name.padEnd(28).substring(0, 28);
    const scoreColor = s.compositeScore >= 80 ? GREEN : (s.compositeScore >= 60 ? YELLOW : RED);
    const scoreStr = `${scoreColor}${String(s.compositeScore + '%').padStart(6)}${RESET}`;
    const latencyStr = `${String(s.network.latencyMs + 'ms').padStart(7)}`;
    const secColor = s.security.score >= 80 ? GREEN : YELLOW;
    const secStr = `${secColor}${String(s.security.score + '%').padStart(8)}${RESET}`;
    const seoColor = s.seo.score >= 75 ? GREEN : YELLOW;
    const seoStr = `${seoColor}${String(s.seo.score + '%').padStart(8)}${RESET}`;
    const speedColor = s.speed.score >= 75 ? GREEN : YELLOW;
    const speedStr = `${speedColor}${String(s.speed.score + '%').padStart(8)}${RESET}`;
    const statusBadge = s.pass ? `${GREEN} PASS ${RESET}` : `${YELLOW} WARN ${RESET}`;

    console.log(`│ ${namePadded} │ ${scoreStr} │ ${latencyStr} │ ${secStr} │ ${seoStr} │ ${speedStr} │ ${statusBadge} │`);
  }

  console.log(`└──────────────────────────────┴────────┴─────────┴──────────┴──────────┴──────────┴────────┘\n`);

  // Overall Verdict Box
  const verdictColor = summary.overallPass ? GREEN : YELLOW;
  console.log(`${BOLD}Ecosystem Composite Health:${RESET} ${verdictColor}${summary.avgScore}%${RESET} (${summary.passedSites}/${summary.totalSites} sites passing)`);
  console.log(`${BOLD}Chamber Verdict:${RESET} ${verdictColor}${summary.overallStatus}${RESET}\n`);

  // Write HTML dashboard if requested or by default
  const html = generateHtmlReport(summary);
  const htmlPath = path.join(__dirname, 'dashboard.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  console.log(`${GREEN}✅ Master Markdown Report written to:${RESET} ULTRA_AUDIT_REPORT.md`);
  console.log(`${GREEN}✅ Visual HTML Dashboard written to:${RESET} dashboard.html\n`);

  // Print top remediations if any
  let hasRemediations = false;
  for (const item of summary.remediations) {
    if (item.remediations.length > 0) {
      if (!hasRemediations) {
        console.log(`${BOLD}${YELLOW}⚠️  TOP ACTIONABLE RECOMMENDATIONS:${RESET}`);
        hasRemediations = true;
      }
      console.log(`  ${BOLD}${CYAN}• ${item.siteName} (${item.domain}):${RESET}`);
      for (const fix of item.remediations.slice(0, 3)) {
        console.log(`    - [${fix.type}] ${fix.fix}`);
      }
    }
  }

  if (!hasRemediations) {
    console.log(`${GREEN}✨ All sites pass every criteria with zero action items required!${RESET}\n`);
  } else {
    console.log(`\n${GRAY}For the complete detailed checklist and remediation guide, inspect ULTRA_AUDIT_REPORT.md${RESET}\n`);
  }
}

main().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
