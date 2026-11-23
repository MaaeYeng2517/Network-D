<# 
.SYNOPSIS
    Network Course Platform - Windows Installation Script

.DESCRIPTION
    Installs all dependencies for the Network Course Platform on Windows:
    - Node.js (via winget or Chocolatey)
    - Python 3 (via winget or Chocolatey)
    - iperf3 (via winget or Chocolatey)
    - tcpdump/WinDump (optional)
    - npm dependencies

.USAGE
    PowerShell -ExecutionPolicy Bypass -File install-windows.ps1
    Or right-click and "Run with PowerShell"

.NOTES
    Requires Administrator privileges for some installations.
    Run PowerShell as Administrator.
#>

param(
    [switch]$SkipNode,
    [switch]$SkipPython,
    [switch]$SkipIperf3,
    [switch]$SkipTcpdump,
    [switch]$BuildProduction
)

# Colors for output
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red
$Cyan = [ConsoleColor]::Cyan
$Gray = [ConsoleColor]::Gray

function Write-Log {
    param([string]$Message, [ConsoleColor]$Color = $Gray)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor $Gray
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info { param([string]$Message) Write-Log $Message $Green }
function Write-Warn { param([string]$Message) Write-Log $Message $Yellow }
function Write-Error { param([string]$Message) Write-Log $Message $Red }

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warn "Not running as Administrator. Some installations may fail."
    Write-Warn "Right-click PowerShell and select 'Run as Administrator' for best results."
    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host "Network Course Platform - Windows Installer" -ForegroundColor $Cyan
Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host ""

# Check Windows version
$osInfo = Get-ComputerInfo
Write-Info "Windows: $($osInfo.WindowsProductName) $($osInfo.WindowsVersion) Build $($osInfo.OsBuildNumber)"

# Detect package manager (prefer winget, fallback to choco)
$hasWinget = Get-Command winget -ErrorAction SilentlyContinue
$hasChoco = Get-Command choco -ErrorAction SilentlyContinue

if ($hasWinget) {
    Write-Info "Package manager: winget (Windows Package Manager)"
    $pkgMgr = "winget"
} elseif ($hasChoco) {
    Write-Info "Package manager: Chocolatey"
    $pkgMgr = "choco"
} else {
    Write-Warn "No package manager found (winget or Chocolatey)."
    Write-Warn "Installing winget via Microsoft Store..."
    try {
        # winget is usually pre-installed on Windows 10 1809+ / Windows 11
        # If not, user needs to install from Microsoft Store manually
        Write-Warn "Please install 'App Installer' from Microsoft Store to get winget"
        Write-Warn "Or install Chocolatey: Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
        exit 1
    } catch {
        Write-Error "Failed to detect package manager. Please install winget or Chocolatey manually."
        exit 1
    }
}

# Helper function to install via package manager
function Install-Package {
    param([string]$Name, [string]$Id, [switch]$Force)
    
    if (Get-Command $Name -ErrorAction SilentlyContinue -and -not $Force) {
        Write-Info "$Name already installed: $($Name --version 2>&1 | Select-Object -First 1)"
        return $true
    }
    
    Write-Info "Installing $Name..."
    try {
        if ($pkgMgr -eq "winget") {
            winget install --id $Id --accept-source-agreements --accept-package-agreements
        } else {
            choco install $Id -y
        }
        Write-Info "$Name installed successfully"
        return $true
    } catch {
        Write-Error "Failed to install $Name"
        return $false
    }
}

# Install Node.js
if (-not $SkipNode) {
    Write-Host ""
    Write-Info "=== Node.js ==="
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVer = node --version
        Write-Info "Node.js found: $nodeVer"
        $major = [int]($nodeVer.TrimStart('v').Split('.')[0])
        if ($major -lt 18) {
            Write-Warn "Node.js version < 18. Upgrading..."
            Install-Package "node" "OpenJS.NodeJS.LTS" -Force
        }
    } else {
        Install-Package "node" "OpenJS.NodeJS.LTS"
    }
    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Install Python 3
if (-not $SkipPython) {
    Write-Host ""
    Write-Info "=== Python 3 ==="
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $pyVer = python --version
        Write-Info "Python found: $pyVer"
    } elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
        $pyVer = python3 --version
        Write-Info "Python found: $pyVer"
    } else {
        if ($pkgMgr -eq "winget") {
            Install-Package "python" "Python.Python.3.11"
        } else {
            Install-Package "python" "python311"
        }
    }
    $env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Install iperf3
if (-not $SkipIperf3) {
    Write-Host ""
    Write-Info "=== iperf3 ==="
    if (Get-Command iperf3 -ErrorAction SilentlyContinue) {
        $iperfVer = iperf3 --version 2>&1 | Select-Object -First 1
        Write-Info "iperf3 found: $iperfVer"
    } else {
        if ($pkgMgr -eq "winget") {
            Install-Package "iperf3" "iperf3.iperf3"
        } else {
            Install-Package "iperf3" "iperf3"
        }
    }
}

