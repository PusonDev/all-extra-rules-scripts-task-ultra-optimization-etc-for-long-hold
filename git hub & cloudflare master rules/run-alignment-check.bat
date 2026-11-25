@echo off
title ZenVQ Ecosystem Alignment Check
cls
echo =======================================================
echo   ZENVQ ECOSYSTEM: CLOUDFLARE, GIT & LOCAL DISK AUDIT
echo =======================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0verify-ecosystem-alignment.ps1"
echo.
echo Audit completed. Press any key to exit.
pause >nul
