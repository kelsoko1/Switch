@echo off
echo 🚀 Kijumbe Authentication System Startup
echo ========================================
echo.

echo 📦 Installing dependencies...
call npm install bcryptjs jsonwebtoken express-validator dotenv
echo.

echo 🔧 Running setup check...
node setup-auth.js
echo.

echo 🌟 Starting Kijumbe server with full authentication...
echo.
echo 🔐 Super Admin Credentials:
echo    📧 Email: admin@kijumbe.com
echo    🔑 Password: admin123456
echo.
echo 🌍 Access URLs:
echo    🖥️  Frontend: http://localhost:3000
echo    🛡️  Backend Admin: http://localhost:3000/backend
echo    🔌 API: http://localhost:3000/backend/auth
echo.
echo ⏳ Server starting...
echo.

npm start
