@echo off
echo ==============================================
echo 🚀 Starting Personalised Learning Platform
echo ==============================================

echo [1/2] Starting FastAPI Backend on Port 8000...
start cmd /k "cd backend && python -m venv venv && call venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn main:app --reload"

echo [2/2] Starting Next.js Frontend on Port 3000...
start cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ✅ Services are starting in separate windows.
echo 🌐 Frontend will be available at: http://localhost:3000
echo 🔌 Backend API will be available at: http://localhost:8000