# Install tcpdump/WinDump (optional)
if (-not $SkipTcpdump) {
    Write-Host ""
    Write-Info "=== tcpdump/WinDump ==="
    if (Get-Command tcpdump -ErrorAction SilentlyContinue) {
        $tcpVer = tcpdump --version 2>&1 | Select-Object -First 1
        Write-Info "tcpdump found: $tcpVer"
    } else {
        Write-Warn "tcpdump/WinDump not found. Installing..."
        if ($pkgMgr -eq "winget") {
            # WinDump is the Windows port of tcpdump
            Install-Package "WinDump" "WinDump.WinDump" -ErrorAction SilentlyContinue
        } else {
            Install-Package "WinDump" "windump"
        }
        Write-Warn "Note: WinDump/tcpdump requires WinPcap or Npcap. Install Npcap from https://npcap.com/#download"
    }
}

# Navigate to project directory
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $projectDir
Write-Host ""
Write-Info "Project directory: $projectDir"

# Install npm dependencies
Write-Host ""
Write-Info "=== Installing npm dependencies ==="
try {
    npm install
    Write-Info "npm install completed"
} catch {
    Write-Error "npm install failed"
    exit 1
}

# Create results.json files
if (-not (Test-Path "results.json")) {
    "[]" | Out-File -FilePath "results.json" -Encoding utf8
    Write-Info "Created results.json"
}
if (-not (Test-Path "tcpdump_results.json")) {
    "[]" | Out-File -FilePath "tcpdump_results.json" -Encoding utf8
    Write-Info "Created tcpdump_results.json"
}

# Build for production if requested
if ($BuildProduction) {
    Write-Host ""
    Write-Info "=== Building for production ==="
    try {
        npm run build
        Write-Info "Build completed"
    } catch {
        Write-Error "Build failed"
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host "Installation Complete!" -ForegroundColor $Green
Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host ""

Write-Host "To run the application:" -ForegroundColor $Cyan
Write-Host ""
Write-Host "  Terminal 1 (PowerShell) - Python iPerf3 Dashboard (port 8765):" -ForegroundColor $Yellow
Write-Host "    python server.py"
Write-Host ""
Write-Host "  Terminal 2 (PowerShell) - Next.js Dev Server (port 3000):" -ForegroundColor $Yellow
Write-Host "    npm run dev"
Write-Host ""
Write-Host "  Or production mode:" -ForegroundColor $Yellow
Write-Host "    npm run start"
Write-Host ""
Write-Host "Then open in browser:" -ForegroundColor $Cyan
Write-Host "  - Main app: http://localhost:3000"
Write-Host "  - iPerf3 Dashboard: http://localhost:8765"
Write-Host ""
Write-Host "Available pages:" -ForegroundColor $Cyan
Write-Host "  /            - Home page with course overview"
Write-Host "  /lessons     - All lessons (0-6)"
Write-Host "  /lessons/[n] - Lesson detail with slides"
Write-Host "  /topology    - Network topology designer"
Write-Host "  /iperf       - iPerf3 testing tool"
Write-Host "  /tcpdump     - Packet capture tool"
Write-Host "  /tshark      - Wireshark/tshark analysis"
Write-Host "  /scapy       - Scapy packet crafting"
Write-Host "  /traceroute  - Network path tracing"
Write-Host "  /practical   - Lab exercises"
Write-Host "  /assessment  - Grading criteria"
Write-Host "  /admin       - Admin dashboard"
Write-Host ""
Write-Host "Keyboard shortcuts in lessons:" -ForegroundColor $Cyan
Write-Host "  F        - Fullscreen"
Write-Host "  D        - Draw/annotate mode"
Write-Host "  Left/Right - Previous/Next slide"
Write-Host "  Space    - Next slide"
Write-Host "  Home/End - First/Last slide"
Write-Host "  Esc      - Exit fullscreen/draw mode"
Write-Host ""

# Create start.ps1 for quick launch
$startScript = @"
# Quick start script for Network Course Platform
\$projectDir = "$projectDir"
Set-Location \$projectDir

Write-Host "Starting Network Course Platform..." -ForegroundColor Cyan
Write-Host "Project: \$projectDir"
Write-Host ""

# Start Python server in background
Write-Host "Starting Python iPerf3 Dashboard on port 8765..." -ForegroundColor Yellow
\$pythonProcess = Start-Process python -ArgumentList "server.py" -PassThru -WindowStyle Hidden
Write-Host "Python PID: \$(\$pythonProcess.Id)"

# Wait a moment for Python server to start
Start-Sleep -Seconds 2

# Start Next.js dev server
Write-Host "Starting Next.js on port 3000..." -ForegroundColor Yellow
\$nextjsProcess = Start-Process npm -ArgumentList "run dev" -PassThru

Write-Host ""
Write-Host "Both servers started!" -ForegroundColor Green
Write-Host "  - Main app: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - iPerf3 Dashboard: http://localhost:8765" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Gray

# Handle Ctrl+C
try {
    Wait-Process -Id \$pythonProcess.Id, \$nextjsProcess.Id -ErrorAction SilentlyContinue
} catch {
    Stop-Process -Id \$pythonProcess.Id, \$nextjsProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Servers stopped." -ForegroundColor Yellow
}
"@

$startScript | Out-File -FilePath "start.ps1" -Encoding utf8
Write-Info "Created start.ps1 for quick launching"

Write-Host ""
Write-Host "Quick start: .\start.ps1" -ForegroundColor $Cyan
Write-Host "(Right-click start.ps1 → 'Run with PowerShell')" -ForegroundColor $Gray
Write-Host ""