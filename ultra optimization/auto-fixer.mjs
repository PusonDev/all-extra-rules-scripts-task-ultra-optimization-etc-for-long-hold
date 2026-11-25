/**
 * ZenVQ Autonomous Auto-Remediation & Self-Healing Engine
 * Automatically patches detected vulnerabilities, security headers, Oxford commas,
 * duplicate H1 headings, return gateways and git hygiene across all ecosystem repositories.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITES_CONFIG_PATH = path.join(__dirname, 'config', 'sites.json');
const PROJECTS_ROOT = "D:\\All coding installation tools\\All My Main Project in real world";

// Map domain or id to exact local repository directory path
const REPO_PATH_MAP = {
  'zenvq.com': path.join(PROJECTS_ROOT, 'ZenVQ-EcoSystem'),
  'zenvq-core': path.join(PROJECTS_ROOT, 'ZenVQ-EcoSystem'),
  'agency.zenvq.com': path.join(PROJECTS_ROOT, 'ZenVQ-Agency'),
  'zenvq-agency': path.join(PROJECTS_ROOT, 'ZenVQ-Agency'),
  'templates.zenvq.com': path.join(PROJECTS_ROOT, 'ZenVQ-Tools', '03-Templates-Hub'),
  'zenvq-templates': path.join(PROJECTS_ROOT, 'ZenVQ-Tools', '03-Templates-Hub'),
  'puson.zenvq.com': path.join(PROJECTS_ROOT, 'Puson-Dev'),
  'puson-dev': path.join(PROJECTS_ROOT, 'Puson-Dev'),
  'natures-intimacy.zenvq.com': path.join(PROJECTS_ROOT, 'Natures-Intimacy'),
  'natures-intimacy': path.join(PROJECTS_ROOT, 'Natures-Intimacy'),
  'tools.zenvq.com': path.join(PROJECTS_ROOT, 'ZenVQ-Tools', '01-OneApp-Ecosystem', '01-Apps', 'oneapp-website'),
  'zenvq-tools': path.join(PROJECTS_ROOT, 'ZenVQ-Tools', '01-OneApp-Ecosystem', '01-Apps', 'oneapp-website'),
  'suggests.zenvq.com': path.join(PROJECTS_ROOT, 'ZenVQ-Suggests'),
  'zenvq-suggests': path.join(PROJECTS_ROOT, 'ZenVQ-Suggests'),
  'rafij.zenvq.com': path.join(PROJECTS_ROOT, 'ZenVQ-Tools', '03-Templates-Hub', 'Rafij-portfolio'),
  'rafij-portfolio': path.join(PROJECTS_ROOT, 'ZenVQ-Tools', '03-Templates-Hub', 'Rafij-portfolio')
};

// 1. Auto-Fixer: Missing HSTS & Security Headers
export function autoFixSecurityHeaders(domain) {
  const repoPath = REPO_PATH_MAP[domain];
  if (!repoPath || !fs.existsSync(repoPath)) return { ok: false, reason: 'Repository path not found' };

  let patched = false;
  const HSTS_LINE = '  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload';

  // Check _headers files in root or public/
  const candidateHeaderFiles = [
    path.join(repoPath, '_headers'),
    path.join(repoPath, 'public', '_headers')
  ];

  for (const hf of candidateHeaderFiles) {
    if (fs.existsSync(hf)) {
      let content = fs.readFileSync(hf, 'utf8');
      if (!content.includes('Strict-Transport-Security')) {
        // Find exact /* global section or append
        const globalCatchAllRegex = /(^|\n)\/\*(\r?\n)/;
        if (globalCatchAllRegex.test(content)) {
          content = content.replace(globalCatchAllRegex, `$1/*$2${HSTS_LINE}$2`);
        } else {
          content += `\n/*\n${HSTS_LINE}\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: SAMEORIGIN\n`;
        }
        fs.writeFileSync(hf, content, 'utf8');
        patched = true;
      }
    }
  }

  // If no _headers exists in a public/ static directory, create one
  if (!patched && fs.existsSync(path.join(repoPath, 'public'))) {
    const targetFile = path.join(repoPath, 'public', '_headers');
    const newContent = `/*\n${HSTS_LINE}\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: SAMEORIGIN\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n`;
    fs.writeFileSync(targetFile, newContent, 'utf8');
    patched = true;
  }

  return { ok: patched, action: 'Injected Strict-Transport-Security (HSTS) into Cloudflare _headers' };
}

// 2. Auto-Fixer: Universal Return Gateway to zenvq.com
export function autoFixReturnGateway(domain) {
  const repoPath = REPO_PATH_MAP[domain];
  if (!repoPath || !fs.existsSync(repoPath)) return { ok: false, reason: 'Repository path not found' };

  let patched = false;

  // Search candidate footer files
  const candidateFiles = [
    path.join(repoPath, 'components', 'Footer.tsx'),
    path.join(repoPath, 'src', 'components', 'Footer.tsx'),
    path.join(repoPath, 'src', 'components', 'footer.tsx'),
    path.join(repoPath, 'index.html')
  ];

  for (const fp of candidateFiles) {
    if (fs.existsSync(fp)) {
      let content = fs.readFileSync(fp, 'utf8');
      if (!content.includes('https://zenvq.com')) {
        // For Nature's Intimacy
        if (content.includes('ZenVQ Ecosystem') && !content.includes('href="https://zenvq.com"')) {
          content = content.replace(
            'ZenVQ Ecosystem',
            '<a href="https://zenvq.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 transition-colors">ZenVQ Ecosystem</a>'
          );
          fs.writeFileSync(fp, content, 'utf8');
          patched = true;
          break;
        }

        // For Rafij Portfolio
        if (content.includes('Corpustudio & ZenVQ') && !content.includes('href="https://zenvq.com"')) {
          content = content.replace(
            'Corpustudio & ZenVQ',
            'Corpustudio &amp; <a href="https://zenvq.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E599] transition-colors">ZenVQ</a>'
          );
          fs.writeFileSync(fp, content, 'utf8');
          patched = true;
          break;
        }

        // For HTML templates
        if (fp.endsWith('index.html') && content.includes('</footer>')) {
          const badge = '\n<div style="text-align:center;padding:12px;font-size:11px;opacity:0.7;"><a href="https://zenvq.com" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none;">Part of ZenVQ Ecosystem</a></div>\n';
          content = content.replace('</footer>', `${badge}</footer>`);
          fs.writeFileSync(fp, content, 'utf8');
          patched = true;
          break;
        }
      }
    }
  }

  return { ok: patched, action: 'Injected ecosystem return link to https://zenvq.com' };
}

// 3. Auto-Fixer: Multiple H1 Tags (Single H1 Directive)
export function autoFixMultipleH1(domain) {
  const repoPath = REPO_PATH_MAP[domain];
  if (!repoPath || !fs.existsSync(repoPath)) return { ok: false, reason: 'Repository path not found' };

  let patched = false;

  // Search in app/page.tsx or src/app/page.tsx
  const candidatePageFiles = [
    path.join(repoPath, 'src', 'app', 'page.tsx'),
    path.join(repoPath, 'app', 'page.tsx')
  ];

  for (const fp of candidatePageFiles) {
    if (fs.existsSync(fp)) {
      let content = fs.readFileSync(fp, 'utf8');

      // Check for specular light reflection <h1 aria-hidden="true"
      if (content.includes('<h1\n                aria-hidden="true"') || content.includes('<h1 aria-hidden="true"')) {
        content = content.replace('<h1\n                aria-hidden="true"', '<span\n                aria-hidden="true"')
                         .replace('<h1 aria-hidden="true"', '<span aria-hidden="true"')
                         .replace(/<\/h1>(\s*<\/\w+>\s*<\/\w+>\s*<\/\w+>\s*\/\* Specular Light)/, '</span>$1');

        // Also ensure closing tag matches
        const matches = [...content.matchAll(/<span\s+aria-hidden="true"[\s\S]*?<\/h1>/gi)];
        for (const m of matches) {
          const fixedSnippet = m[0].replace(/<\/h1>$/i, '</span>');
          content = content.replace(m[0], fixedSnippet);
        }

        fs.writeFileSync(fp, content, 'utf8');
        patched = true;
      }
    }
  }

  return { ok: patched, action: 'Downgraded decorative specular <h1> overlay to <span>' };
}

// 4. Auto-Fixer: Strict Zero Oxford Comma Law
export function autoFixOxfordCommas(domain) {
  const repoPath = REPO_PATH_MAP[domain];
  if (!repoPath || !fs.existsSync(repoPath)) return { ok: false, reason: 'Repository path not found' };

  let count = 0;
  const EXTENSIONS = ['.tsx', '.ts', '.html', '.md', '.json', '.jsx', '.js'];

  function walkAndFix(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (['node_modules', '.git', '.next', 'out', 'dist', '.wrangler'].includes(ent.name)) continue;
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walkAndFix(fullPath);
      } else if (EXTENSIONS.includes(path.extname(ent.name))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        // Strip Oxford commas in prose and code strings
        const patterns = [
          { from: /, and /g, to: ' and ' },
          { from: /, And /g, to: ' and ' },
          { from: /, & /g, to: ' & ' }
        ];

        for (const p of patterns) {
          if (content.match(p.from)) {
            content = content.replace(p.from, p.to);
            modified = true;
            count++;
          }
        }

        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      }
    }
  }

  try {
    walkAndFix(repoPath);
  } catch (err) {
    return { ok: false, reason: err.message };
  }

  return { ok: count > 0, action: `Eliminated ${count} Oxford comma(s)` };
}

// 5. Auto-Fixer: Git Hygiene & Unignored Secrets
export function autoFixGitHygiene(domain) {
  const repoPath = REPO_PATH_MAP[domain];
  if (!repoPath || !fs.existsSync(repoPath)) return { ok: false, reason: 'Repository path not found' };

  const gitignorePath = path.join(repoPath, '.gitignore');
  let content = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  let modified = false;

  if (!content.includes('.env')) {
    content += '\n# Local environment and secret isolation\n.env\n.env.local\n.env*.local\n';
    modified = true;
  }

  if (!content.includes('usage-ledger.json')) {
    content += '\n# Lead data and usage isolation\nusage-ledger.json\n';
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(gitignorePath, content, 'utf8');
  }

  return { ok: modified, action: 'Secured .gitignore with strict .env and lead data isolation' };
}

// Master Auto-Remediation Dispatcher
export function autoFixIssue(issue) {
  const domain = issue.site || issue.url || '';
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const type = issue.type;

  console.log(`[AUTO-FIX] Initiating fix for "${type}" on domain "${cleanDomain}"...`);

  if (type === 'MISSING_HSTS' || type === 'HEADER_MISSING' || type === 'MISSING_NOSNIFF') {
    return autoFixSecurityHeaders(cleanDomain);
  }
  if (type === 'MISSING_RETURN_GATEWAY' || type === 'MISSING_RETURN_GATEWAY_TO_ZENVQ') {
    return autoFixReturnGateway(cleanDomain);
  }
  if (type === 'MULTIPLE_H1') {
    return autoFixMultipleH1(cleanDomain);
  }
  if (type === 'OXFORD_COMMA_VIOLATION') {
    return autoFixOxfordCommas(cleanDomain);
  }
  if (type === 'ENV_NOT_IGNORED' || type === 'LEAD_DATA_GIT_EXPOSURE') {
    return autoFixGitHygiene(cleanDomain);
  }

  return { ok: false, reason: `No automated repair handler for issue type: ${type}` };
}
