# 🛡️ ZenVQ Ultra Optimization, 24/7 Sentinel & TG ⇄ Antigravity Bridge

A unified, autonomous multi-vector auditing, defensive security sentinel and remote control system for the entire **ZenVQ Ecosystem** (11 vertical platforms).

---

## ⚡ 1-Click Launchers (Windows Shortcuts)

| Shortcut | Description |
| :--- | :--- |
| `start-all-zenvq-guardians.bat` | **Master Launcher:** Launches API Server + 24/7 Sentinel + TG Bridge all together in one click! |
| `start-tg-bridge.bat` | Launches the dedicated **Telegram to Antigravity Bridge (TG ⇄ AG)** |
| `run-sentinel-24-7.bat` | Launches the **24/7 Defensive Vulnerability Sentinel** (Continuous attack simulation, zero-spam alerting) |
| `run-audit.bat` | Runs instant multi-vector audit in terminal and outputs colored matrix + markdown report |
| `start-api-server.bat` | Starts the standalone REST API server on `http://localhost:4040` |

---

## 📱 Telegram to Antigravity (TG ⇄ AG) Remote Bridge

Control and communicate with your local Antigravity AI agent from anywhere in the world right from your phone via Telegram!

### Authorized Bot & Security
- **Bot:** `@Zenvq_Lead_bot`
- **Security:** Locked exclusively to your Telegram Chat ID: `8930678641`. Messages from any other chat are blocked.
- **Worldwide Reach:** Uses outbound HTTPS long-polling — works through any firewall, mobile 4G/5G, or international network without port forwarding.

### Commands you can send from Telegram:
- `/start` or `/help` — Displays status and bridge menu
- `/status` — Instant scorecard of all 11 ecosystem sites
- `/audit` — Triggers complete 10-vector audit and returns report
- `/security` or `/attack` — Runs defensive vulnerability penetration scan
- `/cmd <command>` — Executes a terminal command in the workspace
- `/ag <prompt>` — Dispatches an instruction to the Antigravity AI Agent and replies back
- `/clean` — Deletes recent bot messages to keep the chat clean
- *Or simply type any message/question, and Antigravity will process it and respond!*

---

## 🚨 24/7 Defensive Vulnerability Sentinel (Zero-Spam)

- Continuously probes live endpoints for sensitive file leaks (`/.env`, `/.git`, etc.), downtime, and critical flaws.
- **Zero-Spam Policy:** Minor warnings (like missing HSTS) are recorded in logs; Telegram alerts are triggered strictly for real critical vulnerabilities, consolidated into a single card with an anti-flood cooldown.

---

## 🌐 API Endpoints Reference (`http://localhost:4040`)

- `GET /` — API documentation and control panel
- `GET /api/status` — System health check
- `GET /api/audit` — Full 10-vector JSON audit across all sites
- `GET /api/report` — Interactive dark luxury HTML dashboard
- `GET /api/sentinel/run` — Run defensive probing cycle on demand
- `GET /api/sentinel/test-tg` — Verify Telegram push notification
