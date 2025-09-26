const { Client, Storage } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68ac2652001ca468e987')
    .setKey('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498');

const storage = new Storage(client);

async function listBuckets() {
    try {
        const response = await storage.listBuckets();
        console.log('Buckets:', response.buckets);
    } catch (error) {
        console.error('Error listing buckets:', error);
    }
}

listBuckets();
