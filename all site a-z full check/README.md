# 🛡️ all site a-z full check — Master Chamber Vault

Permanent Long-Hold Vault for ZenVQ Master Workflow Chamber: A-Z Site Health, Mobile Ergonomics, Cybersecurity, GEO AI Search, 3-Tier Storage Redundancy (PC + Cloudflare + Git) and Automated Repair.

---

## 📁 Vault Structure

```
all site a-z full check/
├── criteria-config.json              # Modular criteria matrix, endpoint list, thresholds and notification settings
├── chamber-engine.mjs                # Production Node.js engine executing all checks and dispatching Resend HTML emails
├── chamber-runner.ps1                # PowerShell orchestrator with local auto-fix and Git backup sync
├── run-check.bat                     # One-click Windows batch runner (double-click anytime)
├── ALL_SITE_A_Z_FULL_CHECK_REPORT.md # Latest execution report and verification matrix
├── sidecar/
│   └── sidecar.json                  # Antigravity Sidecar manifest for background automations
└── README.md                         # This documentation
```

---

## ⚡ Execution Methods

### 1. 24/7 Autonomous Cloudflare Edge Scheduled Worker (PC Off Immunity)
- **Worker Name:** `zenvq-all-site-guardian`
- **Schedule:** Daily at 03:00 UTC (09:00 AM Asia/Dhaka) via Cloudflare Cron Triggers
- **Edge URL:** `https://zenvq-all-site-guardian.onlyfordigitalwork.workers.dev`
- **JSON Endpoint:** `https://zenvq-all-site-guardian.onlyfordigitalwork.workers.dev/json`
- **Immunity:** Runs 100% autonomously in the cloud even when your PC is completely turned off or asleep. 100% Free forever.

### 2. One-Click Double Click (Local PC)
Simply double-click `run-check.bat` in Windows Explorer to run all checks, trigger auto-repairs, sync git backups and receive an executive email report at `wahidur757@gmail.com`.

### 3. PowerShell Command Line (Local PC)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\All coding installation tools\All My Main Project in real world\all extra rules, scripts, task etc for long hold\all site a-z full check\chamber-runner.ps1"
```

### 4. Windows Scheduled Task (Local PC Catch-Up)
The chamber is registered in Windows Task Scheduler under task name:
- **Task Name:** `ZenVQ-All-Site-A-Z-Full-Check`
- **Schedule:** Daily at 9:00 AM (Asia/Dhaka)
- **Catch-up Mode:** `-StartWhenAvailable` enabled (runs immediately upon boot if PC was powered off during scheduled time)

---

## 📋 Verified Criteria Matrix

1. **Live Endpoints (100% Operational):**
   - `zenvq.com` (Main Ecosystem Directory)
   - `agency.zenvq.com` (Engineering Foundry & Creative Studio)
   - `templates.zenvq.com` (Production Templates Showcase)
   - `puson.zenvq.com` (Founder Authority Hub)
   - `natures-intimacy.zenvq.com` (Health & Wellness Brand)
2. **Mobile Ergonomics & Responsive Standards:**
   - Universal viewport meta tags
   - Zero horizontal scroll overflow (`overflow-x: hidden !important`)
   - Apple & Google Human Interface Guidelines touch target compliance (>=44px)
3. **Cybersecurity & Secret Hygiene:**
   - Zero plain-text GitHub Personal Access Tokens (`ghp_...`) in `.git/config`
   - Windows Credential Locker (`wincred`) authentication
   - Zero leaked API keys or secrets in source code
4. **GEO & AI Search Engine Readiness:**
   - Verified HTTP 200 on `llms.txt` and `llms-full.txt` across domains
   - Clean `robots.txt` and `sitemap.xml`
5. **3-Tier Storage Redundancy Policy:**
   - **Tier 1 (PC Local Storage):** Source repositories located on disk at `D:\All coding installation tools\All My Main Project in real world\`
   - **Tier 2 (Cloudflare 24/7 Edge):** Production sites running worldwide on Cloudflare Pages and Edge CDN (remains online 24/7 even when PC is shut down)
   - **Tier 3 (Git Cloud Backup):** Code repositories synchronized and backed up to GitHub remotes (`origin main` / `origin master`)
   - **Lead Data Boundary:** Prospect/lead data strictly stored only in Google Sheets and local backups (never tracked in Git)
6. **Content Optimization, Simplification & CRO Discipline:**
   - Zero unnecessary repetition or looped marketing claims across sections
   - Elimination of pretentious, confusing AI-jargon in favor of plain, client-friendly words
   - Space-efficient concise copy that respects user attention and fits mobile screens
   - Full preservation of core business value, 15-Minute SLAs, 3-Person Pods and verified proof
7. **Multilingual Spelling & Character Encoding Integrity:**
   - Daily live scan of all websites for spelling mistakes, typos and grammatical errors
   - Detection and auto-repair of character encoding corruptions (mojibake like â€ or Ã©) across all languages
   - Instant automated correction in repository source code upon typo detection
   - Strict Zero Oxford Comma enforcement across all copy and documentation

---

## 📧 Executive Reporting
- **Delivery Provider:** Resend API
- **Recipient:** `wahidur757@gmail.com`
- **Format:** Executive Dark Luxury HTML Email + Full Markdown Report
