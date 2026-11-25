import fs from 'fs';

console.log('=== INJECTING MISSING MOBILE GUARDRAILS ===\n');

// 1. Puson-Dev studio.css
const pusonCss = 'D:/All coding installation tools/All My Main Project in real world/Puson-Dev/studio.css';
if (fs.existsSync(pusonCss)) {
  let content = fs.readFileSync(pusonCss, 'utf8');
  if (!content.includes('-webkit-text-size-adjust')) {
    content = content.replace(
      'overflow-x: hidden !important;',
      'overflow-x: hidden !important;\n  -webkit-text-size-adjust: 100%;\n  touch-action: pan-y;'
    );
    fs.writeFileSync(pusonCss, content, 'utf8');
    console.log('✅ [Puson-Dev] Injected -webkit-text-size-adjust: 100% and touch-action: pan-y');
  }
}

// 2. 03-Templates-Hub styles.css
const templatesCss = 'D:/All coding installation tools/All My Main Project in real world/ZenVQ-Tools/03-Templates-Hub/styles.css';
if (fs.existsSync(templatesCss)) {
  let content = fs.readFileSync(templatesCss, 'utf8');
  if (!content.includes('touch-action: pan-y')) {
    content = content.replace(
      'html, body {',
      'html, body {\n  -webkit-text-size-adjust: 100%;\n  touch-action: pan-y;\n  max-width: 100vw;'
    );
    fs.writeFileSync(templatesCss, content, 'utf8');
    console.log('✅ [03-Templates-Hub] Injected touch-action: pan-y and -webkit-text-size-adjust: 100%');
  }
}

console.log('\nMobile guardrails injected cleanly!');
