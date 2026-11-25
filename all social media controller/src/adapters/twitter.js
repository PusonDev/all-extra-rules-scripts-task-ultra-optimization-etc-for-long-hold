/**
 * Twitter / X Dispatcher
 * Uses official X API v2 (Free Tier provides up to 1,500 posts/month)
 * Supports BOTH OAuth 1.0a User Context (API Key/Secret + Access Token/Secret)
 * and OAuth 2.0 User Context PKCE Bearer Token.
 */

function percentEncode(str) {
  return encodeURIComponent(String(str)).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function generateNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function buildOAuth1Header({ method, url, apiKey, apiSecret, accessToken, accessSecret }) {
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0'
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString)
  ].join('&');

  const signingKey = `${percentEncode(apiSecret)}&${percentEncode(accessSecret)}`;
  const keyData = new TextEncoder().encode(signingKey);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(baseString));
  const sigBytes = new Uint8Array(sigBuffer);
  let binary = '';
  for (let i = 0; i < sigBytes.length; i++) {
    binary += String.fromCharCode(sigBytes[i]);
  }
  oauthParams.oauth_signature = btoa(binary);

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerParts}`;
}

export async function sendTwitter({
  apiKey,
  apiSecret,
  accessToken,
  accessSecret,
  oauth2Token,
  bearerToken,
  text,
  autoTruncate = false
}) {
  const hasOAuth1 = Boolean(apiKey && apiSecret && accessToken && accessSecret);
  const userBearer = oauth2Token || (!hasOAuth1 ? (accessToken || bearerToken) : null);

  if (!hasOAuth1 && !userBearer) {
    return {
      success: false,
      skipped: true,
      platform: 'twitter',
      error: 'Missing Twitter credentials (OAuth 1.0a 4-key set or TWITTER_OAUTH2_TOKEN)'
    };
  }

  let tweetText = text;
  if (tweetText.length > 280) {
    if (autoTruncate) {
      tweetText = `${tweetText.slice(0, 277)}...`;
    } else {
      return {
        success: false,
        platform: 'twitter',
        error: `Post exceeds X/Twitter 280 character limit (${tweetText.length} chars). Pass autoTruncate: true to trim.`
      };
    }
  }

  try {
    const endpoint = 'https://api.twitter.com/2/tweets';
    const authHeader = hasOAuth1
      ? await buildOAuth1Header({
          method: 'POST',
          url: endpoint,
          apiKey,
          apiSecret,
          accessToken,
          accessSecret
        })
      : `Bearer ${userBearer}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: tweetText })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.errors) {
      let errorMsg = result.detail || result.title || JSON.stringify(result.errors || result);
      if (response.status === 403 && String(errorMsg).includes('Application-Only')) {
        errorMsg = 'X API v2 rejected App-Only Bearer Token. Configure OAuth 1.0a keys (TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET) or an OAuth 2.0 User Context token.';
      }
      return {
        success: false,
        platform: 'twitter',
        status: response.status,
        error: errorMsg
      };
    }

    return {
      success: true,
      platform: 'twitter',
      id: result.data?.id
    };
  } catch (err) {
    return { success: false, platform: 'twitter', error: err.message };
  }
}
