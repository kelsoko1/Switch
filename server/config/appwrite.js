const { Client, Account, Databases, Storage, Functions, Teams, Avatars, Locale, Query, ID } = require('node-appwrite');
const logger = require('../utils/logger');

// Validate required environment variables
const requiredEnvVars = [
  'VITE_APPWRITE_ENDPOINT',
  'VITE_APPWRITE_PROJECT_ID',
  'VITE_APPWRITE_API_KEY',
  'VITE_APPWRITE_DATABASE_ID',
  'VITE_APPWRITE_COLLECTION_USERS',
  'VITE_APPWRITE_COLLECTION_WALLETS',
  'VITE_APPWRITE_COLLECTION_TRANSACTIONS',
  'VITE_APPWRITE_COLLECTION_GROUPS',
  'VITE_APPWRITE_COLLECTION_MESSAGES',
  'VITE_APPWRITE_COLLECTION_CALLS',
  'VITE_APPWRITE_BUCKET_AVATARS',
  'VITE_APPWRITE_BUCKET_MEDIA',
  'VITE_APPWRITE_BUCKET_DOCUMENTS'
];

// Check for missing environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Initialize Appwrite client and services
let client, account, databases, storage, functions, teams, avatars, locale;

try {
  logger.info('Initializing Appwrite client and services...');
  
  // Initialize client
  client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.VITE_APPWRITE_API_KEY);

  // Initialize services
  account = new Account(client);
  databases = new Databases(client);
  storage = new Storage(client);
  functions = new Functions(client);
  teams = new Teams(client);
  avatars = new Avatars(client);
  locale = new Locale(client);
  
  logger.info('Appwrite services initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Appwrite services:', error);
  process.exit(1);
}

// Database and collection configuration
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;
const BUCKET_ID = process.env.VITE_APPWRITE_BUCKET_ID || 'default';

// Collection names from environment variables
const COLLECTIONS = {
  USERS: process.env.VITE_APPWRITE_COLLECTION_USERS,
  WALLETS: process.env.VITE_APPWRITE_COLLECTION_WALLETS,
  TRANSACTIONS: process.env.VITE_APPWRITE_COLLECTION_TRANSACTIONS,
  GROUPS: process.env.VITE_APPWRITE_COLLECTION_GROUPS,
  MESSAGES: process.env.VITE_APPWRITE_COLLECTION_MESSAGES,
  CALLS: process.env.VITE_APPWRITE_COLLECTION_CALLS,
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  SESSIONS: 'sessions'
};

// Storage buckets configuration
const BUCKETS = {
  AVATARS: process.env.VITE_APPWRITE_BUCKET_AVATARS || 'avatars',
  MEDIA: process.env.VITE_APPWRITE_BUCKET_MEDIA || 'media',
  DOCUMENTS: process.env.VITE_APPWRITE_BUCKET_DOCUMENTS || 'documents'
};

// User roles
const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
  MODERATOR: 'moderator'
};

// Team roles
const TEAM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

// Helper function to handle Appwrite errors
const handleError = (error, defaultMessage = 'An error occurred') => {
  logger.error('Appwrite Error:', error);
  
  let message = defaultMessage;
  let statusCode = 500;
  let code = 'server_error';
  
  if (error.response) {
    // Handle HTTP errors
    statusCode = error.response.code || statusCode;
    message = error.response.message || message;
    code = error.response.type || code;
  } else if (error.code) {
    // Handle Appwrite SDK errors
    code = error.code;
    message = error.message || message;
  }
  
  const errorObj = new Error(message);
  errorObj.statusCode = statusCode;
  errorObj.code = code;
  
  return errorObj;
};

// Validate database indexes on startup
const initializeDatabaseIndexes = async () => {
  try {
    // Create indexes for users collection
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.USERS,
      'idx_unique_email',
      'unique',
      ['email'],
      ['asc']
    );
    
    // Add more indexes as needed
    logger.info('Database indexes initialized successfully');
  } catch (error) {
    // Ignore errors about indexes already existing
    if (error.code !== 409) {
      logger.error('Error initializing database indexes:', error);
    }
  }
};

// Initialize database indexes when this module is loaded
// DISABLED: Requires API key with collections.write scope
// if (process.env.NODE_ENV !== 'test') {
//   initializeDatabaseIndexes().catch(err => {
//     logger.error('Failed to initialize database indexes:', err);
//   });
// }

module.exports = {
  // Appwrite clients
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
  ROLES,
  TEAM_ROLES,
  
  // Utilities
  Query,
  ID,
  handleError,
  generateId: () => ID.unique(),
  initializeDatabaseIndexes
};