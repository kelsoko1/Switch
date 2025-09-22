# Appwrite Integration Setup Guide

This guide explains how to set up and use the Appwrite integration for the Switch application. The app now works directly with Appwrite for all data operations, including writing data, retrieving data, and real-time updates.

## Prerequisites

1. An Appwrite account (sign up at [https://appwrite.io](https://appwrite.io))
2. Node.js installed on your machine
3. The Switch application codebase

## Setup Steps

### 1. Create an Appwrite Project

1. Log in to your Appwrite Console
2. Create a new project (e.g., "Switch App")
3. Note down your Project ID

### 2. Create a Database

1. In your Appwrite project, go to Databases
2. Create a new database (e.g., "switch-db")
3. Note down your Database ID

### 3. Create an API Key

1. Go to API Keys in your project settings
2. Create a new API key with the following permissions:
   - databases.read
   - databases.write
   - documents.read
   - documents.write
   - collections.read
   - collections.write
   - storage.read
   - storage.write
3. Note down your API Key (you'll only see it once)

### 4. Configure the Application

1. In the root directory of the Switch app, create or edit the `.env` file with the following content:

```
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_API_KEY=your-api-key
```

2. Replace the placeholder values with your actual Appwrite credentials

### 5. Initialize Appwrite Collections

Run the setup script to initialize all required Appwrite collections and indexes:

```bash
node src/scripts/setup-appwrite.js
```

This script will:
- Create all necessary collections in your Appwrite database
- Set up proper indexes for efficient queries
- Create storage buckets for media files
- Start the development server

## Data Structure

The Switch app uses the following collections in Appwrite:

1. **users** - User accounts and profiles
2. **wallets** - User wallets with balance information
3. **wallet_transactions** - Transaction history for wallets
4. **groups** - Kijumbe groups information
5. **group_members** - Members of each group
6. **contributions** - Contributions made to groups
7. **group_payments** - Payments made from groups to members
8. **status_updates** - User status updates (similar to stories)
9. **status_views** - Records of who viewed each status
10. **stream_rooms** - Video streaming rooms
11. **stream_messages** - Messages in streaming rooms

## Using Appwrite in the App

### Real-time Data

The app now uses Appwrite's real-time subscriptions to update data instantly when changes occur. This is implemented in these key areas:

1. **Wallet Balance** - Updates in real-time when transactions occur
2. **Group Contributions** - Members see contributions as they happen
3. **Status Updates** - New statuses appear without refreshing

### Direct Data Operations

All data operations now go directly to Appwrite:

1. **Create** - New records are created directly in Appwrite collections
2. **Read** - Data is fetched directly from Appwrite with proper queries
3. **Update** - Changes are immediately persisted to Appwrite
4. **Delete** - Deleted records are removed from Appwrite

### Offline Support

The app includes offline support with:

1. **Caching** - Important data is cached for offline use
2. **Sync** - Changes made offline are synced when connection is restored
3. **Fallback** - Critical features work even without internet

## Using the Appwrite Services

The application uses the following services to interact with Appwrite:

### User Service

Located at `src/services/appwrite/userService.ts`, this service handles:
- User authentication
- User profile management
- User registration and login

Example usage:
```typescript
import { userService } from '../services/appwrite';

// Get current user
const user = await userService.getCurrentUser();

// Create a new user
await userService.createAccount('email@example.com', 'password', 'User Name');

// Login
await userService.createEmailSession('email@example.com', 'password');
```

### Wallet Service

Located at `src/services/appwrite/walletService.ts`, this service handles:
- Wallet management
- Transactions
- Money transfers

Example usage:
```typescript
import { walletService } from '../services/appwrite';

// Get user wallet
const wallet = await walletService.getUserWallet(userId);

// Create a transaction
await walletService.createTransaction(userId, {
  amount: 5000,
  type: 'deposit',
  status: 'completed',
  description: 'Deposit via M-Pesa',
  service: 'general'
});

// Transfer money
await walletService.transferMoney(senderId, recipientId, amount, description);
```

### Group Service

Located at `src/services/appwrite/groupService.ts`, this service handles:
- Group management
- Group contributions
- Group payments

Example usage:
```typescript
import { groupService } from '../services/appwrite';

// Create a group
await groupService.createGroup(userId, {
  name: 'My Group',
  max_members: 5,
  rotation_duration: 30,
  contribution_amount: 10000
});

// Get user groups
const groups = await groupService.getUserGroups(userId);

// Make a contribution
await groupService.makeContribution(groupId, userId, amount);
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify your API key has the correct permissions
   - Check that your Project ID is correct

2. **Database Errors**
   - Ensure the database ID in your .env file matches the one in Appwrite
   - Check that all collections were created successfully

3. **Permission Errors**
   - Verify that the collections have the correct permissions set

### Getting Help

If you encounter any issues with the Appwrite integration, please:
1. Check the Appwrite documentation: [https://appwrite.io/docs](https://appwrite.io/docs)
2. Look for error messages in the browser console or server logs
3. Contact the development team for assistance
