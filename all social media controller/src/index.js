import { sendTelegram } from './adapters/telegram.js';
import { sendLinkedIn } from './adapters/linkedin.js';
import { sendFacebook } from './adapters/facebook.js';
import { sendInstagram } from './adapters/instagram.js';
import { sendTwitter } from './adapters/twitter.js';

export const SUPPORTED_PLATFORMS = ['telegram', 'linkedin', 'facebook', 'instagram', 'twitter'];
const DEFAULT_PLATFORMS = ['telegram', 'linkedin', 'facebook', 'twitter'];
const THIRTY_DAYS_SECONDS = 86400 * 30;

const SECURITY_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: SECURITY_HEADERS
  });
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);
  const maxLen = Math.max(bufA.length, bufB.length);
  let diff = bufA.length ^ bufB.length;
  for (let i = 0; i < maxLen; i++) {
    diff |= (bufA[i] || 0) ^ (bufB[i] || 0);
  }
  return diff === 0;
}

function isValidHttpUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

async function listAllKvKeys(kv, prefix) {
  const allKeys = [];
  let cursor = undefined;
  do {
    const page = await kv.list({ prefix, cursor });
    allKeys.push(...page.keys);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return allKeys;
}

function validatePayload(payload, { requireScheduleTime = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Request body must be a JSON object';
  }
  if (typeof payload.text !== 'string' || payload.text.trim().length === 0) {
    return 'Missing or empty required field: text';
  }
  if (!isValidHttpUrl(payload.mediaUrl)) {
    return 'Invalid mediaUrl: must be a valid http or https URL';
  }
  if (!isValidHttpUrl(payload.linkUrl)) {
    return 'Invalid linkUrl: must be a valid http or https URL';
  }
  if (payload.platforms !== undefined) {
    if (!Array.isArray(payload.platforms) || payload.platforms.length === 0) {
      return 'platforms must be a non-empty array';
    }
    const invalid = payload.platforms.filter((p) => !SUPPORTED_PLATFORMS.includes(p));
    if (invalid.length > 0) {
      return `Unsupported platforms: ${invalid.join(', ')}. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`;
    }
  }
  if (requireScheduleTime) {
    if (!payload.scheduleTime) {
      return 'Missing required field: scheduleTime (ISO timestamp)';
    }
    const ts = new Date(payload.scheduleTime).getTime();
    if (Number.isNaN(ts)) {
      return 'Invalid scheduleTime format. Use ISO string e.g. 2026-11-25T18:00:00Z';
    }
  }
  return null;
}

export function getConfiguredPlatforms(env) {
  return {
    telegram: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    linkedin: Boolean(env.LINKEDIN_ACCESS_TOKEN && env.LINKEDIN_PERSON_URN),
    facebook: Boolean(env.FACEBOOK_PAGE_ACCESS_TOKEN && env.FACEBOOK_PAGE_ID),
    instagram: Boolean((env.INSTAGRAM_ACCESS_TOKEN || env.FACEBOOK_PAGE_ACCESS_TOKEN) && env.INSTAGRAM_USER_ID),
    twitter: Boolean(
      (env.TWITTER_API_KEY && env.TWITTER_API_SECRET && env.TWITTER_ACCESS_TOKEN && env.TWITTER_ACCESS_SECRET) ||
      env.TWITTER_OAUTH2_TOKEN ||
      env.TWITTER_ACCESS_TOKEN ||
      env.TWITTER_BEARER_TOKEN
    )
  };
}

/**
 * Dispatches a post to all specified platforms in parallel.
 * Explicitly reports every target platform (never silently omits unconfigured ones).
 */
export async function dispatchToPlatforms(env, payload) {
  const {
    text,
    mediaUrl,
    linkUrl,
    title,
    parseMode,
    autoTruncate = false,
    platforms = DEFAULT_PLATFORMS
  } = payload;

  const uniquePlatforms = [...new Set(platforms)];
  const tasks = [];

  for (const platform of uniquePlatforms) {
    if (platform === 'telegram') {
      tasks.push(
        sendTelegram({
          token: env.TELEGRAM_BOT_TOKEN || payload.telegramToken,
          chatId: env.TELEGRAM_CHAT_ID || payload.telegramChatId,
          text,
          mediaUrl,
          parseMode
        })
      );
    } else if (platform === 'linkedin') {
      tasks.push(
        sendLinkedIn({
          accessToken: env.LINKEDIN_ACCESS_TOKEN || payload.linkedinToken,
          personUrn: env.LINKEDIN_PERSON_URN || payload.linkedinUrn,
          text,
          mediaUrl,
          linkUrl,
          title
        })
      );
    } else if (platform === 'facebook') {
      tasks.push(
        sendFacebook({
          pageAccessToken: env.FACEBOOK_PAGE_ACCESS_TOKEN || payload.facebookToken,
          pageId: env.FACEBOOK_PAGE_ID || payload.facebookPageId,
          text,
          mediaUrl,
          linkUrl
        })
      );
    } else if (platform === 'instagram') {
      tasks.push(
        sendInstagram({
          accessToken: env.INSTAGRAM_ACCESS_TOKEN || env.FACEBOOK_PAGE_ACCESS_TOKEN || payload.instagramToken,
          igUserId: env.INSTAGRAM_USER_ID || payload.instagramUserId,
          text,
          mediaUrl
        })
      );
    } else if (platform === 'twitter') {
      tasks.push(
        sendTwitter({
          apiKey: env.TWITTER_API_KEY || payload.twitterApiKey,
          apiSecret: env.TWITTER_API_SECRET || payload.twitterApiSecret,
          accessToken: env.TWITTER_ACCESS_TOKEN || payload.twitterToken,
          accessSecret: env.TWITTER_ACCESS_SECRET || payload.twitterAccessSecret,
          oauth2Token: env.TWITTER_OAUTH2_TOKEN || payload.twitterOAuth2Token,
          bearerToken: env.TWITTER_BEARER_TOKEN || payload.twitterBearer,
          text,
          autoTruncate
        })
      );
    } else {
      tasks.push(Promise.resolve({ success: false, platform, error: `Unsupported platform: ${platform}` }));
    }
  }

  const settled = await Promise.allSettled(tasks);
  return settled.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { success: false, error: r.reason?.message || 'Unknown dispatch failure' }
  );
}

