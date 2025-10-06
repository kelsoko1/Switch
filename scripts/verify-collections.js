#!/usr/bin/env node

/**
 * Appwrite Collections Verification and Setup Script
 * This script verifies that all required collections exist and creates them if missing
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import readline from 'readline';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

// Required collections configuration
const REQUIRED_COLLECTIONS = {
  live_streams: {
    name: 'Live Streams',
    attributes: [
      { key: 'streamId', type: 'string', size: 255, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'streamerId', type: 'string', size: 255, required: true },
      { key: 'streamerName', type: 'string', size: 255, required: true },
      { key: 'category', type: 'string', size: 100, required: false },
      { key: 'tags', type: 'string', size: 1000, required: false, array: true },
      { key: 'thumbnailUrl', type: 'string', size: 500, required: false },
      { key: 'isLive', type: 'boolean', required: true },
      { key: 'isPaid', type: 'boolean', required: false },
      { key: 'price', type: 'double', required: false },
      { key: 'viewerCount', type: 'integer', required: false },
      { key: 'likeCount', type: 'integer', required: false },
      { key: 'startedAt', type: 'datetime', required: false },
      { key: 'endedAt', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'streamerId_idx', type: 'key', attributes: ['streamerId'] },
      { key: 'isLive_idx', type: 'key', attributes: ['isLive'] },
    ],
  },
  stream_comments: {
    name: 'Stream Comments',
    attributes: [
      { key: 'streamId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'timestamp', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'streamId_idx', type: 'key', attributes: ['streamId'] },
    ],
  },
  status_updates: {
    name: 'Status Updates',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'userAvatar', type: 'string', size: 500, required: false },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'content', type: 'string', size: 1000, required: false },
      { key: 'mediaUrl', type: 'string', size: 500, required: false },
      { key: 'backgroundColor', type: 'string', size: 50, required: false },
      { key: 'font', type: 'string', size: 50, required: false },
      { key: 'expiresAt', type: 'datetime', required: true },
      { key: 'views', type: 'integer', required: false },
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'expiresAt_idx', type: 'key', attributes: ['expiresAt'] },
    ],
  },
  videos: {
    name: 'Videos',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'userAvatar', type: 'string', size: 500, required: false },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'videoUrl', type: 'string', size: 500, required: true },
      { key: 'thumbnailUrl', type: 'string', size: 500, required: false },
      { key: 'duration', type: 'integer', required: false },
      { key: 'category', type: 'string', size: 100, required: false },
      { key: 'tags', type: 'string', size: 1000, required: false, array: true },
      { key: 'visibility', type: 'string', size: 50, required: false },
      { key: 'views', type: 'integer', required: false },
      { key: 'likes', type: 'integer', required: false },
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'category_idx', type: 'key', attributes: ['category'] },
    ],
  },
  shorts: {
    name: 'Shorts',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'userAvatar', type: 'string', size: 500, required: false },
      { key: 'caption', type: 'string', size: 500, required: false },
      { key: 'videoUrl', type: 'string', size: 500, required: true },
      { key: 'thumbnailUrl', type: 'string', size: 500, required: false },
      { key: 'duration', type: 'integer', required: true },
      { key: 'views', type: 'integer', required: false },
      { key: 'likes', type: 'integer', required: false },
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
    ],
  },
  groups: {
    name: 'Groups',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'avatar_url', type: 'string', size: 500, required: false },
      { key: 'members', type: 'string', size: 255, required: false, array: true },
      { key: 'kiongoziId', type: 'string', size: 255, required: false },
      { key: 'contributionAmount', type: 'double', required: false },
      { key: 'cycleDuration', type: 'integer', required: false },
      { key: 'maxMembers', type: 'integer', required: false },
      { key: 'currentMembers', type: 'integer', required: false },
      { key: 'status', type: 'string', size: 50, required: false },
    ],
    indexes: [
      { key: 'created_by_idx', type: 'key', attributes: ['created_by'] },
      { key: 'type_idx', type: 'key', attributes: ['type'] },
    ],
  },
  messages: {
    name: 'Messages',
    attributes: [
      { key: 'groupId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 5000, required: true },
      { key: 'type', type: 'string', size: 50, required: false },
      { key: 'timestamp', type: 'datetime', required: true },
      { key: 'read', type: 'boolean', required: false },
    ],
    indexes: [
      { key: 'groupId_idx', type: 'key', attributes: ['groupId'] },
      { key: 'timestamp_idx', type: 'key', attributes: ['timestamp'] },
    ],
  },
  wallets: {
    name: 'Wallets',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'balance', type: 'double', required: true },
      { key: 'currency', type: 'string', size: 10, required: false },
      { key: 'pin_set', type: 'boolean', required: false },
      { key: 'daily_limit', type: 'double', required: false },
      { key: 'monthly_limit', type: 'double', required: false },
      { key: 'kijumbe_balance', type: 'double', required: false },
    ],
    indexes: [
      { key: 'userId_idx', type: 'unique', attributes: ['userId'] },
    ],
  },
  transactions: {
    name: 'Transactions',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'currency', type: 'string', size: 10, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'recipient', type: 'string', size: 255, required: false },
      { key: 'sender', type: 'string', size: 255, required: false },
      { key: 'reference', type: 'string', size: 255, required: false },
      { key: 'created_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'type_idx', type: 'key', attributes: ['type'] },
      { key: 'created_at_idx', type: 'key', attributes: ['created_at'] },
    ],
  },
};

// Initialize Appwrite client
let client, databases;

async function initializeAppwrite() {
  const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '68ac2652001ca468e987';
  const apiKey = process.env.VITE_APPWRITE_API_KEY;
  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '68ac3f000002c33d8048';

  if (!apiKey) {
    log.error('VITE_APPWRITE_API_KEY not found in environment variables');
    log.info('Please set your Appwrite API key in .env file');
    process.exit(1);
  }

  client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  databases = new Databases(client);

  log.success('Connected to Appwrite');
  log.info(`Endpoint: ${endpoint}`);
  log.info(`Project: ${projectId}`);
  log.info(`Database: ${databaseId}`);

  return databaseId;
}

async function checkCollectionExists(databaseId, collectionId) {
  try {
    await databases.getCollection(databaseId, collectionId);
    return true;
  } catch (error) {
    if (error.code === 404) {
      return false;
    }
    throw error;
  }
}

async function createCollection(databaseId, collectionId, config) {
  try {
    log.info(`Creating collection: ${config.name} (${collectionId})`);

    // Create collection
    await databases.createCollection(
      databaseId,
      collectionId,
      config.name,
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );

    log.success(`Collection created: ${config.name}`);

    // Wait a bit for collection to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create attributes
    for (const attr of config.attributes) {
      try {
        log.info(`  Adding attribute: ${attr.key} (${attr.type})`);

        if (attr.type === 'string') {
          await databases.createStringAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.size,
            attr.required,
            undefined,
            attr.array || false
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required,
            undefined,
            undefined,
            attr.array || false
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required,
            undefined,
            undefined,
            attr.array || false
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required,
            undefined,
            attr.array || false
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required,
            undefined,
            attr.array || false
          );
        }

        // Wait for attribute to be available
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        log.warning(`  Failed to create attribute ${attr.key}: ${error.message}`);
      }
    }

    // Create indexes
    if (config.indexes) {
      for (const index of config.indexes) {
        try {
          log.info(`  Creating index: ${index.key}`);
          await databases.createIndex(
            databaseId,
            collectionId,
            index.key,
            index.type,
            index.attributes
          );
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          log.warning(`  Failed to create index ${index.key}: ${error.message}`);
        }
      }
    }

    log.success(`✓ Collection ${config.name} setup complete\n`);
    return true;
  } catch (error) {
    log.error(`Failed to create collection ${config.name}: ${error.message}`);
    return false;
  }
}

async function verifyCollections(databaseId, autoCreate = false) {
  log.title('📋 Verifying Appwrite Collections');

  const results = {
    existing: [],
    missing: [],
    created: [],
    failed: [],
  };

  for (const [collectionId, config] of Object.entries(REQUIRED_COLLECTIONS)) {
    const exists = await checkCollectionExists(databaseId, collectionId);

    if (exists) {
      log.success(`${config.name} (${collectionId})`);
      results.existing.push(collectionId);
    } else {
      log.warning(`${config.name} (${collectionId}) - MISSING`);
      results.missing.push(collectionId);

      if (autoCreate) {
        const created = await createCollection(databaseId, collectionId, config);
        if (created) {
          results.created.push(collectionId);
        } else {
          results.failed.push(collectionId);
        }
      }
    }
  }

  return results;
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log.title('🚀 Appwrite Collections Verification Tool');
  console.log('='.repeat(60) + '\n');

  try {
    // Initialize Appwrite
    const databaseId = await initializeAppwrite();

    // Check collections
    const results = await verifyCollections(databaseId, false);

    // Display summary
    console.log('\n' + '='.repeat(60));
    log.title('📊 Summary');
    console.log('='.repeat(60) + '\n');

    log.success(`Existing collections: ${results.existing.length}/${Object.keys(REQUIRED_COLLECTIONS).length}`);
    if (results.missing.length > 0) {
      log.warning(`Missing collections: ${results.missing.length}`);
      console.log(`  ${results.missing.join(', ')}`);
    }

    // Ask to create missing collections
    if (results.missing.length > 0) {
      console.log('');
      const answer = await promptUser('Do you want to create the missing collections? (yes/no): ');

      if (answer === 'yes' || answer === 'y') {
        log.info('\nCreating missing collections...\n');
        const createResults = await verifyCollections(databaseId, true);

        console.log('\n' + '='.repeat(60));
        log.title('✅ Creation Complete');
        console.log('='.repeat(60) + '\n');

        if (createResults.created.length > 0) {
          log.success(`Created ${createResults.created.length} collections:`);
          createResults.created.forEach(id => console.log(`  - ${id}`));
        }

        if (createResults.failed.length > 0) {
          log.error(`Failed to create ${createResults.failed.length} collections:`);
          createResults.failed.forEach(id => console.log(`  - ${id}`));
        }
      } else {
        log.info('Skipping collection creation');
      }
    } else {
      log.success('\n✨ All required collections exist!');
    }

    console.log('\n' + '='.repeat(60) + '\n');
  } catch (error) {
    log.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
