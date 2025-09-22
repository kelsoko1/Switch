// Script to initialize all Appwrite collections and indexes for the Switch app
import { Client, Databases, Storage } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.VITE_APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// Database and collection constants
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;

// Collection IDs
const COLLECTIONS = {
  USERS: 'users',
  WALLETS: 'wallets',
  WALLET_TRANSACTIONS: 'wallet_transactions',
  WALLET_PAYMENTS: 'wallet_payments',
  GROUPS: 'groups',
  GROUP_MEMBERS: 'group_members',
  CONTRIBUTIONS: 'contributions',
  GROUP_PAYMENTS: 'group_payments',
  STATUS_UPDATES: 'status_updates',
  STATUS_VIEWS: 'status_views',
  STREAM_ROOMS: 'stream_rooms',
  STREAM_MESSAGES: 'stream_messages',
  WHATSAPP_MESSAGES: 'whatsapp_messages',
  SYSTEM_SETTINGS: 'system_settings',
  FUND_COLLECTIONS: 'fund_collections',
  FUND_CONTRIBUTIONS: 'fund_contributions',
};

// Storage bucket IDs
const STORAGE_BUCKETS = {
  STATUS_MEDIA: 'status_media',
  PROFILE_IMAGES: 'profile_images',
  GROUP_IMAGES: 'group_images',
};

