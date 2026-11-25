/**
 * Core SEO & Search Engine Optimization Scanner
 * Inspects heading hierarchy (single H1), title, meta descriptions, canonical URLs,
 * OpenGraph, Twitter Cards, Schema.org JSON-LD structured data, sitemap.xml, robots.txt
 * and Universal Return Gateway to zenvq.com.
 */

export async function scanSeo(siteConfig, networkResult) {
  const url = siteConfig.url;
  const html = networkResult.html || '';

  const result = {
    url,
    score: 100,
    pass: true,
    h1: {
      count: 0,
      content: [],
      valid: false
    },
    headingHierarchy: {
      valid: true,
      order: [],
      issues: []
    },
    metaTitle: {
      present: false,
      text: '',
      length: 0,
      optimal: false
    },
    metaDescription: {
      present: false,
      text: '',
      length: 0,
      optimal: false
    },
    canonical: {
      present: false,
      href: '',
      isHttps: false
    },
    openGraph: {
      present: false,
      title: '',
      image: '',
      url: '',
      siteName: '',
      complete: false
    },
    twitterCard: {
      present: false,
      cardType: '',
      isSummaryLargeImage: false
    },
    structuredData: {
      present: false,
      schemasFound: [],
      validJsonLd: false
    },
    sitemap: {
      url: `${url.replace(/\/$/, '')}/sitemap.xml`,
      accessible: false,
      status: 0
    },
    robotsTxt: {
      url: `${url.replace(/\/$/, '')}/robots.txt`,
      accessible: false,
      status: 0
    },
    returnGatewayToZenvq: {
      required: siteConfig.domain !== 'zenvq.com',
      present: false,
      valid: true
    },
    deadDomainFound: false,
    issues: [],
    remediations: []
  };

  if (!html) {
    result.score = 0;
    result.pass = false;
    result.issues.push('No HTML content received from site');
    return result;
  }

  // 1. Single H1 Law
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  result.h1.count = h1Matches.length;
  result.h1.content = h1Matches.map(m => m[1].replace(/<[^>]+>/g, '').trim()).slice(0, 3);
  result.h1.valid = result.h1.count === 1;

  if (result.h1.count === 0) {
    result.score -= 20;
    result.issues.push('Missing <h1> element (Single H1 law requires exactly one <h1> per page)');
    result.remediations.push({
      type: 'MISSING_H1',
      fix: 'Add a semantic <h1> element in page hero with primary keyword.'
    });
  } else if (result.h1.count > 1) {
    result.score -= 10;
    result.issues.push(`Multiple <h1> elements detected (${result.h1.count}). Only 1 primary <h1> allowed.`);
    result.remediations.push({
      type: 'MULTIPLE_H1',
      fix: 'Downgrade secondary <h1> tags to <h2>.'
    });
  }

  // 2. Heading Hierarchy Inspection
  const headingMatches = [...html.matchAll(/<(h[1-3])[^>]*>/gi)];
  const levels = headingMatches.map(m => parseInt(m[1].charAt(1), 10));
  result.headingHierarchy.order = levels.slice(0, 10);
  for (let i = 0; i < levels.length - 1; i++) {
    if (levels[i] === 1 && levels[i + 1] === 3) {
      result.headingHierarchy.valid = false;
      result.headingHierarchy.issues.push('Heading level skipped directly from <h1> to <h3> without <h2>');
      result.score -= 5;
      break;
    }
  }

  // 3. Title Tag Inspection
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    result.metaTitle.present = true;
    result.metaTitle.text = titleMatch[1].trim();
    result.metaTitle.length = result.metaTitle.text.length;
    result.metaTitle.optimal = result.metaTitle.length >= 25 && result.metaTitle.length <= 70;
    if (!result.metaTitle.optimal) {
      result.score -= 5;
      result.issues.push(`Page title length (${result.metaTitle.length} chars) is outside optimal 25-70 character range`);
    }
  } else {
    result.score -= 15;
    result.issues.push('Missing <title> tag');
  }

  // 4. Meta Description Inspection
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  if (descMatch) {
    result.metaDescription.present = true;
    result.metaDescription.text = descMatch[1].trim();
    result.metaDescription.length = result.metaDescription.text.length;
    result.metaDescription.optimal = result.metaDescription.length >= 100 && result.metaDescription.length <= 165;
  } else {
    result.score -= 15;
    result.issues.push('Missing <meta name="description"> tag');
    result.remediations.push({
      type: 'MISSING_DESCRIPTION',
      fix: 'Export description in Next.js page metadata (120-160 chars).'
    });
  }

  // 5. Canonical URL
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  if (canonicalMatch) {
    result.canonical.present = true;
    result.canonical.href = canonicalMatch[1];
    result.canonical.isHttps = result.canonical.href.startsWith('https://');
  } else {
    result.score -= 10;
    result.issues.push('Missing canonical link (<link rel="canonical">)');
  }

  // 6. OpenGraph Verification
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["']/i);
  const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["']/i);

  if (ogTitleMatch) result.openGraph.title = ogTitleMatch[1];
  if (ogImgMatch) result.openGraph.image = ogImgMatch[1];
  if (ogUrlMatch) result.openGraph.url = ogUrlMatch[1];
  if (ogSiteMatch) result.openGraph.siteName = ogSiteMatch[1];
  result.openGraph.present = Boolean(ogTitleMatch || ogImgMatch);
  result.openGraph.complete = Boolean(ogTitleMatch && ogImgMatch && ogUrlMatch);

  if (!result.openGraph.complete) {
    result.score -= 5;
    result.issues.push('Incomplete OpenGraph tags (requires og:title, og:image, and og:url)');
  }

  // 7. Twitter Card Verification
  const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);
  if (twitterCardMatch) {
    result.twitterCard.present = true;
    result.twitterCard.cardType = twitterCardMatch[1];
    result.twitterCard.isSummaryLargeImage = twitterCardMatch[1].toLowerCase() === 'summary_large_image';
  }

  // 8. Schema.org JSON-LD Structured Data
  const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (jsonLdMatches.length > 0) {
    result.structuredData.present = true;
    for (const jlm of jsonLdMatches) {
      try {
        const parsed = JSON.parse(jlm[1]);
        result.structuredData.validJsonLd = true;
        const schemaType = parsed['@type'] || (Array.isArray(parsed['@graph']) ? parsed['@graph'].map(g => g['@type']).join(', ') : 'Custom');
        result.structuredData.schemasFound.push(schemaType);
      } catch {
        result.issues.push('Invalid JSON-LD syntax in structured data script');
      }
    }
  } else {
    result.score -= 5;
    result.issues.push('No Schema.org JSON-LD structured data found');
  }

  // 9. Universal Return Gateway to zenvq.com Check
  if (siteConfig.domain !== 'zenvq.com') {
    const hasZenvqLink = html.includes('https://zenvq.com') || html.includes('//zenvq.com') || html.includes('href="https://zenvq.com"') || html.includes("href='https://zenvq.com'");
    result.returnGatewayToZenvq.present = hasZenvqLink;
    if (!hasZenvqLink) {
      result.returnGatewayToZenvq.valid = false;
      result.score -= 10;
      result.issues.push('Missing return navigation gateway to "https://zenvq.com" in header/footer (Universal Return Gateway Rule)');
      result.remediations.push({
        type: 'MISSING_RETURN_GATEWAY_TO_ZENVQ',
        fix: 'Add an ecosystem link or footer badge pointing back to https://zenvq.com so users are never trapped on sub-verticals.'
      });
    }
  }

  // 10. Dead Legacy Domain Check (zenvqagency.com must be 0)
  if (html.includes('zenvqagency.com')) {
    result.deadDomainFound = true;
    result.score -= 20;
    result.issues.push('CRITICAL: Dead legacy domain "zenvqagency.com" found in page body!');
    result.remediations.push({
      type: 'DEAD_DOMAIN_DETECTED',
      fix: 'Search and replace "zenvqagency.com" with "agency.zenvq.com" across codebase.'
    });
  }

  // 11. Check live sitemap.xml & robots.txt concurrently
  try {
    const sitemapRes = await fetch(result.sitemap.url, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
    result.sitemap.status = sitemapRes.status;
    result.sitemap.accessible = sitemapRes.status === 200;
  } catch {
    result.sitemap.accessible = false;
  }

  try {
    const robotsRes = await fetch(result.robotsTxt.url, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
    result.robotsTxt.status = robotsRes.status;
    result.robotsTxt.accessible = robotsRes.status === 200;
  } catch {
    result.robotsTxt.accessible = false;
  }

  if (!result.sitemap.accessible) {
    result.score -= 10;
    result.issues.push(`sitemap.xml not accessible at ${result.sitemap.url} (HTTP ${result.sitemap.status})`);
  }

  if (!result.robotsTxt.accessible) {
    result.score -= 5;
    result.issues.push(`robots.txt not accessible at ${result.robotsTxt.url} (HTTP ${result.robotsTxt.status})`);
  }

  if (result.score < 0) result.score = 0;
  result.pass = result.score >= 75 && !result.deadDomainFound;
  return result;
}
