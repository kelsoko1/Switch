@echo off
echo Starting Kijumbe Development Environment...
echo.

echo Starting Backend Server...
start cmd /k "cd %~dp0 && node src/server.js"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start cmd /k "cd %~dp0frontend && npm run dev"

echo.
echo Kijumbe Development Environment Started!
echo.
echo Backend: http://localhost:3000/api
echo Frontend: http://localhost:3001
echo.
echo Press any key to exit this window (servers will continue running)...
pause >nul
