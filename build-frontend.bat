@echo off
echo Building Kijumbe Frontend...
echo.

cd frontend

echo Installing dependencies...
call npm install

echo.
echo Building React app...
call npm run build

echo.
echo Frontend build complete!
echo Files are in frontend/build/
echo.

cd ..
echo Done!
