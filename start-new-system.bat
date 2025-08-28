@echo off
echo ========================================
echo    KIJUMBE SUPERADMIN SYSTEM v2.0
echo ========================================
echo.
echo 🚀 Starting Completely Rebuilt System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
)

if not exist "frontend/node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)

echo ✅ Dependencies installed
echo.

REM Build frontend
echo 🏗️  Building frontend...
cd frontend
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)
cd ..
echo ✅ Frontend built successfully
echo.

echo 🚀 Starting New Superadmin System...
echo.
echo 📍 Backend: http://localhost:3000
echo 📍 Frontend: http://localhost:3000 (served from backend)
echo 📍 Login: http://localhost:3000/login
echo.
echo 🔑 Superadmin Credentials:
echo    Email: admin@kijumbe.com
echo    Password: admin123456
echo.
echo ✨ New Features:
echo    - Completely rebuilt from scratch
echo    - Clean, simple architecture
echo    - Beautiful modern UI
echo    - No more API errors
echo    - Direct backend communication
echo.
echo ========================================
echo.

REM Start the backend server
echo Starting backend server...
start "Kijumbe Backend v2.0" cmd /k "node server.js"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

echo ✅ System started successfully!
echo.
echo 🌐 Access your new superadmin system at:
echo    http://localhost:3000/login
echo.
echo 🧪 Test the system:
echo    Open test-new-system.html in your browser
echo.
echo Press any key to open the login page...
pause >nul

REM Open the login page
start http://localhost:3000/login

echo.
echo 🎉 New Kijumbe System v2.0 is ready!
echo.
echo 💡 What's New:
echo    - Clean, simple backend authentication
echo    - Modern, beautiful frontend
echo    - No complex integrations
echo    - Direct API communication
echo    - Better error handling
echo    - Improved user experience
echo.
pause
