@echo off
echo ====================================
echo Starting Kijumbe Frontend Development Server
echo ====================================

echo.
echo This will start the frontend development server on port 3001
echo Make sure the backend server is running on port 3000
echo.

cd frontend

echo Installing dependencies...
call npm install

echo.
echo Starting frontend development server...
echo The frontend will be available at: http://localhost:3001
echo.

call npm run dev

pause
