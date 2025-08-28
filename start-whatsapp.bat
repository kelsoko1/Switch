@echo off
echo ========================================
echo    Kijumbe WhatsApp Bot Startup
echo ========================================
echo.

echo Checking environment...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy env.example to .env and configure your Green-API settings
    echo.
    pause
    exit /b 1
)

echo.
echo Starting Kijumbe server with WhatsApp bot...
echo.
echo WhatsApp Bot Features:
echo - Automated responses to user messages
echo - Contribution processing via WhatsApp
echo - Group management assistance
echo - Real-time notifications
echo - Message templates and customization
echo.

echo Server will start on: http://localhost:3000
echo Admin Panel: http://localhost:3000/backend
echo WhatsApp Management: http://localhost:3000/backend#whatsapp
echo.

echo Starting server...
npm start

echo.
echo Server stopped. Press any key to exit...
pause >nul
