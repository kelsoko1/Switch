const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;

// Collection definitions
const collections = [
  {
    id: 'users',
    name: 'Users',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ],
    attributes: [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'email', type: 'string', required: true, size: 255 },
      { key: 'phone', type: 'string', required: false, size: 20 },
      { key: 'nida', type: 'string', required: false, size: 20 },
      { key: 'role', type: 'string', required: true, size: 20, default: 'member' },
      { key: 'status', type: 'string', required: true, size: 20, default: 'active' },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'email_index', type: 'key', attributes: ['email'] },
      { key: 'phone_index', type: 'key', attributes: ['phone'] },
    ],
  },
  {
    id: 'groups',
    name: 'Groups',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ],
    attributes: [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'kiongozi_id', type: 'string', required: true, size: 255 },
      { key: 'max_members', type: 'integer', required: true, min: 3, max: 100, default: 5 },
      { key: 'rotation_duration', type: 'integer', required: true, min: 1, max: 365, default: 30 },
      { key: 'contribution_amount', type: 'double', required: true, min: 1000, default: 10000 },
      { key: 'status', type: 'string', required: true, size: 20, default: 'active' },
      { key: 'current_rotation', type: 'integer', required: true, min: 1, default: 1 },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: false },
      { key: 'description', type: 'string', required: false, size: 1000 },
    ],
    indexes: [
      { key: 'kiongozi_index', type: 'key', attributes: ['kiongozi_id'] },
      { key: 'status_index', type: 'key', attributes: ['status'] },
    ],
  },
  {
    id: 'group_members',
    name: 'Group Members',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ],
    attributes: [
      { key: 'group_id', type: 'string', required: true, size: 255 },
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'role', type: 'string', required: true, size: 20, default: 'member' },
      { key: 'rotation_position', type: 'integer', required: true, min: 1 },
      { key: 'joined_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'group_user_index', type: 'key', attributes: ['group_id', 'user_id'] },
      { key: 'user_index', type: 'key', attributes: ['user_id'] },
      { key: 'group_index', type: 'key', attributes: ['group_id'] },
    ],
  },
  {
    id: 'contributions',
    name: 'Contributions',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ],
    attributes: [
      { key: 'group_id', type: 'string', required: true, size: 255 },
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'amount', type: 'double', required: true, min: 0 },
      { key: 'rotation', type: 'integer', required: true, min: 1 },
      { key: 'status', type: 'string', required: true, size: 20, default: 'pending' },
      { key: 'transaction_id', type: 'string', required: false, size: 255 },
      { key: 'created_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'group_user_rotation_index', type: 'key', attributes: ['group_id', 'user_id', 'rotation'] },
      { key: 'user_index', type: 'key', attributes: ['user_id'] },
      { key: 'group_index', type: 'key', attributes: ['group_id'] },
    ],
  },
  {
    id: 'group_payments',
    name: 'Group Payments',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ],
    attributes: [
      { key: 'group_id', type: 'string', required: true, size: 255 },
      { key: 'recipient_id', type: 'string', required: true, size: 255 },
      { key: 'amount', type: 'double', required: true, min: 0 },
      { key: 'rotation', type: 'integer', required: true, min: 1 },
      { key: 'status', type: 'string', required: true, size: 20, default: 'pending' },
      { key: 'transaction_id', type: 'string', required: false, size: 255 },
      { key: 'created_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'group_rotation_index', type: 'key', attributes: ['group_id', 'rotation'] },
      { key: 'recipient_index', type: 'key', attributes: ['recipient_id'] },
      { key: 'group_index', type: 'key', attributes: ['group_id'] },
    ],
  },
  {
    id: 'wallets',
    name: 'Wallets',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ],
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'balance', type: 'double', required: true, min: 0, default: 0 },
      { key: 'pin_set', type: 'boolean', required: true, default: false },
      { key: 'pin_hash', type: 'string', required: false, size: 255 },
      { key: 'daily_limit', type: 'double', required: true, min: 0, default: 1000000 },
      { key: 'monthly_limit', type: 'double', required: true, min: 0, default: 10000000 },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'user_index', type: 'key', attributes: ['user_id'] },
    ],
  },
  {
    id: 'wallet_transactions',
    name: 'Wallet Transactions',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
    ],
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'wallet_id', type: 'string', required: true, size: 255 },
      { key: 'amount', type: 'double', required: true, min: 0 },
      { key: 'type', type: 'string', required: true, size: 50 },
      { key: 'status', type: 'string', required: true, size: 20, default: 'pending' },
      { key: 'description', type: 'string', required: false, size: 1000 },
      { key: 'service', type: 'string', required: true, size: 50, default: 'general' },
      { key: 'reference_id', type: 'string', required: false, size: 255 },
      { key: 'recipient_id', type: 'string', required: false, size: 255 },
      { key: 'created_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'user_index', type: 'key', attributes: ['user_id'] },
      { key: 'wallet_index', type: 'key', attributes: ['wallet_id'] },
      { key: 'type_index', type: 'key', attributes: ['type'] },
      { key: 'status_index', type: 'key', attributes: ['status'] },
    ],
  },
];

