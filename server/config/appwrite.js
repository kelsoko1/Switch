const { Client, Account, Databases, Storage, Functions, Teams, Avatars, Locale, Query, ID } = require('node-appwrite');

// Initialize Appwrite client
let client;
try {
    if (!process.env.APPWRITE_PROJECT_ID) {
        throw new Error('APPWRITE_PROJECT_ID is required');
    }
    if (!process.env.APPWRITE_API_KEY) {
        throw new Error('APPWRITE_API_KEY is required');
    }

    client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    console.log('Appwrite client initialized successfully');
} catch (error) {
    console.error('Failed to initialize Appwrite client:', error);
    process.exit(1);
}

// Initialize all Appwrite services
let account, databases, storage, functions, teams, avatars, locale;

try {
    console.log('Initializing Appwrite services...');
    account = new Account(client);
    databases = new Databases(client);
    storage = new Storage(client);
    functions = new Functions(client);
    teams = new Teams(client);
    avatars = new Avatars(client);
    locale = new Locale(client);
    console.log('All Appwrite services initialized successfully');
} catch (error) {
    console.error('Failed to initialize Appwrite services:', error);
    process.exit(1);
}

// Validate and initialize database and collection IDs
let DATABASE_ID, BUCKET_ID, COLLECTIONS;

try {
    console.log('Validating database and collection configuration...');
    
    // Validate database ID
    DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
    if (!DATABASE_ID) {
        throw new Error('APPWRITE_DATABASE_ID is required');
    }
    console.log('Using database:', DATABASE_ID);

    // Validate bucket ID
    BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'default';
    console.log('Using bucket:', BUCKET_ID);

    // Initialize collections with validation
    COLLECTIONS = {
        USERS: process.env.COLLECTION_USERS || 'users',
        GROUPS: process.env.COLLECTION_GROUPS || 'groups',
        MEMBERS: process.env.COLLECTION_MEMBERS || 'members',
        TRANSACTIONS: process.env.COLLECTION_TRANSACTIONS || 'transactions',
        PAYMENTS: process.env.COLLECTION_PAYMENTS || 'payments',
        OVERDRAFTS: process.env.COLLECTION_OVERDRAFTS || 'overdrafts',
        WALLETS: process.env.COLLECTION_WALLETS || 'wallets',
        WALLET_TRANSACTIONS: process.env.COLLECTION_WALLET_TRANSACTIONS || 'wallet_transactions',
        WALLET_PAYMENTS: process.env.COLLECTION_WALLET_PAYMENTS || 'wallet_payments',
        MESSAGES: 'messages'
    };

    // Validate required collections
    const requiredCollections = ['USERS', 'WALLETS', 'TRANSACTIONS'];
    for (const collection of requiredCollections) {
        if (!COLLECTIONS[collection]) {
            throw new Error(`Collection ${collection} is required but not configured`);
        }
    }

    console.log('Database and collection configuration validated successfully');
} catch (error) {
    console.error('Failed to validate database configuration:', error);
    process.exit(1);
}

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