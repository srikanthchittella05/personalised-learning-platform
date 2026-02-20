#!/bin/bash
echo "=============================================="
echo "🚀 Starting Personalised Learning Platform"
echo "=============================================="

# Start backend in background
echo "[1/2] Starting FastAPI Backend on Port 8000..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

# Start frontend in foreground
echo "[2/2] Starting Next.js Frontend on Port 3000..."
cd frontend
npm install
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
