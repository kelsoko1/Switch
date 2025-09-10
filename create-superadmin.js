const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';
const SUPERADMIN_DATA = {
  name: 'Super Administrator',
  email: 'superadmin@kijumbe.com',
  password: 'superadmin123456'
};

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating Superadmin user...');
    console.log(`📧 Email: ${SUPERADMIN_DATA.email}`);
    console.log(`🔑 Password: ${SUPERADMIN_DATA.password}`);
    console.log('');

    const response = await axios.post(`${API_URL}/auth/create-superadmin`, SUPERADMIN_DATA);
    
    if (response.data.success) {
      console.log('✅ Superadmin created successfully!');
      console.log('');
      console.log('📋 Login Details:');
      console.log(`   Email: ${SUPERADMIN_DATA.email}`);
      console.log(`   Password: ${SUPERADMIN_DATA.password}`);
      console.log('');
      console.log('🌐 You can now login at: http://localhost:3001/login');
      console.log('');
      console.log('🔐 Superadmin has access to:');
      console.log('   • All user pages (Dashboard, Groups, Profile)');
      console.log('   • All Kijumbe pages (Kijumbe Dashboard, Groups, Users)');
      console.log('   • All Admin pages (Admin Dashboard, Users, Groups)');
      console.log('   • All system features and settings');
    } else {
      console.log('❌ Failed to create superadmin:', response.data.message);
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.data.message);
      if (error.response.data.message.includes('already exists')) {
        console.log('');
        console.log('💡 The superadmin user already exists. You can login with:');
        console.log(`   Email: ${SUPERADMIN_DATA.email}`);
        console.log(`   Password: ${SUPERADMIN_DATA.password}`);
      }
    } else {
      console.log('❌ Network error:', error.message);
      console.log('💡 Make sure the backend server is running on http://localhost:3000');
    }
  }
}

// Run the script
createSuperAdmin();
