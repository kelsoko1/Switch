@echo off
echo ====================================
echo Building Frontend and Starting Server
echo ====================================

echo.
echo Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo.
echo Frontend built successfully!
echo.

cd ..
echo Starting server...
echo The website will be available at: http://localhost:3000
echo The API will be available at: http://localhost:3000/backend
echo.

call npm run dev

pause
