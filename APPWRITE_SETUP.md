# Appwrite Integration Setup Guide

This guide explains how to set up and use the Appwrite integration for the Kijumbe application.

## Prerequisites

1. An Appwrite account (sign up at [https://appwrite.io](https://appwrite.io))
2. Node.js installed on your machine
3. The Kijumbe application codebase

## Setup Steps

### 1. Create an Appwrite Project

1. Log in to your Appwrite Console
2. Create a new project or use an existing one
3. Note down your Project ID

### 2. Create an API Key

1. In your Appwrite project, go to "API Keys"
2. Create a new API key with the following permissions:
   - `users.read`
   - `users.write`
   - `databases.read`
   - `databases.write`
   - `documents.read`
   - `documents.write`
3. Note down the API key

### 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env.local` if you haven't already:
   ```
   cp .env.example .env.local
   ```

2. Update the following variables in your `.env.local` file:
   ```
   APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_api_key
   APPWRITE_DATABASE_ID=kijumbe_savings
   ```

### 4. Run the Setup Script

This script will create the necessary database and collections in your Appwrite project:

```
npm run appwrite:setup
```

### 5. Seed the Database (Optional)

To populate your database with test data:

```
npm run appwrite:seed
```

This will create:
- 3 test users (john@example.com, jane@example.com, admin@example.com)
- 3 test groups
- Wallets for each user
- Initial transactions and contributions

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
