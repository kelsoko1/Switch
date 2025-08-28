@echo off
echo =================================================================
echo  KIJUMBE - COMPLETE APPWRITE INTEGRATION SETUP
echo =================================================================
echo.
echo This script will complete the setup after the Vite migration.
echo.

REM Check if we're in the right directory
if not exist "frontend" (
    echo Error: Please run this script from the kijumbe project root directory.
    pause
    exit /b 1
)

echo Step 1: Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
) else (
    echo Dependencies already installed.
)

echo.
echo Step 2: Creating environment file...
if not exist ".env" (
    echo Creating .env file from template...
    copy env.example .env >nul
    if errorlevel 1 (
        echo Warning: Could not copy .env file automatically.
        echo Please manually copy frontend\env.example to frontend\.env
    ) else (
        echo Environment file created successfully!
    )
) else (
    echo Environment file already exists.
)

echo.
echo Step 3: Building the project to verify setup...
echo Building frontend...
npm run build
if errorlevel 1 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo =================================================================
echo  SETUP COMPLETE!
echo =================================================================
echo.
echo Your Kijumbe webapp has been successfully migrated to Vite with 
echo the latest Appwrite integration (v17.0.0).
echo.
echo NEXT STEPS:
echo 1. Update frontend\.env with your actual Appwrite credentials
echo 2. Start development: start-vite.bat
echo 3. Access your app at: http://localhost:3001
echo.
echo FEATURES ADDED:
echo - Vite for faster development and builds
echo - Appwrite v17.0.0 with Pink Icons
echo - Modern Tailwind CSS v4 integration
echo - Enhanced UI with Inter and Poppins fonts
echo - Improved error handling and logging
echo.
echo Documentation: See VITE_MIGRATION.md for details
echo =================================================================
echo.
pause
