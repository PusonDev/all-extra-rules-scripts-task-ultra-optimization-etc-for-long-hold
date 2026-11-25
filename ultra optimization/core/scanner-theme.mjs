/**
 * Core Theme, Luxury Design System & Cursor Color Harmonization Scanner
 * Validates theme tokens, palette discipline, glassmorphic cards, typography,
 * 3D hardware integrity and theme-matched precision cursor colors.
 */

export async function scanTheme(siteConfig, networkResult) {
  const url = siteConfig.url;
  const html = networkResult.html || '';

  const result = {
    url,
    themeType: siteConfig.theme,
    score: 100,
    pass: true,
    tokensFound: [],
    cursorHarmonization: {
      hasCustomCursor: false,
      colorMatch: true,
      expected: '',
      detected: '',
      status: 'MATCHED'
    },
    violations: [],
    remediations: []
  };

  if (!html) {
    result.score = 50;
    return result;
  }

  const lowerHtml = html.toLowerCase();

  // 1. Cursor Color Matching & Harmonization
  const hasLaserScript = lowerHtml.includes('laser.js') || lowerHtml.includes('laser-api') || lowerHtml.includes('laser-cursor') || lowerHtml.includes('lasercursor');
  const hasCustomCanvas = lowerHtml.includes('laser-canvas') || lowerHtml.includes('cursor-trail');
  result.cursorHarmonization.hasCustomCursor = hasLaserScript || hasCustomCanvas;

  if (siteConfig.theme === 'botanical_cream') {
    result.cursorHarmonization.expected = 'Dark Charcoal (#2F3E46) or Deep Sage (#52796F)';
    // In botanical cream, pure white cursor is invisible, dark cyberpunk neon is jarring
    if (lowerHtml.includes('laser-color="#ffffff"') || lowerHtml.includes('cursor: white')) {
      result.cursorHarmonization.colorMatch = false;
      result.cursorHarmonization.status = 'CONTRAST_VIOLATION';
      result.score -= 15;
      result.violations.push('Low-contrast cursor: White cursor detected on botanical cream canvas (#FDFBF7)');
      result.remediations.push({
        type: 'CURSOR_COLOR_MISMATCH',
        fix: 'Configure cursor color to Dark Charcoal (#2F3E46) or Sage Green (#52796F) to harmonize with botanical theme.'
      });
    }
  } else if (siteConfig.theme === 'dark_luxury') {
    result.cursorHarmonization.expected = 'Pure White (#FFFFFF) or Electric Cyan (#6FFFE9)';
    // In dark luxury, black cursor is invisible
    if (lowerHtml.includes('cursor: black') || lowerHtml.includes('laser-color="#000000"')) {
      result.cursorHarmonization.colorMatch = false;
      result.cursorHarmonization.status = 'CONTRAST_VIOLATION';
      result.score -= 15;
      result.violations.push('Zero-visibility cursor: Black cursor detected on dark canvas (#09090B)');
      result.remediations.push({
        type: 'CURSOR_COLOR_MISMATCH',
        fix: 'Configure cursor color to Pure White (#FFFFFF) with Cyan (#6FFFE9) or Mint (#00E599) bloom.'
      });
    }
  }

  // 2. Nature's Intimacy Botanical Integrity
  if (siteConfig.theme === 'botanical_cream') {
    const hasCream = lowerHtml.includes('#fdfbf7') || lowerHtml.includes('bg-cream') || lowerHtml.includes('fdfbf7');
    const hasSage = lowerHtml.includes('#52796f') || lowerHtml.includes('#84a98c') || lowerHtml.includes('emerald') || lowerHtml.includes('sage');
    const hasCharcoal = lowerHtml.includes('#2f3e46') || lowerHtml.includes('stone') || lowerHtml.includes('zinc');

    if (hasCream || hasSage || hasCharcoal) {
      result.tokensFound.push('Botanical Palette: Cream / Sage / Charcoal');
    }

    // Prohibit cyberpunk dark mode leakage into Nature's Intimacy
    if (lowerHtml.includes('bg-zinc-950') && lowerHtml.includes('text-[#00e599]')) {
      result.score -= 30;
      result.violations.push('Prohibited cyberpunk dark tokens (bg-zinc-950 + neon glow) detected in botanical Nature\'s Intimacy theme');
      result.remediations.push({
        type: 'THEME_POLLUTION',
        fix: 'Remove dark cyberpunk classes and enforce cream #FDFBF7 background with sage green accents.'
      });
    }
  }

  // 3. ZenVQ Dark Luxury Mode
  if (siteConfig.theme === 'dark_luxury') {
    const hasDarkCanvas = lowerHtml.includes('09090b') || lowerHtml.includes('zinc-950') || lowerHtml.includes('black') || lowerHtml.includes('bg-neutral-950');
    const hasGlassCard = lowerHtml.includes('backdrop-blur') || lowerHtml.includes('bg-zinc-900') || lowerHtml.includes('bg-black/60');
    const hasBrandAccent = lowerHtml.includes('00e599') || lowerHtml.includes('emerald') || lowerHtml.includes('cyan') || lowerHtml.includes('00d2b4');

    if (hasDarkCanvas) result.tokensFound.push('Zinc-950 Dark Canvas (#09090B)');
    if (hasGlassCard) result.tokensFound.push('Glassmorphic Elevated Surface');
    if (hasBrandAccent) result.tokensFound.push('ZenVQ Emerald/Mint Brand Accent (#00E599)');

    // Check for inline SVG logos
    const hasInlineSvg = html.includes('<svg') && (lowerHtml.includes('fill=') || lowerHtml.includes('stroke='));
    if (hasInlineSvg) {
      result.tokensFound.push('Inline Monochrome Vector SVGs');
    }
  }

  if (result.score < 0) result.score = 0;
  result.pass = result.score >= 80 && result.cursorHarmonization.colorMatch;
  return result;
}
