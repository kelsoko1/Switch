@echo off
echo =====================================
echo  KIJUMBE WHATSAPP BOT - NODE.JS v2.0
echo  Starting WhatsApp Bot for Rotational Savings
echo =====================================
echo.

echo [INFO] Checking environment configuration...
if not exist .env (
    echo [ERROR] .env file not found!
    echo [INFO] Please copy env.example to .env and configure it
    pause
    exit /b 1
)

echo [INFO] Installing/updating dependencies...
call npm install

echo.
echo [INFO] Starting WhatsApp Bot...
echo [INFO] Press Ctrl+C to stop the bot
echo.

npm run bot

echo.
echo [INFO] Bot stopped.
pause