// Collection schemas
const schemas = {
  // Users collection schema
  [COLLECTIONS.USERS]: {
    name: 'Users',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'email', type: 'string', required: true, array: false },
      { key: 'phone', type: 'string', required: false, array: false },
      { key: 'avatar', type: 'string', required: false, array: false },
      { key: 'preferences', type: 'string', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'email_index', type: 'key', attributes: ['email'], orders: ['ASC'] },
      { key: 'phone_index', type: 'key', attributes: ['phone'], orders: ['ASC'] },
    ],
  },

  // Wallets collection schema
  [COLLECTIONS.WALLETS]: {
    name: 'Wallets',
    attributes: [
      { key: 'user_id', type: 'string', required: true, array: false },
      { key: 'balance', type: 'double', required: true, array: false },
      { key: 'currency', type: 'string', required: true, array: false },
      { key: 'pin_set', type: 'boolean', required: true, array: false },
      { key: 'pin_hash', type: 'string', required: false, array: false },
      { key: 'daily_limit', type: 'double', required: true, array: false },
      { key: 'monthly_limit', type: 'double', required: true, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'user_id_index', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
    ],
  },

  // Wallet transactions collection schema
  [COLLECTIONS.WALLET_TRANSACTIONS]: {
    name: 'Wallet Transactions',
    attributes: [
      { key: 'user_id', type: 'string', required: true, array: false },
      { key: 'wallet_id', type: 'string', required: true, array: false },
      { key: 'amount', type: 'double', required: true, array: false },
      { key: 'type', type: 'string', required: true, array: false },
      { key: 'status', type: 'string', required: true, array: false },
      { key: 'description', type: 'string', required: false, array: false },
      { key: 'service', type: 'string', required: true, array: false },
      { key: 'reference_id', type: 'string', required: false, array: false },
      { key: 'recipient_id', type: 'string', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'user_id_index', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'wallet_id_index', type: 'key', attributes: ['wallet_id'], orders: ['ASC'] },
      { key: 'created_at_index', type: 'key', attributes: ['created_at'], orders: ['DESC'] },
      { key: 'type_index', type: 'key', attributes: ['type'], orders: ['ASC'] },
      { key: 'status_index', type: 'key', attributes: ['status'], orders: ['ASC'] },
    ],
  },

  // Groups collection schema
  [COLLECTIONS.GROUPS]: {
    name: 'Groups',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'kiongozi_id', type: 'string', required: true, array: false },
      { key: 'max_members', type: 'integer', required: true, array: false },
      { key: 'rotation_duration', type: 'integer', required: true, array: false },
      { key: 'contribution_amount', type: 'double', required: true, array: false },
      { key: 'status', type: 'string', required: true, array: false },
      { key: 'current_rotation', type: 'integer', required: true, array: false },
      { key: 'description', type: 'string', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'kiongozi_id_index', type: 'key', attributes: ['kiongozi_id'], orders: ['ASC'] },
      { key: 'status_index', type: 'key', attributes: ['status'], orders: ['ASC'] },
    ],
  },

  // Group members collection schema
  [COLLECTIONS.GROUP_MEMBERS]: {
    name: 'Group Members',
    attributes: [
      { key: 'group_id', type: 'string', required: true, array: false },
      { key: 'user_id', type: 'string', required: true, array: false },
      { key: 'role', type: 'string', required: true, array: false },
      { key: 'rotation_position', type: 'integer', required: true, array: false },
      { key: 'joined_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'group_id_index', type: 'key', attributes: ['group_id'], orders: ['ASC'] },
      { key: 'user_id_index', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'group_user_index', type: 'key', attributes: ['group_id', 'user_id'], orders: ['ASC', 'ASC'] },
    ],
  },

  // Contributions collection schema
  [COLLECTIONS.CONTRIBUTIONS]: {
    name: 'Contributions',
    attributes: [
      { key: 'group_id', type: 'string', required: true, array: false },
      { key: 'user_id', type: 'string', required: true, array: false },
      { key: 'amount', type: 'double', required: true, array: false },
      { key: 'rotation', type: 'integer', required: true, array: false },
      { key: 'status', type: 'string', required: true, array: false },
      { key: 'transaction_id', type: 'string', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'group_id_index', type: 'key', attributes: ['group_id'], orders: ['ASC'] },
      { key: 'user_id_index', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'rotation_index', type: 'key', attributes: ['rotation'], orders: ['ASC'] },
    ],
  },

  // Group payments collection schema
  [COLLECTIONS.GROUP_PAYMENTS]: {
    name: 'Group Payments',
    attributes: [
      { key: 'group_id', type: 'string', required: true, array: false },
      { key: 'recipient_id', type: 'string', required: true, array: false },
      { key: 'amount', type: 'double', required: true, array: false },
      { key: 'rotation', type: 'integer', required: true, array: false },
      { key: 'status', type: 'string', required: true, array: false },
      { key: 'transaction_id', type: 'string', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'group_id_index', type: 'key', attributes: ['group_id'], orders: ['ASC'] },
      { key: 'recipient_id_index', type: 'key', attributes: ['recipient_id'], orders: ['ASC'] },
      { key: 'rotation_index', type: 'key', attributes: ['rotation'], orders: ['ASC'] },
    ],
  },

  // Status updates collection schema
  [COLLECTIONS.STATUS_UPDATES]: {
    name: 'Status Updates',
    attributes: [
      { key: 'user_id', type: 'string', required: true, array: false },
      { key: 'type', type: 'string', required: true, array: false },
      { key: 'content', type: 'string', required: true, array: false },
      { key: 'caption', type: 'string', required: false, array: false },
      { key: 'background', type: 'string', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'expires_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'user_id_index', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'created_at_index', type: 'key', attributes: ['created_at'], orders: ['DESC'] },
      { key: 'expires_at_index', type: 'key', attributes: ['expires_at'], orders: ['ASC'] },
    ],
  },

  // Status views collection schema
  [COLLECTIONS.STATUS_VIEWS]: {
    name: 'Status Views',
    attributes: [
      { key: 'status_id', type: 'string', required: true, array: false },
      { key: 'viewer_id', type: 'string', required: true, array: false },
      { key: 'viewed_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'status_id_index', type: 'key', attributes: ['status_id'], orders: ['ASC'] },
      { key: 'viewer_id_index', type: 'key', attributes: ['viewer_id'], orders: ['ASC'] },
      { key: 'status_viewer_index', type: 'key', attributes: ['status_id', 'viewer_id'], orders: ['ASC', 'ASC'] },
    ],
  },

  // Stream rooms collection schema
  [COLLECTIONS.STREAM_ROOMS]: {
    name: 'Stream Rooms',
    attributes: [
      { key: 'name', type: 'string', required: true, array: false },
      { key: 'creator_id', type: 'string', required: true, array: false },
      { key: 'description', type: 'string', required: false, array: false },
      { key: 'is_private', type: 'boolean', required: true, array: false },
      { key: 'janus_room_id', type: 'integer', required: false, array: false },
      { key: 'xmpp_room_jid', type: 'string', required: false, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
      { key: 'updated_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'creator_id_index', type: 'key', attributes: ['creator_id'], orders: ['ASC'] },
      { key: 'name_index', type: 'key', attributes: ['name'], orders: ['ASC'] },
    ],
  },

  // Stream messages collection schema
  [COLLECTIONS.STREAM_MESSAGES]: {
    name: 'Stream Messages',
    attributes: [
      { key: 'room_id', type: 'string', required: true, array: false },
      { key: 'sender_id', type: 'string', required: true, array: false },
      { key: 'content', type: 'string', required: true, array: false },
      { key: 'type', type: 'string', required: true, array: false },
      { key: 'created_at', type: 'datetime', required: true, array: false },
    ],
    indexes: [
      { key: 'room_id_index', type: 'key', attributes: ['room_id'], orders: ['ASC'] },
      { key: 'sender_id_index', type: 'key', attributes: ['sender_id'], orders: ['ASC'] },
      { key: 'created_at_index', type: 'key', attributes: ['created_at'], orders: ['ASC'] },
    ],
  },
};

// Storage bucket configurations
const bucketConfigs = {
  [STORAGE_BUCKETS.STATUS_MEDIA]: {
    name: 'Status Media',
    permissions: ['read("any")'],
    fileSecurity: true,
    maximumFileSize: 100000000, // 100MB
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm'],
    compression: 'none',
  },
  [STORAGE_BUCKETS.PROFILE_IMAGES]: {
    name: 'Profile Images',
    permissions: ['read("any")'],
    fileSecurity: true,
    maximumFileSize: 10000000, // 10MB
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif'],
    compression: 'none',
  },
  [STORAGE_BUCKETS.GROUP_IMAGES]: {
    name: 'Group Images',
    permissions: ['read("any")'],
    fileSecurity: true,
    maximumFileSize: 10000000, // 10MB
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif'],
    compression: 'none',
  },
};

// Function to create collections
async function createCollections() {
  console.log('Creating collections...');
  
  for (const [collectionId, schema] of Object.entries(schemas)) {
    try {
      console.log(`Creating collection: ${collectionId}`);
      
      // Check if collection exists
      try {
        await databases.getCollection(databaseId, collectionId);
        console.log(`Collection ${collectionId} already exists, skipping creation`);
        continue;
      } catch (error) {
        // Collection doesn't exist, create it
        console.log(`Collection ${collectionId} doesn't exist, creating...`);
      }
      
      // Create collection
      await databases.createCollection(
        databaseId,
        collectionId,
        schema.name,
        ['read("any")', 'write("any")'] // Default permissions, should be restricted in production
      );
      
      // Create attributes
      for (const attribute of schema.attributes) {
        try {
          console.log(`Creating attribute ${attribute.key} for collection ${collectionId}`);
          
          if (attribute.type === 'string') {
            await databases.createStringAttribute(
              databaseId,
              collectionId,
              attribute.key,
              attribute.required,
              255, // Default max length
              attribute.array
            );
          } else if (attribute.type === 'integer') {
            await databases.createIntegerAttribute(
              databaseId,
              collectionId,
              attribute.key,
              attribute.required,
              attribute.array
            );
          } else if (attribute.type === 'double') {
            await databases.createFloatAttribute(
              databaseId,
              collectionId,
              attribute.key,
              attribute.required,
              attribute.array
            );
          } else if (attribute.type === 'boolean') {
            await databases.createBooleanAttribute(
              databaseId,
              collectionId,
              attribute.key,
              attribute.required,
              attribute.array
            );
          } else if (attribute.type === 'datetime') {
            await databases.createDatetimeAttribute(
              databaseId,
              collectionId,
              attribute.key,
              attribute.required,
              attribute.array
            );
          }
        } catch (error) {
          console.warn(`Error creating attribute ${attribute.key} for collection ${collectionId}:`, error);
        }
      }
      
      // Wait for attributes to be ready
      console.log(`Waiting for attributes to be ready for collection ${collectionId}...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Create indexes
      for (const index of schema.indexes) {
        try {
          console.log(`Creating index ${index.key} for collection ${collectionId}`);
          await databases.createIndex(
            databaseId,
            collectionId,
            index.key,
            index.type,
            index.attributes,
            index.orders
          );
        } catch (error) {
          console.warn(`Error creating index ${index.key} for collection ${collectionId}:`, error);
        }
      }
      
      console.log(`Collection ${collectionId} created successfully`);
    } catch (error) {
      console.error(`Error creating collection ${collectionId}:`, error);
    }
  }
}

// Function to create storage buckets
async function createBuckets() {
  console.log('Creating storage buckets...');
  
  for (const [bucketId, config] of Object.entries(bucketConfigs)) {
    try {
      console.log(`Creating bucket: ${bucketId}`);
      
      // Check if bucket exists
      try {
        await storage.getBucket(bucketId);
        console.log(`Bucket ${bucketId} already exists, skipping creation`);
        continue;
      } catch (error) {
        // Bucket doesn't exist, create it
        console.log(`Bucket ${bucketId} doesn't exist, creating...`);
      }
      
      // Create bucket
      await storage.createBucket(
        bucketId,
        config.name,
        config.permissions,
        config.fileSecurity,
        config.maximumFileSize,
        config.allowedFileExtensions,
        config.compression
      );
      
      console.log(`Bucket ${bucketId} created successfully`);
    } catch (error) {
      console.error(`Error creating bucket ${bucketId}:`, error);
    }
  }
}

// Main function to initialize everything
async function initialize() {
  try {
    console.log('Starting Appwrite initialization...');
    
    // Create collections
    await createCollections();
    
    // Create storage buckets
    await createBuckets();
    
    console.log('Appwrite initialization completed successfully');
  } catch (error) {
    console.error('Error initializing Appwrite:', error);
  }
}

// Run the initialization
initialize();
