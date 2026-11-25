@echo off
title ZenVQ Master Ecosystem Guardians (API + Sentinel + TG Bridge)
cd /d "%~dp0"
echo ===========================================================================
echo  🛡️  Launching ZenVQ Master Autonomous Guardians (All-in-One)
echo  1. Ultra Optimization API Server (Port 4040)
echo  2. 24/7 Defensive Vulnerability Sentinel
echo  3. Telegram to Antigravity Bridge (TG ⇄ AG)
echo ===========================================================================

echo [1/3] Starting API Server & Dashboard on http://localhost:4040...
start "ZenVQ API Server" cmd /c "node server.mjs"

echo [2/3] Starting 24/7 Defensive Sentinel (Zero-Spam)...
start "ZenVQ 24/7 Sentinel" cmd /c "node sentinel-24-7.mjs --daemon"

echo [3/3] Starting TG to Antigravity Bridge (Dedicated TG ⇄ AG Bot)...
start "ZenVQ TG Bridge" cmd /c "node tg-to-ag-bridge.mjs"

echo.
echo ✅ All Guardians are successfully operating in background!
pause
