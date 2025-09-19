# Rafiki Messenger Setup Guide

## Issues Fixed

✅ **React Router Warnings**: Added future flags to suppress v7 warnings
✅ **Appwrite Authentication Errors**: Added proper error handling for missing configuration
✅ **Supabase Removal**: Completely removed Supabase and migrated all features to Appwrite

## Environment Configuration

To fully configure your application, you need to set up the following environment variables:

### 1. Create a `.env` file in the root directory

```bash
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-actual-project-id
VITE_APPWRITE_DATABASE_ID=your-actual-database-id


# Janus WebRTC Configuration
VITE_JANUS_URL=wss://janus.conf.meetecho.com/ws

# XMPP Configuration
VITE_XMPP_SERVER=ws://localhost:5280/ws
VITE_XMPP_DOMAIN=localhost
```

### 2. Appwrite Setup

1. Go to [Appwrite Cloud](https://cloud.appwrite.io)
2. Create a new project or use an existing one
3. Get your Project ID from the project settings
4. Create a database and get the Database ID
5. Update the `.env` file with your actual values


## Current Status

- ✅ React Router warnings are now suppressed
- ✅ Appwrite authentication errors are handled gracefully
- ✅ Supabase completely removed - now using Appwrite for all features
- ⚠️ You need to configure your environment variables for full functionality

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The application will now run without the previous errors, but you'll need to configure the environment variables for full functionality.

## Features That Work Without Configuration

- Basic UI navigation
- Demo authentication (local storage based)
- Basic chat interface
- Wallet interface (with demo data)

## Features That Require Configuration

- Real Appwrite authentication
- Status updates (now uses Appwrite)
- Real-time features (requires proper backend setup)
