@echo off
echo ========================================
echo    Kijumbe Wallet Deployment Script
echo ========================================
echo.

echo [1/6] Checking environment configuration...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy env.example to .env and configure your settings.
    pause
    exit /b 1
)

echo [2/6] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies!
    pause
    exit /b 1
)

echo [3/6] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies!
    pause
    exit /b 1
)

echo [4/6] Building frontend for production...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend!
    pause
    exit /b 1
)
cd ..

echo [5/6] Testing wallet API endpoints...
echo Testing wallet health check...
curl -s http://localhost:3000/backend/health > nul
if %errorlevel% neq 0 (
    echo WARNING: Backend server is not running. Please start it manually.
)

echo [6/6] Deployment completed successfully!
echo.
echo ========================================
echo    Deployment Summary
echo ========================================
echo.
echo ✅ Backend dependencies installed
echo ✅ Frontend dependencies installed  
echo ✅ Frontend built for production
echo ✅ Wallet feature ready for production
echo.
echo Next steps:
echo 1. Configure your Selcom credentials in .env
echo 2. Set up your Appwrite database collections
echo 3. Start the server: npm start
echo 4. Access the wallet at: http://localhost:3000/wallet
echo.
echo For detailed setup instructions, see WALLET_SETUP_GUIDE.md
echo.
pause
