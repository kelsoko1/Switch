@echo off
echo 🚀 Setting up GreenAPI credentials for WhatsApp Bot
echo.
echo You need to get these credentials from your GreenAPI console:
echo 1. Go to https://console.green-api.com
echo 2. Create a new instance or use existing one
echo 3. Get your Instance ID and API Token
echo 4. Get your bot phone number
echo.
echo Current ngrok webhook URL: https://185d4e030402.ngrok-free.app/backend/whatsapp/webhook
echo.
echo Please enter your GreenAPI credentials:
echo.
set /p GREENAPI_ID_INSTANCE="Enter your GreenAPI Instance ID: "
set /p GREENAPI_API_TOKEN_INSTANCE="Enter your GreenAPI API Token: "
set /p GREENAPI_BOT_PHONE="Enter your bot phone number (with country code, e.g., 255738071080): "
echo.
echo Setting environment variables...
setx GREENAPI_ID_INSTANCE "%GREENAPI_ID_INSTANCE%"
setx GREENAPI_API_TOKEN_INSTANCE "%GREENAPI_API_TOKEN_INSTANCE%"
setx GREENAPI_BOT_PHONE "%GREENAPI_BOT_PHONE%"
setx GREENAPI_WEBHOOK_URL "https://185d4e030402.ngrok-free.app/backend/whatsapp/webhook"
echo.
echo ✅ Environment variables set successfully!
echo.
echo 📋 Next steps:
echo 1. Copy this webhook URL to your GreenAPI console: https://185d4e030402.ngrok-free.app/backend/whatsapp/webhook
echo 2. Restart your server to load the new environment variables
echo 3. Test your WhatsApp bot
echo.
pause
