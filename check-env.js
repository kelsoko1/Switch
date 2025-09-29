const fs = require('fs');
const path = require('path');

// Required environment variables
const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_API_KEY',
  'APPWRITE_DATABASE_ID',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'FRONTEND_URL',
  'COLLECTION_USERS',
  'COLLECTION_GROUPS',
  'COLLECTION_MEMBERS',
  'COLLECTION_TRANSACTIONS',
  'COLLECTION_PAYMENTS',
  'COLLECTION_OVERDRAFTS',
  'COLLECTION_WALLETS',
  'COLLECTION_WALLET_TRANSACTIONS',
  'COLLECTION_WALLET_PAYMENTS',
  'SELCOM_BASE_URL',
  'SELCOM_API_KEY',
  'SELCOM_API_SECRET',
  'SELCOM_MERCHANT_ID'
];

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please create one based on .env.example.');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Check for missing variables
let missingVars = [];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  console.error('Please add these to your .env file.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set.');
}
