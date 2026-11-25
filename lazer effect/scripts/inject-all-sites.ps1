<#
.SYNOPSIS
  Batch-injects ZenVQ Universal Laser Cursor into all 8 ecosystem platforms.

.DESCRIPTION
  Iterates through all known repositories on the machine and runs install-laser.ps1
  to ensure all projects have the latest master laser engine, components and rules.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File "scripts\inject-all-sites.ps1"
#>

[CmdletBinding()]
param(
  [string]$BaseDir = "D:\All coding installation tools\All My Main Project in real world"
)

$ErrorActionPreference = "Continue"

$RootSource = Split-Path -Parent $PSScriptRoot
$InstallScript = Join-Path $PSScriptRoot "install-laser.ps1"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "⚡ ZenVQ Universal Laser Ecosystem Injector" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$Targets = @(
  @{ Name = "ZenVQ-Agency"; RelPath = "ZenVQ-Agency" },
  @{ Name = "ZenVQ-EcoSystem"; RelPath = "ZenVQ-EcoSystem" },
  @{ Name = "Puson-Dev"; RelPath = "Puson-Dev" },
  @{ Name = "Natures-Intimacy"; RelPath = "Natures-Intimacy" },
  @{ Name = "ZenVQ-Suggests (zenvq-suggest)"; RelPath = "ZenVQ-Suggests\zenvq-suggest" },
  @{ Name = "ZenVQ-Tools (oneapp-website)"; RelPath = "ZenVQ-Tools\01-OneApp-Ecosystem\01-Apps\oneapp-website" },
  @{ Name = "03-Templates-Hub (templates.zenvq.com)"; RelPath = "ZenVQ-Tools\03-Templates-Hub" },
  @{ Name = "Dr Jerin-Dental Point"; RelPath = "ZenVQ-Tools\03-Templates-Hub\Dr Jerin-Dental Point" },
  @{ Name = "Boutique-Templates"; RelPath = "ZenVQ-Tools\03-Templates-Hub\Boutique-Templates" },
  @{ Name = "Rafij-portfolio"; RelPath = "ZenVQ-Tools\03-Templates-Hub\Rafij-portfolio" },
  @{ Name = "Saif-portfolio"; RelPath = "ZenVQ-Tools\03-Templates-Hub\Saif-portfolio" },
  @{ Name = "Kawsar.design"; RelPath = "ZenVQ-Tools\03-Templates-Hub\Kawsar.design" },
  @{ Name = "Biodata-Studio"; RelPath = "ZenVQ-Tools\02-CV-and-Biodata-Maker" }
)

$successCount = 0
$skipCount = 0

foreach ($t in $Targets) {
  $targetPath = Join-Path $BaseDir $t.RelPath
  if (-not (Test-Path $targetPath)) {
    $alt = Join-Path $BaseDir "ZenVQ-Tools\03-Templates-Hub\$($t.RelPath)"
    if (Test-Path $alt) { $targetPath = $alt }
  }
  if (Test-Path $targetPath) {
    Write-Host "`n>>> Processing: $($t.Name) ..." -ForegroundColor Yellow
    try {
      & powershell -ExecutionPolicy Bypass -File $InstallScript -TargetProject $targetPath
      $successCount++
    } catch {
      Write-Host "✖ Failed for $($t.Name) : $_" -ForegroundColor Red
    }
  } else {
    Write-Host "⏭ Skipping $($t.Name) (not found at $targetPath)" -ForegroundColor DarkGray
    $skipCount++
  }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Batch injection finished: $successCount updated, $skipCount skipped." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
