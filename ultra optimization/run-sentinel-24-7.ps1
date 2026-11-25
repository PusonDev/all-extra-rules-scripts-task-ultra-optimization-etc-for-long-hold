# ZenVQ 24/7 Autonomous Defensive Vulnerability Sentinel
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot
Write-Host "🛡️ Starting ZenVQ 24/7 Defensive Vulnerability Sentinel (Continuous Attack Tester)..." -ForegroundColor Cyan
Write-Host "🔔 Wired to Telegram @Zenvq_Lead_bot (Chat ID: 8930678641)" -ForegroundColor Yellow
node sentinel-24-7.mjs --daemon
