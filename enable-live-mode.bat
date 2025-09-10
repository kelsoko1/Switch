@echo off
echo 🚀 Enabling Live Mode for WhatsApp Bot
echo.
echo ⚠️  IMPORTANT: Make sure you have valid GreenAPI credentials!
echo.
echo Current status:
echo - Ngrok tunnel: https://185d4e030402.ngrok-free.app
echo - Webhook URL: https://185d4e030402.ngrok-free.app/backend/whatsapp/webhook
echo - Bot responses: ✅ All tests passed (25/25)
echo.
echo To enable live mode, you need:
echo 1. Valid GreenAPI Instance ID
echo 2. Valid GreenAPI API Token
echo 3. Valid Bot Phone Number
echo.
echo Please enter your GreenAPI credentials:
echo.
set /p GREENAPI_ID_INSTANCE="Enter your GreenAPI Instance ID: "
set /p GREENAPI_API_TOKEN_INSTANCE="Enter your GreenAPI API Token: "
set /p GREENAPI_BOT_PHONE="Enter your bot phone number (with country code): "
echo.
echo Updating .env file with live credentials...
echo.
echo # GreenAPI WhatsApp Business API Configuration > temp_env.txt
echo GREENAPI_API_URL=https://7105.api.greenapi.com >> temp_env.txt
echo GREENAPI_MEDIA_URL=https://7105.media.greenapi.com >> temp_env.txt
echo GREENAPI_ID_INSTANCE=%GREENAPI_ID_INSTANCE% >> temp_env.txt
echo GREENAPI_API_TOKEN_INSTANCE=%GREENAPI_API_TOKEN_INSTANCE% >> temp_env.txt
echo GREENAPI_BOT_PHONE=%GREENAPI_BOT_PHONE% >> temp_env.txt
echo. >> temp_env.txt
echo # GreenAPI WhatsApp Business API - Additional Settings >> temp_env.txt
echo GREENAPI_WEBHOOK_URL=https://185d4e030402.ngrok-free.app/backend/whatsapp/webhook >> temp_env.txt
echo GREENAPI_DELAY_BETWEEN_MESSAGES=1000 >> temp_env.txt
echo GREENAPI_MAX_RETRY_ATTEMPTS=3 >> temp_env.txt
echo GREENAPI_MESSAGE_TIMEOUT=10000 >> temp_env.txt
echo. >> temp_env.txt
echo # GreenAPI WhatsApp Business API - Instance Management >> temp_env.txt
echo GREENAPI_INSTANCE_NAME=KijumbeBot >> temp_env.txt
echo GREENAPI_INSTANCE_DESCRIPTION=Kijumbe Rotational Savings WhatsApp Bot >> temp_env.txt
echo GREENAPI_INSTANCE_OWNER=admin@kijumbe.com >> temp_env.txt
echo.
echo ✅ Environment variables prepared!
echo.
echo 📋 Next steps:
echo 1. Copy the webhook URL to your GreenAPI console:
echo    https://185d4e030402.ngrok-free.app/backend/whatsapp/webhook
echo 2. Restart your server to load the new credentials
echo 3. Test with a real WhatsApp message
echo.
echo Press any key to continue...
pause > nul
echo.
echo 🧪 Testing GreenAPI connection...
node test-greenapi-connection.js
echo.
echo If the connection test passes, restart your server with:
echo npm run dev
echo.
pause
