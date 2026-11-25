#!/usr/bin/env node
/**
 * ZenVQ Social Dispatcher CLI
 * One-command interface for Antigravity and terminal usage against your live Cloudflare Worker.
 *
 * Examples:
 *   node scripts/dispatch.js --status
 *   node scripts/dispatch.js --publish "Hello from Antigravity!" --platforms telegram,linkedin
 *   node scripts/dispatch.js --schedule "2026-11-26T12:00:00Z" "Scheduled post!" --platforms telegram,facebook
 *   node scripts/dispatch.js --queue
 *   node scripts/dispatch.js --cancel scheduled:1795651200000_ab12cd34
 *   node scripts/dispatch.js --history
 */
import fs from 'node:fs';
import path from 'node:path';

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    } else {
      args._.push(token);
    }
  }
  return args;
}

loadDotEnv();
const args = parseArgs(process.argv.slice(2));
const workerUrl = (args.url || process.env.WORKER_URL || '').replace(/\/+$/, '');
const apiKey = args.key || process.env.DISPATCHER_API_KEY || '';

if (args.help || Object.keys(args).length === 1 && args._.length === 0) {
  console.log(`ZenVQ Social Dispatcher CLI
Usage:
  node scripts/dispatch.js --status
  node scripts/dispatch.js --publish "Post text" [--platforms telegram,linkedin,facebook,instagram,twitter] [--media https://...] [--link https://...]
  node scripts/dispatch.js --schedule "2026-11-26T18:00:00Z" "Post text" [--platforms telegram,linkedin]
  node scripts/dispatch.js --queue
  node scripts/dispatch.js --cancel <queueId>
  node scripts/dispatch.js --history

Environment (.env):
  WORKER_URL=https://zenvq-social-dispatcher.<subdomain>.workers.dev
  DISPATCHER_API_KEY=<your-secret-key>`);
  process.exit(0);
}

if (!workerUrl || !apiKey) {
  console.error('Error: Missing WORKER_URL or DISPATCHER_API_KEY. Set them in .env or pass --url and --key.');
  process.exit(1);
}

async function requestWorker(method, pathname, body) {
  const res = await fetch(`${workerUrl}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({ rawStatus: res.status }));
  console.log(JSON.stringify(data, null, 2));
  if (!res.ok) process.exit(1);
}

const platforms = typeof args.platforms === 'string'
  ? args.platforms.split(',').map((s) => s.trim()).filter(Boolean)
  : undefined;

if (args.status) {
  await requestWorker('GET', '/status');
} else if (args.queue) {
  await requestWorker('GET', '/queue');
} else if (args.history) {
  await requestWorker('GET', '/history');
} else if (args.cancel) {
  await requestWorker('DELETE', `/queue/${encodeURIComponent(args.cancel)}`);
} else if (args.schedule) {
  const text = typeof args.schedule === 'string' && args._.length > 0 ? args._[0] : args.text;
  const scheduleTime = typeof args.schedule === 'string' ? args.schedule : args.time;
  if (!text || !scheduleTime) {
    console.error('Error: --schedule requires an ISO timestamp and post text.');
    process.exit(1);
  }
  await requestWorker('POST', '/schedule', {
    text,
    scheduleTime,
    platforms,
    mediaUrl: args.media,
    linkUrl: args.link,
    autoTruncate: Boolean(args.truncate)
  });
} else {
  const text = typeof args.publish === 'string' ? args.publish : (args.text || args._[0]);
  if (!text) {
    console.error('Error: Provide post text via --publish "Your message".');
    process.exit(1);
  }
  await requestWorker('POST', '/publish', {
    text,
    platforms,
    mediaUrl: args.media,
    linkUrl: args.link,
    autoTruncate: Boolean(args.truncate)
  });
}
