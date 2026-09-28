@echo off
echo ========================================================
echo   Starting ResQ-GIS Full Stack (FastAPI + Vite)
echo ========================================================

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "ResQ-GIS Backend (FastAPI)" cmd /k "cd backend && .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Vite Frontend on http://localhost:3000 ...
start "ResQ-GIS Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo All services launched!
echo Access the GIS Command Dashboard at http://localhost:3000
echo ========================================================
