@echo off
echo Starting Kijumbe with Vite for development...
echo.

REM Check if frontend directory exists
if not exist "frontend" (
    echo Error: frontend directory not found!
    pause
    exit /b 1
)

REM Install frontend dependencies if node_modules doesn't exist
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

REM Start the development servers
echo Starting servers...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.

REM Start backend in background
start /b "Backend Server" cmd /c "node server.js"

REM Give backend time to start
timeout /t 3 /nobreak >nul

REM Start frontend
cd frontend
npm run dev

REM If we get here, frontend was stopped, so stop backend too
taskkill /f /im node.exe /t >nul 2>&1
echo.
echo Servers stopped.
pause
