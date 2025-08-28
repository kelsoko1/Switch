@echo off
echo ================================================
echo  KIJUMBE OPTIMIZED STARTUP - SERVER + BOT
echo  High-Performance WhatsApp Bot Integration
echo ================================================
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

echo.
echo [INFO] Starting optimized system...
echo [INFO] - Backend Server on port 3000
echo [INFO] - WhatsApp Bot with performance optimizations
echo [INFO] - Auto-start bot integration
echo [INFO] - Fast response times (1-2 seconds)
echo.
echo [INFO] Press Ctrl+C to stop all services
echo.

echo [PERFORMANCE] Bot optimizations enabled:
echo   ⚡ Message caching for instant responses
echo   🔄 Fast polling (1 second intervals)
echo   📊 Parallel message processing
echo   🚀 Response queue optimization
echo.

npm start

echo.
echo [INFO] All services stopped.
pause
