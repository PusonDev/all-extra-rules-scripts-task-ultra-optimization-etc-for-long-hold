/**
 * Core 3-Tier Storage Redundancy & Lead Isolation Scanner
 * Audits Tier 1 (PC Local Storage), Tier 2 (Cloudflare Edge 24/7), Tier 3 (Git Cloud Remote)
 * and Lead Data Isolation (Google Sheets + local only, zero leads in git).
 */

import fs from 'fs';
import path from 'path';

export async function scanRedundancy(siteConfig, networkResult, securityConfig, projectsRoot) {
  const result = {
    domain: siteConfig.domain,
    score: 100,
    pass: true,
    tier1Local: {
      exists: false,
      path: ''
    },
    tier2Cloudflare: {
      active: networkResult.isCloudflare
    },
    tier3GitRemote: {
      configured: false,
      remoteUrl: ''
    },
    leadDataIsolation: {
      clean: true,
      leakedFiles: []
    },
    issues: [],
    remediations: []
  };

  // 1. Tier 1: Local PC Storage Integrity
  if (siteConfig.repo_name && projectsRoot) {
    const repoPath = path.join(projectsRoot, siteConfig.repo_name);
    result.tier1Local.path = repoPath;
    result.tier1Local.exists = fs.existsSync(repoPath);

    if (!result.tier1Local.exists) {
      result.score -= 20;
      result.issues.push(`Tier 1 missing: Local repository not found on disk at "${siteConfig.repo_name}"`);
    } else {
      // 2. Tier 3: Git Remote Backup Integrity
      const gitConfigPath = path.join(repoPath, '.git', 'config');
      if (fs.existsSync(gitConfigPath)) {
        try {
          const config = fs.readFileSync(gitConfigPath, 'utf8');
          if (config.includes('github.com')) {
            result.tier3GitRemote.configured = true;
          } else {
            result.score -= 10;
            result.issues.push('Tier 3 incomplete: Git remote does not point to GitHub');
          }
        } catch {
          // Ignore read errors
        }
      }
    }
  }

  // 3. Tier 2: Cloudflare Edge Redundancy
  if (!result.tier2Cloudflare.active) {
    result.score -= 25;
    result.issues.push('Tier 2 inactive: Not served through Cloudflare 24/7 Edge network');
  }

  // 4. Lead Data Isolation (Checked specifically for lead repo if present)
  if (projectsRoot) {
    const leadRepoPath = path.join(projectsRoot, 'zenvq-scripting-email-collection');
    if (fs.existsSync(leadRepoPath)) {
      const gitIgnorePath = path.join(leadRepoPath, '.gitignore');
      const gitIgnore = fs.existsSync(gitIgnorePath) ? fs.readFileSync(gitIgnorePath, 'utf8') : '';

      for (const forbidden of securityConfig.lead_isolation_forbidden_files_in_git) {
        if (!gitIgnore.includes(forbidden)) {
          // If file exists and is not ignored, flag potential leak
          const filePath = path.join(leadRepoPath, forbidden);
          if (fs.existsSync(filePath)) {
            result.leadDataIsolation.clean = false;
            result.leadDataIsolation.leakedFiles.push(forbidden);
            result.score -= 30;
            result.issues.push(`Lead Data Boundary Breach: "${forbidden}" is not in .gitignore!`);
            result.remediations.push({
              type: 'LEAD_DATA_GIT_EXPOSURE',
              file: forbidden,
              fix: `Add ${forbidden} to .gitignore immediately. Lead data must strictly stay in Google Sheets & local encrypted vault only.`
            });
          }
        }
      }
    }
  }

  if (result.score < 0) result.score = 0;
  result.pass = result.score >= 70 && result.leadDataIsolation.clean;
  return result;
}
