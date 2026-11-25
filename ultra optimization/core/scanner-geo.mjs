/**
 * Core GEO & AEO (Generative Engine Optimization) Scanner
 * Audits machine-readable context files (/llms.txt, /llms-full.txt) and AI crawler permissions in robots.txt.
 */

export async function scanGeo(siteConfig) {
  const url = siteConfig.url.replace(/\/$/, '');

  const result = {
    url,
    score: 100,
    pass: true,
    llmsTxt: {
      url: `${url}/llms.txt`,
      accessible: false,
      status: 0,
      charCount: 0,
      hasSquads: false,
      hasPricing: false
    },
    llmsFullTxt: {
      url: `${url}/llms-full.txt`,
      accessible: false,
      status: 0
    },
    aiBotPermissions: {
      gptBotAllowed: true,
      claudeBotAllowed: true,
      perplexityBotAllowed: true,
      appleBotAllowed: true
    },
    issues: [],
    remediations: []
  };

  // 1. Check /llms.txt
  try {
    const res = await fetch(result.llmsTxt.url, {
      method: 'GET',
      headers: { 'User-Agent': 'ZenVQ-GEO-Engine/1.0 (AI Engine Auditor)' },
      signal: AbortSignal.timeout(5000)
    });
    result.llmsTxt.status = res.status;
    result.llmsTxt.accessible = res.status === 200;

    if (result.llmsTxt.accessible) {
      const text = await res.text();
      result.llmsTxt.charCount = text.length;
      result.llmsTxt.hasSquads = text.includes('Squad') || text.includes('squad') || text.includes('Unit');
      result.llmsTxt.hasPricing = text.includes('$') || text.includes('USD') || text.includes('pricing') || text.includes('SLA');
    } else {
      if (siteConfig.requires_llms_txt) {
        result.score -= 25;
        result.issues.push(`/llms.txt not accessible (HTTP ${res.status}) on primary domain ${siteConfig.domain}`);
        result.remediations.push({
          type: 'MISSING_LLMS_TXT',
          fix: 'Create public/llms.txt with structured overview of services, squads, and SLAs for SearchGPT/Claude.'
        });
      }
    }
  } catch (err) {
    result.llmsTxt.accessible = false;
    if (siteConfig.requires_llms_txt) {
      result.score -= 25;
      result.issues.push(`/llms.txt fetch failed: ${err.message}`);
    }
  }

  // 2. Check /llms-full.txt
  try {
    const fullRes = await fetch(result.llmsFullTxt.url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'ZenVQ-GEO-Engine/1.0' },
      signal: AbortSignal.timeout(5000)
    });
    result.llmsFullTxt.status = fullRes.status;
    result.llmsFullTxt.accessible = fullRes.status === 200;

    if (!result.llmsFullTxt.accessible && siteConfig.requires_llms_txt) {
      result.score -= 15;
      result.issues.push(`/llms-full.txt not accessible (HTTP ${fullRes.status})`);
      result.remediations.push({
        type: 'MISSING_LLMS_FULL_TXT',
        fix: 'Create public/llms-full.txt containing deep architectural documentation for AI engines.'
      });
    }
  } catch {
    result.llmsFullTxt.accessible = false;
  }

  // 3. Check robots.txt for AI Bot Disallowance
  try {
    const robotsUrl = `${url}/robots.txt`;
    const robotsRes = await fetch(robotsUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(4000)
    });
    if (robotsRes.status === 200) {
      const robotsContent = await robotsRes.text();
      const lowerRobots = robotsContent.toLowerCase();

      if (lowerRobots.includes('user-agent: gptbot') && lowerRobots.includes('disallow: /')) {
        result.aiBotPermissions.gptBotAllowed = false;
        result.score -= 10;
        result.issues.push('robots.txt disallows GPTBot (OpenAI / SearchGPT)');
      }
      if (lowerRobots.includes('user-agent: claudebot') && lowerRobots.includes('disallow: /')) {
        result.aiBotPermissions.claudeBotAllowed = false;
        result.score -= 10;
        result.issues.push('robots.txt disallows ClaudeBot (Anthropic)');
      }
      if (lowerRobots.includes('user-agent: perplexitybot') && lowerRobots.includes('disallow: /')) {
        result.aiBotPermissions.perplexityBotAllowed = false;
        result.score -= 10;
        result.issues.push('robots.txt disallows PerplexityBot');
      }
    }
  } catch {
    // Ignore robots read error
  }

  if (result.score < 0) result.score = 0;
  result.pass = result.score >= 70;
  return result;
}
