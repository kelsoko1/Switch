@echo off
REM Appwrite CLI Setup Script for Live Streaming Collections (Windows)
REM This script automates the creation of required collections

echo.
echo 🚀 Appwrite Live Streaming Setup
echo ==================================
echo.

REM Load environment variables from .env
for /f "tokens=*" %%a in ('type .env ^| findstr /v "^#"') do set %%a

REM Configuration
set PROJECT_ID=%VITE_APPWRITE_PROJECT_ID%
set DATABASE_ID=%VITE_APPWRITE_DATABASE_ID%
set ENDPOINT=%VITE_APPWRITE_ENDPOINT%

echo 📊 Configuration:
echo   Project ID: %PROJECT_ID%
echo   Database ID: %DATABASE_ID%
echo   Endpoint: %ENDPOINT%
echo.

REM Check if Appwrite CLI is installed
where appwrite >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Appwrite CLI not found!
    echo.
    echo 📥 Installing Appwrite CLI...
    call npm install -g appwrite-cli
    echo.
)

echo ✅ Appwrite CLI found
echo.

REM Login check
echo 🔐 Checking authentication...
echo If not logged in, please run: appwrite login
echo.

REM Create live_streams collection
echo 📹 Creating live_streams collection...
call appwrite databases create-collection --databaseId "%DATABASE_ID%" --collectionId "live_streams" --name "Live Streams" --permissions "read(\"any\")" "create(\"users\")" "update(\"users\")" "delete(\"users\")"

REM Create attributes for live_streams
echo 📝 Creating attributes for live_streams...

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "streamId" --size 255 --required true

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "title" --size 255 --required true

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "streamerId" --size 255 --required true

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "streamerName" --size 255 --required true

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "streamerAvatar" --size 2000 --required false

call appwrite databases create-boolean-attribute --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "isLive" --required true --default true

call appwrite databases create-integer-attribute --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "viewerCount" --required true --default 0

call appwrite databases create-integer-attribute --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "likeCount" --required true --default 0

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "startedAt" --size 50 --required true

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "endedAt" --size 50 --required false

echo ⏳ Waiting for attributes to be available...
timeout /t 5 /nobreak >nul

REM Create indexes for live_streams
echo 🔍 Creating indexes for live_streams...

call appwrite databases create-index --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "streamId_idx" --type "unique" --attributes "streamId"

call appwrite databases create-index --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "streamerId_idx" --type "key" --attributes "streamerId"

call appwrite databases create-index --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "isLive_idx" --type "key" --attributes "isLive"

call appwrite databases create-index --databaseId "%DATABASE_ID%" --collectionId "live_streams" --key "createdAt_idx" --type "key" --attributes "$createdAt" --orders "DESC"

echo ✅ live_streams collection created!
echo.

REM Create stream_comments collection
echo 💬 Creating stream_comments collection...
call appwrite databases create-collection --databaseId "%DATABASE_ID%" --collectionId "stream_comments" --name "Stream Comments" --permissions "read(\"any\")" "create(\"users\")" "update(\"users\")" "delete(\"users\")"

REM Create attributes for stream_comments
echo 📝 Creating attributes for stream_comments...

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "stream_comments" --key "streamId" --size 255 --required true

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "stream_comments" --key "userId" --size 255 --required true

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "stream_comments" --key "userName" --size 255 --required true

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "stream_comments" --key "userAvatar" --size 2000 --required false

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "stream_comments" --key "message" --size 500 --required true

call appwrite databases create-string-attribute --databaseId "%DATABASE_ID%" --collectionId "stream_comments" --key "timestamp" --size 50 --required true

echo ⏳ Waiting for attributes to be available...
timeout /t 5 /nobreak >nul

REM Create indexes for stream_comments
echo 🔍 Creating indexes for stream_comments...

call appwrite databases create-index --databaseId "%DATABASE_ID%" --collectionId "stream_comments" --key "streamId_idx" --type "key" --attributes "streamId"

call appwrite databases create-index --databaseId "%DATABASE_ID%" --collectionId "stream_comments" --key "userId_idx" --type "key" --attributes "userId"

call appwrite databases create-index --databaseId "%DATABASE_ID%" --collectionId "stream_comments" --key "timestamp_idx" --type "key" --attributes "timestamp" --orders "ASC"

echo ✅ stream_comments collection created!
echo.

echo 🎉 Setup Complete!
echo.
echo ✅ Collections created:
echo   - live_streams (with 10 attributes and 4 indexes)
echo   - stream_comments (with 6 attributes and 3 indexes)
echo.
echo 🚀 Next steps:
echo   1. Restart your dev server: npm run dev
echo   2. Test live streaming at /streams
echo.
echo 🎬 Your live streaming feature is ready!
echo.
pause
