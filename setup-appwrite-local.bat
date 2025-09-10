@echo off
echo ====================================
echo Appwrite Local Setup for Offline Use
echo ====================================

echo.
echo This script will help you set up Appwrite locally for offline use.
echo Prerequisites:
echo - Docker Desktop must be installed and running
echo - Docker Compose must be available
echo.

REM Check if Docker is running
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Docker is running. Proceeding with Appwrite setup...
echo.

REM Create Appwrite directory
echo Creating Appwrite directory...
mkdir %USERPROFILE%\appwrite-local 2> nul
cd %USERPROFILE%\appwrite-local

REM Download Appwrite Docker Compose file
echo Downloading Appwrite Docker Compose file...
curl -L https://appwrite.io/install/compose.yml -o docker-compose.yml

REM Start Appwrite services
echo Starting Appwrite services...
docker-compose up -d

echo.
echo Waiting for Appwrite to initialize (60 seconds)...
timeout /t 60 /nobreak

echo.
echo ====================================
echo Appwrite local setup complete!
echo ====================================
echo.
echo Next steps:
echo 1. Open http://localhost:80 in your browser
echo 2. Login with default credentials:
echo    - Email: admin@appwrite.io
echo    - Password: password
echo 3. Create a new project named 'Kijumbe Local'
echo 4. Note down Project ID and API Keys
echo 5. Update your .env file with the new credentials:
echo    APPWRITE_ENDPOINT=http://localhost/v1
echo    APPWRITE_PROJECT_ID=your_local_project_id
echo    APPWRITE_API_KEY=your_local_api_key
echo.

pause
