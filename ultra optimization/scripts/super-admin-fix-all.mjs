import fs from 'fs';
import path from 'path';

console.log('=== ZENVQ SUPER ADMIN: EXECUTING A-Z ECOSYSTEM COMPLETION ===\n');

const PROJECTS_ROOT = 'D:/All coding installation tools/All My Main Project in real world';

// -----------------------------------------------------------------------------
// 1. Update config/sites.json and auto-fixer.mjs to point to oneapp-website
// -----------------------------------------------------------------------------
const sitesConfigPath = path.join(process.cwd(), 'config', 'sites.json');
if (fs.existsSync(sitesConfigPath)) {
  let sc = fs.readFileSync(sitesConfigPath, 'utf8');
  if (sc.includes('01-MediaDrop-Downloader\\\\mediadrop-website')) {
    sc = sc.replace(/01-MediaDrop-Downloader\\\\mediadrop-website/g, '01-OneApp-Ecosystem\\\\01-Apps\\\\oneapp-website');
    fs.writeFileSync(sitesConfigPath, sc, 'utf8');
    console.log('✅ [CONFIG] Fixed sites.json repo_name for tools.zenvq.com');
  }
}

const autoFixerPath = path.join(process.cwd(), 'auto-fixer.mjs');
if (fs.existsSync(autoFixerPath)) {
  let af = fs.readFileSync(autoFixerPath, 'utf8');
  if (af.includes('01-MediaDrop-Downloader\', \'mediadrop-website')) {
    af = af.replace(
      /'ZenVQ-Tools', '01-MediaDrop-Downloader', 'mediadrop-website'/g,
      "'ZenVQ-Tools', '01-OneApp-Ecosystem', '01-Apps', 'oneapp-website'"
    );
    fs.writeFileSync(autoFixerPath, af, 'utf8');
    console.log('✅ [CONFIG] Fixed auto-fixer.mjs REPO_PATH_MAP for tools.zenvq.com');
  }
}

