const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68ac2652001ca468e987')
    .setKey('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498');

const databases = new Databases(client);
const databaseId = '68ac3f000002c33d8048';

async function testCollections() {
    try {
        // List all collections
        const collections = await databases.listCollections(databaseId);
        console.log('Available collections:', collections.total);
        collections.collections.forEach(collection => {
            console.log(`- ${collection.name} (${collection.$id})`);
        });

        // Try to create a test user
        const testUser = await databases.createDocument(
            databaseId,
            'users',
            ID.unique(),
            {
                name: 'Test User',
                email: 'test@example.com',
                phone: '+255712345678',
                role: 'member',
                status: 'active'
            }
        );

        console.log('Created test user:', testUser);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testCollections();
