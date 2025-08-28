import { Client, Account, Databases, Storage } from 'appwrite';

// Appwrite configuration - Updated to use Vite environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '68ac2652001ca468e987';
const APPWRITE_PROJECT_NAME = import.meta.env.VITE_APPWRITE_PROJECT_NAME || 'kijumbe';

// Database and collection IDs
const DATABASE_ID = 'kijumbe_savings';
const COLLECTIONS = {
  USERS: 'users',
  GROUPS: 'groups',
  MEMBERS: 'members',
  TRANSACTIONS: 'transactions',
  PAYMENTS: 'payments',
  OVERDRAFTS: 'overdrafts'
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Log configuration
console.log('🔧 Frontend Appwrite Configuration:');
console.log(`   Endpoint: ${APPWRITE_ENDPOINT}`);
console.log(`   Project ID: ${APPWRITE_PROJECT_ID}`);
console.log(`   Project Name: ${APPWRITE_PROJECT_NAME}`);

export {
  client,
  account,
  databases,
  storage,
  DATABASE_ID,
  COLLECTIONS,
  APPWRITE_PROJECT_ID
};
