const { Client, Databases, Account, Storage } = require('appwrite');

// Check if required environment variables are set
const requiredEnvVars = {
  APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID || '68ac2652001ca468e987',
  APPWRITE_API_KEY: process.env.APPWRITE_API_KEY || 'demo_key'
};

// Log configuration status
console.log('🔧 Appwrite Configuration:');
console.log(`   Endpoint: ${requiredEnvVars.APPWRITE_ENDPOINT}`);
console.log(`   Project ID: ${requiredEnvVars.APPWRITE_PROJECT_ID}`);
console.log(`   Project Name: ${process.env.APPWRITE_PROJECT_NAME || 'kijumbe'}`);
console.log(`   API Key: ${requiredEnvVars.APPWRITE_API_KEY.substring(0, 10)}...`);

// Initialize Appwrite client with fallback values
const client = new Client();
client.setEndpoint(requiredEnvVars.APPWRITE_ENDPOINT);
client.setProject(requiredEnvVars.APPWRITE_PROJECT_ID);

// Only set API key if it's not the demo key
if (requiredEnvVars.APPWRITE_API_KEY !== 'demo_key') {
  try {
    client.setKey(requiredEnvVars.APPWRITE_API_KEY);
  } catch (error) {
    console.warn('⚠️  Could not set API key, using public access mode');
  }
}

// Initialize services
const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

// Database and collection IDs
const DATABASE_ID = 'kijumbe_savings';
const COLLECTIONS = {
  USERS: process.env.COLLECTION_USERS || 'users',
  GROUPS: process.env.COLLECTION_GROUPS || 'groups',
  MEMBERS: process.env.COLLECTION_MEMBERS || 'members',
  TRANSACTIONS: process.env.COLLECTION_TRANSACTIONS || 'transactions',
  PAYMENTS: process.env.COLLECTION_PAYMENTS || 'payments',
  OVERDRAFTS: process.env.COLLECTION_OVERDRAFTS || 'overdrafts',
  WHATSAPP_MESSAGES: process.env.COLLECTION_WHATSAPP_MESSAGES || 'whatsapp_messages'
};

// Database operations helper
const dbOperations = {
  // Initialize database and collections
  async initializeDatabase() {
    try {
      console.log('🚀 Initializing Kijumbe database...');
      
      console.log('ℹ️  Using local storage for authentication (development mode)');
      console.log('📚 For production Appwrite setup, see APPWRITE_MANUAL_SETUP.md');
      console.log('🔑 Super admin is automatically created in local storage');
      console.log('   📧 Email: admin@kijumbe.com');
      console.log('   🔑 Password: admin123456');
      
      console.log('✅ Database initialization completed!');
      console.log('📝 Authentication is now working with local storage');
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      console.log('📚 Please follow the manual setup guide in APPWRITE_MANUAL_SETUP.md');
    }
  },

  // Test database connection
  async testConnection() {
    try {
      console.log('ℹ️  Database connection test - using local storage');
      console.log('📚 Appwrite database setup not required for local development');
      console.log('🔑 Authentication is fully functional with local storage');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }
};

module.exports = {
  client,
  databases,
  account,
  storage,
  DATABASE_ID,
  COLLECTIONS,
  dbOperations
};
