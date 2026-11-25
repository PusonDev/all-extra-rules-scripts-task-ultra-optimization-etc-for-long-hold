/**
 * Core Content Optimization, CRO, Halal Policy, Oxford Comma & Multilingual Scanner
 * Detects banned AI jargon, Oxford comma violations, Mojibake encoding corruptions,
 * Halal compliance keywords and agency contact isolation.
 */

export async function scanContent(siteConfig, networkResult, securityConfig) {
  const url = siteConfig.url;
  const html = networkResult.html || '';

  const result = {
    url,
    score: 100,
    pass: true,
    aiJargon: {
      found: [],
      clean: true
    },
    oxfordComma: {
      violations: [],
      clean: true
    },
    mojibake: {
      corruptions: [],
      clean: true
    },
    halalIntegrity: {
      clean: true,
      flags: []
    },
    whiteLabelIsolation: {
      compliant: true,
      issues: []
    },
    coreValuePreserved: {
      hasSquads: false,
      hasSla: false,
      hasPods: false
    },
    issues: [],
    remediations: []
  };

  if (!html) {
    result.score = 50;
    return result;
  }

  const lowerHtml = html.toLowerCase();

  // 1. Banned Pretentious AI Jargon Scan
  for (const phrase of securityConfig.banned_ai_jargon) {
    if (lowerHtml.includes(phrase.toLowerCase())) {
      result.aiJargon.found.push(phrase);
      result.aiJargon.clean = false;
      result.score -= 15;
      result.issues.push(`Pretentious AI jargon detected: "${phrase}"`);
      result.remediations.push({
        type: 'BANNED_AI_JARGON',
        phrase,
        fix: `Replace "${phrase}" with simple, punchy, plain-English words so non-technical founders understand effortlessly.`
      });
    }
  }

  // 2. Strict Zero Oxford Comma Scan
  // Extract visible text snippets by stripping script, style, and HTML tags
  const cleanText = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                        .replace(/<style[\s\S]*?<\/style>/gi, '')
                        .replace(/<svg[\s\S]*?<\/svg>/gi, '')
                        .replace(/<[^>]+>/g, ' ');

  for (const pattern of securityConfig.prohibited_oxford_comma_patterns) {
    const idx = cleanText.indexOf(pattern);
    if (idx !== -1) {
      const snippet = cleanText.substring(Math.max(0, idx - 20), Math.min(cleanText.length, idx + 35)).trim();
      result.oxfordComma.violations.push(snippet);
      result.oxfordComma.clean = false;
      result.score -= 10;
      result.issues.push(`Prohibited Oxford comma detected: "...${snippet}..."`);
      result.remediations.push({
        type: 'OXFORD_COMMA_VIOLATION',
        snippet,
        fix: `Remove the comma before "and"/"&": rewrite strictly as "A, B and C".`
      });
      break; // Report first instance to keep report concise
    }
  }

  // 3. Multilingual Character Encoding Corruptions (Mojibake)
  for (const pattern of securityConfig.mojibake_patterns) {
    if (html.includes(pattern)) {
      result.mojibake.corruptions.push(pattern);
      result.mojibake.clean = false;
      result.score -= 15;
      result.issues.push(`Character encoding corruption (Mojibake) detected: "${pattern}"`);
      result.remediations.push({
        type: 'MOJIBAKE_CORRUPTION',
        pattern,
        fix: 'Ensure HTML source files are saved in UTF-8 without BOM and verify correct character entity encoding.'
      });
    }
  }

  // 4. Strict Halal Content & Media Verification
  const HARAM_KEYWORDS = [
    'casino',
    'sports betting',
    'poker table',
    'payday loan',
    'interest rate compounding',
    'dating app',
    'liquor store'
  ];
  for (const kw of HARAM_KEYWORDS) {
    if (cleanText.toLowerCase().includes(kw)) {
      result.halalIntegrity.clean = false;
      result.halalIntegrity.flags.push(kw);
      result.score -= 30;
      result.issues.push(`Haram keyword detected: "${kw}" (violates strict Halal business policy)`);
      result.remediations.push({
        type: 'HARAM_KEYWORD_DETECTED',
        keyword: kw,
        fix: 'Remove prohibited haram business references immediately.'
      });
    }
  }

  // 5. Agency White-Label & Employee Contact Anonymity (for agency.zenvq.com)
  if (siteConfig.domain === 'agency.zenvq.com') {
    for (const personalEmail of securityConfig.agency_contact_restrictions.prohibited_personal_emails) {
      if (cleanText.includes(personalEmail)) {
        result.whiteLabelIsolation.compliant = false;
        result.whiteLabelIsolation.issues.push(`Personal employee email leaked: ${personalEmail}`);
        result.score -= 20;
        result.issues.push(`Agency anonymity violation: ${personalEmail} exposed`);
        result.remediations.push({
          type: 'PERSONAL_EMAIL_LEAK',
          email: personalEmail,
          fix: 'Replace personal email with official enterprise channel: onlyfordigitalwork@gmail.com'
        });
      }
    }

    // Verify official enterprise communication routing
    const hasOfficialChannel = securityConfig.agency_contact_restrictions.required_official_channels.some(
      channel => cleanText.includes(channel) || html.includes(channel)
    );
    if (!hasOfficialChannel) {
      result.score -= 10;
      result.issues.push('Missing official agency routing channel (Telegram @Zenvq_Lead_bot or onlyfordigitalwork@gmail.com)');
    }

    // Verify core business value preservation
    result.coreValuePreserved.hasSquads = cleanText.includes('Squad') || cleanText.includes('squad');
    result.coreValuePreserved.hasSla = cleanText.includes('15-Min') || cleanText.includes('SLA') || cleanText.includes('15 min');
    result.coreValuePreserved.hasPods = cleanText.includes('Pod') || cleanText.includes('pod') || cleanText.includes('Dedicated');
  }

  if (result.score < 0) result.score = 0;
  result.pass = result.score >= 80 && result.aiJargon.clean && result.halalIntegrity.clean;
  return result;
}
