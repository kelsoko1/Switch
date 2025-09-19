const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Debug log environment variables
console.log('Environment variables:');
console.log('Endpoint:', process.env.VITE_APPWRITE_ENDPOINT);
console.log('Project ID:', process.env.VITE_APPWRITE_PROJECT_ID);
console.log('Database ID:', process.env.VITE_APPWRITE_DATABASE_ID);

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68ac2652001ca468e987')
    .setKey('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498');

const databases = new Databases(client);
const databaseId = '68ac3f000002c33d8048'; // Hardcoded database ID from your environment

async function createCollection(collectionId, name, attributes, indexes = []) {
    try {
        // Create collection
        await databases.createCollection(
            databaseId,
            collectionId,
            name,
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.team('admin'))
            ]
        );
        console.log(`Created collection: ${name}`);

        // Create attributes
        for (const attr of attributes) {
            try {
                const methodName = `create${attr.type.charAt(0).toUpperCase() + attr.type.slice(1)}Attribute`;
                await databases[methodName](
                    databaseId,
                    collectionId,
                    attr.key,
                    attr.required,
                    attr.default,
                    attr.array,
                    attr.size,
                    attr.min,
                    attr.max
                );
                console.log(`Added attribute: ${attr.key} to ${name}`);
            } catch (error) {
                console.error(`Error adding attribute ${attr.key}:`, error.message);
            }
        }

        // Create indexes
        for (const index of indexes) {
            try {
                await databases.createIndex(
                    databaseId,
                    collectionId,
                    index.key,
                    index.type,
                    index.attributes
                );
                console.log(`Added index: ${index.key} to ${name}`);
            } catch (error) {
                console.error(`Error adding index ${index.key}:`, error.message);
            }
        }
    } catch (error) {
        console.error(`Error creating collection ${name}:`, error.message);
    }
}

async function setupCollections() {
    try {
        // Users Collection
        await createCollection(
            'users',
            'Users',
            [
                { type: 'string', key: 'name', size: 255, required: true },
                { type: 'string', key: 'email', size: 255, required: true },
                { type: 'string', key: 'phone', size: 20, required: true },
                { type: 'string', key: 'role', size: 20, required: true, default: 'member' },
                { type: 'string', key: 'status', size: 20, required: true, default: 'active' }
            ],
            [
                { key: 'email_unique', type: 'unique', attributes: ['email'] },
                { key: 'phone_unique', type: 'unique', attributes: ['phone'] }
            ]
        );

        // Groups Collection
        await createCollection(
            'groups',
            'Groups',
            [
                { type: 'string', key: 'name', size: 255, required: true },
                { type: 'string', key: 'description', size: 1000, required: false },
                { type: 'string', key: 'kiongozi_id', size: 36, required: true },
                { type: 'integer', key: 'max_members', required: true, min: 2, max: 30 },
                { type: 'integer', key: 'rotation_duration', required: true, min: 1 },
                { type: 'integer', key: 'contribution_amount', required: true, min: 0 },
                { type: 'string', key: 'status', size: 20, required: true, default: 'active' },
                { type: 'integer', key: 'current_rotation', required: true, default: 1 }
            ]
        );

        // Members Collection
        await createCollection(
            'members',
            'Group Members',
            [
                { type: 'string', key: 'group_id', size: 36, required: true },
                { type: 'string', key: 'user_id', size: 36, required: true },
                { type: 'string', key: 'role', size: 20, required: true, default: 'member' },
                { type: 'integer', key: 'rotation_position', required: true, min: 1 },
                { type: 'datetime', key: 'joined_at', required: true }
            ],
            [
                { key: 'group_user_unique', type: 'unique', attributes: ['group_id', 'user_id'] }
            ]
        );

        // Transactions Collection
        await createCollection(
            'transactions',
            'Transactions',
            [
                { type: 'string', key: 'user_id', size: 36, required: true },
                { type: 'string', key: 'type', size: 50, required: true },
                { type: 'integer', key: 'amount', required: true },
                { type: 'string', key: 'status', size: 20, required: true, default: 'pending' },
                { type: 'string', key: 'description', size: 1000, required: false },
                { type: 'string', key: 'reference_id', size: 255, required: false },
                { type: 'string', key: 'group_id', size: 36, required: false },
                { type: 'integer', key: 'rotation', required: false }
            ]
        );

        // Wallets Collection
        await createCollection(
            'wallets',
            'Wallets',
            [
                { type: 'string', key: 'user_id', size: 36, required: true },
                { type: 'integer', key: 'balance', required: true, min: 0, default: 0 },
                { type: 'boolean', key: 'pin_set', required: true, default: false },
                { type: 'string', key: 'pin_hash', size: 255, required: false },
                { type: 'integer', key: 'daily_limit', required: true, default: 1000000 },
                { type: 'integer', key: 'monthly_limit', required: true, default: 10000000 }
            ],
            [
                { key: 'user_wallet_unique', type: 'unique', attributes: ['user_id'] }
            ]
        );

        // Wallet Transactions Collection
        await createCollection(
            'wallet_transactions',
            'Wallet Transactions',
            [
                { type: 'string', key: 'user_id', size: 36, required: true },
                { type: 'string', key: 'wallet_id', size: 36, required: true },
                { type: 'integer', key: 'amount', required: true },
                { type: 'string', key: 'type', size: 50, required: true },
                { type: 'string', key: 'status', size: 20, required: true, default: 'pending' },
                { type: 'string', key: 'description', size: 1000, required: false },
                { type: 'string', key: 'service', size: 50, required: false },
                { type: 'string', key: 'reference_id', size: 255, required: false },
                { type: 'string', key: 'recipient_id', size: 36, required: false }
            ]
        );

        // WhatsApp Messages Collection
        await createCollection(
            'whatsapp_messages',
            'WhatsApp Messages',
            [
                { type: 'string', key: 'user_id', size: 36, required: true },
                { type: 'string', key: 'phone', size: 20, required: true },
                { type: 'string', key: 'message', size: 2000, required: true },
                { type: 'string', key: 'type', size: 20, required: true },
                { type: 'string', key: 'status', size: 20, required: true, default: 'pending' },
                { type: 'string', key: 'message_id', size: 255, required: false },
                { type: 'datetime', key: 'sent_at', required: false }
            ]
        );

        console.log('All collections created successfully!');
    } catch (error) {
        console.error('Error setting up collections:', error);
    }
}

setupCollections();
