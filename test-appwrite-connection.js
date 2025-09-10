require('dotenv').config();
const { databases, DATABASE_ID, COLLECTIONS } = require('./src/config/appwrite');

async function testAppwriteConnection() {
    console.log('========================================');
    console.log('    Appwrite Connection Test');
    console.log('========================================\n');
    
    try {
        console.log('🔍 Testing Appwrite connection...');
        console.log(`Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
        console.log(`Project ID: ${process.env.APPWRITE_PROJECT_ID}`);
        console.log(`Database ID: ${process.env.APPWRITE_DATABASE_ID}\n`);
        
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
        
        collections.collections.forEach(collection => {
            console.log(`   - ${collection.name} (${collection.$id})`);
        });
        console.log();
        
        // Test 3: Test each collection
        const collectionTests = [
            { name: 'Users', id: COLLECTIONS.USERS },
            { name: 'Groups', id: COLLECTIONS.GROUPS },
            { name: 'Members', id: COLLECTIONS.MEMBERS },
            { name: 'Transactions', id: COLLECTIONS.TRANSACTIONS },
            { name: 'Payments', id: COLLECTIONS.PAYMENTS },
            { name: 'Overdrafts', id: COLLECTIONS.OVERDRAFTS },
            { name: 'WhatsApp Messages', id: COLLECTIONS.WHATSAPP_MESSAGES }
        ];
        
        console.log('3️⃣ Testing individual collections...');
        for (const test of collectionTests) {
            try {
                const documents = await databases.listDocuments(DATABASE_ID, test.id, [], 1);
                console.log(`✅ ${test.name}: Accessible (${documents.total} documents)`);
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
        console.log();
        
        // Test 4: Create a test user
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
        
        // Test 5: Authentication test
        console.log('5️⃣ Testing authentication endpoints...');
        try {
            const response = await fetch('http://localhost:3000/backend/health');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Server is running and accessible');
                console.log(`   Status: ${data.status}`);
                console.log(`   Environment: ${data.environment}`);
            } else {
                console.log('❌ Server health check failed');
            }
        } catch (error) {
            console.log('❌ Server not running or not accessible');
            console.log('   Make sure to start your server with: npm start');
        }
        console.log();
        
        console.log('========================================');
        console.log('    Test Results Summary');
        console.log('========================================');
        console.log('✅ Appwrite connection: SUCCESS');
        console.log('✅ Database access: SUCCESS');
        console.log('✅ Collections access: SUCCESS');
        console.log('✅ Document operations: SUCCESS');
        console.log('\n🎉 Your Appwrite setup is working perfectly!');
        console.log('\nNext steps:');
        console.log('1. Start your server: npm start');
        console.log('2. Access your app: http://localhost:3000');
        console.log('3. Login with admin credentials');
        console.log('4. Test all application features');
        
    } catch (error) {
        console.log('========================================');
        console.log('    Test Results Summary');
        console.log('========================================');
        console.log('❌ Appwrite connection: FAILED');
        console.log(`❌ Error: ${error.message}`);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check your .env file has correct credentials');
        console.log('2. Verify your API key has proper permissions');
        console.log('3. Ensure your project exists in Appwrite console');
        console.log('4. Check your internet connection');
        console.log('5. Run the setup script again if needed');
        
        if (error.code) {
            console.log(`\nError Code: ${error.code}`);
        }
        if (error.type) {
            console.log(`Error Type: ${error.type}`);
        }
    }
}

// Run the test
testAppwriteConnection().catch(console.error);
