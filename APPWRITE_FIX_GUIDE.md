# 🔧 Appwrite Integration Fix Guide

## 🚨 Current Issues Identified

### 1. **Configuration Problems**
- Hardcoded credentials in `src/config/appwrite.js`
- Missing or incorrect environment variables
- Database/collection IDs don't match Appwrite console

### 2. **Database Setup Issues**
- Database may not exist in Appwrite project
- Collections not created or have wrong IDs
- API key permissions insufficient

### 3. **Authentication Conflicts**
- Server uses mock auth but Appwrite routes expect real Appwrite
- Mixed middleware usage causing authentication failures

## ✅ Step-by-Step Fix

### Step 1: Create/Update Environment Variables

Create a `.env` file in the root directory with your actual Appwrite credentials:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Appwrite Configuration (REPLACE WITH YOUR ACTUAL VALUES)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_actual_project_id
APPWRITE_API_KEY=your_actual_api_key

# Database Configuration (REPLACE WITH YOUR ACTUAL VALUES)
APPWRITE_DATABASE_ID=your_actual_database_id
COLLECTION_USERS=users
COLLECTION_GROUPS=groups
COLLECTION_MEMBERS=members
COLLECTION_TRANSACTIONS=transactions
COLLECTION_PAYMENTS=payments
COLLECTION_OVERDRAFTS=overdrafts
COLLECTION_WHATSAPP_MESSAGES=whatsapp_messages
```

### Step 2: Get Your Appwrite Credentials

1. **Go to [Appwrite Console](https://console.appwrite.io/)**
2. **Select your project** (or create a new one)
3. **Get Project ID**: Go to Settings → General → Project ID
4. **Create API Key**: Go to Settings → API Keys → Create API Key
   - Select "Server" type
   - Give it a name (e.g., "Kijumbe Server")
   - Select permissions: `databases.read`, `databases.write`, `collections.read`, `collections.write`, `documents.read`, `documents.write`
5. **Get Database ID**: Go to Databases → Your Database → Settings → Database ID

### Step 3: Create Database and Collections

Follow the `APPWRITE_MANUAL_SETUP.md` guide to:
1. Create the database
2. Create all required collections
3. Set up proper permissions
4. Create indexes for better performance

### Step 4: Update Appwrite Configuration

Update `src/config/appwrite.js` to remove hardcoded values:

```javascript
const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();

// Set up Appwrite configuration
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // Use setKey instead of setJWT for server-side

// Initialize services
const databases = new Databases(client);

// Database and Collection IDs
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const COLLECTIONS = {
    USERS: process.env.COLLECTION_USERS || 'users',
    GROUPS: process.env.COLLECTION_GROUPS || 'groups',
    MEMBERS: process.env.COLLECTION_MEMBERS || 'members',
    TRANSACTIONS: process.env.COLLECTION_TRANSACTIONS || 'transactions',
    PAYMENTS: process.env.COLLECTION_PAYMENTS || 'payments',
    OVERDRAFTS: process.env.COLLECTION_OVERDRAFTS || 'overdrafts',
    WHATSAPP_MESSAGES: process.env.COLLECTION_WHATSAPP_MESSAGES || 'whatsapp_messages'
};

// Queries helper
const queries = Query;

module.exports = {
    client,
    databases,
    DATABASE_ID,
    COLLECTIONS,
    queries
};
```

### Step 5: Switch to Appwrite Authentication

Update `src/server.js` to use Appwrite authentication:

```javascript
// Import routes
const authRoutes = require('./routes/auth'); // Change from auth-mock to auth
const groupRoutes = require('./routes/groups');
const whatsappRoutes = require('./routes/whatsapp');
const adminRoutes = require('./routes/admin');
```

### Step 6: Update Route Middleware

Update routes that use mock middleware to use Appwrite middleware:

In `src/routes/whatsapp.js` and `src/routes/admin.js`, change:
```javascript
const { authenticateToken, requireAdmin } = require('../middleware/auth-mock');
```
to:
```javascript
const { authenticateToken, requireAdmin } = require('../middleware/auth');
```

### Step 7: Test the Connection

Create a test script to verify Appwrite connection:

```javascript
// test-appwrite.js
require('dotenv').config();
const { databases, DATABASE_ID, COLLECTIONS } = require('./src/config/appwrite');

async function testAppwriteConnection() {
    try {
        console.log('Testing Appwrite connection...');
        
        // Test database connection
        const database = await databases.get(DATABASE_ID);
        console.log('✅ Database connection successful:', database.name);
        
        // Test collections
        const collections = await databases.listCollections(DATABASE_ID);
        console.log('✅ Collections found:', collections.collections.length);
        
        // Test users collection
        const users = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS);
        console.log('✅ Users collection accessible, count:', users.total);
        
        console.log('🎉 Appwrite connection test successful!');
        
    } catch (error) {
        console.error('❌ Appwrite connection failed:', error.message);
        console.error('Full error:', error);
    }
}

testAppwriteConnection();
```

Run the test:
```bash
node test-appwrite.js
```

## 🚨 Common Error Solutions

### Error: "Database not found"
- **Solution**: Verify `APPWRITE_DATABASE_ID` in `.env` matches your database ID in Appwrite console

### Error: "Collection not found"
- **Solution**: Verify collection IDs in `.env` match your collections in Appwrite console

### Error: "Insufficient permissions"
- **Solution**: Update your API key permissions to include all required database operations

### Error: "Invalid API key"
- **Solution**: Generate a new API key in Appwrite console and update `.env`

### Error: "Project not found"
- **Solution**: Verify `APPWRITE_PROJECT_ID` in `.env` matches your project ID

## 🔄 Migration from Mock to Appwrite

### Option 1: Gradual Migration
1. Keep mock authentication for development
2. Set up Appwrite in parallel
3. Test Appwrite connection thoroughly
4. Switch to Appwrite when ready

### Option 2: Direct Switch
1. Complete Appwrite setup first
2. Update all configuration
3. Switch server to use Appwrite routes
4. Test all functionality

## 📋 Checklist

- [ ] Create `.env` file with correct Appwrite credentials
- [ ] Update `src/config/appwrite.js` to use environment variables
- [ ] Create database and collections in Appwrite console
- [ ] Set up proper API key permissions
- [ ] Update server to use Appwrite authentication
- [ ] Update route middleware to use Appwrite
- [ ] Test Appwrite connection
- [ ] Test authentication flow
- [ ] Test all application features

## 🎯 Expected Results

After completing these steps:
- ✅ Appwrite connection will work without errors
- ✅ Authentication will use real Appwrite database
- ✅ User registration and login will persist data
- ✅ All application features will work with real data
- ✅ No more mock data dependencies

## 🆘 If You Still Get Errors

1. **Check Appwrite Console**: Verify your project, database, and collections exist
2. **Check API Key**: Ensure it has all required permissions
3. **Check Environment Variables**: Verify all values are correct
4. **Check Network**: Ensure your server can reach Appwrite cloud
5. **Check Logs**: Look at server console for detailed error messages

## 📞 Support

If you continue to have issues:
1. Share the exact error messages you're seeing
2. Verify your Appwrite console setup
3. Check that all environment variables are set correctly
4. Test the connection using the provided test script
