/**
 * Core Speed, Core Web Vitals & Mobile Ergonomics Scanner
 * Inspects mobile viewport meta compliance, HTML transfer weight, image dimension attributes (CLS prevention)
 * and responsive ergonomics.
 */

export async function scanSpeed(siteConfig, networkResult) {
  const url = siteConfig.url;
  const html = networkResult.html || '';
  const headers = networkResult.headers || {};
  const latencyMs = networkResult.latencyMs || 0;

  const result = {
    url,
    score: 100,
    pass: true,
    latency: {
      ms: latencyMs,
      grade: latencyMs < 500 ? 'EXCELLENT' : (latencyMs < 1000 ? 'GOOD' : 'SLOW')
    },
    mobileViewport: {
      present: false,
      tag: '',
      valid: false
    },
    payloadWeight: {
      htmlBytes: html.length,
      compressed: networkResult.compression !== 'none' && networkResult.compression !== 'uncompressed'
    },
    clsElimination: {
      totalImagesFound: 0,
      imagesWithExplicitDimensions: 0,
      ratio: 1.0,
      issues: []
    },
    issues: [],
    remediations: []
  };

  // 1. Latency Benchmark Check
  if (latencyMs > 1200) {
    result.score -= 20;
    result.issues.push(`High TTFB / latency: ${latencyMs}ms (target is < 500ms)`);
    result.remediations.push({
      type: 'HIGH_LATENCY',
      fix: 'Enable Cloudflare Edge Cache-Control headers: public, s-maxage=86400, stale-while-revalidate=604800'
    });
  } else if (latencyMs > 700) {
    result.score -= 10;
  }

  // 2. Mobile Viewport Meta Inspection
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']viewport["']/i);
  if (viewportMatch) {
    result.mobileViewport.present = true;
    result.mobileViewport.tag = viewportMatch[1];
    result.mobileViewport.valid = viewportMatch[1].includes('width=device-width');
  } else {
    result.score -= 25;
    result.issues.push('Missing viewport meta tag (breaks mobile rendering and Google mobile-first indexation)');
    result.remediations.push({
      type: 'MISSING_VIEWPORT',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to document head.'
    });
  }

  // 3. Compression Verification
  if (!result.payloadWeight.compressed) {
    result.score -= 15;
    result.issues.push('HTML response uncompressed (Brotli/Gzip not detected)');
    result.remediations.push({
      type: 'NO_COMPRESSION',
      fix: 'Enable Brotli and Gzip compression on Cloudflare dashboard.'
    });
  }

  // 4. CLS (Cumulative Layout Shift) Elimination Inspection
  const imgTags = [...html.matchAll(/<img[^>]*>/gi)];
  result.clsElimination.totalImagesFound = imgTags.length;
  if (imgTags.length > 0) {
    let withDimensions = 0;
    for (const tag of imgTags) {
      const str = tag[0];
      const hasWidth = /width=["']?\d+/i.test(str);
      const hasHeight = /height=["']?\d+/i.test(str);
      const hasAspect = /aspect-/i.test(str);
      const isNextFill = /data-nimg=["']fill["']/i.test(str);
      if ((hasWidth && hasHeight) || hasAspect || isNextFill) {
        withDimensions++;
      }
    }
    result.clsElimination.imagesWithExplicitDimensions = withDimensions;
    result.clsElimination.ratio = Math.round((withDimensions / imgTags.length) * 100) / 100;

    if (result.clsElimination.ratio < 0.6) {
      result.score -= 10;
      result.issues.push(`${imgTags.length - withDimensions} image(s) lack explicit width/height or aspect-ratio classes, causing Cumulative Layout Shift (CLS)`);
      result.remediations.push({
        type: 'CLS_IMAGES_MISSING_DIMENSIONS',
        fix: 'Add explicit width and height attributes or Tailwind aspect-ratio containers to all <img> elements.'
      });
    }
  }

  if (result.score < 0) result.score = 0;
  result.pass = result.score >= 75 && result.mobileViewport.valid;
  return result;
}
