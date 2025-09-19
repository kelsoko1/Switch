const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68ac2652001ca468e987')
    .setKey('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498');

const databases = new Databases(client);
const databaseId = '68ac3f000002c33d8048';

async function createCollection(collectionId, name, attributes, indexes = []) {
    try {
        // Create collection
        const collection = await databases.createCollection(
            databaseId,
            collectionId,
            name,
            [
                Permission.read(Role.users()),
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

        return collection;
    } catch (error) {
        console.error(`Error creating collection ${name}:`, error.message);
        return null;
    }
}

async function addMissingCollections() {
    try {
        // Overdrafts Collection
        await createCollection(
            'overdrafts',
            'Overdrafts',
            [
                { type: 'string', key: 'user_id', size: 36, required: true },
                { type: 'string', key: 'wallet_id', size: 36, required: true },
                { type: 'integer', key: 'amount', required: true },
                { type: 'integer', key: 'fee', required: true, default: 0 },
                { type: 'string', key: 'status', size: 20, required: true, default: 'pending' },
                { type: 'datetime', key: 'due_date', required: true },
                { type: 'datetime', key: 'repaid_at', required: false },
                { type: 'string', key: 'description', size: 1000, required: false },
                { type: 'string', key: 'reference_id', size: 255, required: false }
            ],
            [
                { key: 'user_overdrafts', type: 'key', attributes: ['user_id'] },
                { key: 'wallet_overdrafts', type: 'key', attributes: ['wallet_id'] },
                { key: 'status_index', type: 'key', attributes: ['status'] },
                { key: 'due_date_index', type: 'key', attributes: ['due_date'] }
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
                { type: 'string', key: 'type', size: 20, required: true }, // incoming, outgoing
                { type: 'string', key: 'message_type', size: 20, required: true }, // text, image, document
                { type: 'string', key: 'status', size: 20, required: true, default: 'pending' },
                { type: 'string', key: 'message_id', size: 255, required: false },
                { type: 'string', key: 'media_url', size: 1000, required: false },
                { type: 'string', key: 'error', size: 1000, required: false },
                { type: 'integer', key: 'retry_count', required: true, default: 0 },
                { type: 'datetime', key: 'sent_at', required: false },
                { type: 'datetime', key: 'delivered_at', required: false },
                { type: 'datetime', key: 'read_at', required: false }
            ],
            [
                { key: 'user_messages', type: 'key', attributes: ['user_id'] },
                { key: 'phone_index', type: 'key', attributes: ['phone'] },
                { key: 'message_id_unique', type: 'unique', attributes: ['message_id'] },
                { key: 'status_index', type: 'key', attributes: ['status'] },
                { key: 'type_index', type: 'key', attributes: ['type'] }
            ]
        );

        console.log('All missing collections created successfully!');
    } catch (error) {
        console.error('Error adding missing collections:', error);
    }
}

// Run the setup
addMissingCollections();
