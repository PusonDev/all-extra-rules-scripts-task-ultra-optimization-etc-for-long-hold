@echo off
title ZenVQ 24/7 Autonomous Defensive Vulnerability Sentinel
cd /d "%~dp0"
echo ===========================================================================
echo  🛡️  ZenVQ 24/7 Defensive Vulnerability Sentinel (Continuous Attack Tester)
echo  🔔  Wired to Telegram @Zenvq_Lead_bot (Chat ID: 8930678641)
echo ===========================================================================
node sentinel-24-7.mjs --daemon
pause
