/**
 * ZenVQ Telegram to Antigravity (TG ⇄ AG) Dedicated Autonomous Bridge
 * COMPLETELY ISOLATED from business leads (@Zenvq_Lead_bot).
 * Strictly dedicated for private Antigravity AI communication, remote prompt execution
 * and ecosystem control worldwide.
 */

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { runUltraAudit } from './engine.mjs';
import { runDefensiveProbingCycle } from './sentinel-24-7.mjs';
import { autoFixMultipleH1, autoFixOxfordCommas, autoFixSecurityHeaders, autoFixReturnGateway } from './auto-fixer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, 'config', 'tg-ag-config.json');
const LOG_FILE = path.join(__dirname, 'tg-bridge.log');
const AGY_BIN = "C:\\All my stuff out from windows\\Ai Agents\\All data for antigravity\\bin\\agy.exe";
const WORKSPACE_DIR = "d:\\All coding installation tools\\All My Main Project in real world\\all extra rules, scripts, task etc for long hold\\ultra optimization";

// Load dedicated configuration
let tgConfig = { bot_token: '', authorized_chat_id: '8930678641' };
if (fs.existsSync(CONFIG_PATH)) {
  try {
    tgConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    // Ignore
  }
}

const BOT_TOKEN = process.env.TG_AG_BOT_TOKEN || tgConfig.bot_token;
const AUTHORIZED_CHAT_ID = String(process.env.TG_AG_CHAT_ID || tgConfig.authorized_chat_id || '8930678641');

let lastUpdateId = 0;
let isPolling = false;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
  } catch {
    // Ignore log write failure
  }
}

async function sendTelegramMessage(chatId, text, options = {}) {
  if (!BOT_TOKEN) {
    log('Cannot send message: Dedicated TG to AG Bot Token is not configured.');
    return null;
  }

  try {
    const truncatedText = text.length > 4000 ? text.substring(0, 3990) + '\n\n<i>[Truncated...]</i>' : text;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: truncatedText,
        parse_mode: options.parse_mode || 'HTML',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(10000)
    });
    const data = await res.json();
    return data.ok ? data.result : null;
  } catch (err) {
    log(`Failed to send Telegram message: ${err.message}`);
    return null;
  }
}

async function deleteTelegramMessage(chatId, messageId) {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId })
    });
    const data = await res.json();
    return data.ok;
  } catch {
    return false;
  }
}

function executeShellCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd: WORKSPACE_DIR, timeout: 30000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        resolve({ ok: false, output: stderr || err.message });
      } else {
        resolve({ ok: true, output: stdout || stderr || 'Command executed successfully with no output.' });
      }
    });
  });
}

