const axios = require('axios');

// Test the authentication system
async function testAuthentication() {
  console.log('🔐 Testing Authentication System...\n');

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

    // Test 2: Test super admin login
    console.log('👑 Test 2: Super Admin Login');
    try {
      const loginResponse = await axios.post(`${baseURL}/backend/auth/login`, {
        email: 'admin@kijumbe.com',
        password: 'admin123456'
      });
      
      console.log('✅ Login Status:', loginResponse.status);
      console.log('✅ Login Message:', loginResponse.data.message);
      console.log('✅ User Role:', loginResponse.data.user.role);
      console.log('✅ Is Super Admin:', loginResponse.data.user.isSuperAdmin);
      console.log('✅ Token Generated:', !!loginResponse.data.token);
      
      const token = loginResponse.data.token;
      
      // Test 3: Test token verification
      console.log('\n🔍 Test 3: Token Verification');
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
      
      // Test 4: Test profile access
      console.log('\n👤 Test 4: Profile Access');
      try {
        const profileResponse = await axios.get(`${baseURL}/backend/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Profile Access:', profileResponse.status);
        console.log('✅ Profile Data:', profileResponse.data.user.name);
        
      } catch (error) {
        console.log('❌ Profile Access Failed:', error.response?.status, error.response?.data?.error);
      }
      
      // Test 5: Test admin-only endpoint
      console.log('\n🛡️ Test 5: Admin Access Control');
      try {
        const usersResponse = await axios.get(`${baseURL}/backend/auth/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Admin Access:', usersResponse.status);
        console.log('✅ Users Count:', usersResponse.data.users.length);
        
      } catch (error) {
        console.log('❌ Admin Access Failed:', error.response?.status, error.response?.data?.error);
      }
      
    } catch (error) {
      console.log('❌ Login Failed:', error.response?.status, error.response?.data?.error || error.message);
      return;
    }

    // Test 6: Test invalid credentials
    console.log('\n🚫 Test 6: Invalid Credentials');
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

    // Test 7: Test missing token
    console.log('\n🔒 Test 7: Missing Token');
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

    console.log('\n🎉 Authentication tests completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Open http://localhost:3000/backend in your browser');
    console.log('2. Login with admin@kijumbe.com / admin123456');
    console.log('3. Check browser console for any JavaScript errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAuthentication();
}

module.exports = { testAuthentication };
