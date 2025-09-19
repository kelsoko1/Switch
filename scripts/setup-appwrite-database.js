#!/usr/bin/env node

/**
 * Appwrite Database Setup Script
 * 
 * This script sets up the required database and collections for the Kijumbe integration.
 * Run this script after creating your Appwrite project.
 * 
 * Usage: node scripts/setup-appwrite-database.js
 */

const { Client, Databases, Permission, Role } = require('appwrite');

// Configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'your-project-id';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || 'your-api-key';

// Database ID
const DATABASE_ID = 'kijumbe-database';

// Collection IDs
const COLLECTIONS = {
  USERS: 'users',
  WALLETS: 'wallets',
  TRANSACTIONS: 'transactions',
  SAVINGS_GOALS: 'savings_goals',
  GROUPS: 'groups',
  GROUP_MEMBERS: 'group_members',
  CONTRIBUTIONS: 'contributions',
  GROUP_PAYMENTS: 'group_payments',
  WHATSAPP_MESSAGES: 'whatsapp_messages',
  SYSTEM_SETTINGS: 'system_settings',
};

// Create Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

// Collection schemas
const collectionSchemas = {
  [COLLECTIONS.USERS]: {
    name: 'Users',
    documentSecurity: true,
    attributes: [
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'role', type: 'enum', elements: ['member', 'kiongozi', 'admin', 'superadmin'], required: true, default: 'member' },
      { key: 'phone', type: 'string', size: 20, required: false },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'is_active', type: 'boolean', required: true, default: true },
      { key: 'last_login', type: 'datetime', required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'email_index', type: 'key', attributes: ['email'], orders: ['ASC'] },
      { key: 'role_index', type: 'key', attributes: ['role'], orders: ['ASC'] },
    ],
  },
  [COLLECTIONS.WALLETS]: {
    name: 'Wallets',
    documentSecurity: true,
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'balance', type: 'double', required: true, default: 0 },
      { key: 'pin_set', type: 'boolean', required: true, default: false },
      { key: 'pin_hash', type: 'string', size: 255, required: false },
      { key: 'currency', type: 'string', size: 3, required: true, default: 'TZS' },
      { key: 'is_active', type: 'boolean', required: true, default: true },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'user_id_index', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
    ],
  },
  [COLLECTIONS.TRANSACTIONS]: {
    name: 'Transactions',
    documentSecurity: true,
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'type', type: 'enum', elements: ['deposit', 'withdraw', 'contribution', 'refund', 'payment'], required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'status', type: 'enum', elements: ['pending', 'completed', 'failed', 'cancelled'], required: true, default: 'pending' },
      { key: 'group_id', type: 'string', size: 255, required: false },
      { key: 'recipient_id', type: 'string', size: 255, required: false },
      { key: 'payment_method', type: 'string', size: 50, required: false },
      { key: 'reference', type: 'string', size: 255, required: false },
      { key: 'created_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'user_id_index', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'type_index', type: 'key', attributes: ['type'], orders: ['ASC'] },
      { key: 'status_index', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'created_at_index', type: 'key', attributes: ['created_at'], orders: ['DESC'] },
    ],
  },
  [COLLECTIONS.SAVINGS_GOALS]: {
    name: 'Savings Goals',
    documentSecurity: true,
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'target_amount', type: 'double', required: true },
      { key: 'current_amount', type: 'double', required: true, default: 0 },
      { key: 'target_date', type: 'datetime', required: true },
      { key: 'status', type: 'enum', elements: ['active', 'completed', 'paused', 'cancelled'], required: true, default: 'active' },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'user_id_index', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'status_index', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'target_date_index', type: 'key', attributes: ['target_date'], orders: ['ASC'] },
    ],
  },
  [COLLECTIONS.GROUPS]: {
    name: 'Groups',
    documentSecurity: true,
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'contribution_amount', type: 'double', required: true },
      { key: 'frequency', type: 'enum', elements: ['weekly', 'monthly'], required: true },
      { key: 'max_members', type: 'integer', required: true, default: 10 },
      { key: 'current_members', type: 'integer', required: true, default: 0 },
      { key: 'status', type: 'enum', elements: ['active', 'completed', 'paused', 'cancelled'], required: true, default: 'active' },
      { key: 'start_date', type: 'datetime', required: true },
      { key: 'end_date', type: 'datetime', required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'created_by_index', type: 'key', attributes: ['created_by'], orders: ['ASC'] },
      { key: 'status_index', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'start_date_index', type: 'key', attributes: ['start_date'], orders: ['ASC'] },
    ],
  },
  [COLLECTIONS.GROUP_MEMBERS]: {
    name: 'Group Members',
    documentSecurity: true,
    attributes: [
      { key: 'group_id', type: 'string', size: 255, required: true },
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'role', type: 'enum', elements: ['member', 'kiongozi'], required: true, default: 'member' },
      { key: 'status', type: 'enum', elements: ['active', 'inactive', 'removed'], required: true, default: 'active' },
      { key: 'joined_at', type: 'datetime', required: true },
      { key: 'left_at', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'group_id_index', type: 'key', attributes: ['group_id'], orders: ['ASC'] },
      { key: 'user_id_index', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'status_index', type: 'key', attributes: ['status'], orders: ['ASC'] },
    ],
  },
  [COLLECTIONS.CONTRIBUTIONS]: {
    name: 'Contributions',
    documentSecurity: true,
    attributes: [
      { key: 'group_id', type: 'string', size: 255, required: true },
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'cycle_number', type: 'integer', required: true },
      { key: 'status', type: 'enum', elements: ['pending', 'completed', 'overdue'], required: true, default: 'pending' },
      { key: 'due_date', type: 'datetime', required: true },
      { key: 'paid_at', type: 'datetime', required: false },
      { key: 'created_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'group_id_index', type: 'key', attributes: ['group_id'], orders: ['ASC'] },
      { key: 'user_id_index', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'cycle_number_index', type: 'key', attributes: ['cycle_number'], orders: ['ASC'] },
      { key: 'status_index', type: 'key', attributes: ['status'], orders: ['ASC'] },
    ],
  },
  [COLLECTIONS.GROUP_PAYMENTS]: {
    name: 'Group Payments',
    documentSecurity: true,
    attributes: [
      { key: 'group_id', type: 'string', size: 255, required: true },
      { key: 'recipient_id', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'cycle_number', type: 'integer', required: true },
      { key: 'status', type: 'enum', elements: ['pending', 'completed', 'failed'], required: true, default: 'pending' },
      { key: 'processed_by', type: 'string', size: 255, required: true },
      { key: 'processed_at', type: 'datetime', required: false },
      { key: 'created_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'group_id_index', type: 'key', attributes: ['group_id'], orders: ['ASC'] },
      { key: 'recipient_id_index', type: 'key', attributes: ['recipient_id'], orders: ['ASC'] },
      { key: 'cycle_number_index', type: 'key', attributes: ['cycle_number'], orders: ['ASC'] },
      { key: 'status_index', type: 'key', attributes: ['status'], orders: ['ASC'] },
    ],
  },
  [COLLECTIONS.WHATSAPP_MESSAGES]: {
    name: 'WhatsApp Messages',
    documentSecurity: true,
    attributes: [
      { key: 'phone_number', type: 'string', size: 20, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'direction', type: 'enum', elements: ['inbound', 'outbound'], required: true },
      { key: 'status', type: 'enum', elements: ['sent', 'delivered', 'read', 'failed'], required: true, default: 'sent' },
      { key: 'group_id', type: 'string', size: 255, required: false },
      { key: 'created_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'phone_number_index', type: 'key', attributes: ['phone_number'], orders: ['ASC'] },
      { key: 'direction_index', type: 'key', attributes: ['direction'], orders: ['ASC'] },
      { key: 'created_at_index', type: 'key', attributes: ['created_at'], orders: ['DESC'] },
    ],
  },
  [COLLECTIONS.SYSTEM_SETTINGS]: {
    name: 'System Settings',
    documentSecurity: true,
    attributes: [
      { key: 'key', type: 'string', size: 255, required: true },
      { key: 'value', type: 'string', size: 1000, required: true },
      { key: 'type', type: 'enum', elements: ['string', 'number', 'boolean', 'json'], required: true, default: 'string' },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'is_public', type: 'boolean', required: true, default: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'key_index', type: 'key', attributes: ['key'], orders: ['ASC'] },
      { key: 'is_public_index', type: 'key', attributes: ['is_public'], orders: ['ASC'] },
    ],
  },
};

