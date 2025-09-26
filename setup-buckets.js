const { Client, Storage } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68ac2652001ca468e987')
    .setKey('standard_d1aac338e34f0674a53aa08d7bd5e0129984b8753341dea5a016f628614092f6b781008906aecb5fbc805088799b0aff46f108a35d77828ecef11e9b5b36ed0fc783a53f0bfafed81cf0a78ee78b21cc1c5151ac392cd678240bbb86b04db612737c050a1e35ceff6fbc4b4e4d05e67bc4948cf455394dc26ca972cba86fe498');

const storage = new Storage(client);

const buckets = [
    {
        id: 'status_media',
        name: 'Status Media',
        maximumFileSize: 50 * 1024 * 1024, // 50MB
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm'],
        encryption: false,
        antivirus: true
    },
    {
        id: 'profile_images',
        name: 'Profile Images',
        maximumFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif'],
        encryption: false,
        antivirus: true
    },
    {
        id: 'group_images',
        name: 'Group Images',
        maximumFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif'],
        encryption: false,
        antivirus: true
    }
];

async function setupBuckets() {
    try {
        // List existing buckets
        const existingBuckets = await storage.listBuckets();
        const existingBucketIds = existingBuckets.buckets.map(b => b.$id);
        
        // Create buckets that don't exist
        for (const bucket of buckets) {
            if (!existingBucketIds.includes(bucket.id)) {
                console.log(`Creating bucket: ${bucket.name}`);
                await storage.createBucket(
                    bucket.id,
                    bucket.name,
                    bucket.allowedFileExtensions,
                    bucket.maximumFileSize,
                    bucket.encryption,
                    bucket.antivirus
                );
                console.log(`Created bucket: ${bucket.name}`);
            } else {
                console.log(`Bucket already exists: ${bucket.name}`);
            }
        }
        
        console.log('All buckets are set up!');
    } catch (error) {
        console.error('Error setting up buckets:', error);
    }
}

setupBuckets();
