@echo off
echo 🔄 Restarting Kijumbe Server...
echo.

echo 🛑 Stopping any running processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im ngrok.exe 2>nul

echo.
echo ⏳ Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Starting server...
npm run dev

pause
