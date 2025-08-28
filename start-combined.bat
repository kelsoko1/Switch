@echo off
echo 🚀 Starting Kijumbe Rotational Savings Platform (Combined Mode)...
echo.

echo 📦 Installing backend dependencies...
npm install

echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo 🔧 Starting combined server on port 3000...
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend API: http://localhost:3000/backend
echo 📊 Health Check: http://localhost:3000/health
echo.

echo 🎯 Starting the server...
npm run dev

echo.
echo ✅ Application started successfully!
echo 📱 Everything runs on: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
