#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Colours
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cleanup() {
  echo -e "\n${YELLOW}Shutting down all processes...${NC}"
  kill $OLLAMA_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $OLLAMA_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo -e "${GREEN}All processes stopped.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ─── 1. Ollama ────────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/4]${NC} Starting Ollama server..."
unset OLLAMA_MODELS
mkdir -p /tmp/ollama_models
OLLAMA_MODELS=/tmp/ollama_models ollama serve &>/tmp/ollama.log &
OLLAMA_PID=$!

# Wait for Ollama to be ready
for i in $(seq 1 15); do
  if curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Ollama ready"
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo -e "  ${RED}✗${NC} Ollama failed to start. Check /tmp/ollama.log"
    exit 1
  fi
  sleep 1
done

# ─── 2. Backend dependencies ─────────────────────────────────────────────────
echo -e "${BLUE}[2/4]${NC} Installing backend dependencies..."
cd backend
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt
cd "$SCRIPT_DIR"

# ─── 3. Backend server ───────────────────────────────────────────────────────
echo -e "${BLUE}[3/4]${NC} Starting Python backend (port 8000)..."
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000 &>/tmp/backend.log &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

# Wait for backend
for i in $(seq 1 15); do
  if curl -s http://127.0.0.1:8000/health >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Backend ready"
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo -e "  ${YELLOW}⚠${NC} Backend did not respond — continuing anyway"
  fi
  sleep 1
done

# ─── 4. Frontend ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/4]${NC} Starting Next.js frontend (port 3000)..."
npm install --silent 2>/dev/null
npm run dev &>/tmp/frontend.log &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  All systems running!${NC}"
echo -e "  Frontend : ${BLUE}http://localhost:3000${NC}"
echo -e "  Backend  : ${BLUE}http://localhost:8000${NC}"
echo -e "  Ollama   : ${BLUE}http://localhost:11434${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop all processes."
echo ""

# Wait for frontend — the last process — so Ctrl+C works on it
wait $FRONTEND_PID
