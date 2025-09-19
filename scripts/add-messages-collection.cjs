const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68ac2652001ca468e987')
    .setKey('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498');

const databases = new Databases(client);
const databaseId = '68ac3f000002c33d8048';

async function createMessagesCollection() {
    try {
        // Create Messages Collection
        const messages = await databases.createCollection(
            databaseId,
            'messages',
            'Messages',
            [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );
        console.log('Created Messages collection');

        // Add attributes
        await databases.createStringAttribute(
            databaseId,
            'messages',
            'sender_id',
            36,
            true
        );
        console.log('Added sender_id attribute');

        await databases.createStringAttribute(
            databaseId,
            'messages',
            'receiver_id',
            36,
            true
        );
        console.log('Added receiver_id attribute');

        await databases.createStringAttribute(
            databaseId,
            'messages',
            'group_id',
            36,
            false
        );
        console.log('Added group_id attribute');

        await databases.createStringAttribute(
            databaseId,
            'messages',
            'content',
            2000,
            true
        );
        console.log('Added content attribute');

        await databases.createStringAttribute(
            databaseId,
            'messages',
            'type',
            20,
            true
        );
        console.log('Added type attribute');

        await databases.createStringAttribute(
            databaseId,
            'messages',
            'status',
            20,
            true
        );
        console.log('Added status attribute');

        await databases.createStringAttribute(
            databaseId,
            'messages',
            'media_url',
            1000,
            false
        );
        console.log('Added media_url attribute');

        await databases.createDatetimeAttribute(
            databaseId,
            'messages',
            'sent_at',
            true
        );
        console.log('Added sent_at attribute');

        await databases.createDatetimeAttribute(
            databaseId,
            'messages',
            'delivered_at',
            false
        );
        console.log('Added delivered_at attribute');

        await databases.createDatetimeAttribute(
            databaseId,
            'messages',
            'read_at',
            false
        );
        console.log('Added read_at attribute');

        // Add indexes
        await databases.createIndex(
            databaseId,
            'messages',
            'sender_receiver_idx',
            'key',
            ['sender_id', 'receiver_id']
        );
        console.log('Added sender_receiver_idx index');

        await databases.createIndex(
            databaseId,
            'messages',
            'group_messages_idx',
            'key',
            ['group_id']
        );
        console.log('Added group_messages_idx index');

        await databases.createIndex(
            databaseId,
            'messages',
            'sent_at_idx',
            'key',
            ['sent_at']
        );
        console.log('Added sent_at_idx index');

        console.log('Messages collection setup completed successfully!');
    } catch (error) {
        console.error('Error:', error);
    }
}

createMessagesCollection();
