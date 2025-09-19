const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68ac2652001ca468e987')
    .setKey('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498');

const databases = new Databases(client);
const databaseId = '68ac3f000002c33d8048';

async function updateCollection(collectionId, updates) {
    try {
        // Get existing collection
        const collection = await databases.getCollection(databaseId, collectionId);
        
        // Update permissions
        if (updates.permissions) {
            await databases.updateCollection(
                databaseId,
                collectionId,
                collection.name,
                updates.permissions
            );
            console.log(`Updated permissions for collection: ${collectionId}`);
        }

        // Add new attributes
        if (updates.attributes) {
            for (const attr of updates.attributes) {
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
                    console.log(`Added attribute: ${attr.key} to ${collectionId}`);
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.error(`Error adding attribute ${attr.key}:`, error.message);
                    }
                }
            }
        }

        // Add new indexes
        if (updates.indexes) {
            for (const index of updates.indexes) {
                try {
                    await databases.createIndex(
                        databaseId,
                        collectionId,
                        index.key,
                        index.type,
                        index.attributes
                    );
                    console.log(`Added index: ${index.key} to ${collectionId}`);
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.error(`Error adding index ${index.key}:`, error.message);
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error updating collection ${collectionId}:`, error.message);
    }
}

async function updateCollections() {
    try {
        // Users Collection Updates
        await updateCollection('users', {
            permissions: [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.team('admin'))
            ],
            attributes: [
                { type: 'string', key: 'profile_photo', size: 255, required: false },
                { type: 'datetime', key: 'last_login', required: false },
                { type: 'string', key: 'preferred_language', size: 10, required: false, default: 'sw' },
                { type: 'boolean', key: 'notifications_enabled', required: false, default: true },
                { type: 'datetime', key: 'created_at', required: true },
                { type: 'datetime', key: 'updated_at', required: true }
            ],
            indexes: [
                { key: 'created_at_idx', type: 'key', attributes: ['created_at'] },
                { key: 'role_idx', type: 'key', attributes: ['role'] }
            ]
        });

        // Groups Collection Updates
        await updateCollection('groups', {
            permissions: [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.team('kiongozi')),
                Permission.delete(Role.team('admin'))
            ],
            attributes: [
                { type: 'string', key: 'group_photo', size: 255, required: false },
                { type: 'string', key: 'location', size: 255, required: false },
                { type: 'integer', key: 'total_members', required: true, min: 0, default: 0 },
                { type: 'integer', key: 'total_contributions', required: true, min: 0, default: 0 },
                { type: 'datetime', key: 'next_contribution_date', required: false },
                { type: 'datetime', key: 'created_at', required: true },
                { type: 'datetime', key: 'updated_at', required: true }
            ],
            indexes: [
                { key: 'created_at_idx', type: 'key', attributes: ['created_at'] },
                { key: 'status_idx', type: 'key', attributes: ['status'] }
            ]
        });

        // Members Collection Updates
        await updateCollection('members', {
            permissions: [
                Permission.read(Role.users()),
                Permission.create(Role.team('kiongozi')),
                Permission.update(Role.team('kiongozi')),
                Permission.delete(Role.team('kiongozi'))
            ],
            attributes: [
                { type: 'integer', key: 'contributions_made', required: true, min: 0, default: 0 },
                { type: 'datetime', key: 'last_contribution_date', required: false },
                { type: 'datetime', key: 'next_contribution_date', required: false },
                { type: 'boolean', key: 'notifications_enabled', required: true, default: true },
                { type: 'datetime', key: 'created_at', required: true },
                { type: 'datetime', key: 'updated_at', required: true }
            ],
            indexes: [
                { key: 'last_contribution_idx', type: 'key', attributes: ['last_contribution_date'] },
                { key: 'next_contribution_idx', type: 'key', attributes: ['next_contribution_date'] }
            ]
        });

        // Transactions Collection Updates
        await updateCollection('transactions', {
            permissions: [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.team('admin')),
                Permission.delete(Role.team('admin'))
            ],
            attributes: [
                { type: 'string', key: 'payment_method', size: 50, required: false },
                { type: 'string', key: 'payment_reference', size: 255, required: false },
                { type: 'string', key: 'metadata', size: 2000, required: false },
                { type: 'datetime', key: 'created_at', required: true },
                { type: 'datetime', key: 'updated_at', required: true }
            ],
            indexes: [
                { key: 'created_at_idx', type: 'key', attributes: ['created_at'] },
                { key: 'payment_reference_idx', type: 'key', attributes: ['payment_reference'] }
            ]
        });

        // Wallets Collection Updates
        await updateCollection('wallets', {
            permissions: [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.team('admin'))
            ],
            attributes: [
                { type: 'integer', key: 'total_transactions', required: true, min: 0, default: 0 },
                { type: 'integer', key: 'pending_balance', required: true, min: 0, default: 0 },
                { type: 'datetime', key: 'last_transaction_date', required: false },
                { type: 'string', key: 'preferred_payment_method', size: 50, required: false },
                { type: 'datetime', key: 'created_at', required: true },
                { type: 'datetime', key: 'updated_at', required: true }
            ],
            indexes: [
                { key: 'last_transaction_idx', type: 'key', attributes: ['last_transaction_date'] }
            ]
        });

        // Wallet Transactions Collection Updates
        await updateCollection('wallet_transactions', {
            permissions: [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.team('admin')),
                Permission.delete(Role.team('admin'))
            ],
            attributes: [
                { type: 'string', key: 'transaction_type', size: 50, required: true },
                { type: 'integer', key: 'previous_balance', required: true, min: 0, default: 0 },
                { type: 'integer', key: 'new_balance', required: true, min: 0, default: 0 },
                { type: 'string', key: 'metadata', size: 2000, required: false },
                { type: 'datetime', key: 'created_at', required: true },
                { type: 'datetime', key: 'updated_at', required: true }
            ],
            indexes: [
                { key: 'created_at_idx', type: 'key', attributes: ['created_at'] },
                { key: 'transaction_type_idx', type: 'key', attributes: ['transaction_type'] }
            ]
        });

        // Overdrafts Collection Updates
        await updateCollection('overdrafts', {
            permissions: [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.team('admin')),
                Permission.delete(Role.team('admin'))
            ],
            attributes: [
                { type: 'integer', key: 'interest_rate', required: true, min: 0, default: 10 },
                { type: 'integer', key: 'total_repayment', required: true, min: 0, default: 0 },
                { type: 'integer', key: 'remaining_balance', required: true, min: 0, default: 0 },
                { type: 'datetime', key: 'last_payment_date', required: false },
                { type: 'string', key: 'payment_schedule', size: 2000, required: false },
                { type: 'datetime', key: 'created_at', required: true },
                { type: 'datetime', key: 'updated_at', required: true }
            ],
            indexes: [
                { key: 'due_date_idx', type: 'key', attributes: ['due_date'] },
                { key: 'last_payment_idx', type: 'key', attributes: ['last_payment_date'] }
            ]
        });

        // WhatsApp Messages Collection Updates
        await updateCollection('whatsapp_messages', {
            permissions: [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.team('admin'))
            ],
            attributes: [
                { type: 'string', key: 'template_name', size: 255, required: false },
                { type: 'string', key: 'template_language', size: 10, required: false },
                { type: 'string', key: 'template_params', size: 2000, required: false },
                { type: 'integer', key: 'retry_count', required: true, min: 0, default: 0 },
                { type: 'datetime', key: 'next_retry_at', required: false },
                { type: 'datetime', key: 'created_at', required: true },
                { type: 'datetime', key: 'updated_at', required: true }
            ],
            indexes: [
                { key: 'next_retry_idx', type: 'key', attributes: ['next_retry_at'] },
                { key: 'template_idx', type: 'key', attributes: ['template_name'] }
            ]
        });

        console.log('All collections updated successfully!');
    } catch (error) {
        console.error('Error updating collections:', error);
    }
}

// Run the updates
updateCollections();
