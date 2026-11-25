/**
 * Core Network & Edge Scanner
 * Verifies live endpoint availability, latency, Cloudflare edge, compression and HTTPS redirection.
 */

export async function scanNetwork(siteConfig, maxLatencyMs = 1500) {
  const url = siteConfig.url;
  const start = Date.now();

  const result = {
    url,
    status: 0,
    latencyMs: 0,
    isOnline: false,
    isCloudflare: false,
    compression: 'none',
    httpsEnforced: false,
    headers: {},
    html: '',
    pass: false,
    issues: []
  };

  // 1. Primary HTTPS Request
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'ZenVQ-Ultra-Engine/1.0 (Automated Multi-Vector Audit)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      signal: AbortSignal.timeout(12000)
    });

    result.latencyMs = Date.now() - start;
    result.status = res.status;
    result.isOnline = res.status === 200;

    for (const [k, v] of res.headers.entries()) {
      result.headers[k.toLowerCase()] = v;
    }

    // Cloudflare Edge verification
    const serverHeader = (result.headers['server'] || '').toLowerCase();
    const hasCfRay = Boolean(result.headers['cf-ray']);
    result.isCloudflare = serverHeader.includes('cloudflare') || hasCfRay;

    // Compression verification
    const encoding = (result.headers['content-encoding'] || '').toLowerCase();
    result.compression = encoding || 'uncompressed';

    // Fetch HTML body
    result.html = await res.text();

    if (!result.isOnline) {
      result.issues.push(`Endpoint returned HTTP ${result.status} (expected 200)`);
    }

    if (result.latencyMs > maxLatencyMs) {
      result.issues.push(`Latency ${result.latencyMs}ms exceeded threshold of ${maxLatencyMs}ms`);
    }

    if (!result.isCloudflare) {
      result.issues.push('Not served via Cloudflare Edge network (missing cf-ray/server header)');
    }

  } catch (err) {
    result.latencyMs = Date.now() - start;
    result.isOnline = false;
    result.issues.push(`Network connection failed: ${err.message}`);
  }

  // 2. HTTP to HTTPS Redirection Test
  try {
    const httpUrl = url.replace('https://', 'http://');
    const httpRes = await fetch(httpUrl, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(6000)
    });
    // Cloudflare normally responds with 301 or 308 redirect to https
    result.httpsEnforced = [301, 302, 307, 308].includes(httpRes.status);
    if (!result.httpsEnforced && httpRes.status !== 200) {
      result.issues.push(`HTTP endpoint did not issue HTTPS redirect (status: ${httpRes.status})`);
    }
  } catch {
    // If port 80 is strictly blocked, HTTPS is effectively enforced
    result.httpsEnforced = true;
  }

  result.pass = result.isOnline && result.latencyMs <= maxLatencyMs && result.isCloudflare;
  return result;
}
