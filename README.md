# Network-D

![logo](logo.svg)

Network-D is an educational network lab platform combining a Next.js course site with a Python-based iPerf3/tcpdump dashboard.

## Features

- **Course Content**: Network fundamentals, switching, routing, programming, services, analysis, monitoring, automation, security, performance
- **Interactive Lessons**: 7 lessons (0-6) with fullscreen slides, drawing/annotation, keyboard navigation
- **iPerf3 Dashboard**: Command builder with live SSE throughput charts, history
- **Packet Analysis**: tcpdump capture dashboard, Scapy packet runner, Wireshark/tshark analysis
- **Network Tools**: Topology designer, traceroute, subnet calculator
- **Labs & Assessment**: Practical exercises, grading rubrics, admin dashboard

## Quick Start (Docker)

```bash
docker run --rm -it --net=host --cap-add=NET_ADMIN --cap-add=NET_RAW -p 8765:8765 -p 3000:3000 maae120617/network-d
```

Open http://localhost:3000 (main app) and http://localhost:8765 (iPerf3 dashboard)

---

## Native Installation

### Prerequisites

| Component | Minimum Version | Purpose |
|-----------|----------------|---------|
| Node.js | 18+ (LTS recommended) | Next.js 15 frontend |
| Python | 3.8+ | iPerf3/tcpdump dashboard |
| iperf3 | Latest | Bandwidth testing |
| tcpdump / WinDump | Latest | Packet capture (optional) |
| Npcap (Windows) | Latest | Required for tcpdump on Windows |

---

### macOS Installation

**Automated (recommended):**

```bash
# Clone or download the project
cd network-d

# Make executable and run
chmod +x install-macos.sh
./install-macos.sh
```

**Manual:**

```bash
# 1. Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install dependencies
brew update
brew install node@20 python@3.11 iperf3 tcpdump

# 3. Link Node.js 20
brew link node@20 --force --overwrite

# 4. Install project dependencies
cd network-d
npm install

# 5. Run servers
# Terminal 1:
python3 server.py

# Terminal 2:
npm run dev
```

---

### Windows Installation

**Automated (PowerShell, run as Administrator):**

```powershell
# Clone or download the project
cd network-d

# Run installer (right-click → "Run with PowerShell" as Administrator)
.\install-windows.ps1

# Or with options:
.\install-windows.ps1 -BuildProduction   # Build for production
.\install-windows.ps1 -SkipTcpdump       # Skip WinDump installation
```

**Manual (using winget):**

```powershell
# 1. Install dependencies via winget (Windows 10 1809+ / Windows 11)
winget install OpenJS.NodeJS.LTS Python.Python.3.11 iperf3.iperf3 WinDump.WinDump

# 2. Install Npcap (required for tcpdump/WinDump)
# Download from: https://npcap.com/#download

# 3. Restart terminal/PowerShell to refresh PATH

# 4. Install project dependencies
cd network-d
npm install

# 5. Run servers
# Terminal 1:
python server.py

# Terminal 2:
npm run dev
```

**Quick Start (Batch file - double-click):**

```cmd
start.bat
```

Opens two command windows: one for Python dashboard (port 8765), one for Next.js (port 3000).

---

## Running the Application

### Development Mode

```bash
# Terminal 1 - Python Dashboard (port 8765)
python3 server.py    # macOS/Linux
python server.py     # Windows

# Terminal 2 - Next.js Dev Server (port 3000)
npm run dev
```

Open http://localhost:3000

### Production Mode

```bash
# Build
npm run build

# Start production server
npm run start

# Python dashboard still runs separately
python3 server.py
```

### Quick Start Scripts

| Platform | Script | Description |
|----------|--------|-------------|
| macOS/Linux | `./start.sh` | Starts both servers in one terminal |
| Windows | `.\start.ps1` | Starts both servers (PowerShell) |
| Windows | `start.bat` | Starts both servers in separate windows (double-click) |

---

## Project Structure

```
network-d/
├── app/                    # Next.js 15 App Router pages
│   ├── lessons/[n]/        # Lesson slides with fullscreen/drawing
│   ├── topology/           # Network topology designer
│   ├── iperf/              # iPerf3 testing
│   ├── tcpdump/            # Packet capture
│   ├── scapy/              # Scapy runner
│   ├── traceroute/         # Path tracing
│   ├── practical/          # Lab exercises
│   ├── assessment/         # Grading criteria
│   └── admin/              # Admin dashboard
├── components/             # React components
├── lib/                    # Shared utilities & course data
├── public/                 # Static assets
├── static/                 # Python server static files
├── server.py               # Python iPerf3/tcpdump dashboard
├── install-macos.sh        # macOS installer
├── install-windows.ps1     # Windows installer (PowerShell)
├── start.sh                # Quick start (macOS/Linux)
├── start.ps1               # Quick start (Windows PowerShell)
├── start.bat               # Quick start (Windows batch)
└── package.json            # Node.js dependencies
```

---

## Keyboard Shortcuts (Lesson Slides)

| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |
| `D` | Toggle draw/annotate mode |
| `←` / `→` | Previous / Next slide |
| `Space` | Next slide |
| `Home` / `End` | First / Last slide |
| `Esc` | Exit fullscreen or draw mode |
| `Auto-slide` | Checkbox in toolbar (5s interval) |

---

## Ports

| Port | Service |
|------|---------|
| 3000 | Next.js frontend (dev) |
| 3000 | Next.js frontend (production) |
| 8765 | Python iPerf3/tcpdump dashboard |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `IPERF_HOST` | 127.0.0.1 | Python server bind address |
| `IPERF_PORT` | 8765 | Python server port |
| `IPERF_BIN` | iperf3 | Path to iperf3 binary |
| `TCPDUMP_BIN` | tcpdump | Path to tcpdump binary |

---

## Troubleshooting

### "command not found: node/npm/python"
- Restart terminal after installation
- Check PATH includes installation directories
- macOS: `eval "$(/opt/homebrew/bin/brew shellenv)"` (Apple Silicon)
- Windows: Restart PowerShell as Administrator

### "Port already in use"
- Kill existing processes: `lsof -ti:3000,8765 | xargs kill -9` (macOS)
- Windows: `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`

### tcpdump/WinDump permission errors
- macOS: Run with `sudo` or configure `chmod +s /usr/sbin/tcpdump`
- Windows: Install Npcap with "WinPcap API-compatible Mode" checked
- Run terminal as Administrator

### Python server fails to start
- Check Python version: `python --version` (needs 3.8+)
- Verify iperf3 installed: `iperf3 --version`
- Check port 8765 not blocked by firewall

---

## License

Copyright (c) 2026 maaeyeng. All rights reserved.

Educational use for network engineering courses.