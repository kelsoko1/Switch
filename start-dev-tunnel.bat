@echo off
echo 🚀 Starting Kijumbe Development Server with ngrok tunnel...
echo.
echo This will:
echo 1. Start ngrok tunnel on port 3000
echo 2. Display the webhook URL for GreenAPI
echo 3. Start your development server
echo 4. Automatically update .env with the webhook URL
echo.
pause
npm run dev:tunnel
