/**
 * ZenVQ 24/7 Autonomous Defensive Sentinel with Instant Auto-Remediation
 * Continuously tests all ecosystem sites for vulnerabilities, security flaws and anomalies.
 * Dispatches instant Telegram alerts AND automatically fixes detected issues on the spot!
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { autoFixIssue } from './auto-fixer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITES_CONFIG_PATH = path.join(__dirname, 'config', 'sites.json');
const SECURITY_CONFIG_PATH = path.join(__dirname, 'config', 'security-probes.json');
const LOG_PATH = path.join(__dirname, 'sentinel-events.log');

const TG_CONFIG_PATH = path.join(__dirname, 'config', 'tg-ag-config.json');
let dedicatedTgConfig = { bot_token: '', authorized_chat_id: '8930678641' };
if (fs.existsSync(TG_CONFIG_PATH)) {
  try {
    dedicatedTgConfig = JSON.parse(fs.readFileSync(TG_CONFIG_PATH, 'utf8'));
  } catch {
    // Ignore
  }
}

// Telegram Configuration: strictly uses dedicated Antigravity channel (NEVER lead bot)
const TELEGRAM_BOT_TOKEN = process.env.TG_AG_BOT_TOKEN || dedicatedTgConfig.bot_token;
const TELEGRAM_CHAT_ID = process.env.TG_AG_CHAT_ID || dedicatedTgConfig.authorized_chat_id || '8930678641';

// Default loop interval: 15 minutes (in ms)
const DEFAULT_INTERVAL_MS = (parseInt(process.env.INTERVAL_MINUTES, 10) || 15) * 60 * 1000;

// Track previously fixed issues to avoid infinite auto-fix loops
const autoFixedRegistry = new Set();

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_PATH, line + '\n', 'utf8');
  } catch {
    // Ignore log write failure
  }
}

export async function sendTelegramAlert(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    log('Telegram alert skipped: Token or Chat ID not configured');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await res.json();
    return data.ok;
  } catch (err) {
    log(`Telegram dispatch failed: ${err.message}`);
    return false;
  }
}

export async function runDefensiveProbingCycle(options = { autoFix: true }) {
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
  log(`=== Commencing Defensive Probing & Auto-Fix Cycle at ${timestamp} ===`);

  const sitesConfig = JSON.parse(fs.readFileSync(SITES_CONFIG_PATH, 'utf8'));
  const securityConfig = JSON.parse(fs.readFileSync(SECURITY_CONFIG_PATH, 'utf8'));

  const issuesFound = [];
  const fixesApplied = [];

  for (const site of sitesConfig.sites) {
    const siteUrl = site.url;

    // 1. Live Endpoint & Latency Test
    const start = Date.now();
    let res;
    let body = '';
    let headers = {};

    try {
      res = await fetch(siteUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'ZenVQ-Defensive-Sentinel-24-7/1.0',
          'Accept-Encoding': 'gzip, deflate, br'
        },
        signal: AbortSignal.timeout(10000)
      });
      const latency = Date.now() - start;

      for (const [k, v] of res.headers.entries()) {
        headers[k.toLowerCase()] = v;
      }
      body = await res.text();

      // Check downtime
      if (res.status !== 200) {
        issuesFound.push({
          site: site.name,
          url: siteUrl,
          domain: site.domain,
          severity: 'CRITICAL',
          type: 'ENDPOINT_DOWN',
          detail: `HTTP Status ${res.status}`
        });
      }

      // Check HSTS header
      if (!headers['strict-transport-security']) {
        issuesFound.push({
          site: site.name,
          url: siteUrl,
          domain: site.domain,
          severity: 'HIGH',
          type: 'MISSING_HSTS',
          detail: 'Strict-Transport-Security (HSTS) header is missing'
        });
      }

      // Check Dead Legacy Domain
      if (body.includes('zenvqagency.com')) {
        issuesFound.push({
          site: site.name,
          url: siteUrl,
          domain: site.domain,
          severity: 'CRITICAL',
          type: 'DEAD_DOMAIN_EXPOSED',
          detail: 'Dead domain "zenvqagency.com" found in live HTML'
        });
      }

      // Check Return Gateway to zenvq.com
      if (site.domain !== 'zenvq.com' && !body.includes('https://zenvq.com')) {
        issuesFound.push({
          site: site.name,
          url: siteUrl,
          domain: site.domain,
          severity: 'MEDIUM',
          type: 'MISSING_RETURN_GATEWAY',
          detail: 'No return link to holding core "https://zenvq.com" found'
        });
      }

    } catch (err) {
      issuesFound.push({
        site: site.name,
        url: siteUrl,
        domain: site.domain,
        severity: 'CRITICAL',
        type: 'CONNECTION_FAILED',
        detail: `Site unreachable: ${err.message}`
      });
      continue;
    }

    // 2. Defensive Sensitive File Exposure Probing
    const sensitiveProbes = securityConfig.sensitive_file_probes.slice(0, 6);
    for (const probe of sensitiveProbes) {
      const probeUrl = `${siteUrl.replace(/\/$/, '')}${probe.path}`;
      try {
        const probeRes = await fetch(probeUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'ZenVQ-Defensive-Sentinel/1.0' },
          signal: AbortSignal.timeout(4000)
        });

        if (probeRes.status === 200) {
          const probeBody = await probeRes.text();
          const looksLikeSpa = probeBody.includes('<!DOCTYPE html>') || probeBody.includes('<html');
          const isRealLeak = !looksLikeSpa || (probe.path.includes('.env') && probeBody.includes('=')) || (probe.path.includes('.git') && probeBody.includes('[core]'));

          if (isRealLeak && !looksLikeSpa) {
            issuesFound.push({
              site: site.name,
              url: probeUrl,
              domain: site.domain,
              severity: 'CRITICAL_EXPLOITABLE',
              type: 'SENSITIVE_FILE_EXPOSURE',
              detail: `Publicly exposed sensitive file: ${probe.path}`
            });
          }
        }
      } catch {
        // Safe
      }
    }
  }

  log(`Cycle complete. Total issues detected: ${issuesFound.length}`);

  // Auto-Fix Pipeline: Immediately patch detected issues and notify Telegram
  if (options.autoFix && issuesFound.length > 0) {
    for (const issue of issuesFound) {
      const fixKey = `${issue.domain}:${issue.type}`;

      if (!autoFixedRegistry.has(fixKey)) {
        // 1. Send detection push alert
        const alertMsg = `
🚨 <b>ZenVQ Sentinel: Vulnerability Detected</b>
<b>Site:</b> ${issue.site} (${issue.domain})
<b>Severity:</b> ${issue.severity}
<b>Type:</b> <code>${issue.type}</code>
<b>Detail:</b> ${issue.detail}
<b>Time:</b> ${timestamp}

🔧 <i>Auto-Remediation in progress...</i>
        `.trim();
        await sendTelegramAlert(alertMsg);

        // 2. Execute Auto-Fix
        const fixResult = autoFixIssue({ ...issue, site: issue.domain });

        if (fixResult.ok) {
          autoFixedRegistry.add(fixKey);
          fixesApplied.push({ issue, fixResult });
          log(`[AUTO-FIX SUCCESS] ${fixKey}: ${fixResult.action}`);

          // 3. Send fix confirmation alert
          const confirmMsg = `
✅ <b>ZenVQ Sentinel: Auto-Fix Applied & Verified</b>
<b>Site:</b> ${issue.site} (${issue.domain})
<b>Fixed:</b> <code>${issue.type}</code>
<b>Action:</b> ${fixResult.action}
<b>Status:</b> Repaired in source repository.
          `.trim();
          await sendTelegramAlert(confirmMsg);
        } else {
          log(`[AUTO-FIX MANUAL ACTION NEEDED] ${fixKey}: ${fixResult.reason}`);
        }
      }
    }
  }

  return {
    timestamp,
    totalIssues: issuesFound.length,
    issues: issuesFound,
    fixesApplied
  };
}

// Daemon execution loop
async function startDaemon() {
  log(`🛡️ ZenVQ 24/7 Sentinel & Auto-Fix Daemon Started (Interval: ${DEFAULT_INTERVAL_MS / 60000} mins)`);

  // Startup safety grace period: wait 2 minutes so network and system settle cleanly
  log('⏳ Waiting 120s startup grace period before initial probing cycle...');
  await new Promise(resolve => setTimeout(resolve, 120000));

  try {
    await runDefensiveProbingCycle({ autoFix: true });
  } catch (err) {
    log(`Initial cycle error: ${err.message}`);
  }

  setInterval(async () => {
    try {
      await runDefensiveProbingCycle({ autoFix: true });
    } catch (err) {
      log(`Cycle error: ${err.message}`);
    }
  }, DEFAULT_INTERVAL_MS);
}

const isDaemon = process.argv.includes('--daemon');
if (isDaemon) {
  startDaemon();
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDefensiveProbingCycle({ autoFix: true }).then(result => {
    console.log(`\nProbe & Auto-Fix complete. Issues: ${result.totalIssues}, Fixes Applied: ${result.fixesApplied.length}`);
    process.exit(0);
  });
}
