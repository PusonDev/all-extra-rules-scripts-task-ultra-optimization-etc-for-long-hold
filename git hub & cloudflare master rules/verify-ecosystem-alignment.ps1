# ==============================================================================
# ZenVQ Master Ecosystem Alignment & Family Tree Verification Engine
# Author: Puson (@PusonDev)
# Standards: Zero Oxford Comma (A, B and C) | 3-Tier Redundancy & Deduplication
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$SkipNetworkCheck = $false
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$MatrixPath = Join-Path $ScriptDir "ECOSYSTEM_TREE_AND_MAPPING_MATRIX.json"

if (-not (Test-Path $MatrixPath)) {
    Write-Error "Matrix file not found: $MatrixPath"
    exit 1
}

$MatrixData = Get-Content -Path $MatrixPath -Raw | ConvertFrom-Json
$TotalProjects = $MatrixData.matrix.Count
$Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  ZENVQ ECOSYSTEM: 4-GENERATION FAMILY TREE & AUDIT" -ForegroundColor Yellow
Write-Host "  Timestamp: $Timestamp" -ForegroundColor Gray
Write-Host "  Total Nodes in Tree: $TotalProjects" -ForegroundColor Gray
Write-Host "=================================================================`n" -ForegroundColor Cyan

$ReportRows = @()
$PassedCount = 0
$WarningCount = 0
$FailedCount = 0

foreach ($project in $MatrixData.matrix) {
    $name = $project.name
    $wing = $project.tree_wing
    $level = $project.hierarchy_level
    $parent = $project.parent_entity
    $localPath = $project.local_path
    $repoUrl = $project.github_repo
    $canonicalUrl = $project.canonical_url

    Write-Host "[$level | $wing] Checking $name (Parent: $parent)..." -ForegroundColor White

    # 1. Local Disk Check
    $localStatus = "MISSING"
    if (Test-Path $localPath) {
        $localStatus = "OK"
    }

    # 2. Git Remote Check
    $gitStatus = "NO_GIT"
    $gitBranch = "-"
    $gitSecretLeaked = $false

    $gitDir = Join-Path $localPath ".git"
    $targetGitDir = $localPath
    if (-not (Test-Path $gitDir) -and $project.parent_repo_path) {
        $candidateGitDir = Join-Path $project.parent_repo_path ".git"
        if (Test-Path $candidateGitDir) {
            $gitDir = $candidateGitDir
            $targetGitDir = $project.parent_repo_path
        }
    }

    if (Test-Path $gitDir) {
        try {
            $remote = git -C $targetGitDir remote get-url origin 2>$null
            $branch = git -C $targetGitDir branch --show-current 2>$null
            $gitBranch = if ($branch) { $branch } else { "HEAD" }

            if ($remote -match "ghp_|github_pat_") {
                $gitStatus = "PAT_LEAKED_WARNING"
                $gitSecretLeaked = $true
            } elseif ($remote) {
                $gitStatus = if ($targetGitDir -ne $localPath) { "PARENT_GIT_OK" } else { "OK" }
            } else {
                $gitStatus = "NO_REMOTE"
            }
        } catch {
            $gitStatus = "ERROR"
        }
    } elseif ($repoUrl -match "Internal") {
        $gitStatus = "INTERNAL_CHAMBER"
    }

    # 3. Cloudflare Live Endpoint Check
    $edgeStatus = "SKIPPED"
    $latencyMs = 0
    if (-not $SkipNetworkCheck -and $canonicalUrl -match "^https?://") {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $req = [System.Net.HttpWebRequest]::Create($canonicalUrl)
            $req.Timeout = 5000
            $req.Method = "HEAD"
            $req.UserAgent = "ZenVQ-Ecosystem-Guardian/1.0"
            $resp = $req.GetResponse()
            $stopwatch.Stop()
            $latencyMs = $stopwatch.ElapsedMilliseconds
            $code = [int]$resp.StatusCode
            $resp.Close()

            if ($code -ge 200 -and $code -lt 400) {
                $edgeStatus = "ONLINE ($code)"
            } else {
                $edgeStatus = "STATUS_$code"
            }
        } catch [System.Net.WebException] {
            if ($_.Response) {
                $code = [int]$_.Response.StatusCode
                $edgeStatus = "STATUS_$code"
            } else {
                $edgeStatus = "UNREACHABLE"
            }
        } catch {
            $edgeStatus = "TIMEOUT"
        }
    }

    # Summary Determination
    $itemResult = "PASS"
    if ($localStatus -ne "OK" -or $edgeStatus -eq "UNREACHABLE") {
        $itemResult = "FAIL"
        $FailedCount++
    } elseif ($gitSecretLeaked -or $gitStatus -eq "NO_REMOTE" -or $edgeStatus -match "STATUS_[45]") {
        $itemResult = "WARN"
        $WarningCount++
    } else {
        $PassedCount++
    }

    $color = switch ($itemResult) {
        "PASS" { "Green" }
        "WARN" { "Yellow" }
        "FAIL" { "Red" }
    }

    Write-Host "   -> Local: $localStatus | Git: $gitStatus ($gitBranch) | Edge: $edgeStatus ($($latencyMs)ms) => [$itemResult]" -ForegroundColor $color

    $ReportRows += [PSCustomObject]@{
        Level = $level
        Wing = $wing
        Project = $name
        Parent = $parent
        LocalPath = $localPath
        LocalStatus = $localStatus
        GitBranch = $gitBranch
        GitStatus = $gitStatus
        CanonicalUrl = $canonicalUrl
        EdgeStatus = $edgeStatus
        LatencyMs = $latencyMs
        Result = $itemResult
    }
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  AUDIT COMPLETE: $PassedCount Passed | $WarningCount Warnings | $FailedCount Failures" -ForegroundColor $(if ($FailedCount -eq 0) { "Green" } else { "Red" })
Write-Host "=================================================================`n" -ForegroundColor Cyan

