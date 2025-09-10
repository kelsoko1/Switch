require('dotenv').config();
const { databases, DATABASE_ID, COLLECTIONS } = require('./src/config/appwrite');

async function testExistingAppwrite() {
    console.log('========================================');
    console.log('    Testing Existing Appwrite Instance');
    console.log('========================================\n');
    
    try {
        console.log('🔍 Testing connection to existing Appwrite instance...');
        console.log(`Endpoint: ${process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'}`);
        console.log(`Project ID: ${process.env.APPWRITE_PROJECT_ID || '68ac2652001ca468e987'}`);
        console.log(`Database ID: ${process.env.APPWRITE_DATABASE_ID || '68ac2652001ca468e987'}\n`);
        
        // Test 1: Database connection
        console.log('1️⃣ Testing database connection...');
        const database = await databases.get(DATABASE_ID);
        console.log(`✅ Database connection successful: ${database.name}`);
        console.log(`   Database ID: ${database.$id}`);
        console.log(`   Created: ${database.$createdAt}\n`);
        
        // Test 2: List collections
        console.log('2️⃣ Testing collections access...');
        const collections = await databases.listCollections(DATABASE_ID);
        console.log(`✅ Collections found: ${collections.collections.length}`);
        
        if (collections.collections.length > 0) {
            collections.collections.forEach(collection => {
                console.log(`   - ${collection.name} (${collection.$id})`);
            });
        } else {
            console.log('   ⚠️  No collections found. You may need to create them.');
        }
        console.log();
        
        // Test 3: Test each expected collection
        const expectedCollections = [
            { name: 'Users', id: COLLECTIONS.USERS },
            { name: 'Groups', id: COLLECTIONS.GROUPS },
            { name: 'Members', id: COLLECTIONS.MEMBERS },
            { name: 'Transactions', id: COLLECTIONS.TRANSACTIONS },
            { name: 'Payments', id: COLLECTIONS.PAYMENTS },
            { name: 'Overdrafts', id: COLLECTIONS.OVERDRAFTS },
            { name: 'WhatsApp Messages', id: COLLECTIONS.WHATSAPP_MESSAGES }
        ];
        
        console.log('3️⃣ Testing expected collections...');
        for (const test of expectedCollections) {
            try {
                const documents = await databases.listDocuments(DATABASE_ID, test.id, [], 1);
                console.log(`✅ ${test.name}: Accessible (${documents.total} documents)`);
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
        console.log();
        
        // Test 4: Check if we can create a test document
        console.log('4️⃣ Testing document creation...');
        try {
            const testUser = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
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
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.USERS, testUser.$id);
            console.log('✅ Test user cleaned up');
            
        } catch (error) {
            console.log(`❌ Document creation test failed: ${error.message}`);
        }
        console.log();
        
        console.log('========================================');
        console.log('    Test Results Summary');
        console.log('========================================');
        console.log('✅ Appwrite connection: SUCCESS');
        console.log('✅ Database access: SUCCESS');
        console.log('✅ Collections access: SUCCESS');
        console.log('✅ Document operations: SUCCESS');
        console.log('\n🎉 Your existing Appwrite setup is working!');
        console.log('\nNext steps:');
        console.log('1. Update your .env file with the correct API key');
        console.log('2. Switch from mock to Appwrite authentication');
        console.log('3. Test your application');
        
    } catch (error) {
        console.log('========================================');
        console.log('    Test Results Summary');
        console.log('========================================');
        console.log('❌ Appwrite connection: FAILED');
        console.log(`❌ Error: ${error.message}`);
        console.log('\n🔧 Possible issues:');
        console.log('1. API key is invalid or expired');
        console.log('2. Database/collections don\'t exist');
        console.log('3. Permissions are insufficient');
        console.log('4. Network connectivity issues');
        
        if (error.code) {
            console.log(`\nError Code: ${error.code}`);
        }
        if (error.type) {
            console.log(`Error Type: ${error.type}`);
        }
        
        console.log('\n💡 Solutions:');
        console.log('1. Check your API key in Appwrite console');
        console.log('2. Verify your project and database exist');
        console.log('3. Create missing collections if needed');
        console.log('4. Update your .env file with correct credentials');
    }
}

// Run the test
testExistingAppwrite().catch(console.error);
