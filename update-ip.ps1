# ============================================================
# ARound BulSU - IP Address Update Script
# ============================================================
# Run this script whenever you change networks to automatically
# update all configuration files with your current IP address.
#
# Usage:
#   .\update-ip.ps1           # Auto-detect IP
#   .\update-ip.ps1 -Manual   # Manually enter IP
# ============================================================

param(
    [switch]$Manual
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "[->] $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[X] $msg" -ForegroundColor Red }

# Get the script's directory (project root)
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   ARound BulSU - Network Configuration    " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# ============================================================
# Get IP Address
# ============================================================

function Get-LocalIPAddress {
    # Get all IPv4 addresses that are not loopback and are connected
    $ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | 
        Where-Object { 
            $_.IPAddress -ne "127.0.0.1" -and 
            $_.PrefixOrigin -ne "WellKnown" -and
            ($_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*")
        } |
        Select-Object -ExpandProperty IPAddress

    if ($ipAddresses -is [array]) {
        return $ipAddresses[0]  # Return first valid IP
    }
    return $ipAddresses
}

if ($Manual) {
    $NewIP = Read-Host "Enter your IP address"
    if (-not ($NewIP -match '^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$')) {
        Write-Err "Invalid IP address format!"
        exit 1
    }
} else {
    $NewIP = Get-LocalIPAddress
    if (-not $NewIP) {
        Write-Err "Could not auto-detect IP address. Please use -Manual flag."
        exit 1
    }
}

Write-Info "Detected IP Address: $NewIP"
Write-Host ""

# ============================================================
# Define files to update
# ============================================================

$Port = "3001"
$ApiUrl = "http://${NewIP}:${Port}/api"
$BaseUrl = "http://${NewIP}:${Port}"

$FilesToUpdate = @(
    @{
        Path = "$ProjectRoot\mobile-app\src\services\apiService.js"
        Pattern = "const API_BASE_URL = 'http://[^']+/api';"
        Replacement = "const API_BASE_URL = '$ApiUrl';"
        Description = "Mobile App - API Service"
    },
    @{
        Path = "$ProjectRoot\mobile-app\src\services\emergencyService.js"
        Pattern = "const API_BASE_URL = 'http://[^']+/api';"
        Replacement = "const API_BASE_URL = '$ApiUrl';"
        Description = "Mobile App - Emergency Service"
    },
    @{
        Path = "$ProjectRoot\admin-app\src\services\apiService.js"
        Pattern = "const API_BASE_URL = 'http://[^']+/api';"
        Replacement = "const API_BASE_URL = 'http://localhost:${Port}/api';"
        Description = "Admin App - API Service (localhost)"
    },
    @{
        Path = "$ProjectRoot\admin-app\.env"
        Pattern = "VITE_API_URL=http://[^\r\n]+"
        Replacement = "VITE_API_URL=http://localhost:${Port}"
        Description = "Admin App - Environment Config (localhost)"
    }
)

# ============================================================
# Update files
# ============================================================

Write-Host "Updating configuration files..." -ForegroundColor White
Write-Host ""

$UpdatedCount = 0
$ErrorCount = 0

foreach ($file in $FilesToUpdate) {
    $filePath = $file.Path
    $fileName = Split-Path -Leaf $filePath
    
    if (-not (Test-Path $filePath)) {
        Write-Warn "$($file.Description): File not found - $fileName"
        continue
    }
    
    try {
        $content = Get-Content $filePath -Raw
        $newContent = $content -replace $file.Pattern, $file.Replacement
        
        if ($content -ne $newContent) {
            Set-Content -Path $filePath -Value $newContent -NoNewline
            Write-Success "$($file.Description)"
            $UpdatedCount++
        } else {
            Write-Info "$($file.Description) - Already up to date"
        }
    } catch {
        Write-Err "$($file.Description): $($_.Exception.Message)"
        $ErrorCount++
    }
}

# ============================================================
# Summary
# ============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "                 Summary                   " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  IP Address:    " -NoNewline; Write-Host $NewIP -ForegroundColor Yellow
Write-Host "  Port:          " -NoNewline; Write-Host $Port -ForegroundColor Yellow
Write-Host "  Mobile API:    " -NoNewline; Write-Host $ApiUrl -ForegroundColor Cyan
Write-Host "  Admin API:     " -NoNewline; Write-Host "http://localhost:${Port}/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Files Updated: " -NoNewline; Write-Host $UpdatedCount -ForegroundColor Green
if ($ErrorCount -gt 0) {
    Write-Host "  Errors:        " -NoNewline; Write-Host $ErrorCount -ForegroundColor Red
}
Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# ============================================================
# Next Steps
# ============================================================

Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Start the backend:  " -NoNewline; Write-Host "cd backend; npm start" -ForegroundColor Gray
Write-Host "  2. Start the admin app:" -NoNewline; Write-Host " cd admin-app; npm run dev" -ForegroundColor Gray
Write-Host "  3. Start the mobile app:" -NoNewline; Write-Host " cd mobile-app; npx expo start" -ForegroundColor Gray
Write-Host ""
Write-Host "Make sure your phone is on the same WiFi network as this laptop!" -ForegroundColor Yellow
Write-Host ""
