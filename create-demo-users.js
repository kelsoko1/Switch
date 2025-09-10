require('dotenv').config();
const { Client, Databases } = require('appwrite');
const bcrypt = require('bcryptjs');

// Disable SSL verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function createDemoUsers() {
    console.log('========================================');
    console.log('    Creating Demo Users in Appwrite');
    console.log('========================================\n');
    
    try {
        // Initialize Appwrite client
        const client = new Client();
        client
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setJWT(process.env.APPWRITE_API_KEY);
        
        const databases = new Databases(client);
        
        console.log('🔍 Connecting to Appwrite...');
        console.log(`Database ID: ${process.env.APPWRITE_DATABASE_ID}`);
        console.log(`Collection: ${process.env.COLLECTION_USERS}\n`);
        
        // Demo users to create
        const demoUsers = [
            {
                name: 'Super Administrator',
                email: 'admin@kijumbe.com',
                password: 'admin123456',
                role: 'admin',
                isSuperAdmin: true,
                status: 'active'
            },
            {
                name: 'John Kiongozi',
                email: 'kiongozi@kijumbe.com',
                password: 'kiongozi123',
                role: 'kiongozi',
                isSuperAdmin: false,
                status: 'active'
            },
            {
                name: 'Mary Mwanachama',
                email: 'mary@kijumbe.com',
                password: 'mary123456',
                role: 'member',
                isSuperAdmin: false,
                status: 'active'
            },
            {
                name: 'Peter Member',
                email: 'peter@kijumbe.com',
                password: 'peter123456',
                role: 'member',
                isSuperAdmin: false,
                status: 'active'
            }
        ];
        
        console.log('👥 Creating demo users...\n');
        
        for (const userData of demoUsers) {
            try {
                // Check if user already exists
                const existingUsers = await databases.listDocuments(
                    process.env.APPWRITE_DATABASE_ID,
                    process.env.COLLECTION_USERS,
                    [`email.equal("${userData.email}")`]
                );
                
                if (existingUsers.documents.length > 0) {
                    console.log(`⚠️  User ${userData.email} already exists, skipping...`);
                    continue;
                }
                
                // Hash password
                const hashedPassword = await bcrypt.hash(userData.password, 12);
                
                // Create user
                const user = await databases.createDocument(
                    process.env.APPWRITE_DATABASE_ID,
                    process.env.COLLECTION_USERS,
                    'unique()',
                    {
                        name: userData.name,
                        email: userData.email,
                        password: hashedPassword,
                        role: userData.role,
                        isSuperAdmin: userData.isSuperAdmin,
                        status: userData.status,
                        created_at: new Date().toISOString(),
                        last_login: null,
                        permissions: userData.isSuperAdmin ? ['all'] : ['user']
                    }
                );
                
                console.log(`✅ Created user: ${userData.name} (${userData.email})`);
                console.log(`   Role: ${userData.role}`);
                console.log(`   Password: ${userData.password}`);
                console.log(`   User ID: ${user.$id}\n`);
                
            } catch (error) {
                console.log(`❌ Failed to create user ${userData.email}: ${error.message}\n`);
            }
        }
        
        console.log('========================================');
        console.log('    Demo Users Creation Complete! 🎉');
        console.log('========================================\n');
        
        console.log('📋 Demo User Credentials:');
        console.log('┌─────────────────────────────────────────────────────────┐');
        console.log('│ Super Administrator                                     │');
        console.log('│ Email: admin@kijumbe.com                               │');
        console.log('│ Password: admin123456                                  │');
        console.log('│ Role: admin (Super Admin)                              │');
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ Group Leader                                           │');
        console.log('│ Email: kiongozi@kijumbe.com                            │');
        console.log('│ Password: kiongozi123                                  │');
        console.log('│ Role: kiongozi (Group Leader)                          │');
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ Member 1                                               │');
        console.log('│ Email: mary@kijumbe.com                                │');
        console.log('│ Password: mary123456                                   │');
        console.log('│ Role: member                                           │');
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ Member 2                                               │');
        console.log('│ Email: peter@kijumbe.com                               │');
        console.log('│ Password: peter123456                                  │');
        console.log('│ Role: member                                           │');
        console.log('└─────────────────────────────────────────────────────────┘\n');
        
        console.log('🚀 Next Steps:');
        console.log('1. Visit your app: http://localhost:3000');
        console.log('2. Login with any of the demo credentials above');
        console.log('3. Test all features with real Appwrite data');
        console.log('4. Create more users as needed');
        
    } catch (error) {
        console.log('========================================');
        console.log('    Demo Users Creation Failed');
        console.log('========================================');
        console.log(`❌ Error: ${error.message}`);
        
        if (error.code) {
            console.log(`Error Code: ${error.code}`);
        }
        if (error.type) {
            console.log(`Error Type: ${error.type}`);
        }
        
        console.log('\n🔧 Possible solutions:');
        console.log('1. Check your Appwrite connection');
        console.log('2. Verify your API key has proper permissions');
        console.log('3. Ensure the users collection exists');
        console.log('4. Check your database ID is correct');
    }
}

// Run the script
createDemoUsers().catch(console.error);
