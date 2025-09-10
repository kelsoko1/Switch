@echo off
echo ====================================
echo Creating Superadmins for all member types (Simple Version)
echo ====================================

echo.
echo This script will create superadmin accounts for all three member types:
echo - Member Superadmin
echo - Kiongozi Superadmin
echo - Admin Superadmin
echo.
echo Make sure your backend server is running at http://localhost:3000
echo.

set /p OFFLINE_MODE="Do you want to run in offline mode? (y/n): "

echo.
if /i "%OFFLINE_MODE%"=="y" (
    echo Running superadmin creation script (simple version) in OFFLINE mode...
    echo.
    node create-all-superadmins-simple.js --offline
) else (
    echo Running superadmin creation script (simple version)...
    echo.
    node create-all-superadmins-simple.js
)

echo.
echo Script completed.
echo.

pause
