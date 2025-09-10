# 🏦 Appwrite CLI Setup Guide for Kijumbe Wallet Collections

## 📋 Prerequisites

1. **Appwrite CLI Installed**: Make sure you have the Appwrite CLI installed
2. **Project Configuration**: Your `.env` file should have the correct Appwrite credentials
3. **Database Access**: Ensure your API key has database permissions

## 🚀 Quick Setup (Automated)

The easiest way to set up the wallet collections is using the automated script:

```bash
node setup-wallet-collections.js
```

This script will automatically create all the required collections, attributes, and indexes.

## 🔧 Manual Setup (Step by Step)

If you prefer to set up the collections manually using the Appwrite CLI, follow these steps:

### Step 1: Login to Appwrite

```bash
appwrite login
```

### Step 2: Set Your Project

```bash
appwrite projects use --projectId YOUR_PROJECT_ID
```

### Step 3: Create Wallets Collection

```bash
# Create the collection
appwrite databases createCollection \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --name "Wallets" \
  --documentSecurity false

# Add attributes
appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key user_id \
  --size 255 \
  --required true

appwrite databases createFloatAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key balance \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key currency \
  --size 10 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key status \
  --size 20 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key pin_hash \
  --size 255 \
  --required false

appwrite databases createBooleanAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key pin_set \
  --required true

appwrite databases createFloatAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key daily_limit \
  --required true

appwrite databases createFloatAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key monthly_limit \
  --required true

appwrite databases createFloatAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key daily_spent \
  --required true

appwrite databases createFloatAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key monthly_spent \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key last_reset_date \
  --size 20 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key created_at \
  --size 50 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key updated_at \
  --size 50 \
  --required true

# Create indexes
appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key user_id_index \
  --type key \
  --attributes user_id

appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallets \
  --key status_index \
  --type key \
  --attributes status
```

### Step 4: Create Wallet Transactions Collection

```bash
# Create the collection
appwrite databases createCollection \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --name "Wallet Transactions" \
  --documentSecurity false

# Add attributes
appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key user_id \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key type \
  --size 50 \
  --required true

appwrite databases createFloatAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key amount \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key description \
  --size 500 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key reference \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key status \
  --size 20 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key metadata \
  --size 2000 \
  --required false

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key created_at \
  --size 50 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key updated_at \
  --size 50 \
  --required true

# Create indexes
appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key user_id_index \
  --type key \
  --attributes user_id

appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key type_index \
  --type key \
  --attributes type

appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key status_index \
  --type key \
  --attributes status

appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key created_at_index \
  --type key \
  --attributes created_at

appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_transactions \
  --key reference_index \
  --type key \
  --attributes reference
```

### Step 5: Create Wallet Payments Collection

```bash
# Create the collection
appwrite databases createCollection \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --name "Wallet Payments" \
  --documentSecurity false

# Add attributes
appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key user_id \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key transaction_id \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key payment_method \
  --size 50 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key payment_data \
  --size 2000 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key selcom_order_id \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key status \
  --size 20 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key created_at \
  --size 50 \
  --required true

appwrite databases createStringAttribute \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key updated_at \
  --size 50 \
  --required true

# Create indexes
appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key user_id_index \
  --type key \
  --attributes user_id

appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key transaction_id_index \
  --type key \
  --attributes transaction_id

appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key selcom_order_id_index \
  --type key \
  --attributes selcom_order_id

appwrite databases createIndex \
  --databaseId YOUR_DATABASE_ID \
  --collectionId wallet_payments \
  --key status_index \
  --type key \
  --attributes status
```

## 🔍 Verification

After setting up the collections, you can verify they were created correctly:

```bash
# List all collections
appwrite databases listCollections --databaseId YOUR_DATABASE_ID

# Get collection details
appwrite databases getCollection --databaseId YOUR_DATABASE_ID --collectionId wallets
appwrite databases getCollection --databaseId YOUR_DATABASE_ID --collectionId wallet_transactions
appwrite databases getCollection --databaseId YOUR_DATABASE_ID --collectionId wallet_payments
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Collection already exists"**: This is normal if you run the script multiple times
2. **"Permission denied"**: Check your API key permissions
3. **"Project not found"**: Verify your project ID in the `.env` file
4. **"Database not found"**: Verify your database ID in the `.env` file

### Environment Variables Check:

Make sure your `.env` file contains:
```env
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_API_KEY=your_api_key
```

## 🎯 Next Steps

After setting up the collections:

1. **Configure Selcom credentials** in your `.env` file
2. **Start your server**: `npm start`
3. **Test the wallet**: `npm run test:wallet`
4. **Access the wallet**: Navigate to `http://localhost:3000/wallet`

## 📞 Support

If you encounter any issues:
1. Check the Appwrite console for error messages
2. Verify your API key has the correct permissions
3. Ensure all environment variables are correctly set
4. Run the automated setup script: `node setup-wallet-collections.js`
