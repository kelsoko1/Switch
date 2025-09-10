const fs = require('fs');
const path = require('path');

/**
 * Switch Authentication Mode
 * 
 * This script allows you to easily switch between:
 * - Mock authentication (for development/testing)
 * - Appwrite authentication (for production)
 */

function switchAuthMode(mode) {
    const serverPath = path.join(__dirname, 'src', 'server.js');
    
    if (!fs.existsSync(serverPath)) {
        console.error('❌ Server file not found!');
        return false;
    }
    
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (mode === 'mock') {
        // Switch to mock authentication
        serverContent = serverContent.replace(
            "const authRoutes = require('./routes/auth'); // Using Appwrite auth",
            "const authRoutes = require('./routes/auth-mock'); // Using mock auth for development"
        );
        serverContent = serverContent.replace(
            "const authRoutes = require('./routes/auth-mock'); // Using mock auth for demo",
            "const authRoutes = require('./routes/auth-mock'); // Using mock auth for development"
        );
        
        console.log('🔄 Switching to MOCK authentication mode...');
        console.log('✅ Development/Testing mode activated');
        console.log('📝 Using mock users from mock-users.json');
        
    } else if (mode === 'appwrite') {
        // Switch to Appwrite authentication
        serverContent = serverContent.replace(
            "const authRoutes = require('./routes/auth-mock'); // Using mock auth for development",
            "const authRoutes = require('./routes/auth'); // Using Appwrite auth for production"
        );
        serverContent = serverContent.replace(
            "const authRoutes = require('./routes/auth-mock'); // Using mock auth for demo",
            "const authRoutes = require('./routes/auth'); // Using Appwrite auth for production"
        );
        
        console.log('🔄 Switching to APPWRITE authentication mode...');
        console.log('✅ Production mode activated');
        console.log('📝 Using real Appwrite database');
        
    } else {
        console.error('❌ Invalid mode! Use "mock" or "appwrite"');
        return false;
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(serverPath, serverContent);
    
    console.log('✅ Server configuration updated successfully!');
    console.log('🔄 Please restart your server for changes to take effect');
    console.log('   Run: npm start');
    
    return true;
}

// Get command line arguments
const args = process.argv.slice(2);
const mode = args[0];

if (!mode) {
    console.log('========================================');
    console.log('    Authentication Mode Switcher');
    console.log('========================================\n');
    
    console.log('Usage:');
    console.log('  node switch-auth-mode.js mock     # Switch to mock authentication');
    console.log('  node switch-auth-mode.js appwrite # Switch to Appwrite authentication\n');
    
    console.log('Current modes available:');
    console.log('  📝 mock     - Development/Testing (uses mock-users.json)');
    console.log('  🚀 appwrite - Production (uses real Appwrite database)\n');
    
    console.log('Examples:');
    console.log('  node switch-auth-mode.js mock');
    console.log('  node switch-auth-mode.js appwrite');
    
} else {
    switchAuthMode(mode);
}
