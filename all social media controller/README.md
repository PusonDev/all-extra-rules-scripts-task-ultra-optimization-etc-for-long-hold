# ZenVQ 100% Free Social Media Dispatcher (Cloudflare Workers + Cron + KV)

Edge-powered, 24/7 serverless social media dispatcher. Dispatches to **Telegram, LinkedIn, Facebook, Instagram and Twitter/X** simultaneously with **zero monthly fees** and **runs even when your computer is completely turned off**.

---

## ⚡ Features
- **100% Free Architecture:** Powered by Cloudflare Workers (100,000 requests/day free), Cloudflare KV (100,000 reads/day free) and official APIs.
- **24/7 Offline Scheduling (PC OFF Safe):** Schedule posts via `/schedule` or send immediately via `/publish`. Cloudflare Cron Triggers check and publish on time every 5 minutes without keeping any PC on.
- **Partial-Success Retry Engine:** Tracks `completedPlatforms` in KV so failed networks retry automatically up to `MAX_RETRY_ATTEMPTS` without double-posting to platforms that already succeeded.
- **One-Command Antigravity CLI:** Run `node scripts/dispatch.js` locally or let Antigravity trigger it directly.
- **Zero Third-Party Middlemen:** No Buffer, no Hootsuite, no Zapier, no Make and no Ayrshare subscriptions.

---

## 📁 Architecture
```
all social media controller/
├── wrangler.toml                  # Cloudflare Worker configuration, KV binding & cron triggers
├── package.json                   # Project manifest & test/deploy scripts
├── .env.example                   # Template for CLI URL & secret tokens
├── .gitignore                     # Protects .env, .dev.vars and build caches
├── src/
│   ├── index.js                   # Worker router, auth guard, validation & Cron retry engine
│   └── adapters/
│       ├── telegram.js            # Telegram Bot API (100% free)
│       ├── linkedin.js            # LinkedIn UGC Posts API (100% free)
│       ├── facebook.js            # Meta Graph API v21.0 (100% free)
│       ├── instagram.js           # Instagram Graph API v21.0 (2-step media publish)
│       └── twitter.js             # Twitter/X API v2 (OAuth 1.0a HMAC-SHA1 + OAuth 2.0 User Context)
├── scripts/
│   ├── dispatch.js                # CLI tool for publishing, scheduling & managing queue
│   └── test-dispatch.js           # Automated unit & integration test suite
├── PROFILE_AND_FIVERR_GIG_READY.md # Copy-paste ready LinkedIn & Fiverr profile/gig suite
└── README.md
```

---

## 🔑 Free API Token Setup Guide (Step-by-Step)

### 1. Dispatcher Security Key (Required)
Generate any strong random password/token and store it as `DISPATCHER_API_KEY`. Every protected request must send `Authorization: Bearer <DISPATCHER_API_KEY>`.

### 2. Telegram (1 Minute - Instant & Unlimited Free)
1. Open `@BotFather` in Telegram, run `/newbot` and copy the `TELEGRAM_BOT_TOKEN`.
2. Add your bot as an Admin to your Telegram Channel or Group.
3. Get your `TELEGRAM_CHAT_ID` (e.g. `@your_channel_username` or numeric chat ID via `https://api.telegram.org/bot<TOKEN>/getUpdates`).

### 3. LinkedIn (Free Community API)
1. Go to the LinkedIn Developer Portal and create an App linked to your LinkedIn Page.
2. Under Products, request **Share on LinkedIn** and **Sign In with LinkedIn using OpenID Connect**.
3. Generate an OAuth 2.0 Access Token with `w_member_social` (for personal profile) or `w_organization_social` (for company page) as `LINKEDIN_ACCESS_TOKEN`.
4. Set `LINKEDIN_PERSON_URN` as `urn:li:person:<your_id>` (from `/v2/userinfo` `sub` field) or `urn:li:organization:<org_id>`.

### 4. Facebook Page & Instagram Business (Free Meta Graph API v21.0)
1. Go to Meta for Developers, create a Business App and open **Graph API Explorer**.
2. Grant `pages_manage_posts`, `pages_read_engagement` and (for Instagram) `instagram_basic` + `instagram_content_publish`.
3. Exchange for a long-lived Page Access Token (`FACEBOOK_PAGE_ACCESS_TOKEN`) and copy your `FACEBOOK_PAGE_ID`.
4. For Instagram, copy your linked `INSTAGRAM_USER_ID` (requires a public image `mediaUrl` on every IG post).

### 5. Twitter / X (Free Tier - 1,500 Posts/Month)
1. Go to the X Developer Portal and create a Free Tier Project & App.
2. Under **User authentication settings**, enable **Read and write** permissions.
3. Under **Keys and tokens**, generate **API Key & Secret** (`TWITTER_API_KEY`, `TWITTER_API_SECRET`) and **Access Token & Secret** (`TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`).
   *(Note: App-Only Bearer tokens cannot post tweets; our adapter signs OAuth 1.0a HMAC-SHA1 natively in Cloudflare Workers.)*

---

## 🚀 Deploy to Cloudflare in 3 Steps

1. **Authenticate Wrangler with your Cloudflare account:**
   ```bash
   npx wrangler login
   ```
2. **Create the KV Namespace and update `wrangler.toml`:**
   ```bash
   npx wrangler kv namespace create SOCIAL_QUEUE
   ```
   Copy the returned `id` and replace `SOCIAL_QUEUE_ID_PLACEHOLDER` in `wrangler.toml`.
3. **Upload secrets & deploy:**
   ```bash
   npx wrangler secret put DISPATCHER_API_KEY
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_CHAT_ID
   # Add LinkedIn, Facebook, Instagram and Twitter secrets as needed
   npx wrangler deploy
   ```

---

## 📡 API Endpoints & CLI Commands

### CLI Usage (Copy `.env.example` to `.env` first)
```bash
# Check worker health & configured platforms
node scripts/dispatch.js --status

# Instant post across platforms
node scripts/dispatch.js --publish "Live update from ZenVQ!" --platforms telegram,linkedin,facebook

# Schedule post for later (runs 24/7 even with PC OFF)
node scripts/dispatch.js --schedule "2026-11-26T18:00:00Z" "Scheduled launch announcement!" --platforms telegram,linkedin

# View pending queue or cancel a scheduled post
node scripts/dispatch.js --queue
node scripts/dispatch.js --cancel scheduled:1795651200000_ab12cd34

# View 30-day dispatch history & failed logs
node scripts/dispatch.js --history
```

### HTTP Endpoints Summary
- `GET /` — Public liveness ping
- `GET /status` — Authenticated health check, configured platforms and queue counts
- `POST /publish` — Immediate multi-platform publish
- `POST /schedule` — Save post to Cloudflare KV for Cron delivery
- `GET /queue` — List all pending scheduled posts
- `DELETE /queue/:queueId` — Cancel a pending scheduled post
- `GET /history` — View recent `history:` and `failed:` dispatch records
