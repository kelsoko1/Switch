const { Client, Databases, Query } = require('appwrite');
require('dotenv').config();

// Initialize Appwrite client
const client = new Client();
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

async function createWalletCollections() {
    console.log('🏦 Setting up Kijumbe Wallet Collections...\n');

    try {
        // 1. Create Wallets Collection
        console.log('📁 Creating Wallets collection...');
        try {
            const walletsCollection = await databases.createCollection(
                DATABASE_ID,
                'wallets',
                'Wallets',
                'User wallet information and settings'
            );
            console.log('✅ Wallets collection created successfully');

            // Add attributes to Wallets collection
            console.log('🔧 Adding attributes to Wallets collection...');
            
            await databases.createStringAttribute(DATABASE_ID, 'wallets', 'user_id', 255, true);
            await databases.createFloatAttribute(DATABASE_ID, 'wallets', 'balance', true);
            await databases.createStringAttribute(DATABASE_ID, 'wallets', 'currency', 10, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallets', 'status', 20, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallets', 'pin_hash', 255, false);
            await databases.createBooleanAttribute(DATABASE_ID, 'wallets', 'pin_set', true);
            await databases.createFloatAttribute(DATABASE_ID, 'wallets', 'daily_limit', true);
            await databases.createFloatAttribute(DATABASE_ID, 'wallets', 'monthly_limit', true);
            await databases.createFloatAttribute(DATABASE_ID, 'wallets', 'daily_spent', true);
            await databases.createFloatAttribute(DATABASE_ID, 'wallets', 'monthly_spent', true);
            await databases.createStringAttribute(DATABASE_ID, 'wallets', 'last_reset_date', 20, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallets', 'created_at', 50, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallets', 'updated_at', 50, true);

            console.log('✅ Wallets collection attributes added');

            // Create indexes for Wallets collection
            console.log('🔍 Creating indexes for Wallets collection...');
            await databases.createIndex(DATABASE_ID, 'wallets', 'user_id_index', 'key', ['user_id'], ['ASC']);
            await databases.createIndex(DATABASE_ID, 'wallets', 'status_index', 'key', ['status'], ['ASC']);
            console.log('✅ Wallets collection indexes created');

        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️ Wallets collection already exists, skipping...');
            } else {
                throw error;
            }
        }

        // 2. Create Wallet Transactions Collection
        console.log('\n📁 Creating Wallet Transactions collection...');
        try {
            const transactionsCollection = await databases.createCollection(
                DATABASE_ID,
                'wallet_transactions',
                'Wallet Transactions',
                'User wallet transaction records'
            );
            console.log('✅ Wallet Transactions collection created successfully');

            // Add attributes to Wallet Transactions collection
            console.log('🔧 Adding attributes to Wallet Transactions collection...');
            
            await databases.createStringAttribute(DATABASE_ID, 'wallet_transactions', 'user_id', 255, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_transactions', 'type', 50, true);
            await databases.createFloatAttribute(DATABASE_ID, 'wallet_transactions', 'amount', true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_transactions', 'description', 500, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_transactions', 'reference', 255, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_transactions', 'status', 20, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_transactions', 'metadata', 2000, false);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_transactions', 'created_at', 50, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_transactions', 'updated_at', 50, true);

            console.log('✅ Wallet Transactions collection attributes added');

            // Create indexes for Wallet Transactions collection
            console.log('🔍 Creating indexes for Wallet Transactions collection...');
            await databases.createIndex(DATABASE_ID, 'wallet_transactions', 'user_id_index', 'key', ['user_id'], ['ASC']);
            await databases.createIndex(DATABASE_ID, 'wallet_transactions', 'type_index', 'key', ['type'], ['ASC']);
            await databases.createIndex(DATABASE_ID, 'wallet_transactions', 'status_index', 'key', ['status'], ['ASC']);
            await databases.createIndex(DATABASE_ID, 'wallet_transactions', 'created_at_index', 'key', ['created_at'], ['DESC']);
            await databases.createIndex(DATABASE_ID, 'wallet_transactions', 'reference_index', 'key', ['reference'], ['ASC']);
            console.log('✅ Wallet Transactions collection indexes created');

        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️ Wallet Transactions collection already exists, skipping...');
            } else {
                throw error;
            }
        }

        // 3. Create Wallet Payments Collection
        console.log('\n📁 Creating Wallet Payments collection...');
        try {
            const paymentsCollection = await databases.createCollection(
                DATABASE_ID,
                'wallet_payments',
                'Wallet Payments',
                'Payment processing records for wallet transactions'
            );
            console.log('✅ Wallet Payments collection created successfully');

            // Add attributes to Wallet Payments collection
            console.log('🔧 Adding attributes to Wallet Payments collection...');
            
            await databases.createStringAttribute(DATABASE_ID, 'wallet_payments', 'user_id', 255, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_payments', 'transaction_id', 255, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_payments', 'payment_method', 50, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_payments', 'payment_data', 2000, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_payments', 'selcom_order_id', 255, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_payments', 'status', 20, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_payments', 'created_at', 50, true);
            await databases.createStringAttribute(DATABASE_ID, 'wallet_payments', 'updated_at', 50, true);

            console.log('✅ Wallet Payments collection attributes added');

            // Create indexes for Wallet Payments collection
            console.log('🔍 Creating indexes for Wallet Payments collection...');
            await databases.createIndex(DATABASE_ID, 'wallet_payments', 'user_id_index', 'key', ['user_id'], ['ASC']);
            await databases.createIndex(DATABASE_ID, 'wallet_payments', 'transaction_id_index', 'key', ['transaction_id'], ['ASC']);
            await databases.createIndex(DATABASE_ID, 'wallet_payments', 'selcom_order_id_index', 'key', ['selcom_order_id'], ['ASC']);
            await databases.createIndex(DATABASE_ID, 'wallet_payments', 'status_index', 'key', ['status'], ['ASC']);
            console.log('✅ Wallet Payments collection indexes created');

        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️ Wallet Payments collection already exists, skipping...');
            } else {
                throw error;
            }
        }

        console.log('\n🎉 Wallet collections setup completed successfully!');
        console.log('\n📋 Collections created:');
        console.log('   ✅ wallets - User wallet information');
        console.log('   ✅ wallet_transactions - Transaction records');
        console.log('   ✅ wallet_payments - Payment processing data');
        
        console.log('\n🔧 Next steps:');
        console.log('   1. Configure your Selcom credentials in .env');
        console.log('   2. Start your server: npm start');
        console.log('   3. Test the wallet: npm run test:wallet');
        console.log('   4. Access wallet at: http://localhost:3000/wallet');

    } catch (error) {
        console.error('❌ Error setting up wallet collections:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Check your .env file has correct Appwrite credentials');
        console.error('   2. Ensure your Appwrite project exists');
        console.error('   3. Verify your API key has proper permissions');
        process.exit(1);
    }
}

// Run the setup
createWalletCollections();
