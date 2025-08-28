const axios = require('axios');

async function testAPIEndpoint() {
  console.log('🔍 Testing API Endpoint...\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('📊 Test 1: Backend Server Check');
    try {
      const healthResponse = await axios.get('http://localhost:3000/health');
      console.log('✅ Backend Server:', healthResponse.status, healthResponse.data.status);
    } catch (error) {
      console.log('❌ Backend Server Check Failed:', error.message);
      return;
    }
    console.log('');

    // Test 2: Test authentication endpoint directly
    console.log('🔐 Test 2: Authentication Endpoint Test');
    try {
      const loginResponse = await axios.post('http://localhost:3000/backend/auth/login', {
        email: 'admin@kijumbe.com',
        password: 'admin123456'
      });
      
      console.log('✅ Login Status:', loginResponse.status);
      console.log('✅ Login Message:', loginResponse.data.message);
      console.log('✅ User Role:', loginResponse.data.user.role);
      console.log('✅ Is Super Admin:', loginResponse.data.user.isSuperAdmin);
      console.log('✅ Token Generated:', !!loginResponse.data.token);
      console.log('✅ Auth Source:', loginResponse.data.authSource || 'Not specified');
      
    } catch (error) {
      console.log('❌ Login Failed:', error.response?.status, error.response?.data?.error || error.message);
    }
    console.log('');

    // Test 3: Test frontend proxy endpoint
    console.log('🌐 Test 3: Frontend Proxy Test');
    try {
      const proxyResponse = await axios.get('http://localhost:3001/backend/health');
      console.log('✅ Frontend Proxy:', proxyResponse.status, 'OK');
      console.log('✅ Proxy Data:', proxyResponse.data.status);
    } catch (error) {
      console.log('❌ Frontend Proxy Failed:', error.message);
      console.log('   💡 Frontend server might not be running on port 3001');
    }

    console.log('\n🎉 API endpoint tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testAPIEndpoint();
}

module.exports = { testAPIEndpoint };
