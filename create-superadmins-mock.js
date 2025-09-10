// Mock superadmin creation for testing without Appwrite
const fs = require('fs');
const path = require('path');

// Superadmin data for all three member types
const SUPERADMINS = [
  {
    name: 'Member Superadmin',
    email: 'member-superadmin@kijumbe.com',
    password: 'superadmin123456',
    type: 'member',
    role: 'member',
    isSuperAdmin: true
  },
  {
    name: 'Kiongozi Superadmin',
    email: 'kiongozi-superadmin@kijumbe.com',
    password: 'superadmin123456',
    type: 'kiongozi',
    role: 'kiongozi',
    isSuperAdmin: true
  },
  {
    name: 'Admin Superadmin',
    email: 'admin-superadmin@kijumbe.com',
    password: 'superadmin123456',
    type: 'admin',
    role: 'admin',
    isSuperAdmin: true
  }
];

// Create a mock users file
const mockUsersFile = path.join(__dirname, 'mock-users.json');

function createMockSuperadmins() {
  console.log('🚀 Creating Mock Superadmin users for all member types...');
  console.log('');

  // Load existing users or create new file
  let users = [];
  if (fs.existsSync(mockUsersFile)) {
    try {
      const data = fs.readFileSync(mockUsersFile, 'utf8');
      users = JSON.parse(data);
    } catch (error) {
      console.log('⚠️  Could not load existing users, creating new file');
    }
  }

  // Add superadmins
  for (const superadmin of SUPERADMINS) {
    console.log(`Creating ${superadmin.type} superadmin...`);
    console.log(`📧 Email: ${superadmin.email}`);
    console.log(`🔑 Password: ${superadmin.password}`);
    console.log('');

    // Check if user already exists
    const existingUser = users.find(user => user.email === superadmin.email);
    if (existingUser) {
      console.log(`⚠️  ${superadmin.type} superadmin already exists`);
    } else {
      // Add new superadmin
      const newUser = {
        id: `superadmin_${superadmin.type}_${Date.now()}`,
        ...superadmin,
        status: 'active',
        created_at: new Date().toISOString(),
        last_login: null,
        permissions: ['all']
      };
      
      users.push(newUser);
      console.log(`✅ ${superadmin.type} superadmin created successfully!`);
    }
    
    console.log('📋 Login Details:');
    console.log(`   Email: ${superadmin.email}`);
    console.log(`   Password: ${superadmin.password}`);
    console.log('');
    console.log('-------------------------------------------');
  }

  // Save users to file
  try {
    fs.writeFileSync(mockUsersFile, JSON.stringify(users, null, 2));
    console.log('💾 Mock users saved to mock-users.json');
  } catch (error) {
    console.log('❌ Error saving mock users:', error.message);
  }

  console.log('');
  console.log('🌐 You can now login at: http://localhost:3002/login');
  console.log('');
  console.log('🔐 All superadmins have access to:');
  console.log('   • All user pages (Dashboard, Groups, Profile)');
  console.log('   • All Kijumbe pages (Kijumbe Dashboard, Groups, Users)');
  console.log('   • All Admin pages (Admin Dashboard, Users, Groups)');
  console.log('   • All system features and settings');
  console.log('');
  console.log('📝 Note: This is a mock implementation for testing.');
  console.log('   For production use, set up proper Appwrite database.');
}

// Run the script
createMockSuperadmins();
