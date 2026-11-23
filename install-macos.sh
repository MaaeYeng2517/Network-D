#!/bin/bash
# Network Course Platform - macOS Installation Script
# Usage: chmod +x install-macos.sh && ./install-macos.sh

set -e

echo "========================================="
echo "Network Course Platform - macOS Installer"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check macOS version
macos_version=$(sw_vers -productVersion)
log_info "macOS version: $macos_version"

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    log_warn "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # Add Homebrew to PATH for Apple Silicon
    if [[ $(uname -m) == "arm64" ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    log_info "Homebrew found: $(brew --version | head -1)"
fi

# Update Homebrew
log_info "Updating Homebrew..."
brew update

# Check/Install Node.js
log_info "Checking Node.js..."
if ! command -v node &> /dev/null; then
    log_warn "Node.js not found. Installing Node.js 20 (LTS)..."
    brew install node@20
    brew link node@20 --force --overwrite
else
    node_version=$(node --version)
    log_info "Node.js found: $node_version"
    # Check if version is 18+
    major_version=$(echo $node_version | sed 's/v//' | cut -d. -f1)
    if [ "$major_version" -lt 18 ]; then
        log_warn "Node.js version < 18. Upgrading to Node.js 20..."
        brew install node@20
        brew link node@20 --force --overwrite
    fi
fi

# Check/Install Python 3
log_info "Checking Python 3..."
if ! command -v python3 &> /dev/null; then
    log_warn "Python 3 not found. Installing Python 3.11..."
    brew install python@3.11
    brew link python@3.11 --force --overwrite
else
    python_version=$(python3 --version)
    log_info "Python 3 found: $python_version"
fi

# Check/Install iperf3
log_info "Checking iperf3..."
if ! command -v iperf3 &> /dev/null; then
    log_warn "iperf3 not found. Installing iperf3..."
    brew install iperf3
else
    iperf_version=$(iperf3 --version 2>&1 | head -1)
    log_info "iperf3 found: $iperf_version"
fi

# Check/Install tcpdump (optional but recommended)
log_info "Checking tcpdump..."
if ! command -v tcpdump &> /dev/null; then
    log_warn "tcpdump not found. Installing tcpdump (requires admin)..."
    brew install tcpdump
    log_warn "Note: tcpdump requires sudo to capture packets. Run with 'sudo tcpdump' or configure permissions."
else
    tcpdump_version=$(tcpdump --version 2>&1 | head -1)
    log_info "tcpdump found: $tcpdump_version"
fi

# Navigate to project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

log_info "Project directory: $PROJECT_DIR"

# Install Node.js dependencies
log_info "Installing Node.js dependencies (npm install)..."
npm install

# Create results.json if not exists
if [ ! -f "results.json" ]; then
    echo "[]" > results.json
    log_info "Created results.json"
fi

if [ ! -f "tcpdump_results.json" ]; then
    echo "[]" > tcpdump_results.json
    log_info "Created tcpdump_results.json"
fi

# Build Next.js for production (optional)
read -p "Build for production? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Building Next.js for production..."
    npm run build
fi

echo ""
echo "========================================="
echo -e "${GREEN}Installation Complete!${NC}"
echo "========================================="
echo ""
echo "To run the application:"
echo ""
echo "  Terminal 1 - Python iPerf3 Dashboard (port 8765):"
echo "    python3 server.py"
echo ""
echo "  Terminal 2 - Next.js Dev Server (port 3000):"
echo "    npm run dev"
echo ""
echo "  Or production mode:"
echo "    npm run start"
echo ""
echo "Then open in browser:"
echo "  - Main app: http://localhost:3000"
echo "  - iPerf3 Dashboard: http://localhost:8765"
echo ""
echo "Available pages:"
echo "  - /            : Home page with course overview"
echo "  - /lessons     : All lessons (0-6)"
echo "  - /lessons/[n] : Lesson detail with slides"
echo "  - /topology    : Network topology designer"
echo "  - /iperf       : iPerf3 testing tool"
echo "  - /tcpdump     : Packet capture tool"
echo "  - /tshark      : Wireshark/tshark analysis"
echo "  - /scapy       : Scapy packet crafting"
echo "  - /traceroute  : Network path tracing"
echo "  - /practical   : Lab exercises"
echo "  - /assessment  : Grading criteria"
echo "  - /admin       : Admin dashboard"
echo ""
echo "Keyboard shortcuts in lessons:"
echo "  F        - Fullscreen"
echo "  D        - Draw/annotate mode"
echo "  ← / →    - Previous/Next slide"
echo "  Space    - Next slide"
echo "  Home/End - First/Last slide"
echo "  Esc      - Exit fullscreen/draw mode"
echo ""

# Create launch script
cat > start.sh << 'EOF'
#!/bin/bash
# Quick start script for Network Course Platform

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "Starting Network Course Platform..."
echo "Project: $PROJECT_DIR"
echo ""

# Start Python server in background
echo "Starting Python iPerf3 Dashboard on port 8765..."
python3 server.py &
PYTHON_PID=$!
echo "Python PID: $PYTHON_PID"

# Wait a moment for Python server to start
sleep 2

# Start Next.js dev server
echo "Starting Next.js on port 3000..."
npm run dev &
NEXTJS_PID=$!
echo "Next.js PID: $NEXTJS_PID"

echo ""
echo "Both servers started!"
echo "  - Main app: http://localhost:3000"
echo "  - iPerf3 Dashboard: http://localhost:8765"
echo ""
echo "Press Ctrl+C to stop both servers"

# Trap Ctrl+C to kill both processes
trap "kill $PYTHON_PID $NEXTJS_PID 2>/dev/null; echo 'Servers stopped.'; exit 0" INT

# Wait for both processes
wait $PYTHON_PID $NEXTJS_PID
EOF

chmod +x start.sh
log_info "Created start.sh for quick launching"

echo ""
echo "Quick start: ./start.sh"
echo ""