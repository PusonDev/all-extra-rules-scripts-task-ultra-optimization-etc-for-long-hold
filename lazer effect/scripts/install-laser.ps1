<#
.SYNOPSIS
  Installs ZenVQ Universal Precision Laser Cursor into any target project.

.DESCRIPTION
  Copies the laser engine, React components and configuration into a target
  Next.js, Vite, React or Vanilla HTML repository.

.PARAMETER TargetProject
  Absolute or relative path to the target project directory.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File "scripts\install-laser.ps1" -TargetProject "..\ZenVQ-Agency"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$TargetProject
)

$ErrorActionPreference = "Stop"

$RootSource = Split-Path -Parent $PSScriptRoot
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "⚡ ZenVQ Universal Laser Cursor Installer" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $TargetProject)) {
  Write-Error "Target project path '$TargetProject' does not exist."
}

$TargetPath = (Resolve-Path $TargetProject).Path
Write-Host "Target: $TargetPath" -ForegroundColor Gray

# 1. Detect project type
$isNextJs = (Test-Path (Join-Path $TargetPath "next.config.js")) -or (Test-Path (Join-Path $TargetPath "next.config.ts")) -or (Test-Path (Join-Path $TargetPath "next.config.mjs"))
$hasComponents = Test-Path (Join-Path $TargetPath "components")
$hasPublic = Test-Path (Join-Path $TargetPath "public")

# 2. Copy Core Standalone Engine
$publicLibDir = Join-Path $TargetPath "public\lib"
if ($hasPublic) {
  if (-not (Test-Path $publicLibDir)) {
    New-Item -Path $publicLibDir -ItemType Directory -Force | Out-Null
  }
  Copy-Item -Path (Join-Path $RootSource "core\zenvq-laser.js") -Destination (Join-Path $publicLibDir "zenvq-laser.js") -Force
  Write-Host "✔ Copied zenvq-laser.js -> public\lib\zenvq-laser.js" -ForegroundColor Green
}

# 3. Copy React / Next.js Components (supports both components\ and src\components\)
$componentsDir = Join-Path $TargetPath "components"
$srcComponentsDir = Join-Path $TargetPath "src\components"
$resolvedCompDir = $null
if (Test-Path $srcComponentsDir) {
  $resolvedCompDir = $srcComponentsDir
} elseif (Test-Path $componentsDir) {
  $resolvedCompDir = $componentsDir
} elseif ($isNextJs) {
  $resolvedCompDir = $componentsDir
}

if ($resolvedCompDir) {
  if (-not (Test-Path $resolvedCompDir)) {
    New-Item -Path $resolvedCompDir -ItemType Directory -Force | Out-Null
  }
  Copy-Item -Path (Join-Path $RootSource "components\LaserCursor.tsx") -Destination (Join-Path $resolvedCompDir "LaserCursor.tsx") -Force
  Copy-Item -Path (Join-Path $RootSource "components\ZenVQLaser.tsx") -Destination (Join-Path $resolvedCompDir "ZenVQLaser.tsx") -Force
  Write-Host "✔ Copied LaserCursor.tsx & ZenVQLaser.tsx -> $resolvedCompDir" -ForegroundColor Green
}

# For static sites that use root lib\ instead of public\lib\
$rootLibDir = Join-Path $TargetPath "lib"
if (-not $hasPublic -and (Test-Path $rootLibDir)) {
  Copy-Item -Path (Join-Path $RootSource "core\zenvq-laser.js") -Destination (Join-Path $rootLibDir "zenvq-laser.js") -Force
  Write-Host "✔ Copied zenvq-laser.js -> lib\zenvq-laser.js" -ForegroundColor Green
}

# 4. Check & append CSS if needed
$globalsCssPath = $null
if (Test-Path (Join-Path $TargetPath "app\globals.css")) {
  $globalsCssPath = Join-Path $TargetPath "app\globals.css"
} elseif (Test-Path (Join-Path $TargetPath "src\app\globals.css")) {
  $globalsCssPath = Join-Path $TargetPath "src\app\globals.css"
} elseif (Test-Path (Join-Path $TargetPath "styles\globals.css")) {
  $globalsCssPath = Join-Path $TargetPath "styles\globals.css"
}

if ($globalsCssPath) {
  $cssContent = Get-Content -Raw $globalsCssPath
  if ($cssContent -notmatch "laser-cursor-active") {
    $laserCss = @"

/* Master Silicon-Valley Precision Laser Cursor */
@media (hover: hover) and (pointer: fine) {
  html.laser-cursor-active,
  html.laser-cursor-active body,
  html.laser-cursor-active a,
  html.laser-cursor-active button,
  html.laser-cursor-active [role="button"],
  html.laser-cursor-active [data-interactive],
  html.laser-cursor-active .cursor-pointer {
    cursor: none !important;
  }

  html.laser-cursor-active input,
  html.laser-cursor-active textarea,
  html.laser-cursor-active [contenteditable="true"] {
    cursor: text !important;
  }
}
"@
    Add-Content -Path $globalsCssPath -Value $laserCss
    Write-Host "✔ Injected cursor suppression styles into $globalsCssPath" -ForegroundColor Green
  } else {
    Write-Host "ℹ Cursor styles already present in $globalsCssPath" -ForegroundColor Gray
  }
}

Write-Host "`n✅ Installation Complete!" -ForegroundColor Green
Write-Host "Integration Quick Start:" -ForegroundColor Yellow
if ($isNextJs) {
  Write-Host "  Add to your root app/layout.tsx:" -ForegroundColor White
  Write-Host "    import { LaserCursor } from '@/components/LaserCursor';" -ForegroundColor Cyan
  Write-Host "    // inside <body>: <LaserCursor theme=""auto"" />" -ForegroundColor Cyan
} else {
  Write-Host "  Add to your HTML <head> or <body>:" -ForegroundColor White
  Write-Host "    <script src=""https://laser-api.zenvq.com/v1/laser.js"" data-auto-laser=""true"" defer></script>" -ForegroundColor Cyan
}
