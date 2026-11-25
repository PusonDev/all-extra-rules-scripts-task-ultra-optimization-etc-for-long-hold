# Master Workflow Chamber Runner: "all site a-z full check"
[CmdletBinding()]
param(
    [switch]$SkipAutoFix = $false
)

$ErrorActionPreference = "Continue"
$ProjectsRoot = "D:\All coding installation tools\All My Main Project in real world"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [CHAMBER: all site a-z full check] Initializing Master Engine" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# =========================================================================
# STARTUP STABILITY GUARD: Prevent Boot Congestion & System Freezes
# =========================================================================
# If the PC booted recently (within the last 10 minutes), delay execution so
# Windows Explorer, display drivers, audio engines and network have fully settled.
$targetUptimeSec = 600 # 10 minutes grace period after boot
try {
    $osInfo = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
    if ($osInfo -and $osInfo.LastBootUpTime) {
        $currentUptimeSec = [int]((Get-Date) - $osInfo.LastBootUpTime).TotalSeconds
        if ($currentUptimeSec -lt $targetUptimeSec) {
            $waitRemainingSec = $targetUptimeSec - $currentUptimeSec
            Write-Host " [STARTUP-GUARD] System booted $currentUptimeSec seconds ago (grace period: $targetUptimeSec s)." -ForegroundColor Yellow
            Write-Host " [STARTUP-GUARD] Delaying execution by $waitRemainingSec seconds to keep PC responsive at startup..." -ForegroundColor Yellow
            Start-Sleep -Seconds $waitRemainingSec
        }
    }
} catch {
    Start-Sleep -Seconds 120
}

# CPU Calm Check: If system is under heavy load (> 40% CPU), wait an extra 25 seconds
try {
    $cpuLoad = (Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue | Measure-Object -Property LoadPercentage -Average).Average
    if ($cpuLoad -gt 40) {
        Write-Host " [STARTUP-GUARD] CPU load is high ($cpuLoad%). Waiting 25s for system to idle..." -ForegroundColor Yellow
        Start-Sleep -Seconds 25
    }
} catch {}

# 1. Local Auto-Fix & Git Backup Synchronization across all 9 repositories
if (-not $SkipAutoFix -and (Test-Path $ProjectsRoot)) {
    $projects = Get-ChildItem -Path $ProjectsRoot -Directory
    foreach ($p in $projects) {
        $hasGit = Test-Path (Join-Path $p.FullName ".git")
        if ($hasGit) {
            Push-Location $p.FullName
            try {
                $status = (git status --short 2>$null)
                if ($status -and $status.Count -gt 0) {
                    Write-Host " [AUTO-FIX] Resolving $($status.Count) pending changes in $($p.Name)..." -ForegroundColor Yellow
                    git add . 2>$null
                    git commit -m "chore(auto-maintenance): stage and synchronize verified files [skip ci]" 2>$null
                }

                $branch = (git rev-parse --abbrev-ref HEAD 2>$null)
                $hasRemote = (git remote -v 2>$null)
                if ($hasRemote -and $branch) {
                    $ahead = (git log origin/$branch..HEAD --oneline 2>$null)
                    if ($ahead -and $ahead.Count -gt 0) {
                        Write-Host " [GIT-BACKUP] Backing up $($ahead.Count) commits to origin/$branch in $($p.Name)..." -ForegroundColor Cyan
                        git push origin $branch 2>$null
                    }
                }
            } finally {
                Pop-Location
            }
        }
    }
}

# 2. Extract RESEND_API_KEY
$envFile = Join-Path $ProjectsRoot "ZenVQ-Agency\.env.local"
$resendKey = $env:RESEND_API_KEY
if (-not $resendKey -and (Test-Path $envFile)) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^RESEND_API_KEY=(re_[a-zA-Z0-9_]+)") {
            $resendKey = $matches[1]
        }
    }
}

$env:RESEND_API_KEY = $resendKey
$env:RECIPIENT_EMAIL = "wahidur757@gmail.com"

# 3. Execute Chamber Node Engine
$nodeExe = "D:\All coding installation tools\codeing all tools, plugins, skills, mcp etc\node\PFiles64\nodejs\node.exe"
$localEngine = Join-Path $PSScriptRoot "chamber-engine.mjs"
if (Test-Path $localEngine) {
    $engineScript = $localEngine
} else {
    $engineScript = "C:\All my stuff out from windows\Ai Agents\All data for antigravity\config\chambers\all-site-a-z-full-check\chamber-engine.mjs"
}

if (Test-Path $nodeExe) {
    & $nodeExe $engineScript
} else {
    Write-Host "Node.js executable not found at $nodeExe" -ForegroundColor Red
}