// Main function to create database and collections
async function setupAppwrite() {
  try {
    console.log('Starting Appwrite setup...');
    console.log(`Using database ID: ${databaseId}`);

    // Check if database exists, if not create it
    try {
      await databases.get(databaseId);
      console.log(`Database ${databaseId} already exists.`);
    } catch (error) {
      if (error.code === 404) {
        await databases.create(databaseId, 'Kijumbe Database');
        console.log(`Created database ${databaseId}.`);
      } else {
        throw error;
      }
    }

    // Create collections
    for (const collection of collections) {
      try {
        // Check if collection exists
        try {
          await databases.getCollection(databaseId, collection.id);
          console.log(`Collection ${collection.id} already exists.`);
        } catch (error) {
          if (error.code === 404) {
            // Create collection
            await databases.createCollection(
              databaseId,
              collection.id,
              collection.name,
              collection.permissions
            );
            console.log(`Created collection ${collection.id}.`);
          } else {
            throw error;
          }
        }

        // Create attributes
        for (const attr of collection.attributes) {
          try {
            if (attr.type === 'string') {
              await databases.createStringAttribute(
                databaseId,
                collection.id,
                attr.key,
                attr.size,
                attr.required,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'integer') {
              await databases.createIntegerAttribute(
                databaseId,
                collection.id,
                attr.key,
                attr.required,
                attr.min,
                attr.max,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'double') {
              await databases.createFloatAttribute(
                databaseId,
                collection.id,
                attr.key,
                attr.required,
                attr.min,
                attr.max || null,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'boolean') {
              await databases.createBooleanAttribute(
                databaseId,
                collection.id,
                attr.key,
                attr.required,
                attr.default || null,
                attr.array || false
              );
            } else if (attr.type === 'datetime') {
              await databases.createDatetimeAttribute(
                databaseId,
                collection.id,
                attr.key,
                attr.required,
                attr.default || null,
                attr.array || false
              );
            }
            console.log(`Created attribute ${attr.key} in collection ${collection.id}.`);
          } catch (error) {
            if (error.code === 409) {
              console.log(`Attribute ${attr.key} already exists in collection ${collection.id}.`);
            } else {
              console.error(`Error creating attribute ${attr.key}:`, error);
            }
          }
        }

        // Create indexes
        if (collection.indexes) {
          for (const index of collection.indexes) {
            try {
              await databases.createIndex(
                databaseId,
                collection.id,
                index.key,
                index.type,
                index.attributes
              );
              console.log(`Created index ${index.key} in collection ${collection.id}.`);
            } catch (error) {
              if (error.code === 409) {
                console.log(`Index ${index.key} already exists in collection ${collection.id}.`);
              } else {
                console.error(`Error creating index ${index.key}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing collection ${collection.id}:`, error);
      }
    }

    console.log('Appwrite setup completed successfully!');
  } catch (error) {
    console.error('Error setting up Appwrite:', error);
  }
}

// Run the setup
setupAppwrite();
