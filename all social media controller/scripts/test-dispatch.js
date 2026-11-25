import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { dispatchToPlatforms } from '../src/index.js';

function createMockKV() {
  const store = new Map();
  return {
    store,
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async put(key, value) {
      store.set(key, String(value));
    },
    async delete(key) {
      store.delete(key);
    },
    async list({ prefix = '', cursor } = {}) {
      const matching = [...store.keys()]
        .filter((k) => k.startsWith(prefix))
        .sort()
        .map((name) => ({ name }));
      return {
        keys: matching,
        list_complete: true,
        cursor: cursor ? undefined : undefined
      };
    }
  };
}

function createFetchMock(handler) {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return handler(String(url), options, calls);
  };
  return {
    calls,
    restore() {
      globalThis.fetch = originalFetch;
    }
  };
}

function jsonRes(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

test('dispatchToPlatforms reports skipped platforms instead of silent empty array', async () => {
  const results = await dispatchToPlatforms({}, {
    text: 'Hello world',
    platforms: ['telegram', 'linkedin', 'facebook', 'instagram', 'twitter']
  });

  assert.equal(results.length, 5);
  for (const r of results) {
    assert.equal(r.success, false);
    assert.equal(r.skipped, true);
    assert.ok(r.error);
  }
});

test('Telegram adapter handles HTML parse error fallback and photo caption splitting', async () => {
  const mock = createFetchMock((url, opts) => {
    const body = JSON.parse(opts.body);
    if (url.endsWith('/sendMessage') && body.parse_mode === 'HTML') {
      return jsonRes({ ok: false, description: "Bad Request: can't parse entities" }, 400);
    }
    if (url.endsWith('/sendPhoto')) {
      assert.ok(body.caption.length <= 1024);
      return jsonRes({ ok: true, result: { message_id: 101 } });
    }
    return jsonRes({ ok: true, result: { message_id: 102 } });
  });

  try {
    const res1 = await dispatchToPlatforms(
      { TELEGRAM_BOT_TOKEN: 'bot-tok', TELEGRAM_CHAT_ID: '123' },
      { text: 'Next.js > React & Vite', platforms: ['telegram'], parseMode: 'HTML' }
    );
    assert.equal(res1[0].success, true);
    assert.equal(res1[0].messageId, 102);

    const longText = 'A'.repeat(1200);
    const res2 = await dispatchToPlatforms(
      { TELEGRAM_BOT_TOKEN: 'bot-tok', TELEGRAM_CHAT_ID: '123' },
      { text: longText, mediaUrl: 'https://example.com/img.png', platforms: ['telegram'] }
    );
    assert.equal(res2[0].success, true);
    assert.equal(res2[0].messageId, 101);
    assert.ok(mock.calls.some((c) => c.url.endsWith('/sendPhoto')));
    assert.ok(mock.calls.some((c) => c.url.endsWith('/sendMessage')));
  } finally {
    mock.restore();
  }
});

test('LinkedIn adapter reads x-restli-id header and enforces 3000 char limit', async () => {
  const mock = createFetchMock((url, opts) => {
    const payload = JSON.parse(opts.body);
    assert.equal(payload.author, 'urn:li:person:abc123');
    return new Response('', { status: 201, headers: { 'x-restli-id': 'urn:li:share:999' } });
  });

  try {
    const ok = await dispatchToPlatforms(
      { LINKEDIN_ACCESS_TOKEN: 'li-tok', LINKEDIN_PERSON_URN: 'abc123' },
      { text: 'Shipping edge workers', platforms: ['linkedin'] }
    );
    assert.equal(ok[0].success, true);
    assert.equal(ok[0].id, 'urn:li:share:999');

    const tooLong = await dispatchToPlatforms(
      { LINKEDIN_ACCESS_TOKEN: 'li-tok', LINKEDIN_PERSON_URN: 'abc123' },
      { text: 'X'.repeat(3001), platforms: ['linkedin'] }
    );
    assert.equal(tooLong[0].success, false);
    assert.match(tooLong[0].error, /3,000/);
  } finally {
    mock.restore();
  }
});

test('Facebook & Instagram adapters call Meta Graph API v21.0 properly', async () => {
  const mock = createFetchMock((url, opts) => {
    const params = new URLSearchParams(opts.body.toString());
    if (url.includes('/photos')) {
      assert.equal(params.get('url'), 'https://example.com/pic.jpg');
      assert.equal(params.get('caption'), 'Launch post');
      assert.equal(params.get('message'), null);
      return jsonRes({ id: 'fb_photo_1', post_id: 'fb_post_1' });
    }
    if (url.endsWith('/ig_1/media')) {
      assert.equal(params.get('image_url'), 'https://example.com/pic.jpg');
      return jsonRes({ id: 'creation_123' });
    }
    if (url.endsWith('/ig_1/media_publish')) {
      assert.equal(params.get('creation_id'), 'creation_123');
      return jsonRes({ id: 'ig_published_456' });
    }
    return jsonRes({ id: 'fb_feed_1' });
  });

  try {
    const igNoMedia = await dispatchToPlatforms(
      { INSTAGRAM_USER_ID: 'ig_1', FACEBOOK_PAGE_ACCESS_TOKEN: 'meta-tok' },
      { text: 'Text only', platforms: ['instagram'] }
    );
    assert.equal(igNoMedia[0].success, false);
    assert.match(igNoMedia[0].error, /mediaUrl/);

    const both = await dispatchToPlatforms(
      {
        FACEBOOK_PAGE_ID: 'fb_1',
        FACEBOOK_PAGE_ACCESS_TOKEN: 'meta-tok',
        INSTAGRAM_USER_ID: 'ig_1'
      },
      { text: 'Launch post', mediaUrl: 'https://example.com/pic.jpg', platforms: ['facebook', 'instagram'] }
    );
    assert.equal(both[0].success, true);
    assert.equal(both[0].id, 'fb_post_1');
    assert.equal(both[1].success, true);
    assert.equal(both[1].id, 'ig_published_456');
  } finally {
    mock.restore();
  }
});

test('Twitter adapter signs OAuth 1.0a HMAC-SHA1 and enforces 280 char limit', async () => {
  const mock = createFetchMock((url, opts) => {
    assert.ok(opts.headers.Authorization.startsWith('OAuth '));
    assert.ok(opts.headers.Authorization.includes('oauth_signature_method="HMAC-SHA1"'));
    assert.ok(opts.headers.Authorization.includes('oauth_signature='));
    return jsonRes({ data: { id: 'tweet_777' } }, 201);
  });

  try {
    const env = {
      TWITTER_API_KEY: 'ck',
      TWITTER_API_SECRET: 'cs',
      TWITTER_ACCESS_TOKEN: 'at',
      TWITTER_ACCESS_SECRET: 'as'
    };

    const overLimit = await dispatchToPlatforms(env, {
      text: 'T'.repeat(281),
      platforms: ['twitter']
    });
    assert.equal(overLimit[0].success, false);

    const truncated = await dispatchToPlatforms(env, {
      text: 'T'.repeat(285),
      platforms: ['twitter'],
      autoTruncate: true
    });
    assert.equal(truncated[0].success, true);
    assert.equal(truncated[0].id, 'tweet_777');
  } finally {
    mock.restore();
  }
});

test('Worker HTTP endpoints enforce fail-closed auth, validation, schedule, queue & history', async () => {
  const kv = createMockKV();
  const ctx = { waitUntil: (p) => p };

  // Fail closed when DISPATCHER_API_KEY is missing
  const misconfRes = await worker.fetch(new Request('https://worker.test/status'), {}, ctx);
  assert.equal(misconfRes.status, 500);

  const env = {
    DISPATCHER_API_KEY: 'super-secret-123',
    TELEGRAM_BOT_TOKEN: 'tg-tok',
    TELEGRAM_CHAT_ID: 'tg-chat',
    SOCIAL_QUEUE: kv,
    MAX_RETRY_ATTEMPTS: '2'
  };

  // Public ping succeeds without auth
  const pingRes = await worker.fetch(new Request('https://worker.test/'), env, ctx);
  assert.equal(pingRes.status, 200);

  // Wrong key returns 401
  const unauthRes = await worker.fetch(
    new Request('https://worker.test/status', { headers: { Authorization: 'Bearer wrong' } }),
    env,
    ctx
  );
  assert.equal(unauthRes.status, 401);

  // Validation error on empty text
  const badPublish = await worker.fetch(
    new Request('https://worker.test/publish', {
      method: 'POST',
      headers: { Authorization: 'Bearer super-secret-123', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '   ' })
    }),
    env,
    ctx
  );
  assert.equal(badPublish.status, 400);

  // Schedule future post
  const schedRes = await worker.fetch(
    new Request('https://worker.test/schedule', {
      method: 'POST',
      headers: { Authorization: 'Bearer super-secret-123', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Future post',
        scheduleTime: '2099-01-01T00:00:00Z',
        platforms: ['telegram']
      })
    }),
    env,
    ctx
  );
  assert.equal(schedRes.status, 200);
  const schedJson = await schedRes.json();
  assert.ok(schedJson.queueId.startsWith('scheduled:'));

  // Queue listing shows 1 item
  const queueRes = await worker.fetch(
    new Request('https://worker.test/queue', {
      headers: { Authorization: 'Bearer super-secret-123' }
    }),
    env,
    ctx
  );
  const queueJson = await queueRes.json();
  assert.equal(queueJson.count, 1);

  // Delete scheduled item
  const delRes = await worker.fetch(
    new Request(`https://worker.test/queue/${encodeURIComponent(schedJson.queueId)}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer super-secret-123' }
    }),
    env,
    ctx
  );
  assert.equal(delRes.status, 200);
});

test('Cron scheduled() retries only failed platforms without duplicating succeeded ones', async () => {
  const kv = createMockKV();
  const env = {
    SOCIAL_QUEUE: kv,
    MAX_RETRY_ATTEMPTS: '3',
    TELEGRAM_BOT_TOKEN: 'tg-tok',
    TELEGRAM_CHAT_ID: 'tg-chat',
    LINKEDIN_ACCESS_TOKEN: 'li-tok',
    LINKEDIN_PERSON_URN: 'urn:li:person:1'
  };

  let linkedInShouldFail = true;
  const mock = createFetchMock((url) => {
    if (url.includes('api.telegram.org')) {
      return jsonRes({ ok: true, result: { message_id: 55 } });
    }
    if (url.includes('api.linkedin.com')) {
      if (linkedInShouldFail) {
        return new Response('Transient 503', { status: 503 });
      }
      return new Response('', { status: 201, headers: { 'x-restli-id': 'urn:li:share:555' } });
    }
    return jsonRes({});
  });

  try {
    const dueKey = `scheduled:${Date.now() - 1000}_test1`;
    await kv.put(
      dueKey,
      JSON.stringify({
        text: 'Multi-platform scheduled post',
        platforms: ['telegram', 'linkedin'],
        attempts: 0,
        completedPlatforms: []
      })
    );

    // Run 1: Telegram succeeds, LinkedIn fails -> Telegram saved in completedPlatforms
    await worker.scheduled({}, env, {});
    const afterRun1 = JSON.parse(await kv.get(dueKey));
    assert.deepEqual(afterRun1.completedPlatforms, ['telegram']);
    assert.equal(afterRun1.attempts, 1);

    // Run 2: LinkedIn recovers -> ONLY LinkedIn is called, Telegram is NOT double-posted!
    const callsBeforeRun2 = mock.calls.length;
    linkedInShouldFail = false;
    await worker.scheduled({}, env, {});

    const callsInRun2 = mock.calls.slice(callsBeforeRun2);
    assert.equal(callsInRun2.filter((c) => c.url.includes('api.telegram.org')).length, 0);
    assert.equal(callsInRun2.filter((c) => c.url.includes('api.linkedin.com')).length, 1);
    assert.equal(await kv.get(dueKey), null);

    const historyKeys = [...kv.store.keys()].filter((k) => k.startsWith('history:'));
    assert.equal(historyKeys.length, 1);
  } finally {
    mock.restore();
  }
});