function executeAgyPrompt(prompt) {
  return new Promise((resolve) => {
    const safePrompt = prompt.replace(/"/g, '\\"');
    const cmd = `"${AGY_BIN}" --dangerously-skip-permissions --print "${safePrompt}"`;
    log(`Executing Antigravity prompt: ${prompt.substring(0, 60)}...`);

    exec(cmd, { cwd: WORKSPACE_DIR, timeout: 60000, maxBuffer: 1024 * 1024 * 2 }, (err, stdout, stderr) => {
      if (err) {
        resolve({ ok: false, output: stderr || err.message });
      } else {
        resolve({ ok: true, output: stdout.trim() || 'Agent completed task with zero output.' });
      }
    });
  });
}

async function handleIncomingMessage(msg) {
  const chatId = String(msg.chat.id);
  const text = (msg.text || '').trim();
  const msgId = msg.message_id;

  if (chatId !== AUTHORIZED_CHAT_ID) {
    log(`Unauthorized access attempt from Chat ID: ${chatId}`);
    await sendTelegramMessage(chatId, '⛔ <b>Access Denied:</b> This is a private dedicated Antigravity bridge channel.');
    return;
  }

  log(`Received command from user [${msgId}]: "${text}"`);

  // 1. /start or /help
  if (text === '/start' || text === '/help') {
    const helpMsg = `
🛡️ <b>ZenVQ Dedicated TG ⇄ Antigravity Bridge</b>
<b>Channel:</b> 100% Private & Dedicated (Zero Lead Clutter)
<b>PC Host:</b> <code>puson-deep-galaxy</code>

<b>Available Commands:</b>
• <code>/status</code> — Quick health scorecard of all 11 sites
• <code>/audit</code> — Run full Ultra Optimization audit
• <code>/security</code> — Run defensive self-attack scan
• <code>/fix</code> — <b>Auto-Fix</b> all detected issues & security headers
• <code>/cmd &lt;command&gt;</code> — Run a PowerShell terminal command
• <code>/ag &lt;prompt&gt;</code> — Execute task via Antigravity Agent
• <code>/clean</code> — Clean up recent bot messages

💡 <i>Or simply type any message/instruction, and Antigravity will process it and reply!</i>
    `.trim();
    await sendTelegramMessage(chatId, helpMsg);
    return;
  }

  // 2. /status
  if (text === '/status') {
    await sendTelegramMessage(chatId, '⏳ <i>Pinging all 11 ecosystem sites...</i>');
    try {
      const summary = await runUltraAudit({ criticalOnly: true });
      let statusMsg = `📊 <b>ZenVQ Ecosystem Live Status</b>\n`;
      statusMsg += `<b>Composite Health:</b> ${summary.avgScore}%\n`;
      statusMsg += `<b>Sites Passing:</b> ${summary.passedSites} / ${summary.totalSites}\n\n`;

      for (const s of summary.sites) {
        const icon = s.pass ? '✅' : '⚠️';
        statusMsg += `${icon} <b>${s.site.name}</b>: ${s.compositeScore}% (${s.network.latencyMs}ms)\n`;
      }
      await sendTelegramMessage(chatId, statusMsg);
    } catch (e) {
      await sendTelegramMessage(chatId, `❌ Failed to fetch status: ${e.message}`);
    }
    return;
  }

  // 3. /audit
  if (text === '/audit') {
    await sendTelegramMessage(chatId, '🔍 <i>Executing complete 10-vector Ultra Optimization audit across all sites...</i>');
    try {
      const summary = await runUltraAudit();
      let auditMsg = `🛡️ <b>ZenVQ Ultra Audit Report</b>\n`;
      auditMsg += `<b>Overall Status:</b> <b>${summary.overallStatus}</b>\n`;
      auditMsg += `<b>Ecosystem Score:</b> ${summary.avgScore}%\n`;
      auditMsg += `<b>Execution Time:</b> ${summary.durationMs}ms\n\n`;

      auditMsg += `<b>Top Site Scores:</b>\n`;
      for (const s of summary.sites) {
        auditMsg += `• ${s.site.name}: <b>${s.compositeScore}%</b> (Sec: ${s.security.score}%, SEO: ${s.seo.score}%)\n`;
      }
      await sendTelegramMessage(chatId, auditMsg);
    } catch (e) {
      await sendTelegramMessage(chatId, `❌ Audit failed: ${e.message}`);
    }
    return;
  }

  // 4. /security or /attack
  if (text === '/security' || text === '/attack') {
    await sendTelegramMessage(chatId, '⚔️ <i>Launching defensive self-attack & vulnerability scan...</i>');
    try {
      const probeResult = await runDefensiveProbingCycle({ autoFix: false });
      let secMsg = `🛡️ <b>Defensive Security Scan Results</b>\n`;
      secMsg += `<b>Time:</b> ${probeResult.timestamp}\n`;
      secMsg += `<b>Total Issues:</b> ${probeResult.totalIssues}\n\n`;

      if (probeResult.totalIssues === 0) {
        secMsg += `✅ <b>Zero vulnerabilities found!</b>\nAll probed sensitive paths (/.env, /.git, etc.) are securely blocked.`;
      } else {
        for (const iss of probeResult.issues) {
          secMsg += `• <b>${iss.site}</b>: <code>${iss.type}</code> — ${iss.detail}\n`;
        }
      }
      await sendTelegramMessage(chatId, secMsg);
    } catch (e) {
      await sendTelegramMessage(chatId, `❌ Security scan failed: ${e.message}`);
    }
    return;
  }

  // 5. /fix or /autofix (Autonomous Self-Healing)
  if (text === '/fix' || text === '/autofix') {
    await sendTelegramMessage(chatId, '🔧 <i>Executing Autonomous Auto-Remediation across all sites...</i>');
    const fixes = [];

    const h1Fix = autoFixMultipleH1('zenvq.com');
    if (h1Fix.ok) fixes.push(`ZenVQ Core Hub: ${h1Fix.action}`);

    const templHsts = autoFixSecurityHeaders('templates.zenvq.com');
    if (templHsts.ok) fixes.push(`Templates: ${templHsts.action}`);

    const toolsHsts = autoFixSecurityHeaders('tools.zenvq.com');
    if (toolsHsts.ok) fixes.push(`Tools: ${toolsHsts.action}`);

    const natReturn = autoFixReturnGateway('natures-intimacy.zenvq.com');
    if (natReturn.ok) fixes.push(`Nature's Intimacy: ${natReturn.action}`);

    const rafijReturn = autoFixReturnGateway('rafij.zenvq.com');
    if (rafijReturn.ok) fixes.push(`Rafij Portfolio: ${rafijReturn.action}`);

    const commaFix = autoFixOxfordCommas('templates.zenvq.com');
    if (commaFix.ok) fixes.push(`Templates: ${commaFix.action}`);

    let reply = `✅ <b>Autonomous Auto-Fix Summary:</b>\n\n`;
    if (fixes.length > 0) {
      for (const f of fixes) {
        reply += `• ${f}\n`;
      }
      reply += `\n<i>All source repositories patched and synchronized!</i>`;
    } else {
      reply += `✨ All repositories are already in 100% compliant state. No repairs needed!`;
    }
    await sendTelegramMessage(chatId, reply);
    return;
  }

  // 6. /clean
  if (text === '/clean') {
    await sendTelegramMessage(chatId, '🧹 <i>Cleaning up recent bot messages...</i>');
    let deletedCount = 0;
    for (let id = msgId; id >= msgId - 20; id--) {
      const ok = await deleteTelegramMessage(chatId, id);
      if (ok) deletedCount++;
    }
    const confirm = await sendTelegramMessage(chatId, `✅ Cleaned up ${deletedCount} messages.`);
    setTimeout(() => {
      deleteTelegramMessage(chatId, confirm.message_id);
    }, 4000);
    return;
  }

  // 7. /cmd <command>
  if (text.startsWith('/cmd ')) {
    const cmdStr = text.replace('/cmd ', '').trim();
    await sendTelegramMessage(chatId, `⚡ <i>Running: <code>${cmdStr}</code>...</i>`);
    const result = await executeShellCommand(cmdStr);
    const outMsg = `<b>Command Output:</b>\n<pre>${result.output}</pre>`;
    await sendTelegramMessage(chatId, outMsg);
    return;
  }

  // 8. /ag <prompt> OR plain text message -> Dispatch to Antigravity AI
  const prompt = text.startsWith('/ag ') ? text.replace('/ag ', '').trim() : text;
  await sendTelegramMessage(chatId, `🤖 <i>Antigravity processing: "${prompt.substring(0, 50)}..."</i>`);

  const agyRes = await executeAgyPrompt(prompt);
  const replyHeader = `🤖 <b>Antigravity Response:</b>\n\n`;
  await sendTelegramMessage(chatId, replyHeader + agyRes.output, { parse_mode: '' });
}

async function pollTelegramUpdates() {
  if (!BOT_TOKEN) {
    log('⚠️ TG ⇄ AG Bridge Paused: Awaiting dedicated Bot Token in config/tg-ag-config.json');
    console.log('\n[TG-AG-BRIDGE] Dedicated Bot Token is not set in config/tg-ag-config.json.');
    console.log('[TG-AG-BRIDGE] Please provide your dedicated Antigravity bot token to begin listening.\n');
    return;
  }

  if (isPolling) return;
  isPolling = true;

  log('='.repeat(70));
  log(' 🛡️ ZenVQ Dedicated TG ⇄ Antigravity Bridge Active');
  log(` 📱 Authorized Telegram Chat ID: ${AUTHORIZED_CHAT_ID}`);
  log(' 🌐 Listening for private Antigravity commands worldwide...');
  log('='.repeat(70));

  while (true) {
    try {
      const pollUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
      const res = await fetch(pollUrl, { signal: AbortSignal.timeout(45000) });
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          if (update.message && update.message.text) {
            await handleIncomingMessage(update.message);
          }
        }
      }
    } catch (err) {
      log(`Polling error (reconnecting in 3s): ${err.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

pollTelegramUpdates();
