const { Client, Account, Databases, Storage, Functions, Teams, Avatars, Locale, Query, ID } = require('node-appwrite');

// Disable SSL verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

// Initialize all Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const teams = new Teams(client);
const avatars = new Avatars(client);
const locale = new Locale(client);

// Database and Collection IDs
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'switch_db';
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'default';

// Collection names
const COLLECTIONS = {
    USERS: process.env.COLLECTION_USERS || 'users',
    GROUPS: process.env.COLLECTION_GROUPS || 'groups',
    MEMBERS: process.env.COLLECTION_MEMBERS || 'members',
    TRANSACTIONS: process.env.COLLECTION_TRANSACTIONS || 'transactions',
    PAYMENTS: process.env.COLLECTION_PAYMENTS || 'payments',
    OVERDRAFTS: process.env.COLLECTION_OVERDRAFTS || 'overdrafts',
    WALLETS: process.env.COLLECTION_WALLETS || 'wallets',
    WALLET_TRANSACTIONS: process.env.COLLECTION_WALLET_TRANSACTIONS || 'wallet_transactions',
    WALLET_PAYMENTS: process.env.COLLECTION_WALLET_PAYMENTS || 'wallet_payments',
    
    // Messaging
    MESSAGES: 'messages'
};

// Storage buckets
const BUCKETS = {
    USER_AVATARS: 'user_avatars',
    MEDIA: 'media_files'
};

// Team roles
const TEAM_ROLES = {
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer',
    OWNER: 'owner'
};

// Export all services and configurations
module.exports = {
    // Clients
    client,
    account,
    databases,
    storage,
    functions,
    teams,
    avatars,
    locale,
    
    // Constants
    DATABASE_ID,
    BUCKET_ID,
    COLLECTIONS,
    BUCKETS,
    TEAM_ROLES,
    
    // Utilities
    Query,
    ID,
    generateId: () => ID.unique()
};