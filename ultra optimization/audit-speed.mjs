import https from 'https';
import http from 'http';

const sites = [
  { name: 'ZenVQ Core Hub', url: 'https://zenvq.com' },
  { name: 'ZenVQ Agency', url: 'https://agency.zenvq.com' },
  { name: 'ZenVQ Templates', url: 'https://templates.zenvq.com' },
  { name: 'Puson Dev', url: 'https://puson.zenvq.com' },
  { name: 'Nature\'s Intimacy', url: 'https://natures-intimacy.zenvq.com' },
  { name: 'ZenVQ Tools', url: 'https://tools.zenvq.com' },
  { name: 'ZenVQ Suggests', url: 'https://suggests.zenvq.com' },
  { name: 'Rafij Portfolio', url: 'https://rafij.zenvq.com' }
];

async function measureSite(site) {
  return new Promise((resolve) => {
    const start = performance.now();
    let ttfb = 0;
    
    const req = https.get(site.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Accept-Encoding': 'gzip, deflate, br' } }, (res) => {
      ttfb = performance.now() - start;
      let bodyLength = 0;
      
      res.on('data', (chunk) => {
        bodyLength += chunk.length;
      });
      
      res.on('end', () => {
        const total = performance.now() - start;
        resolve({
          name: site.name,
          url: site.url,
          status: res.statusCode,
          ttfbMs: Math.round(ttfb),
          totalMs: Math.round(total),
          bytes: bodyLength,
          encoding: res.headers['content-encoding'] || 'none',
          cacheControl: res.headers['cache-control'] || 'none',
          cfCache: res.headers['cf-cache-status'] || 'none',
          cfRay: res.headers['cf-ray'] || 'none'
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        name: site.name,
        url: site.url,
        status: 'ERROR',
        error: err.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name: site.name,
        url: site.url,
        status: 'TIMEOUT'
      });
    });
  });
}

console.log('=== MEASURING LIVE SPEED AND HEADERS ACROSS SITES ===\n');
const results = [];
for (const s of sites) {
  const res = await measureSite(s);
  results.push(res);
}
console.table(results);