export default {
  /**
   * HTTP Request Handler
   * GET  /           - Minimal public health ping
   * GET  /status     - Authenticated system status, configured platforms & queue summary
   * POST /publish    - Immediate dispatch to selected or default platforms
   * POST /schedule   - Queue post in Cloudflare KV for 24/7 offline Cron delivery
   * GET  /queue      - List pending scheduled posts
   * DELETE /queue/:id - Cancel a scheduled post
   * GET  /history    - View recent dispatched & failed posts
   */
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: SECURITY_HEADERS });
    }

    const url = new URL(request.url);

    // Public minimal liveness check (no secrets or queue state exposed)
    if (url.pathname === '/' && request.method === 'GET') {
      return jsonResponse({
        status: 'online',
        service: 'ZenVQ Social Media Dispatcher',
        engine: 'Cloudflare Workers (Edge)',
        timestamp: new Date().toISOString()
      });
    }

    // Fail-closed authentication guard for all operational endpoints
    const configuredKey = env.DISPATCHER_API_KEY;
    if (!configuredKey) {
      return jsonResponse(
        { error: 'Server misconfigured: DISPATCHER_API_KEY secret is not set' },
        500
      );
    }

    const authHeader = request.headers.get('Authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const queryKey = url.searchParams.get('key') || '';
    const isAuthorized =
      timingSafeEqual(bearerToken, configuredKey) || timingSafeEqual(queryKey, configuredKey);

    if (!isAuthorized) {
      return jsonResponse({ error: 'Unauthorized: Invalid DISPATCHER_API_KEY' }, 401);
    }

    // Authenticated system status
    if (url.pathname === '/status' && request.method === 'GET') {
      let pendingScheduledPosts = 0;
      let completedHistoryCount = 0;
      let failedCount = 0;

      if (env.SOCIAL_QUEUE) {
        const [pending, history, failed] = await Promise.all([
          listAllKvKeys(env.SOCIAL_QUEUE, 'scheduled:'),
          listAllKvKeys(env.SOCIAL_QUEUE, 'history:'),
          listAllKvKeys(env.SOCIAL_QUEUE, 'failed:')
        ]);
        pendingScheduledPosts = pending.length;
        completedHistoryCount = history.length;
        failedCount = failed.length;
      }

      return jsonResponse({
        status: 'online',
        service: 'ZenVQ Social Media Dispatcher',
        engine: 'Cloudflare Workers (Edge)',
        kvConfigured: Boolean(env.SOCIAL_QUEUE),
        configuredPlatforms: getConfiguredPlatforms(env),
        pendingScheduledPosts,
        completedHistoryCount,
        failedCount,
        maxRetryAttempts: Number.parseInt(env.MAX_RETRY_ATTEMPTS || '3', 10),
        timestamp: new Date().toISOString()
      });
    }

    // Immediate publish
    if (url.pathname === '/publish' && request.method === 'POST') {
      let payload;
      try {
        payload = await request.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON request body' }, 400);
      }

      const validationError = validatePayload(payload);
      if (validationError) {
        return jsonResponse({ error: validationError }, 400);
      }

      const results = await dispatchToPlatforms(env, payload);
      const anySucceeded = results.some((r) => r.success);
      const allSucceeded = results.length > 0 && results.every((r) => r.success);

      if (env.SOCIAL_QUEUE) {
        const record = {
          mode: 'immediate',
          text: payload.text,
          platforms: payload.platforms || DEFAULT_PLATFORMS,
          dispatchedAt: new Date().toISOString(),
          results
        };
        const logKey = `history:${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
        ctx?.waitUntil?.(
          env.SOCIAL_QUEUE.put(logKey, JSON.stringify(record), { expirationTtl: THIRTY_DAYS_SECONDS })
        );
      }

      return jsonResponse(
        {
          success: anySucceeded,
          allSucceeded,
          mode: 'immediate',
          dispatchedAt: new Date().toISOString(),
          results
        },
        anySucceeded ? 200 : 502
      );
    }

    // Schedule for future delivery (PC OFF safe)
    if (url.pathname === '/schedule' && request.method === 'POST') {
      let payload;
      try {
        payload = await request.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON request body' }, 400);
      }

      const validationError = validatePayload(payload, { requireScheduleTime: true });
      if (validationError) {
        return jsonResponse({ error: validationError }, 400);
      }

      if (!env.SOCIAL_QUEUE) {
        return jsonResponse(
          { error: 'SOCIAL_QUEUE KV binding not configured. Please bind KV in wrangler.toml' },
          500
        );
      }

      const scheduledTimestamp = new Date(payload.scheduleTime).getTime();
      const id = `scheduled:${scheduledTimestamp}_${crypto.randomUUID().slice(0, 8)}`;
      const queueRecord = {
        ...payload,
        platforms: payload.platforms || DEFAULT_PLATFORMS,
        attempts: 0,
        completedPlatforms: [],
        lastErrors: [],
        createdAt: new Date().toISOString()
      };

      await env.SOCIAL_QUEUE.put(id, JSON.stringify(queueRecord));

      return jsonResponse({
        success: true,
        mode: 'scheduled',
        queueId: id,
        targetTime: new Date(scheduledTimestamp).toISOString(),
        platforms: queueRecord.platforms,
        message: 'Saved to Cloudflare edge KV. Post will automatically dispatch even if your PC is off!'
      });
    }

    // List pending scheduled posts
    if (url.pathname === '/queue' && request.method === 'GET') {
      if (!env.SOCIAL_QUEUE) {
        return jsonResponse({ error: 'SOCIAL_QUEUE KV binding not configured' }, 500);
      }
      const keys = await listAllKvKeys(env.SOCIAL_QUEUE, 'scheduled:');
      const items = await Promise.all(
        keys.map(async (k) => {
          const raw = await env.SOCIAL_QUEUE.get(k.name);
          try {
            const parsed = JSON.parse(raw || '{}');
            return { queueId: k.name, ...parsed };
          } catch {
            return { queueId: k.name, corrupt: true };
          }
        })
      );
      items.sort((a, b) => a.queueId.localeCompare(b.queueId));
      return jsonResponse({ count: items.length, items });
    }

    // Cancel / delete a scheduled post
    if (url.pathname.startsWith('/queue/') && request.method === 'DELETE') {
      if (!env.SOCIAL_QUEUE) {
        return jsonResponse({ error: 'SOCIAL_QUEUE KV binding not configured' }, 500);
      }
      const queueId = decodeURIComponent(url.pathname.slice('/queue/'.length));
      if (!queueId.startsWith('scheduled:')) {
        return jsonResponse({ error: 'Invalid queueId: must start with scheduled:' }, 400);
      }
      const existing = await env.SOCIAL_QUEUE.get(queueId);
      if (!existing) {
        return jsonResponse({ error: 'Scheduled item not found' }, 404);
      }
      await env.SOCIAL_QUEUE.delete(queueId);
      return jsonResponse({ success: true, deleted: queueId });
    }

    // Recent dispatch history & failed jobs
    if (url.pathname === '/history' && request.method === 'GET') {
      if (!env.SOCIAL_QUEUE) {
        return jsonResponse({ error: 'SOCIAL_QUEUE KV binding not configured' }, 500);
      }
      const [historyKeys, failedKeys] = await Promise.all([
        listAllKvKeys(env.SOCIAL_QUEUE, 'history:'),
        listAllKvKeys(env.SOCIAL_QUEUE, 'failed:')
      ]);

      const readItems = async (keys) =>
        Promise.all(
          keys.slice(-25).reverse().map(async (k) => {
            const raw = await env.SOCIAL_QUEUE.get(k.name);
            try {
              return { id: k.name, ...JSON.parse(raw || '{}') };
            } catch {
              return { id: k.name, raw };
            }
          })
        );

      const [history, failed] = await Promise.all([readItems(historyKeys), readItems(failedKeys)]);
      return jsonResponse({ historyCount: historyKeys.length, failedCount: failedKeys.length, history, failed });
    }

    return jsonResponse({ error: 'Not Found' }, 404);
  },

  /**
   * Cron Trigger Handler (24/7 Edge Execution - PC OFF Safe)
   * Processes all due posts in KV with partial-success tracking and bounded retries.
   */
  async scheduled(event, env, ctx) {
    if (!env.SOCIAL_QUEUE) return;

    const now = Date.now();
    const maxRetries = Math.max(1, Number.parseInt(env.MAX_RETRY_ATTEMPTS || '3', 10));
    const keys = await listAllKvKeys(env.SOCIAL_QUEUE, 'scheduled:');

    for (const key of keys) {
      const parts = key.name.replace('scheduled:', '').split('_');
      const targetTime = Number.parseInt(parts[0], 10);

      if (Number.isNaN(targetTime) || targetTime > now) continue;

      const itemStr = await env.SOCIAL_QUEUE.get(key.name);
      if (!itemStr) continue;

      let record;
      try {
        record = JSON.parse(itemStr);
      } catch (err) {
        console.error('Corrupt scheduled JSON in KV:', key.name, err);
        await env.SOCIAL_QUEUE.put(
          `failed:${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
          JSON.stringify({ queueId: key.name, error: 'Corrupt JSON payload', raw: itemStr }),
          { expirationTtl: THIRTY_DAYS_SECONDS }
        );
        await env.SOCIAL_QUEUE.delete(key.name);
        continue;
      }

      const targetPlatforms = record.platforms || DEFAULT_PLATFORMS;
      const completedPlatforms = new Set(record.completedPlatforms || []);
      const remainingPlatforms = targetPlatforms.filter((p) => !completedPlatforms.has(p));

      if (remainingPlatforms.length === 0) {
        await env.SOCIAL_QUEUE.delete(key.name);
        continue;
      }

      const results = await dispatchToPlatforms(env, {
        ...record,
        platforms: remainingPlatforms
      });

      const failedResults = [];
      for (const res of results) {
        if (res.success && res.platform) {
          completedPlatforms.add(res.platform);
        } else {
          failedResults.push(res);
        }
      }

      // Check if every non-skipped platform succeeded (or if all remaining failed only because missing config)
      const retryableFailures = failedResults.filter((r) => !r.skipped);
      const nextAttempts = (record.attempts || 0) + 1;

      if (retryableFailures.length === 0) {
        const archive = {
          ...record,
          mode: 'scheduled',
          completedPlatforms: [...completedPlatforms],
          dispatchedAt: new Date().toISOString(),
          results
        };
        const prefix = failedResults.length > 0 && completedPlatforms.size === 0 ? 'failed' : 'history';
        await env.SOCIAL_QUEUE.put(
          `${prefix}:${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
          JSON.stringify(archive),
          { expirationTtl: THIRTY_DAYS_SECONDS }
        );
        await env.SOCIAL_QUEUE.delete(key.name);
      } else if (nextAttempts >= maxRetries) {
        const failedArchive = {
          ...record,
          attempts: nextAttempts,
          completedPlatforms: [...completedPlatforms],
          failedAt: new Date().toISOString(),
          lastErrors: retryableFailures
        };
        await env.SOCIAL_QUEUE.put(
          `failed:${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
          JSON.stringify(failedArchive),
          { expirationTtl: THIRTY_DAYS_SECONDS }
        );
        await env.SOCIAL_QUEUE.delete(key.name);
      } else {
        // Persist partial success so next cron run only retries failed platforms
        const updatedRecord = {
          ...record,
          attempts: nextAttempts,
          completedPlatforms: [...completedPlatforms],
          lastAttemptAt: new Date().toISOString(),
          lastErrors: retryableFailures
        };
        await env.SOCIAL_QUEUE.put(key.name, JSON.stringify(updatedRecord));
      }
    }
  }
};
