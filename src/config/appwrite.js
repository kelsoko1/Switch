const { Client, Databases, Query } = require('appwrite');

// Disable SSL verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Initialize Appwrite client
const client = new Client();

// Set up Appwrite configuration
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setJWT(process.env.APPWRITE_API_KEY);

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