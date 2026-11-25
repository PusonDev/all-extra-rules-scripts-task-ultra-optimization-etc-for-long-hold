/**
 * ZenVQ Ultra Optimization API Server
 * Standalone, zero-dependency Node.js HTTP server.
 * Enables 1-call autonomous multi-vector auditing and 24/7 Sentinel integration.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { runUltraAudit, generateHtmlReport } from './engine.mjs';
import { runDefensiveProbingCycle, sendTelegramAlert } from './sentinel-24-7.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4040;
const SITES_CONFIG_PATH = path.join(__dirname, 'config', 'sites.json');

// In-memory cache for ultra-fast repeated queries
let lastAuditResult = null;
let lastAuditTimestamp = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // 1. API Status / Root Help Page
    if (pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ZenVQ Ultra Optimization API</title>
  <style>
    body { background: #09090b; color: #fafafa; font-family: system-ui, sans-serif; padding: 40px 24px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    h1 { color: #00e599; font-size: 24px; margin-bottom: 8px; }
    p { color: #a1a1aa; margin-bottom: 24px; font-size: 14px; }
    .card { background: rgba(24, 24, 27, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .endpoint { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-family: monospace; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .get { background: rgba(0, 229, 153, 0.2); color: #00e599; }
    .post { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    a { color: #00e599; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .btn { display: inline-block; background: #00e599; color: #09090b; font-weight: bold; padding: 10px 18px; border-radius: 8px; text-decoration: none; margin-top: 12px; }
  </style>
</head>
<body>
  <h1>🛡️ ZenVQ Ultra Optimization & 24/7 Sentinel API</h1>
  <p>Single-call autonomous verification of all 11 ZenVQ Ecosystem websites (SEO, GEO/AEO, Security, Performance, Theme, Cursor & Content Integrity).</p>

  <div class="card">
    <h3>🚀 Instant Execution Gateways</h3>
    <a href="/api/report" class="btn" target="_blank">Open Executive Visual Dashboard</a>
    <a href="/api/audit" class="btn" style="background: rgba(255,255,255,0.1); color: #fff; margin-left: 10px;" target="_blank">Run Full Audit (JSON)</a>
    <a href="/api/sentinel/test-tg" class="btn" style="background: rgba(234,179,8,0.2); color: #eab308; margin-left: 10px;" target="_blank">Test Telegram Alert</a>
  </div>

  <div class="card">
    <div class="endpoint"><span class="badge get">GET</span> <a href="/api/audit">/api/audit</a></div>
    <div>Triggers 10-vector audit across all sites and returns structured JSON with scores and remediations.</div>
  </div>

  <div class="card">
    <div class="endpoint"><span class="badge get">GET</span> <a href="/api/report">/api/report</a></div>
    <div>Renders full dark luxury HTML visual report dashboard.</div>
  </div>

  <div class="card">
    <div class="endpoint"><span class="badge get">GET</span> <a href="/api/sentinel/run">/api/sentinel/run</a></div>
    <div>Triggers a defensive vulnerability self-attack cycle and pushes alerts to Telegram.</div>
  </div>

  <div class="card">
    <div class="endpoint"><span class="badge get">GET</span> <a href="/api/sentinel/test-tg">/api/sentinel/test-tg</a></div>
    <div>Dispatches a live test verification ping to official Telegram (@Zenvq_Lead_bot).</div>
  </div>

  <div class="card">
    <div class="endpoint"><span class="badge get">GET</span> <a href="/api/sites">/api/sites</a></div>
    <div>Returns list of all 11 registered ecosystem sites and their target metadata.</div>
  </div>

  <div class="card">
    <div class="endpoint"><span class="badge get">GET</span> <a href="/api/status">/api/status</a></div>
    <div>API health check and system information.</div>
  </div>
</body>
</html>
      `);
      return;
    }

    // 2. Status Endpoint
    if (pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ONLINE',
        engine: 'ZenVQ Ultra Optimization API',
        version: '1.1.0',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }, null, 2));
      return;
    }

    // 3. Sites Registry Endpoint
    if (pathname === '/api/sites') {
      const sitesData = JSON.parse(fs.readFileSync(SITES_CONFIG_PATH, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(sitesData, null, 2));
      return;
    }

    // 4. Full Audit Endpoint (JSON)
    if (pathname === '/api/audit') {
      const siteId = urlObj.searchParams.get('site');
      const forceRefresh = urlObj.searchParams.get('refresh') === 'true';

      if (!forceRefresh && !siteId && lastAuditResult && (Date.now() - lastAuditTimestamp < CACHE_TTL_MS)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ...lastAuditResult, cached: true }, null, 2));
        return;
      }

      console.log(`[API] Executing full audit across sites... (siteId: ${siteId || 'ALL'})`);
      const auditResult = await runUltraAudit({ siteId });

      if (!siteId) {
        lastAuditResult = auditResult;
        lastAuditTimestamp = Date.now();
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(auditResult, null, 2));
      return;
    }

    // 5. Visual HTML Report Dashboard
    if (pathname === '/api/report') {
      let auditResult = lastAuditResult;
      if (!auditResult || (Date.now() - lastAuditTimestamp >= CACHE_TTL_MS)) {
        console.log('[API] Running audit for HTML dashboard...');
        auditResult = await runUltraAudit();
        lastAuditResult = auditResult;
        lastAuditTimestamp = Date.now();
      }

      const html = generateHtmlReport(auditResult);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // 6. Security-Specific Endpoint
    if (pathname === '/api/audit/security') {
      let auditResult = lastAuditResult;
      if (!auditResult || (Date.now() - lastAuditTimestamp >= CACHE_TTL_MS)) {
        auditResult = await runUltraAudit();
        lastAuditResult = auditResult;
        lastAuditTimestamp = Date.now();
      }
      const securitySummary = auditResult.sites.map(s => ({
        site: s.site.name,
        domain: s.site.domain,
        securityScore: s.security.score,
        pass: s.security.pass,
        owaspHeaders: s.security.owaspHeaders,
        probedVulnerabilities: s.security.probedVulnerabilities,
        remediations: s.security.remediations
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ timestamp: auditResult.timestamp, results: securitySummary }, null, 2));
      return;
    }

    // 7. Sentinel On-Demand Probe Cycle
    if (pathname === '/api/sentinel/run') {
      console.log('[API] Running defensive sentinel probing cycle...');
      const probeResult = await runDefensiveProbingCycle();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(probeResult, null, 2));
      return;
    }

    // 8. Sentinel Telegram Test Endpoint
    if (pathname === '/api/sentinel/test-tg') {
      const ok = await sendTelegramAlert('🔔 <b>ZenVQ API Verification Ping</b>\nTelegram alerting channel is verified operational.');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: ok, telegramBot: '@Zenvq_Lead_bot', chatId: '8930678641' }, null, 2));
      return;
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Endpoint not found',
      available: ['/', '/api/status', '/api/sites', '/api/audit', '/api/report', '/api/audit/security', '/api/sentinel/run', '/api/sentinel/test-tg']
    }));

  } catch (err) {
    console.error('[API Server Error]:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message, stack: err.stack }));
  }
});

server.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log(` 🛡️ ZenVQ Ultra Optimization API Server`);
  console.log(` 🌐 Live at: http://localhost:${PORT}`);
  console.log(` 📋 Visual Dashboard: http://localhost:${PORT}/api/report`);
  console.log(` ⚡ Full Audit Endpoint: http://localhost:${PORT}/api/audit`);
  console.log(` 🔔 Sentinel Telegram Gateway: http://localhost:${PORT}/api/sentinel/run`);
  console.log('='.repeat(70));
});

export default server;
