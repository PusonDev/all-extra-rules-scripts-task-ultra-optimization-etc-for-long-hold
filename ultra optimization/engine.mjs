/**
 * Master Unified Orchestrator: ZenVQ Ultra Optimization Engine
 * Runs multi-vector audits across all ecosystem sites concurrently:
 * Network, Cybersecurity (Self-Attack Simulation), SEO, GEO/AEO, Speed, Theme, Content & 3-Tier Redundancy.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { scanNetwork } from './core/scanner-network.mjs';
import { scanSecurity } from './core/scanner-security.mjs';
import { scanSeo } from './core/scanner-seo.mjs';
import { scanGeo } from './core/scanner-geo.mjs';
import { scanSpeed } from './core/scanner-speed.mjs';
import { scanTheme } from './core/scanner-theme.mjs';
import { scanContent } from './core/scanner-content.mjs';
import { scanRedundancy } from './core/scanner-redundancy.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITES_CONFIG_PATH = path.join(__dirname, 'config', 'sites.json');
const SECURITY_CONFIG_PATH = path.join(__dirname, 'config', 'security-probes.json');
const PROJECTS_ROOT = "D:\\All coding installation tools\\All My Main Project in real world";

export async function runUltraAudit(options = {}) {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
  const dateStr = new Date().toISOString().slice(0, 10);

  const sitesConfig = JSON.parse(fs.readFileSync(SITES_CONFIG_PATH, 'utf8'));
  const securityConfig = JSON.parse(fs.readFileSync(SECURITY_CONFIG_PATH, 'utf8'));

  // Target filter if specified in options
  let targets = sitesConfig.sites;
  if (options.siteId) {
    targets = targets.filter(s => s.id === options.siteId || s.domain === options.siteId);
  } else if (options.criticalOnly) {
    targets = targets.filter(s => s.critical);
  }

  const siteResults = [];
  const allRemediations = [];

  for (const site of targets) {
    // 1. Network & Edge Scan
    const network = await scanNetwork(site, sitesConfig.default_max_latency_ms);

    // If site is completely unreachable, skip downstream deep content scans
    if (!network.isOnline) {
      siteResults.push({
        site,
        compositeScore: 0,
        pass: false,
        status: 'OFFLINE',
        network,
        security: { pass: false, score: 0, owaspHeaders: { passed: [], missing: [] }, remediations: [] },
        seo: { pass: false, score: 0, issues: [], remediations: [] },
        geo: { pass: false, score: 0, issues: [], remediations: [] },
        speed: { pass: false, score: 0, issues: [], remediations: [] },
        theme: { pass: false, score: 0, issues: [] },
        content: { pass: false, score: 0, issues: [], remediations: [] },
        redundancy: { pass: false, score: 0, issues: [] },
        issues: [`Site unreachable: ${network.issues.join(', ')}`],
        remediations: [{ type: 'SITE_OFFLINE', fix: 'Check Cloudflare DNS and Pages deployment status.' }]
      });
      continue;
    }

    // Run modular scanners concurrently for maximum speed
    const [security, seo, geo, speed, theme, content, redundancy] = await Promise.all([
      scanSecurity(site, network, securityConfig, PROJECTS_ROOT),
      scanSeo(site, network),
      scanGeo(site),
      scanSpeed(site, network),
      scanTheme(site, network),
      scanContent(site, network, securityConfig),
      scanRedundancy(site, network, securityConfig, PROJECTS_ROOT)
    ]);

    // Compute composite health score (weighted)
    // Security 25%, SEO 20%, Speed 15%, GEO 10%, Content 10%, Redundancy 10%, Theme 10%
    const compositeScore = Math.round(
      (security.score * 0.25) +
      (seo.score * 0.20) +
      (speed.score * 0.15) +
      (geo.score * 0.10) +
      (content.score * 0.10) +
      (redundancy.score * 0.10) +
      (theme.score * 0.10)
    );

    const sitePass = security.pass && seo.pass && speed.pass && content.pass && redundancy.pass;

    // Collect all site remediations
    const siteRemediations = [
      ...security.remediations,
      ...seo.remediations,
      ...geo.remediations,
      ...speed.remediations,
      ...content.remediations,
      ...redundancy.remediations
    ];

    allRemediations.push({
      siteName: site.name,
      domain: site.domain,
      remediations: siteRemediations
    });

    siteResults.push({
      site,
      compositeScore,
      pass: sitePass,
      status: sitePass ? 'VERIFIED' : 'ACTION_REQUIRED',
      network,
      security,
      seo,
      geo,
      speed,
      theme,
      content,
      redundancy,
      issues: [
        ...network.issues,
        ...security.owaspHeaders.issues,
        ...seo.issues,
        ...geo.issues,
        ...speed.issues,
        ...theme.violations,
        ...content.issues,
        ...redundancy.issues
      ],
      remediations: siteRemediations
    });
  }

  const durationMs = Date.now() - startTime;
  const totalSites = siteResults.length;
  const passedSites = siteResults.filter(s => s.pass).length;
  const overallPass = passedSites === totalSites;
  const overallStatus = overallPass ? '100% OPERATIONAL & VERIFIED' : 'ACTION REQUIRED';

  // Average ecosystem score
  const avgScore = totalSites > 0 ? Math.round(siteResults.reduce((acc, s) => acc + s.compositeScore, 0) / totalSites) : 0;

  const summary = {
    engine: 'ZenVQ Ultra Optimization Engine',
    version: '1.0.0',
    timestamp,
    dateStr,
    durationMs,
    totalSites,
    passedSites,
    avgScore,
    overallStatus,
    overallPass,
    sites: siteResults,
    remediations: allRemediations
  };

  // Generate Markdown Report
  const markdownReport = generateMarkdownReport(summary);
  const reportPath = path.join(__dirname, 'ULTRA_AUDIT_REPORT.md');
  fs.writeFileSync(reportPath, markdownReport, 'utf8');

  return summary;
}

export function generateMarkdownReport(summary) {
  let md = `# 🛡️ ZenVQ Ultra Optimization Master Audit Report\n`;
  md += `**Engine:** ${summary.engine} (v${summary.version})\n`;
  md += `**Timestamp:** ${summary.timestamp} (Asia/Dhaka) | **Duration:** ${summary.durationMs}ms\n`;
  md += `**Overall Health:** **${summary.overallStatus}** | **Ecosystem Average Score:** **${summary.avgScore}%**\n\n`;
  md += `---\n\n`;

  md += `## 📊 Executive Sites Scorecard\n\n`;
  md += `| Site Name | Live URL | Composite Score | Latency | Cloudflare Edge | Security (OWASP) | SEO | Speed | GEO / AI | Status |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const s of summary.sites) {
    const edgeIcon = s.network.isCloudflare ? '⛅ Active' : '❌ Direct';
    const secBadge = `${s.security.score}% (${s.security.owaspHeaders.passed.length}/${s.security.owaspHeaders.passed.length + s.security.owaspHeaders.missing.length})`;
    const statusBadge = s.pass ? '✅ PASS' : '⚠️ WARN';
    md += `| **${s.site.name}** | [${s.site.domain}](${s.site.url}) | **${s.compositeScore}%** | ${s.network.latencyMs}ms | ${edgeIcon} | ${secBadge} | ${s.seo.score}% | ${s.speed.score}% | ${s.geo.score}% | ${statusBadge} |\n`;
  }

  md += `\n---\n\n`;

  md += `## 🔒 1. Cybersecurity & Self-Attack Simulation Findings\n\n`;
  for (const s of summary.sites) {
    md += `### ${s.site.name} (${s.site.domain})\n`;
    md += `- **Security Score:** ${s.security.score}%\n`;
    md += `- **OWASP Headers Passed:** \`${s.security.owaspHeaders.passed.join('`, `') || 'None'}\`\n`;
    if (s.security.owaspHeaders.missing.length > 0) {
      md += `- **Missing OWASP Headers:** ⚠️ \`${s.security.owaspHeaders.missing.join('`, `')}\`\n`;
    }
    const exposedProbes = s.security.probedVulnerabilities.filter(p => p.exposed);
    if (exposedProbes.length > 0) {
      md += `- 🚨 **CRITICAL VULNERABILITY EXPOSED:** ${exposedProbes.map(p => p.path).join(', ')}\n`;
    } else {
      md += `- **Sensitive File Probes:** ✅ Clean (All probed sensitive paths returned 404/403)\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;

  md += `## 🔍 2. Full-Stack SEO & Indexation Verification\n\n`;
  for (const s of summary.sites) {
    md += `### ${s.site.name}\n`;
    md += `- **Single H1:** ${s.seo.h1.valid ? '✅ Exactly 1 H1' : '⚠️ ' + s.seo.h1.count + ' H1 tags'}\n`;
    md += `- **Meta Description:** ${s.seo.metaDescription.present ? '✅ Present (' + s.seo.metaDescription.length + ' chars)' : '⚠️ Missing'}\n`;
    md += `- **Canonical Link:** ${s.seo.canonical.present ? '✅ ' + s.seo.canonical.href : '⚠️ Missing'}\n`;
    md += `- **Sitemap (/sitemap.xml):** ${s.seo.sitemap.accessible ? '✅ 200 OK' : '⚠️ HTTP ' + s.seo.sitemap.status}\n`;
    md += `- **Robots (/robots.txt):** ${s.seo.robotsTxt.accessible ? '✅ 200 OK' : '⚠️ HTTP ' + s.seo.robotsTxt.status}\n`;
    md += `- **Dead Domain Leak (zenvqagency.com):** ${s.seo.deadDomainFound ? '🚨 FOUND LEAK' : '✅ 0 Occurrences'}\n\n`;
  }

  md += `---\n\n`;

  md += `## 🤖 3. GEO & AEO (AI Search Engine Readiness)\n\n`;
  for (const s of summary.sites) {
    md += `### ${s.site.name}\n`;
    md += `- **/llms.txt:** ${s.geo.llmsTxt.accessible ? '✅ 200 OK (' + s.geo.llmsTxt.charCount + ' chars)' : (s.site.requires_llms_txt ? '⚠️ Missing' : 'Optional')}\n`;
    md += `- **/llms-full.txt:** ${s.geo.llmsFullTxt.accessible ? '✅ 200 OK' : 'Optional'}\n`;
    md += `- **AI Crawlers Allowed:** GPTBot (${s.geo.aiBotPermissions.gptBotAllowed ? '✅' : '❌'}), ClaudeBot (${s.geo.aiBotPermissions.claudeBotAllowed ? '✅' : '❌'}), PerplexityBot (${s.geo.aiBotPermissions.perplexityBotAllowed ? '✅' : '❌'})\n\n`;
  }

  md += `---\n\n`;

  md += `## 🛠️ 4. Actionable Remediation Guide\n\n`;
  let hasAnyFix = false;
  for (const item of summary.remediations) {
    if (item.remediations.length > 0) {
      hasAnyFix = true;
      md += `### ${item.siteName} (${item.domain})\n`;
      for (const fix of item.remediations) {
        md += `- **[${fix.type}]**: ${fix.fix}\n`;
      }
      md += `\n`;
    }
  }

  if (!hasAnyFix) {
    md += `✅ *All sites pass every criteria with zero action items required!*\n\n`;
  }

  md += `---\n*ZenVQ Ultra Optimization Engine • Operating Autonomously across the ZenVQ Ecosystem*\n`;
  return md;
}

