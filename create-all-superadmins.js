const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3000/api';

// Check if we're in offline mode
const isOfflineMode = process.argv.includes('--offline');

// Load environment variables from .env file if it exists
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n').reduce((acc, line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        acc[match[1]] = match[2];
      }
      return acc;
    }, {});
    
    // Set environment variables
    Object.entries(envVars).forEach(([key, value]) => {
      process.env[key] = value;
    });
    
    return true;
  }
  return false;
}

// Superadmin data for all three member types
const SUPERADMINS = [
  {
    name: 'Member Superadmin',
    email: 'member-superadmin@kijumbe.com',
    password: 'superadmin123456',
    type: 'member'
  },
  {
    name: 'Kiongozi Superadmin',
    email: 'kiongozi-superadmin@kijumbe.com',
    password: 'superadmin123456',
    type: 'kiongozi'
  },
  {
    name: 'Admin Superadmin',
    email: 'admin-superadmin@kijumbe.com',
    password: 'superadmin123456',
    type: 'admin'
  }
];

async function createAllSuperadmins() {
  // Load environment variables if available
  loadEnvFile();

  console.log('🚀 Creating Superadmin users for all member types...');
  if (isOfflineMode) {
    console.log('🔌 Running in OFFLINE mode');
    // Disable SSL verification for development
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  console.log('');

  for (const superadmin of SUPERADMINS) {
    try {
      console.log(`Creating ${superadmin.type} superadmin...`);
      console.log(`📧 Email: ${superadmin.email}`);
      console.log(`🔑 Password: ${superadmin.password}`);
      console.log('');

      // Add offline flag for backend to handle offline mode
      const payload = { ...superadmin };
      if (isOfflineMode) {
        payload.offline = true;
      }

      const response = await axios.post(`${API_URL}/auth/create-superadmin`, payload);
      
      if (response.data.success) {
        console.log(`✅ ${superadmin.type} superadmin created successfully!`);
        console.log('');
        console.log('📋 Login Details:');
        console.log(`   Email: ${superadmin.email}`);
        console.log(`   Password: ${superadmin.password}`);
        console.log('');
      } else {
        console.log(`❌ Failed to create ${superadmin.type} superadmin:`, response.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.log(`❌ Error creating ${superadmin.type} superadmin:`, error.response.data.message);
        if (error.response.data.message && error.response.data.message.includes('already exists')) {
          console.log('');
          console.log(`💡 The ${superadmin.type} superadmin user already exists. You can login with:`);
          console.log(`   Email: ${superadmin.email}`);
          console.log(`   Password: ${superadmin.password}`);
        }
      } else {
        console.log('❌ Network error:', error.message);
        console.log('💡 Make sure the backend server is running on http://localhost:3000');
        if (isOfflineMode) {
          console.log('💡 For offline mode, ensure you have set up local Appwrite instance');
        }
      }
    }
    console.log('-------------------------------------------');
  }

  console.log('');
  console.log('🌐 You can now login at: http://localhost:3001/login');
  console.log('');
  console.log('🔐 All superadmins have access to:');
  console.log('   • All user pages (Dashboard, Groups, Profile)');
  console.log('   • All Kijumbe pages (Kijumbe Dashboard, Groups, Users)');
  console.log('   • All Admin pages (Admin Dashboard, Users, Groups)');
  console.log('   • All system features and settings');
}

// Run the script
createAllSuperadmins();
