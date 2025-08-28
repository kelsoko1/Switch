@echo off
echo 🚀 Starting Kijumbe Rotational Savings Platform...
echo.

echo 📦 Installing backend dependencies...
npm install

echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo 🔧 Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo 🌐 Starting frontend application...
cd frontend
start "Frontend App" cmd /k "npm start"
cd ..

echo.
echo ✅ Application started successfully!
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:5000
echo.
echo Press any key to exit...
pause >nul