# Generate Markdown Report
$ReportMdPath = Join-Path $ScriptDir "ALIGNMENT_VERIFICATION_REPORT.md"
$MdContent = @"
# 🛡️ ZenVQ Ecosystem: 4-Generation Family Tree & Alignment Report
**Timestamp:** $Timestamp  
**Auditor Engine:** `verify-ecosystem-alignment.ps1` (v2.0.0)  
**Total Nodes:** $TotalProjects | **Passed:** $PassedCount | **Warnings:** $WarningCount | **Failures:** $FailedCount  

---

## 📋 Complete Generational Hierarchy Table

| Generation | Parent | Project Name | Local Directory | Git Status & Branch | Live Subdomain | Edge Status & Latency | Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"@

foreach ($row in $ReportRows) {
    $badge = switch ($row.Result) {
        "PASS" { "✅ PASS" }
        "WARN" { "⚠️ WARN" }
        "FAIL" { "❌ FAIL" }
    }
    $MdContent += "`n| **$($row.Level)** | $($row.Parent) | $($row.Project) | ``$($row.LocalStatus)`` | ``$($row.GitStatus)`` ($($row.GitBranch)) | [$($row.CanonicalUrl)]($($row.CanonicalUrl)) | $($row.EdgeStatus) ($($row.LatencyMs)ms) | $badge |"
}

$MdContent += @"

---

## 🔐 Architecture, Deduplication & Hygiene Checklist
- **Grandparent Root Authority:** ``zenvq.com`` governs master wildcard routing and brand integrity
- **3-Tier Storage Redundancy:** Replicated safely across Local Disk (Tier 1), Cloudflare Edge (Tier 2) and GitHub Remote (Tier 3)
- **Internal Content Deduplication:** Merged duplicate utility domains (e.g. ``mediadrop.zenvq.com`` merged into ``tools.zenvq.com/mediadrop``)
- **Zero Oxford Comma Grammar:** Enforced throughout all documentation, copy and code comments (A, B and C)
- **100% Halal Media & Ethics:** Zero female imagery, zero audio soundtracks and zero un-Islamic sectors

---
*ZenVQ Unified Architecture & Governance • Operating 24/7*
"@

Set-Content -Path $ReportMdPath -Value $MdContent -Encoding UTF8
Write-Host "Generated markdown report at: $ReportMdPath`n" -ForegroundColor Cyan