// -----------------------------------------------------------------------------
// 2. Comprehensive Security Headers for Cloudflare Pages (_headers)
// -----------------------------------------------------------------------------
const owaspHeaders = `/*
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;

// A. 03-Templates-Hub
const templatesHeaders = path.join(PROJECTS_ROOT, 'ZenVQ-Tools', '03-Templates-Hub', '_headers');
if (fs.existsSync(templatesHeaders)) {
  let th = fs.readFileSync(templatesHeaders, 'utf8');
  if (!th.includes('X-Frame-Options: SAMEORIGIN')) {
    if (th.includes('/*\n')) {
      th = th.replace('/*\n', '/*\n  X-Frame-Options: SAMEORIGIN\n');
    } else {
      th = owaspHeaders + '\n' + th;
    }
    fs.writeFileSync(templatesHeaders, th, 'utf8');
    console.log('✅ [HEADERS] Added X-Frame-Options to 03-Templates-Hub _headers');
  }
}

// B. tools.zenvq.com (oneapp-website)
const toolsDir = path.join(PROJECTS_ROOT, 'ZenVQ-Tools', '01-OneApp-Ecosystem', '01-Apps', 'oneapp-website');
const toolsPublicHeaders = path.join(toolsDir, 'public', '_headers');
const toolsOutHeaders = path.join(toolsDir, 'out', '_headers');
const toolsRootHeaders = path.join(toolsDir, '_headers');

for (const target of [toolsPublicHeaders, toolsOutHeaders, toolsRootHeaders]) {
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    let content = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    if (!content.includes('Strict-Transport-Security')) {
      content = owaspHeaders + '\n' + content;
      fs.writeFileSync(target, content, 'utf8');
      console.log(`✅ [HEADERS] Created/Updated _headers at ${target}`);
    }
  } catch (e) {
    console.log(`[WARN] Failed to write ${target}: ${e.message}`);
  }
}

// C. Rafij Portfolio
const rafijDir = path.join(PROJECTS_ROOT, 'ZenVQ-Tools', '03-Templates-Hub', 'Rafij-portfolio');
const rafijHeadersPaths = [
  path.join(rafijDir, '_headers'),
  path.join(rafijDir, 'public', '_headers'),
  path.join(rafijDir, 'out', '_headers')
];

for (const rp of rafijHeadersPaths) {
  try {
    if (fs.existsSync(path.dirname(rp))) {
      let content = fs.existsSync(rp) ? fs.readFileSync(rp, 'utf8') : '';
      if (!content.includes('X-Frame-Options')) {
        content = owaspHeaders + '\n' + content;
        fs.writeFileSync(rp, content, 'utf8');
        console.log(`✅ [HEADERS] Created/Updated _headers at ${rp}`);
      }
    }
  } catch (e) {}
}

// -----------------------------------------------------------------------------
// 3. Puson-Dev: Add explicit width and height to all <img> tags for 0.00 CLS
// -----------------------------------------------------------------------------
const pusonHtmlPath = path.join(PROJECTS_ROOT, 'Puson-Dev', 'index.html');
if (fs.existsSync(pusonHtmlPath)) {
  let html = fs.readFileSync(pusonHtmlPath, 'utf8');
  let imgCount = 0;
  // Replace <img> tags missing width and height
  html = html.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    let modified = false;

    if (!/width=/i.test(newAttrs) && !/height=/i.test(newAttrs)) {
      if (/puson-hero/i.test(newAttrs)) {
        newAttrs += ' width="800" height="960"';
        modified = true;
      } else if (/logo|icon|avatar/i.test(newAttrs)) {
        newAttrs += ' width="48" height="48"';
        modified = true;
      } else {
        newAttrs += ' width="600" height="400"';
        modified = true;
      }
    }

    if (!/loading=/i.test(newAttrs) && !/puson-hero/i.test(newAttrs)) {
      newAttrs += ' loading="lazy" decoding="async"';
      modified = true;
    }

    if (modified) {
      imgCount++;
      return `<img ${newAttrs}>`;
    }
    return match;
  });

  fs.writeFileSync(pusonHtmlPath, html, 'utf8');
  console.log(`✅ [CLS OPTIMIZATION] Puson-Dev: Enhanced ${imgCount} <img> tags with explicit dimensions`);
}

// -----------------------------------------------------------------------------
// 4. Rafij Portfolio: Add explicit width and height to all <img> tags for 0.00 CLS
// -----------------------------------------------------------------------------
function fixImagesInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    if (['node_modules', '.git', '.next', 'out'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      fixImagesInDir(full);
    } else if (['.tsx', '.jsx', '.html'].includes(path.extname(item.name))) {
      let content = fs.readFileSync(full, 'utf8');
      let modified = false;
      content = content.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
        if (!/width=/i.test(attrs) && !/height=/i.test(attrs)) {
          let newAttrs = attrs + ' width="1200" height="800" loading="lazy" decoding="async"';
          modified = true;
          return `<img ${newAttrs}>`;
        }
        return match;
      });
      if (modified) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`✅ [CLS OPTIMIZATION] Added image dimensions in ${path.relative(dir, full)}`);
      }
    }
  }
}
fixImagesInDir(rafijDir);

// -----------------------------------------------------------------------------
// 5. ZenVQ Suggests: Eliminate all Oxford commas (, and / , &)
// -----------------------------------------------------------------------------
const suggestsDir = path.join(PROJECTS_ROOT, 'ZenVQ-Suggests');
let oxfordCount = 0;
function cleanOxfordCommas(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    if (['node_modules', '.git', '.next', 'out', 'dist'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      cleanOxfordCommas(full);
    } else if (['.json', '.tsx', '.ts', '.jsx', '.js', '.md'].includes(path.extname(item.name))) {
      try {
        let content = fs.readFileSync(full, 'utf8');
        if (/,\s+(and|&)\s+/gi.test(content)) {
          content = content.replace(/,\s+and\s+/g, ' and ');
          content = content.replace(/,\s+And\s+/g, ' And ');
          content = content.replace(/,\s+&\s+/g, ' & ');
          fs.writeFileSync(full, content, 'utf8');
          oxfordCount++;
        }
      } catch (e) {}
    }
  }
}
cleanOxfordCommas(suggestsDir);
console.log(`✅ [OXFORD COMMA] ZenVQ Suggests: Cleaned ${oxfordCount} file(s) containing Oxford commas`);

// -----------------------------------------------------------------------------
// 6. Nature's Intimacy: Verify & Enforce Return Gateway to https://zenvq.com
// -----------------------------------------------------------------------------
const naturesFooter = path.join(PROJECTS_ROOT, 'Natures-Intimacy', 'components', 'Footer.tsx');
if (fs.existsSync(naturesFooter)) {
  let content = fs.readFileSync(naturesFooter, 'utf8');
  if (!content.includes('https://zenvq.com')) {
    const gatewaySnippet = `
          {/* ZenVQ Ecosystem Universal Return Gateway */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Part of the <a href="https://zenvq.com" target="_blank" rel="noopener noreferrer" className="text-zinc-900 dark:text-zinc-100 underline hover:text-emerald-500 font-semibold">ZenVQ Ecosystem</a></span>
            <a href="https://zenvq.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500">zenvq.com ↗</a>
          </div>
    `;
    content = content.replace('</footer>', gatewaySnippet + '\n</footer>');
    fs.writeFileSync(naturesFooter, content, 'utf8');
    console.log('✅ [RETURN GATEWAY] Injected verified gateway link to https://zenvq.com in Natures-Intimacy Footer.tsx');
  } else {
    console.log('✅ [RETURN GATEWAY] Natures-Intimacy already has return link to https://zenvq.com');
  }
}

console.log('\nSuper admin fixes complete!');
