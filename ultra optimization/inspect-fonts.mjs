import fs from 'fs';
import path from 'path';

const repos = [
  { name: 'ZenVQ-EcoSystem', path: 'D:\\All coding installation tools\\All My Main Project in real world\\ZenVQ-EcoSystem' },
  { name: 'ZenVQ-Agency', path: 'D:\\All coding installation tools\\All My Main Project in real world\\ZenVQ-Agency' },
  { name: 'Puson-Dev', path: 'D:\\All coding installation tools\\All My Main Project in real world\\Puson-Dev' },
  { name: 'Natures-Intimacy', path: 'D:\\All coding installation tools\\All My Main Project in real world\\Natures-Intimacy' },
  { name: 'ZenVQ-Suggests', path: 'D:\\All coding installation tools\\All My Main Project in real world\\ZenVQ-Suggests' },
  { name: 'ZenVQ-Tools', path: 'D:\\All coding installation tools\\All My Main Project in real world\\ZenVQ-Tools\\01-MediaDrop-Downloader\\mediadrop-website' },
  { name: '03-Templates-Hub', path: 'D:\\All coding installation tools\\All My Main Project in real world\\ZenVQ-Tools\\03-Templates-Hub' },
  { name: 'Rafij-portfolio', path: 'D:\\All coding installation tools\\All My Main Project in real world\\ZenVQ-Tools\\03-Templates-Hub\\Rafij-portfolio' },
  { name: 'Boutique-Templates', path: 'D:\\All coding installation tools\\All My Main Project in real world\\ZenVQ-Tools\\03-Templates-Hub\\Boutique-Templates' },
  { name: 'Dr Jerin', path: 'D:\\All coding installation tools\\All My Main Project in real world\\ZenVQ-Tools\\03-Templates-Hub\\Dr Jerin-Dental Point' }
];

function findFiles(dir, matchName, maxDepth = 4, depth = 0) {
  if (depth > maxDepth || !fs.existsSync(dir)) return [];
  let results = [];
  try {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      if (item.name === 'node_modules' || item.name === '.git' || item.name === '.next' || item.name === 'out') continue;
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        results = results.concat(findFiles(full, matchName, maxDepth, depth + 1));
      } else if (matchName.test(item.name)) {
        results.push(full);
      }
    }
  } catch (e) {}
  return results;
}

console.log('=== FONT CONFIGURATION AUDIT ACROSS ALL SITES ===\n');

for (const repo of repos) {
  console.log(`\n--------------------------------------------------`);
  console.log(`SITE: ${repo.name}`);
  console.log(`Path: ${repo.path}`);
  if (!fs.existsSync(repo.path)) {
    console.log(`[STATUS] Directory NOT found!`);
    continue;
  }

  // 1. Find layout files
  const layouts = findFiles(repo.path, /^layout\.(tsx|jsx|js)$/);
  if (layouts.length > 0) {
    for (const l of layouts) {
      console.log(`\n  [Layout File] ${path.relative(repo.path, l)}:`);
      const content = fs.readFileSync(l, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/font|fontfamily|google|geist|inter|instrument|sans|mono/i.test(line)) {
          console.log(`    L${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }

  // 2. Find tailwind.config
  const twConfigs = findFiles(repo.path, /^tailwind\.config\.(js|ts|mjs|cjs)$/);
  if (twConfigs.length > 0) {
    for (const tw of twConfigs) {
      console.log(`\n  [Tailwind Config] ${path.relative(repo.path, tw)}:`);
      const content = fs.readFileSync(tw, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/fontfamily|font-|sans:|mono:|serif:/i.test(line)) {
          console.log(`    L${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }

  // 3. Find HTML files if static
  const htmls = findFiles(repo.path, /^index\.html$/);
  if (htmls.length > 0) {
    for (const h of htmls) {
      console.log(`\n  [HTML File] ${path.relative(repo.path, h)}:`);
      const content = fs.readFileSync(h, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/fonts\.|stylesheet|font-family/i.test(line)) {
          console.log(`    L${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}
