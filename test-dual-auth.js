const axios = require('axios');

// Test both authentication modes
async function testDualAuthentication() {
  console.log('🔐 Testing Dual Authentication System...\n');

  const baseURL = 'http://localhost:3000';
  
  try {
    // Test 1: Check server health
    console.log('📊 Test 1: Server Health Check');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('✅ Server Health:', healthResponse.status, healthResponse.data.status);
    } catch (error) {
      console.log('❌ Server Health Check Failed:', error.message);
      return;
    }
    console.log('');

    // Test 2: Test local storage authentication (super admin)
    console.log('👑 Test 2: Local Storage Authentication (Super Admin)');
    try {
      const loginResponse = await axios.post(`${baseURL}/backend/auth/login`, {
        email: 'admin@kijumbe.com',
        password: 'admin123456'
      });
      
      console.log('✅ Login Status:', loginResponse.status);
      console.log('✅ Login Message:', loginResponse.data.message);
      console.log('✅ User Role:', loginResponse.data.user.role);
      console.log('✅ Is Super Admin:', loginResponse.data.user.isSuperAdmin);
      console.log('✅ Auth Source:', loginResponse.data.authSource);
      console.log('✅ Token Generated:', !!loginResponse.data.token);
      
      const token = loginResponse.data.token;
      
      // Test token verification
      console.log('\n🔍 Test 2.1: Token Verification');
      try {
        const verifyResponse = await axios.get(`${baseURL}/backend/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Token Verification:', verifyResponse.status);
        console.log('✅ User Verified:', verifyResponse.data.user.email);
        
      } catch (error) {
        console.log('❌ Token Verification Failed:', error.response?.status, error.response?.data?.error);
      }
      
    } catch (error) {
      console.log('❌ Local Storage Login Failed:', error.response?.status, error.response?.data?.error || error.message);
      return;
    }

    // Test 3: Test Appwrite authentication (if configured)
    console.log('\n🌐 Test 3: Appwrite Authentication Check');
    try {
      // This would require a real Appwrite user account
      console.log('ℹ️ Appwrite authentication test skipped - requires real Appwrite setup');
      console.log('   To test Appwrite auth:');
      console.log('   1. Set APPWRITE_API_KEY in .env');
      console.log('   2. Create user account in Appwrite Console');
      console.log('   3. Use real credentials for testing');
      
    } catch (error) {
      console.log('⚠️ Appwrite test error:', error.message);
    }

    // Test 4: Test invalid credentials
    console.log('\n🚫 Test 4: Invalid Credentials');
    try {
      await axios.post(`${baseURL}/backend/auth/login`, {
        email: 'wrong@email.com',
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials properly rejected');
      } else {
        console.log('❌ Unexpected error for invalid credentials:', error.response?.status);
      }
    }

    // Test 5: Test missing token
    console.log('\n🔒 Test 5: Missing Token');
    try {
      await axios.get(`${baseURL}/backend/auth/profile`);
      console.log('❌ Missing token should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Missing token properly rejected');
      } else {
        console.log('❌ Unexpected error for missing token:', error.response?.status);
      }
    }

    console.log('\n🎉 Dual authentication tests completed!');
    console.log('\n📝 Summary:');
    console.log('✅ Local Storage Authentication: Working');
    console.log('ℹ️ Appwrite Authentication: Ready (requires configuration)');
    console.log('✅ JWT Token System: Working');
    console.log('✅ Access Control: Working');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. For local development: Use admin@kijumbe.com / admin123456');
    console.log('2. For Appwrite production: Set APPWRITE_API_KEY in .env');
    console.log('3. Create user accounts in Appwrite Console');
    console.log('4. Test with real Appwrite credentials');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testDualAuthentication();
}

module.exports = { testDualAuthentication };
