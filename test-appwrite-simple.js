require('dotenv').config();
const { Client, Databases } = require('appwrite');

async function testAppwriteSimple() {
    console.log('========================================');
    console.log('    Simple Appwrite Connection Test');
    console.log('========================================\n');
    
    try {
        // Initialize Appwrite client
        const client = new Client();
        client
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setJWT(process.env.APPWRITE_API_KEY);
        
        const databases = new Databases(client);
        
        console.log('🔍 Testing Appwrite connection...');
        console.log(`Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
        console.log(`Project ID: ${process.env.APPWRITE_PROJECT_ID}`);
        console.log(`Database ID: ${process.env.APPWRITE_DATABASE_ID}\n`);
        
        // Test 1: List databases
        console.log('1️⃣ Testing database access...');
        const databaseList = await databases.list();
        console.log(`✅ Database access successful! Found ${databaseList.total} databases`);
        
        if (databaseList.databases.length > 0) {
            databaseList.databases.forEach(db => {
                console.log(`   - ${db.name} (${db.$id})`);
            });
        }
        console.log();
        
        // Test 2: Get specific database
        console.log('2️⃣ Testing specific database access...');
        const database = await databases.get(process.env.APPWRITE_DATABASE_ID);
        console.log(`✅ Database found: ${database.name}`);
        console.log(`   Database ID: ${database.$id}`);
        console.log(`   Created: ${database.$createdAt}\n`);
        
        // Test 3: List collections
        console.log('3️⃣ Testing collections access...');
        const collections = await databases.listCollections(process.env.APPWRITE_DATABASE_ID);
        console.log(`✅ Collections access successful! Found ${collections.total} collections`);
        
        if (collections.collections.length > 0) {
            collections.collections.forEach(collection => {
                console.log(`   - ${collection.name} (${collection.$id})`);
            });
        } else {
            console.log('   ⚠️  No collections found. You may need to create them.');
        }
        console.log();
        
        // Test 4: Test users collection if it exists
        console.log('4️⃣ Testing users collection...');
        try {
            const users = await databases.listDocuments(
                process.env.APPWRITE_DATABASE_ID, 
                'users', 
                [], 
                1
            );
            console.log(`✅ Users collection accessible (${users.total} documents)`);
        } catch (error) {
            console.log(`❌ Users collection: ${error.message}`);
            console.log('   This is expected if the collection doesn\'t exist yet.');
        }
        console.log();
        
        console.log('========================================');
        console.log('    Test Results Summary');
        console.log('========================================');
        console.log('✅ Appwrite connection: SUCCESS');
        console.log('✅ Database access: SUCCESS');
        console.log('✅ Collections access: SUCCESS');
        console.log('\n🎉 Your Appwrite setup is working!');
        console.log('\nNext steps:');
        console.log('1. Create missing collections if needed');
        console.log('2. Start your server: npm start');
        console.log('3. Test your application');
        
    } catch (error) {
        console.log('========================================');
        console.log('    Test Results Summary');
        console.log('========================================');
        console.log('❌ Appwrite connection: FAILED');
        console.log(`❌ Error: ${error.message}`);
        
        if (error.code) {
            console.log(`Error Code: ${error.code}`);
        }
        if (error.type) {
            console.log(`Error Type: ${error.type}`);
        }
        
        console.log('\n🔧 Possible solutions:');
        console.log('1. Check your API key is correct');
        console.log('2. Verify your project ID is correct');
        console.log('3. Ensure your database exists');
        console.log('4. Check your internet connection');
    }
}

// Run the test
testAppwriteSimple().catch(console.error);
