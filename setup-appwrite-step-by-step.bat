@echo off
echo ========================================
echo    Kijumbe Appwrite Setup (Step by Step)
echo ========================================
echo.

echo [1/6] Creating Project...
appwrite projects create --projectId kijumbe-savings --name "Kijumbe Rotational Savings"
echo.

echo [2/6] Creating Database...
appwrite databases create --databaseId kijumbe_database --name "Kijumbe Database"
echo.

echo [3/6] Creating Collections...
appwrite databases createCollection --databaseId kijumbe_database --collectionId users --name "Users" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
appwrite databases createCollection --databaseId kijumbe_database --collectionId groups --name "Groups" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
appwrite databases createCollection --databaseId kijumbe_database --collectionId members --name "Members" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
appwrite databases createCollection --databaseId kijumbe_database --collectionId transactions --name "Transactions" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
appwrite databases createCollection --databaseId kijumbe_database --collectionId payments --name "Payments" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
appwrite databases createCollection --databaseId kijumbe_database --collectionId overdrafts --name "Overdrafts" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
appwrite databases createCollection --databaseId kijumbe_database --collectionId whatsapp_messages --name "WhatsApp Messages" --permissions "read(\"any\")" "write(\"any\")" "delete(\"any\")"
echo.

echo [4/6] Creating Users Collection Attributes...
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key email --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key password --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key role --size 50 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key status --size 50 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key created_at --size 50 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key last_login --size 50 --required false
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId users --key permissions --size 255 --required false
appwrite databases createBooleanAttribute --databaseId kijumbe_database --collectionId users --key isSuperAdmin --required false
echo.

echo [5/6] Creating Groups Collection Attributes...
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId groups --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId groups --key kiongozi_id --size 255 --required true
appwrite databases createIntegerAttribute --databaseId kijumbe_database --collectionId groups --key max_members --required true
appwrite databases createIntegerAttribute --databaseId kijumbe_database --collectionId groups --key rotation_duration --required true
appwrite databases createFloatAttribute --databaseId kijumbe_database --collectionId groups --key contribution_amount --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId groups --key status --size 50 --required true
appwrite databases createIntegerAttribute --databaseId kijumbe_database --collectionId groups --key current_rotation --required true
appwrite databases createStringAttribute --databaseId kijumbe_database --collectionId groups --key created_at --size 50 --required true
echo.

echo [6/6] Creating API Key...
appwrite projects createKey --projectId kijumbe-savings --name "Kijumbe Server Key" --scopes "databases.read" "databases.write" "collections.read" "collections.write" "documents.read" "documents.write"
echo.

echo ========================================
echo    Setup Complete! 🎉
echo ========================================
echo.
echo Your Appwrite project is now ready!
echo.
echo Next steps:
echo 1. Copy the API key from above
echo 2. Run: node update-appwrite-config.js
echo 3. Enter the API key when prompted
echo 4. Run: node test-appwrite-connection.js
echo.
pause
