@echo off
echo Starting Kijumbe Rotational Savings Platform in Production Mode...
echo.

REM Set production environment
set NODE_ENV=production

REM Check if .env file exists
if not exist ".env" (
    echo Error: .env file not found!
    echo Please create a .env file based on env.example
    pause
    exit /b 1
)

REM Check if frontend is built
if not exist "frontend\build" (
    echo Building frontend...
    call npm run build
    if errorlevel 1 (
        echo Error: Frontend build failed!
        pause
        exit /b 1
    )
)

echo Starting production server...
npm start

pause
