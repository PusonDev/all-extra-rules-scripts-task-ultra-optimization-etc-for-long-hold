/**
 * Core Defensive Cybersecurity & Vulnerability Scanner
 * Conducts defensive self-attack simulations, sensitive file exposure probes,
 * OWASP header compliance verification, dangerous HTTP method testing and local git secret scanning.
 */

import fs from 'fs';
import path from 'path';

export async function scanSecurity(siteConfig, networkResult, securityConfig, projectsRoot) {
  const url = siteConfig.url;
  const headers = networkResult.headers || {};

  const result = {
    url,
    score: 100,
    pass: true,
    owaspHeaders: {
      passed: [],
      missing: [],
      issues: []
    },
    probedVulnerabilities: [],
    dangerousMethods: {
      traceDisabled: true,
      issues: []
    },
    corsConfig: {
      safe: true,
      issues: []
    },
    localSecretAudit: {
      scanned: false,
      leaks: [],
      clean: true
    },
    remediations: []
  };

  // 1. OWASP Security Headers Verification
  for (const h of securityConfig.owasp_headers) {
    const val = headers[h.key];
    if (!val) {
      if (h.required) {
        result.owaspHeaders.missing.push(h.key);
        result.owaspHeaders.issues.push(`Missing mandatory security header: ${h.key} (${h.description})`);
        result.score -= 10;
        result.remediations.push({
          type: 'HEADER_MISSING',
          header: h.key,
          fix: `Add header to next.config.js or Cloudflare Transform Rules: { key: '${h.key}', value: '${h.expected_value || 'max-age=63072000; includeSubDomains; preload'}' }`
        });
      }
    } else {
      let headerOk = true;
      if (h.expected_value && val.toLowerCase() !== h.expected_value.toLowerCase()) {
        headerOk = false;
        result.owaspHeaders.issues.push(`Header ${h.key} has unexpected value: "${val}" (expected: "${h.expected_value}")`);
        result.score -= 5;
      }
      if (h.acceptable_values && !h.acceptable_values.includes(val.toUpperCase()) && !h.acceptable_values.includes(val.toLowerCase())) {
        headerOk = false;
        result.owaspHeaders.issues.push(`Header ${h.key} value "${val}" not in approved list: [${h.acceptable_values.join(', ')}]`);
        result.score -= 5;
      }
      if (headerOk) {
        result.owaspHeaders.passed.push(h.key);
      }
    }
  }

  // 2. Defensive Self-Attack & Sensitive File Exposure Probing
  // Probe a subset of high-priority sensitive files concurrently
  const probes = securityConfig.sensitive_file_probes.slice(0, 10);
  const probePromises = probes.map(async (probe) => {
    const probeUrl = `${url.replace(/\/$/, '')}${probe.path}`;
    try {
      const res = await fetch(probeUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'ZenVQ-Security-Defensive-Audit/1.0' },
        signal: AbortSignal.timeout(5000)
      });

      // If status is 200, check if it actually returned sensitive data
      if (res.status === 200) {
        const body = await res.text();
        const looksLikeSpa = body.includes('<!DOCTYPE html>') || body.includes('<html');
        // If it's HTML from a single-page app 404 fallback, it's not a real leak.
        // But if it contains env or git data, it's a critical vulnerability!
        const isRealLeak = !looksLikeSpa || (probe.path.includes('.env') && body.includes('=')) || (probe.path.includes('.git') && body.includes('[core]'));

        if (isRealLeak && !looksLikeSpa) {
          return {
            path: probe.path,
            status: res.status,
            exposed: true,
            severity: 'CRITICAL',
            description: probe.description
          };
        }
      }
      return {
        path: probe.path,
        status: res.status,
        exposed: false,
        severity: 'SAFE',
        description: probe.description
      };
    } catch {
      return {
        path: probe.path,
        status: 0,
        exposed: false,
        severity: 'SAFE',
        description: probe.description
      };
    }
  });

  const probeResults = await Promise.all(probePromises);
  result.probedVulnerabilities = probeResults;

  for (const pr of probeResults) {
    if (pr.exposed) {
      result.score -= 30;
      result.remediations.push({
        type: 'SENSITIVE_FILE_EXPOSURE',
        path: pr.path,
        fix: `IMMEDIATE ACTION: Block public access to ${pr.path} via Cloudflare WAF custom rule or Cloudflare Pages redirect to 404.`
      });
    }
  }

  // 3. Dangerous HTTP Method Probe (TRACE test for Cross-Site Tracing)
  try {
    const traceRes = await fetch(url, {
      method: 'TRACE',
      signal: AbortSignal.timeout(4000)
    });
    // If TRACE responds with 200 echoing headers, it is vulnerable
    if (traceRes.status === 200) {
      result.dangerousMethods.traceDisabled = false;
      result.dangerousMethods.issues.push('TRACE method enabled on web server (vulnerable to Cross-Site Tracing XST)');
      result.score -= 15;
      result.remediations.push({
        type: 'TRACE_METHOD_ENABLED',
        fix: 'Disable HTTP TRACE method in web server / Cloudflare WAF rule.'
      });
    }
  } catch {
    result.dangerousMethods.traceDisabled = true;
  }

  // 4. CORS Misconfiguration Audit
  const acao = headers['access-control-allow-origin'];
  const acac = headers['access-control-allow-credentials'];
  if (acao === '*' && acac === 'true') {
    result.corsConfig.safe = false;
    result.corsConfig.issues.push('Insecure CORS: Wildcard origin (*) combined with allow-credentials (true)');
    result.score -= 20;
    result.remediations.push({
      type: 'INSECURE_CORS',
      fix: 'Do not combine Access-Control-Allow-Origin: * with Access-Control-Allow-Credentials: true. Specify explicit origin.'
    });
  }

  // 5. Local Git Repository & Secrets Audit
  if (siteConfig.repo_name && projectsRoot) {
    const repoPath = path.join(projectsRoot, siteConfig.repo_name);
    if (fs.existsSync(repoPath)) {
      result.localSecretAudit.scanned = true;

      // Check .git/config for leaked plaintext GitHub tokens
      const gitConfigPath = path.join(repoPath, '.git', 'config');
      if (fs.existsSync(gitConfigPath)) {
        try {
          const gitConfig = fs.readFileSync(gitConfigPath, 'utf8');
          if (gitConfig.includes('ghp_') || gitConfig.includes('github_pat_')) {
            result.localSecretAudit.clean = false;
            result.localSecretAudit.leaks.push('Plaintext GitHub PAT detected in .git/config');
            result.score -= 25;
            result.remediations.push({
              type: 'GIT_PAT_LEAK',
              fix: 'Replace plaintext GitHub token in .git/config with git credential helper (git config credential.helper wincred).'
            });
          }
        } catch {
          // Ignore read errors
        }
      }

      // Check for committed .env files
      const envPath = path.join(repoPath, '.env');
      const gitPath = path.join(repoPath, '.git');
      if (fs.existsSync(envPath) && fs.existsSync(gitPath)) {
        try {
          const gitignorePath = path.join(repoPath, '.gitignore');
          const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
          if (!gitignore.includes('.env')) {
            result.localSecretAudit.clean = false;
            result.localSecretAudit.leaks.push('.env file exists but is not listed in .gitignore');
            result.score -= 15;
            result.remediations.push({
              type: 'ENV_NOT_IGNORED',
              fix: 'Add .env and .env.local to .gitignore immediately.'
            });
          }
        } catch {
          // Ignore read errors
        }
      }
    }
  }

  if (result.score < 0) result.score = 0;
  result.pass = result.score >= 80 && !result.probedVulnerabilities.some(p => p.exposed);
  return result;
}
