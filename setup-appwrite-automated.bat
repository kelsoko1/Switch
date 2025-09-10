@echo off
echo ========================================
echo    Kijumbe Appwrite Automated Setup
echo ========================================
echo.

echo [1/8] Installing Appwrite CLI...
npm install -g appwrite-cli
if %errorlevel% neq 0 (
    echo ❌ Failed to install Appwrite CLI
    pause
    exit /b 1
)
echo ✅ Appwrite CLI installed successfully
echo.

echo [2/8] Checking Appwrite CLI installation...
appwrite --version
if %errorlevel% neq 0 (
    echo ❌ Appwrite CLI not working properly
    pause
    exit /b 1
)
echo ✅ Appwrite CLI is working
echo.

echo [3/8] Logging into Appwrite...
echo Please login to your Appwrite account when prompted...
appwrite login
if %errorlevel% neq 0 (
    echo ❌ Failed to login to Appwrite
    pause
    exit /b 1
)
echo ✅ Successfully logged into Appwrite
echo.

echo [4/8] Creating/Selecting Project...
echo Creating project: kijumbe-savings...
appwrite projects create --projectId kijumbe-savings --name "Kijumbe Rotational Savings" --teamId ""
if %errorlevel% neq 0 (
    echo Project might already exist, continuing...
)
echo ✅ Project ready
echo.

echo [5/8] Creating Database...
echo Creating database: kijumbe_database...
appwrite databases create --databaseId kijumbe_database --name "Kijumbe Database"
if %errorlevel% neq 0 (
    echo Database might already exist, continuing...
)
echo ✅ Database ready
echo.

echo [6/8] Creating Collections...
echo Creating users collection...
appwrite databases createCollection --databaseId kijumbe_database --collectionId users --name "Users" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
if %errorlevel% neq 0 (
    echo Collection might already exist, continuing...
)

echo Creating groups collection...
appwrite databases createCollection --databaseId kijumbe_database --collectionId groups --name "Groups" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
if %errorlevel% neq 0 (
    echo Collection might already exist, continuing...
)

echo Creating members collection...
appwrite databases createCollection --databaseId kijumbe_database --collectionId members --name "Members" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
if %errorlevel% neq 0 (
    echo Collection might already exist, continuing...
)

echo Creating transactions collection...
appwrite databases createCollection --databaseId kijumbe_database --collectionId transactions --name "Transactions" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
if %errorlevel% neq 0 (
    echo Collection might already exist, continuing...
)

echo Creating payments collection...
appwrite databases createCollection --databaseId kijumbe_database --collectionId payments --name "Payments" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
if %errorlevel% neq 0 (
    echo Collection might already exist, continuing...
)

echo Creating overdrafts collection...
appwrite databases createCollection --databaseId kijumbe_database --collectionId overdrafts --name "Overdrafts" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
if %errorlevel% neq 0 (
    echo Collection might already exist, continuing...
)

echo Creating whatsapp_messages collection...
appwrite databases createCollection --databaseId kijumbe_database --collectionId whatsapp_messages --name "WhatsApp Messages" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
if %errorlevel% neq 0 (
    echo Collection might already exist, continuing...
)

echo ✅ All collections created
echo.

echo [7/8] Creating Collection Attributes...
echo Adding attributes to users collection...
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key email --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key password --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key role --size 50 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key status --size 50 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key created_at --size 50 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key last_login --size 50 --required false
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key permissions --size 255 --required false
appwrite databases createBooleanAttribute --databaseId kijumbe_database --collectionId users --key isSuperAdmin --required false

echo Adding attributes to groups collection...
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId groups --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId groups --key kiongozi_id --size 255 --required true
appwrite databases createIntegerAttribute --databaseId kijumbe_database --collectionId groups --key max_members --required true
appwrite databases createIntegerAttribute --databaseId kijumbe_database --collectionId groups --key rotation_duration --required true
appwrite databases createFloatAttribute --databaseId kijumbe_database --collectionId groups --key contribution_amount --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId groups --key status --size 50 --required true
appwrite databases createIntegerAttribute --databaseId kijumbe_database --collectionId groups --key current_rotation --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId groups --key created_at --size 50 --required true

echo Adding attributes to members collection...
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId members --key group_id --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId members --key user_id --size 255 --required true
appwrite databases createIntegerAttribute --databaseId kijumbe_database --collectionId members --key member_number --required true
appwrite databases createIntegerAttribute --databaseId kijumbe_database --collectionId members --key rotation_order --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId members --key status --size 50 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId members --key joined_at --size 50 --required true

echo Adding attributes to transactions collection...
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId transactions --key group_id --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId transactions --key user_id --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId transactions --key type --size 50 --required true
appwrite databases createFloatAttribute --databaseId kijumbe_database --collectionId transactions --key amount --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId transactions --key description --size 500 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId transactions --key status --size 50 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId transactions --key created_at --size 50 --required true

echo Adding attributes to payments collection...
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId payments --key group_id --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId payments --key user_id --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId payments --key payment_type --size 50 --required true
appwrite databases createFloatAttribute --databaseId kijumbe_database --collectionId payments --key amount --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId payments --key phone_number --size 20 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId payments --key payment_reference --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId payments --key description --size 500 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId payments --key status --size 50 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId payments --key created_at --size 50 --required true

echo Adding attributes to overdrafts collection...
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId overdrafts --key group_id --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId overdrafts --key user_id --size 255 --required true
appwrite databases createFloatAttribute --databaseId kijumbe_database --collectionId overdrafts --key amount --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId overdrafts --key purpose --size 500 --required true
appwrite databases createIntegerAttribute --databaseId kijumbe_database --collectionId overdrafts --key repayment_period --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId overdrafts --key status --size 50 --required true
appwrite databases createFloatAttribute --databaseId kijumbe_database --collectionId overdrafts --key interest_rate --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId overdrafts --key created_at --size 50 --required true

echo Adding attributes to whatsapp_messages collection...
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId whatsapp_messages --key phone_number --size 20 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId whatsapp_messages --key message --size 1000 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId whatsapp_messages --key direction --size 20 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId whatsapp_messages --key status --size 50 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId whatsapp_messages --key created_at --size 50 --required true

echo ✅ All attributes created
echo.

echo [8/8] Generating API Key...
echo Creating API key for server access...
appwrite projects createKey --projectId kijumbe-savings --name "Kijumbe Server Key" --scopes "databases.read" "databases.write" "collections.read" "collections.write" "documents.read" "documents.write"
if %errorlevel% neq 0 (
    echo ❌ Failed to create API key
    pause
    exit /b 1
)
echo ✅ API key created successfully
echo.

echo ========================================
echo    Setup Complete! 🎉
echo ========================================
echo.
echo Your Appwrite project is now ready with:
echo ✅ Project: kijumbe-savings
echo ✅ Database: kijumbe_database
echo ✅ Collections: users, groups, members, transactions, payments, overdrafts, whatsapp_messages
echo ✅ API Key: Generated (check Appwrite console for the key)
echo.
echo Next steps:
echo 1. Copy the API key from Appwrite console
echo 2. Update your .env file with the new credentials
echo 3. Run the configuration update script
echo.
echo Press any key to continue...
pause > nul
