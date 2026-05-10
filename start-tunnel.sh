#!/bin/bash
# ─── TheChatNest HTTPS Tunnel Setup ─────────────────────────
# Creates HTTPS tunnels for both backend and frontend
# so video call, screen share, etc. work on any device
#
# Usage: bash start-tunnel.sh
# ──────────────────────────────────────────────────────────

echo ""
echo "=========================================="
echo "  TheChatNest HTTPS Tunnel Setup"
echo "=========================================="
echo ""

# Start backend tunnel (port 5000)
echo "[1/2] Starting backend tunnel (port 5000)..."
npx localtunnel --port 5000 --subdomain thechatnest-api &
BACKEND_PID=$!
sleep 3

# Start frontend tunnel (port 5173)
echo "[2/2] Starting frontend tunnel (port 5173)..."
npx localtunnel --port 5173 --subdomain thechatnest-app &
FRONTEND_PID=$!
sleep 3

echo ""
echo "=========================================="
echo "  TUNNELS READY!"
echo "=========================================="
echo ""
echo "  Backend:  https://thechatnest-api.loca.lt"
echo "  Frontend: https://thechatnest-app.loca.lt"
echo ""
echo "  Share this link with anyone:"
echo "  https://thechatnest-app.loca.lt"
echo ""
echo "  Press Ctrl+C to stop tunnels"
echo "=========================================="
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
