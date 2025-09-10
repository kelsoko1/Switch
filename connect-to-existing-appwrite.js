const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt user for input
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Function to update .env file
function updateEnvFile(config) {
    const envPath = path.join(__dirname, '.env');
    
    // Build .env content
    let envContent = '';
    for (const [key, value] of Object.entries(config)) {
        envContent += `${key}=${value}\n`;
    }
    
    // Write to .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created/updated successfully');
}

// Function to update appwrite.js config
function updateAppwriteConfig() {
    const appwriteConfigPath = path.join(__dirname, 'src', 'config', 'appwrite.js');
    
    const newConfig = `const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();

// Set up Appwrite configuration
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

// Initialize services
const databases = new Databases(client);

// Database and Collection IDs
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const COLLECTIONS = {
    USERS: process.env.COLLECTION_USERS || 'users',
    GROUPS: process.env.COLLECTION_GROUPS || 'groups',
    MEMBERS: process.env.COLLECTION_MEMBERS || 'members',
    TRANSACTIONS: process.env.COLLECTION_TRANSACTIONS || 'transactions',
    PAYMENTS: process.env.COLLECTION_PAYMENTS || 'payments',
    OVERDRAFTS: process.env.COLLECTION_OVERDRAFTS || 'overdrafts',
    WHATSAPP_MESSAGES: process.env.COLLECTION_WHATSAPP_MESSAGES || 'whatsapp_messages'
};

// Queries helper
const queries = Query;

module.exports = {
    client,
    databases,
    DATABASE_ID,
    COLLECTIONS,
    queries
};`;
    
    fs.writeFileSync(appwriteConfigPath, newConfig);
    console.log('✅ appwrite.js config updated successfully');
}

// Function to update server.js to use Appwrite auth
function updateServerConfig() {
    const serverPath = path.join(__dirname, 'src', 'server.js');
    
    if (fs.existsSync(serverPath)) {
        let serverContent = fs.readFileSync(serverPath, 'utf8');
        
        // Replace auth-mock with auth
        serverContent = serverContent.replace(
            "const authRoutes = require('./routes/auth-mock'); // Using mock auth for now",
            "const authRoutes = require('./routes/auth'); // Using Appwrite auth"
        );
        
        fs.writeFileSync(serverPath, serverContent);
        console.log('✅ server.js updated to use Appwrite authentication');
    }
}

// Function to update route middleware
function updateRouteMiddleware() {
    const routesDir = path.join(__dirname, 'src', 'routes');
    const files = ['whatsapp.js', 'admin.js', 'groups.js'];
    
    files.forEach(file => {
        const filePath = path.join(routesDir, file);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Replace auth-mock with auth
            content = content.replace(
                "require('../middleware/auth-mock')",
                "require('../middleware/auth')"
            );
            
            fs.writeFileSync(filePath, content);
            console.log(`✅ ${file} updated to use Appwrite middleware`);
        }
    });
}

// Main function
async function main() {
    console.log('========================================');
    console.log('    Connect to Existing Appwrite Instance');
    console.log('========================================\n');
    
    console.log('This script will help you connect to your existing Appwrite instance.');
    console.log('Based on your current config, you have:');
    console.log('- Endpoint: https://fra.cloud.appwrite.io/v1');
    console.log('- Project ID: 68ac2652001ca468e987');
    console.log('- Database ID: 68ac2652001ca468e987\n');
    
    // Get API key from user
    const apiKey = await askQuestion('Enter your Appwrite API key: ');
    
    if (!apiKey || apiKey.trim() === '') {
        console.log('❌ API key is required. Exiting...');
        rl.close();
        return;
    }
    
    // Configuration object
    const config = {
        PORT: '3000',
        NODE_ENV: 'development',
        FRONTEND_URL: 'http://localhost:3001',
        JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
        JWT_EXPIRES_IN: '24h',
        APPWRITE_ENDPOINT: 'https://fra.cloud.appwrite.io/v1',
        APPWRITE_PROJECT_ID: '68ac2652001ca468e987',
        APPWRITE_DATABASE_ID: '68ac2652001ca468e987',
        APPWRITE_API_KEY: apiKey.trim(),
        COLLECTION_USERS: 'users',
        COLLECTION_GROUPS: 'groups',
        COLLECTION_MEMBERS: 'members',
        COLLECTION_TRANSACTIONS: 'transactions',
        COLLECTION_PAYMENTS: 'payments',
        COLLECTION_OVERDRAFTS: 'overdrafts',
        COLLECTION_WHATSAPP_MESSAGES: 'whatsapp_messages'
    };
    
    console.log('\nUpdating configuration files...\n');
    
    try {
        // Update .env file
        updateEnvFile(config);
        
        // Update appwrite.js config
        updateAppwriteConfig();
        
        // Update server.js
        updateServerConfig();
        
        // Update route middleware
        updateRouteMiddleware();
        
        console.log('\n========================================');
        console.log('    Configuration Update Complete! 🎉');
        console.log('========================================\n');
        
        console.log('Your application is now configured to use your existing Appwrite instance!');
        console.log('\nNext steps:');
        console.log('1. Test the connection: node test-existing-appwrite.js');
        console.log('2. Start your server: npm start');
        console.log('3. Access your app at: http://localhost:3000');
        console.log('\nIf you get errors, you may need to:');
        console.log('- Create missing collections in your Appwrite console');
        console.log('- Update your API key permissions');
        console.log('- Verify your database and collections exist');
        
    } catch (error) {
        console.error('❌ Error updating configuration:', error.message);
    }
    
    rl.close();
}

// Run the script
main().catch(console.error);
