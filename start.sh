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