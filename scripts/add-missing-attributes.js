import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68ac2652001ca468e987')
    .setKey('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498');

const databases = new Databases(client);
const databaseId = '68ac3f000002c33d8048';

async function addMissingAttributes() {
    try {
        // Add role attribute to Users
        await databases.createStringAttribute(
            databaseId,
            'users',
            'role',
            20,
            true,
            undefined,
            false
        );
        console.log('Added role attribute to Users');

        // Add role index to Users
        await databases.createIndex(
            databaseId,
            'users',
            'role_idx',
            'key',
            ['role']
        );
        console.log('Added role index to Users');

        // Add status attribute to Groups
        await databases.createStringAttribute(
            databaseId,
            'groups',
            'status',
            20,
            true,
            undefined,
            false
        );
        console.log('Added status attribute to Groups');

        // Add status index to Groups
        await databases.createIndex(
            databaseId,
            'groups',
            'status_idx',
            'key',
            ['status']
        );
        console.log('Added status index to Groups');

        // Add due_date attribute to Overdrafts
        await databases.createDatetimeAttribute(
            databaseId,
            'overdrafts',
            'due_date',
            true,
            undefined
        );
        console.log('Added due_date attribute to Overdrafts');

        // Add due_date index to Overdrafts
        await databases.createIndex(
            databaseId,
            'overdrafts',
            'due_date_idx',
            'key',
            ['due_date']
        );
        console.log('Added due_date index to Overdrafts');

        console.log('All missing attributes and indexes added successfully!');
    } catch (error) {
        console.error('Error adding missing attributes:', error);
    }
}

addMissingAttributes();
