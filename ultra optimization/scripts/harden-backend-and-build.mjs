import fs from 'fs';
import path from 'path';

const root = 'D:/All coding installation tools/All My Main Project in real world';

const nextConfigs = [
  'ZenVQ-EcoSystem/next.config.mjs',
  'ZenVQ-Agency/next.config.mjs',
  'Natures-Intimacy/next.config.mjs',
  'ZenVQ-Suggests/zenvq-suggest/next.config.ts',
  'ZenVQ-Tools/01-OneApp-Ecosystem/01-Apps/oneapp-website/next.config.mjs',
  'ZenVQ-Tools/03-Templates-Hub/Rafij-portfolio/next.config.mjs',
  'ZenVQ-Tools/03-Templates-Hub/Dr Jerin-Dental Point/next.config.mjs'
];

console.log('=== HARDENING SOURCE PROTECTION & PRODUCTION COMPILER SETTINGS ===\n');

for (const rel of nextConfigs) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  let content = fs.readFileSync(full, 'utf8');
  let modified = false;

  // Match "const nextConfig = {" or "const nextConfig: NextConfig = {"
  const match = content.match(/(const nextConfig(?:\s*:\s*\w+)?\s*=\s*\{)/);
  if (match) {
    let additions = [];
    if (!content.includes('productionBrowserSourceMaps')) {
      additions.push('  productionBrowserSourceMaps: false,');
    }
    if (!content.includes('poweredByHeader')) {
      additions.push('  poweredByHeader: false,');
    }
    if (!content.includes('compress:')) {
      additions.push('  compress: true,');
    }
    if (!content.includes('removeConsole')) {
      additions.push("  compiler: { removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false },");
    }

    if (additions.length > 0) {
      content = content.replace(match[1], match[1] + '\n' + additions.join('\n'));
      fs.writeFileSync(full, content, 'utf8');
      console.log(`✅ [HARDENED] ${rel} (+${additions.length} compiler/protection flags)`);
      modified = true;
    } else {
      console.log(`[ALREADY HARDENED] ${rel}`);
    }
  } else {
    console.log(`[SKIP] Could not parse nextConfig in ${rel}`);
  }
}

// Remove any .map files in static out/ directories
let mapsRemoved = 0;
function cleanSourceMaps(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) cleanSourceMaps(full);
    else if (e.name.endsWith('.map')) {
      fs.unlinkSync(full);
      mapsRemoved++;
    }
  }
}

for (const outDir of [
  'ZenVQ-EcoSystem/out',
  'ZenVQ-Agency/out',
  'Natures-Intimacy/out',
  'ZenVQ-Tools/01-OneApp-Ecosystem/01-Apps/oneapp-website/out',
  'ZenVQ-Tools/03-Templates-Hub/Rafij-portfolio/out',
  'ZenVQ-Tools/03-Templates-Hub/Dr Jerin-Dental Point/out'
]) {
  cleanSourceMaps(path.join(root, outDir));
}
console.log(`\n🗑️  Removed ${mapsRemoved} exposed .map source-map file(s) from static out/ directories.`);
