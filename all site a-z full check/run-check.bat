@echo off
title ZenVQ Master Chamber: all site a-z full check
echo ==========================================================
echo  ZenVQ Master Chamber: all site a-z full check
echo ==========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0chamber-runner.ps1"
echo.
echo [DONE] Master check complete. Press any key to exit...
pause >nul