async function setupDatabase() {
  try {
    console.log('🚀 Starting Appwrite database setup...');
    
    // Check if database exists
    let database;
    try {
      database = await databases.get(DATABASE_ID);
      console.log(`✅ Database '${DATABASE_ID}' already exists`);
    } catch (error) {
      if (error.code === 404) {
        // Create database
        console.log(`📦 Creating database '${DATABASE_ID}'...`);
        database = await databases.create(DATABASE_ID, 'Kijumbe Database');
        console.log(`✅ Database '${DATABASE_ID}' created successfully`);
      } else {
        throw error;
      }
    }

    // Create collections
    for (const [collectionId, schema] of Object.entries(collectionSchemas)) {
      try {
        const existingCollection = await databases.getCollection(DATABASE_ID, collectionId);
        console.log(`✅ Collection '${collectionId}' already exists`);
      } catch (error) {
        if (error.code === 404) {
          console.log(`📦 Creating collection '${collectionId}'...`);
          
          // Create collection
          const collection = await databases.createCollection(
            DATABASE_ID,
            collectionId,
            schema.name,
            schema.documentSecurity
          );
          
          // Add attributes
          for (const attribute of schema.attributes) {
            try {
              if (attribute.type === 'string') {
                await databases.createStringAttribute(
                  DATABASE_ID,
                  collectionId,
                  attribute.key,
                  attribute.size,
                  attribute.required,
                  attribute.default,
                  attribute.array
                );
              } else if (attribute.type === 'integer') {
                await databases.createIntegerAttribute(
                  DATABASE_ID,
                  collectionId,
                  attribute.key,
                  attribute.required,
                  attribute.default,
                  attribute.min,
                  attribute.max,
                  attribute.array
                );
              } else if (attribute.type === 'double') {
                await databases.createFloatAttribute(
                  DATABASE_ID,
                  collectionId,
                  attribute.key,
                  attribute.required,
                  attribute.default,
                  attribute.min,
                  attribute.max,
                  attribute.array
                );
              } else if (attribute.type === 'boolean') {
                await databases.createBooleanAttribute(
                  DATABASE_ID,
                  collectionId,
                  attribute.key,
                  attribute.required,
                  attribute.default,
                  attribute.array
                );
              } else if (attribute.type === 'datetime') {
                await databases.createDatetimeAttribute(
                  DATABASE_ID,
                  collectionId,
                  attribute.key,
                  attribute.required,
                  attribute.default,
                  attribute.array
                );
              } else if (attribute.type === 'enum') {
                await databases.createEnumAttribute(
                  DATABASE_ID,
                  collectionId,
                  attribute.key,
                  attribute.elements,
                  attribute.required,
                  attribute.default,
                  attribute.array
                );
              }
            } catch (attrError) {
              console.log(`⚠️  Attribute '${attribute.key}' might already exist: ${attrError.message}`);
            }
          }
          
          // Add indexes
          for (const index of schema.indexes) {
            try {
              await databases.createIndex(
                DATABASE_ID,
                collectionId,
                index.key,
                index.type,
                index.attributes,
                index.orders
              );
            } catch (indexError) {
              console.log(`⚠️  Index '${index.key}' might already exist: ${indexError.message}`);
            }
          }
          
          console.log(`✅ Collection '${collectionId}' created successfully`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the correct Appwrite credentials');
    console.log('2. Start your development server: npm run dev');
    console.log('3. Test the integration by creating a user account');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, COLLECTIONS };
