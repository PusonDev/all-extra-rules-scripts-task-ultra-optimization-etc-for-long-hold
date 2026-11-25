# 🌐 ZenVQ Ecosystem Guardian: Master Data & System Bridge

> **Unified System Bridge** between **Local Daily Guardian (`daily-check`)** and **24/7 Autonomous Cloud Security & Bug Hunter Engine**.

---

## 📌 1. Verified Live Production Endpoints (100% Online)
All 5 live endpoints are verified operational (HTTP 200) with sub-second latencies:
1. **ZenVQ Ecosystem:** `https://zenvq.com` (Main Platform)
2. **ZenVQ Agency Hub:** `https://agency.zenvq.com` (Cloudflare Pages Distribution)
3. **ZenVQ Templates:** `https://templates.zenvq.com` (Production Templates Showcase)
4. **ZenVQ Founder Portfolio:** `https://puson.zenvq.com` (Puson Dev Authority Site)
5. **Nature's Intimacy:** `https://natures-intimacy.zenvq.com` (Evidence-based Health Portal)

---

## 🗄️ 2. Repository & Workspace Map (`github.com/PusonDev`)
| Repository / Project | Branch | Remote Repository | Build / Type |
| :--- | :--- | :--- | :--- |
| **`ZenVQ-Agency`** | `master` | `https://github.com/PusonDev/ZenVQ-Agency.git` | Next.js 14 App Router + Cloudflare Pages |
| **`ZenVQ-EcoSystem`** | `main` | `https://github.com/PusonDev/ZenVQ-EcoSystem.git` | Next.js 14 App Router |
| **`ZenVQ-Tools`** | `main` | `https://github.com/PusonDev/ZenVQ-Tools.git` | Next.js + OneApp Binaries |
| **`Puson-Dev`** | `main` | `https://github.com/PusonDev/Puson-Dev.git` | Static HTML5 + Tailwind |
| **`ZenVQ-Suggests`** | `main` | `https://github.com/PusonDev/ZenVQ-Suggests.git` | Next.js |
| **`Natures-Intimacy`** | `main` | `https://github.com/PusonDev/Natures-Intimacy.git` | Next.js 14 App Router |
| **`Rafij-portfolio`** | `main` | `https://github.com/PusonDev/Rafij-portfolio.git` | Static Showcase |
| **`templetes.zenvq.com`** | `main` | Subdirectory / Pages deployment | Static Showcase |
| **`zenvq-scripting-email-collection`** | — | Local Lead Engine | Node.js + Google Sheets API |

---

## ⚡ 3. Active Auto-Fix Engine Capabilities
The local guardian script (`daily-check-runner.ps1`) already handles:
- **DNS & Subdomain Validation:** Auto-detects endpoint routing anomalies.
- **Git State Hygiene:** Automatically detects uncommitted changes, stages files, verifies production build stability, and commits with `chore(auto-maintenance): stage and synchronize verified files [skip ci]`.
- **Missed-Run Protection:** Windows Task Scheduler (`ZenVQ-Daily-Guardian`) has `StartWhenAvailable` enabled so it catches up immediately on boot if the machine was asleep at 09:00 AM.
- **Notification Pipeline:** Dispatches clean Markdown and HTML summaries directly to `wahidur757@gmail.com` via Resend API (HTTP 200).

---

## ☁️ 4. 24/7 Zero-Cost Cloud Runner Implementation Plan (GitHub Actions)
To run 24/7 completely free even when the local PC is powered off:
1. Add `.github/workflows/daily-guardian.yml` to `ZenVQ-Agency` or `ZenVQ-EcoSystem`.
2. Configure GitHub Secrets:
   - `RESEND_API_KEY`: Readily available in `ZenVQ-Agency/.env.local`.
   - `NOTIFICATION_EMAIL`: `wahidur757@gmail.com`.
3. Cron Schedule: `0 3 * * *` (03:00 UTC = 09:00 AM Asia/Dhaka).
4. Job Steps:
   - Ping all 5 live URLs.
   - Run dependency audits (`npm audit --audit-level=high`).
   - Check mobile layout parameters and CSS overflow.
   - Dispatch status summary via Resend API.
