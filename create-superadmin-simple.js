// Simple superadmin creation using Node.js built-in modules
const http = require('http');

// Configuration
const API_URL = 'http://localhost:3000/api';
const SUPERADMIN_DATA = {
  name: 'Super Administrator',
  email: 'superadmin@kijumbe.com',
  password: 'superadmin123456'
};

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating Superadmin user...');
    console.log(`📧 Email: ${SUPERADMIN_DATA.email}`);
    console.log(`🔑 Password: ${SUPERADMIN_DATA.password}`);
    console.log('');

    const response = await makeRequest('POST', '/api/auth/create-superadmin', SUPERADMIN_DATA);
    
    if (response.status === 201 && response.data.success) {
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
      console.log('❌ Failed to create superadmin:', response.data.message || 'Unknown error');
      if (response.data.message && response.data.message.includes('already exists')) {
        console.log('');
        console.log('💡 The superadmin user already exists. You can login with:');
        console.log(`   Email: ${SUPERADMIN_DATA.email}`);
        console.log(`   Password: ${SUPERADMIN_DATA.password}`);
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('💡 Make sure the backend server is running on http://localhost:3000');
  }
}

// Run the script
createSuperAdmin();
