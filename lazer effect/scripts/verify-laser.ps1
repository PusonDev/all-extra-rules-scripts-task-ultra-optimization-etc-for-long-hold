<#
.SYNOPSIS
  Verifies the integrity, syntax and policy compliance of the Laser Effect package.

.DESCRIPTION
  Runs automated file checks, syntax linting and Oxford comma sanitization checks.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File "scripts\verify-laser.ps1"
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Verifying ZenVQ Laser Architecture Integrity" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$requiredFiles = @(
  "core\zenvq-laser.js",
  "components\LaserCursor.tsx",
  "components\ZenVQLaser.tsx",
  "components\ZenVQLaser.standalone.html",
  "cloudflare-worker\src\index.js",
  "cloudflare-worker\src\engineCode.js",
  "cloudflare-worker\package.json",
  "cloudflare-worker\wrangler.jsonc",
  "rules\zenvq-laser-rules.md",
  "rules\LASER_MASTER_TECH_SPEC.md",
  "scripts\install-laser.ps1",
  "scripts\inject-all-sites.ps1"
)

$missing = 0
foreach ($file in $requiredFiles) {
  $fullPath = Join-Path $Root $file
  if (Test-Path $fullPath) {
    Write-Host "[OK] Found: $file" -ForegroundColor Green
  } else {
    Write-Host "[FAIL] Missing: $file" -ForegroundColor Red
    $missing++
  }
}

if ($missing -gt 0) {
  Write-Error "Verification failed: $missing files are missing."
}

# Node syntax check
Write-Host "`nChecking JavaScript syntax with Node.js..." -ForegroundColor Yellow
try {
  node -c (Join-Path $Root "core\zenvq-laser.js")
  Write-Host "[OK] core\zenvq-laser.js syntax clean" -ForegroundColor Green
  node -c (Join-Path $Root "cloudflare-worker\src\index.js")
  Write-Host "[OK] cloudflare-worker\src\index.js syntax clean" -ForegroundColor Green
} catch {
  Write-Error "Syntax check failed: $_"
}

# Oxford Comma check
Write-Host "`nScanning repository for Oxford comma violations (, and / , &)..." -ForegroundColor Yellow
$oxfordViolations = 0
$filesToScan = Get-ChildItem -Path $Root -Recurse -File | Where-Object { 
  $_.FullName -notmatch '\\\.git' -and 
  $_.FullName -notmatch '\\node_modules' -and 
  $_.Name -notmatch '\.png$' -and 
  $_.Name -notmatch '\.jpg$' -and 
  $_.Name -notmatch '\.woff2?$' -and
  $_.Name -ne 'verify-laser.ps1'
}

$oxRegex = ',\s+(and|&)\b'
foreach ($f in $filesToScan) {
  $content = Get-Content -Path $f.FullName
  $lineNum = 0
  foreach ($line in $content) {
    $lineNum++
    if ($line -match $oxRegex) {
      Write-Host "Warning: Oxford comma in $($f.Name):$lineNum : $($line.Trim())" -ForegroundColor Red
      $oxfordViolations++
    }
  }
}

if ($oxfordViolations -eq 0) {
  Write-Host "[OK] 100% Clean: Zero Oxford comma violations found." -ForegroundColor Green
} else {
  Write-Host "Found $oxfordViolations Oxford comma violations." -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Laser Architecture Verification Complete!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