export function generateHtmlReport(summary) {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZenVQ Ultra Optimization Dashboard</title>
  <style>
    :root {
      --bg: #09090b;
      --card: rgba(24, 24, 27, 0.7);
      --border: rgba(255, 255, 255, 0.08);
      --accent: #00e599;
      --text: #fafafa;
      --muted: #a1a1aa;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 32px 20px;
      line-height: 1.5;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 16px;
    }
    .title-group h1 { font-size: 26px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; }
    .title-group p { color: var(--muted); font-size: 13px; margin-top: 4px; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
    }
    .badge-ok { background: rgba(0, 229, 153, 0.12); color: var(--accent); border: 1px solid rgba(0, 229, 153, 0.3); }
    .badge-warn { background: rgba(234, 179, 8, 0.12); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.3); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      backdrop-filter: blur(16px);
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    }
    .stat-label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace; }
    .stat-val { font-size: 32px; font-weight: 700; color: #fff; margin-top: 6px; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 24px;
      backdrop-filter: blur(16px);
      margin-bottom: 24px;
      position: relative;
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    }
    .card h2 { font-size: 18px; margin-bottom: 16px; color: #fff; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 12px 10px; color: var(--muted); border-bottom: 1px solid var(--border); font-family: monospace; }
    td { padding: 14px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
    tr:hover { background: rgba(255, 255, 255, 0.02); }
    .score-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      font-family: monospace;
    }
    .pill-green { background: rgba(0, 229, 153, 0.15); color: #00e599; border: 1px solid rgba(0, 229, 153, 0.3); }
    .pill-yellow { background: rgba(234, 179, 8, 0.15); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.3); }
    .pill-red { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .fix-item {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .fix-type { color: #eab308; font-weight: 600; font-family: monospace; margin-right: 8px; }
    .footer { text-align: center; color: var(--muted); font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <h1>🛡️ ZenVQ Ultra Optimization Dashboard</h1>
        <p>Unified Multi-Vector A-Z Automated Audit Engine • Timestamp: ${summary.timestamp}</p>
      </div>
      <div>
        <span class="badge ${summary.overallPass ? 'badge-ok' : 'badge-warn'}">
          ${summary.overallStatus}
        </span>
      </div>
    </div>

    <div class="grid">
      <div class="stat-card">
        <div class="stat-label">Ecosystem Health</div>
        <div class="stat-val" style="color: #00e599;">${summary.avgScore}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sites Monitored</div>
        <div class="stat-val">${summary.totalSites}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Verified Passing</div>
        <div class="stat-val" style="color: #00e599;">${summary.passedSites} / ${summary.totalSites}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Execution Time</div>
        <div class="stat-val">${summary.durationMs}ms</div>
      </div>
    </div>

    <div class="card">
      <h2>🌐 All Sites Multi-Vector Matrix</h2>
      <table>
        <thead>
          <tr>
            <th>Site Name</th>
            <th>Domain</th>
            <th>Score</th>
            <th>Latency</th>
            <th>Edge CDN</th>
            <th>Security</th>
            <th>SEO</th>
            <th>Speed</th>
            <th>GEO AI</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  for (const s of summary.sites) {
    const pillClass = s.compositeScore >= 80 ? 'pill-green' : (s.compositeScore >= 60 ? 'pill-yellow' : 'pill-red');
    html += `
      <tr>
        <td><strong>${s.site.name}</strong></td>
        <td><a href="${s.site.url}" target="_blank" style="color: #00e599; text-decoration: none;">${s.site.domain}</a></td>
        <td><span class="score-pill ${pillClass}">${s.compositeScore}%</span></td>
        <td>${s.network.latencyMs}ms</td>
        <td>${s.network.isCloudflare ? '⛅ Cloudflare' : 'Direct'}</td>
        <td>${s.security.score}% (${s.security.owaspHeaders.passed.length}/${s.security.owaspHeaders.passed.length + s.security.owaspHeaders.missing.length})</td>
        <td>${s.seo.score}%</td>
        <td>${s.speed.score}%</td>
        <td>${s.geo.score}%</td>
        <td><span class="score-pill ${s.pass ? 'pill-green' : 'pill-yellow'}">${s.pass ? 'PASS' : 'WARN'}</span></td>
      </tr>
    `;
  }

  html += `
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>🛠️ Automated Remediation Recommendations</h2>
  `;

  let hasRemediations = false;
  for (const item of summary.remediations) {
    if (item.remediations.length > 0) {
      hasRemediations = true;
      html += `<h3 style="color: #00e599; font-size: 15px; margin: 16px 0 8px;">${item.siteName} (${item.domain})</h3>`;
      for (const fix of item.remediations) {
        html += `
          <div class="fix-item">
            <span class="fix-type">[${fix.type}]</span>
            <span>${fix.fix}</span>
          </div>
        `;
      }
    }
  }

  if (!hasRemediations) {
    html += `<p style="color: #00e599; font-size: 14px;">✅ All sites pass every criteria with zero action items required!</p>`;
  }

  html += `
    </div>

    <div class="footer">
      ZenVQ Ultra Optimization Engine • Operating Autonomously across the ZenVQ Ecosystem
    </div>
  </div>
</body>
</html>`;

  return html;
}
