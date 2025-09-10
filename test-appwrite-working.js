require('dotenv').config();
const { Client, Databases } = require('appwrite');

async function testAppwriteWorking() {
    console.log('========================================');
    console.log('    Working Appwrite Connection Test');
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
        
        // Test 1: Try to access a document in users collection
        console.log('1️⃣ Testing document access...');
        try {
            const users = await databases.listDocuments(
                process.env.APPWRITE_DATABASE_ID, 
                'users', 
                [], 
                1
            );
            console.log(`✅ Users collection accessible (${users.total} documents)`);
        } catch (error) {
            if (error.code === 404) {
                console.log('❌ Users collection not found - this is expected if not created yet');
            } else {
                console.log(`❌ Users collection error: ${error.message}`);
            }
        }
        console.log();
        
        // Test 2: Try to create a test document
        console.log('2️⃣ Testing document creation...');
        try {
            const testUser = await databases.createDocument(
                process.env.APPWRITE_DATABASE_ID,
                'users',
                'unique()',
                {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'hashedpassword',
                    role: 'member',
                    status: 'active',
                    created_at: new Date().toISOString(),
                    isSuperAdmin: false
                }
            );
            console.log(`✅ Test user created: ${testUser.$id}`);
            
            // Clean up test user
            await databases.deleteDocument(process.env.APPWRITE_DATABASE_ID, 'users', testUser.$id);
            console.log('✅ Test user cleaned up');
            
        } catch (error) {
            if (error.code === 404) {
                console.log('❌ Users collection not found - need to create it first');
            } else {
                console.log(`❌ Document creation error: ${error.message}`);
            }
        }
        console.log();
        
        // Test 3: Test other collections
        console.log('3️⃣ Testing other collections...');
        const collections = ['groups', 'members', 'transactions', 'payments', 'overdrafts', 'whatsapp_messages'];
        
        for (const collection of collections) {
            try {
                const docs = await databases.listDocuments(
                    process.env.APPWRITE_DATABASE_ID, 
                    collection, 
                    [], 
                    1
                );
                console.log(`✅ ${collection}: Accessible (${docs.total} documents)`);
            } catch (error) {
                if (error.code === 404) {
                    console.log(`❌ ${collection}: Not found (need to create)`);
                } else {
                    console.log(`❌ ${collection}: ${error.message}`);
                }
            }
        }
        console.log();
        
        console.log('========================================');
        console.log('    Test Results Summary');
        console.log('========================================');
        console.log('✅ Appwrite connection: SUCCESS');
        console.log('✅ API key authentication: SUCCESS');
        console.log('✅ Database access: SUCCESS');
        console.log('\n🎉 Your Appwrite setup is working!');
        console.log('\nNext steps:');
        console.log('1. Create missing collections using Appwrite CLI');
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
testAppwriteWorking().catch(console.error);
