@echo off
echo ========================================
echo  KIJUMBE COMPLETE SYSTEM STARTUP
echo  Server + WhatsApp Bot + Frontend
echo ========================================
echo.

echo [INFO] Checking environment configuration...
if not exist .env (
    echo [ERROR] .env file not found!
    echo [INFO] Please copy env.example to .env and configure it
    pause
    exit /b 1
)

echo [INFO] Installing/updating dependencies...
call npm install

echo [INFO] Building frontend...
call npm run build

echo.
echo [INFO] Starting complete system...
echo [INFO] - Backend Server on port 3000
echo [INFO] - WhatsApp Bot automation
echo [INFO] - Frontend served from backend
echo.
echo [INFO] Press Ctrl+C to stop all services
echo.

npm run start:all

echo.
echo [INFO] All services stopped.
pause
