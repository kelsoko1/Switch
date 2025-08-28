const axios = require('axios');

// Test the frontend authentication system
async function testFrontendAuth() {
  console.log('🔐 Testing Frontend Authentication System...\n');

  const baseURL = 'http://localhost:3001';
  const backendURL = 'http://localhost:3000';
  
  try {
    // Test 1: Check if frontend is running
    console.log('📊 Test 1: Frontend Server Check');
    try {
      const frontendResponse = await axios.get(baseURL);
      console.log('✅ Frontend Server:', frontendResponse.status, 'OK');
    } catch (error) {
      console.log('❌ Frontend Server Check Failed:', error.message);
      console.log('   💡 Make sure to run: cd frontend && npm run dev');
      return;
    }
    console.log('');

    // Test 2: Check if backend is running
    console.log('📊 Test 2: Backend Server Check');
    try {
      const backendResponse = await axios.get(`${backendURL}/health`);
      console.log('✅ Backend Server:', backendResponse.status, backendResponse.data.status);
    } catch (error) {
      console.log('❌ Backend Server Check Failed:', error.message);
      console.log('   💡 Make sure to run: npm start (in root directory)');
      return;
    }
    console.log('');

    // Test 3: Test super admin login through backend
    console.log('👑 Test 3: Super Admin Login (Backend)');
    try {
      const loginResponse = await axios.post(`${backendURL}/backend/auth/login`, {
        email: 'admin@kijumbe.com',
        password: 'admin123456'
      });
      
      console.log('✅ Login Status:', loginResponse.status);
      console.log('✅ Login Message:', loginResponse.data.message);
      console.log('✅ User Role:', loginResponse.data.user.role);
      console.log('✅ Is Super Admin:', loginResponse.data.user.isSuperAdmin);
      console.log('✅ Token Generated:', !!loginResponse.data.token);
      console.log('✅ Auth Source:', loginResponse.data.authSource || 'Not specified');
      
      const token = loginResponse.data.token;
      
      // Test 4: Test token verification
      console.log('\n🔍 Test 4: Token Verification');
      try {
        const verifyResponse = await axios.get(`${backendURL}/backend/auth/profile`, {
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
      console.log('❌ Login Failed:', error.response?.status, error.response?.data?.error || error.message);
      return;
    }

    // Test 5: Test frontend proxy to backend
    console.log('\n🌐 Test 5: Frontend Proxy to Backend');
    try {
      const proxyResponse = await axios.get(`${baseURL}/backend/health`);
      console.log('✅ Frontend Proxy:', proxyResponse.status, 'OK');
      console.log('✅ Proxy Data:', proxyResponse.data.status);
    } catch (error) {
      console.log('❌ Frontend Proxy Failed:', error.message);
      console.log('   💡 Check vite.config.js proxy configuration');
    }

    // Test 6: Test authentication through frontend proxy
    console.log('\n🔐 Test 6: Authentication Through Frontend Proxy');
    try {
      const proxyLoginResponse = await axios.post(`${baseURL}/backend/auth/login`, {
        email: 'admin@kijumbe.com',
        password: 'admin123456'
      });
      
      console.log('✅ Proxy Login Status:', proxyLoginResponse.status);
      console.log('✅ Proxy Login Message:', proxyLoginResponse.data.message);
      console.log('✅ Proxy User Role:', proxyLoginResponse.data.user.role);
      
    } catch (error) {
      console.log('❌ Proxy Login Failed:', error.response?.status, error.response?.data?.error || error.message);
    }

    // Test 7: Test invalid credentials
    console.log('\n🚫 Test 7: Invalid Credentials');
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

    console.log('\n🎉 Frontend authentication tests completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Open http://localhost:3001 in your browser');
    console.log('2. Navigate to /login page');
    console.log('3. Login with admin@kijumbe.com / admin123456');
    console.log('4. Check browser console for any JavaScript errors');
    console.log('5. Verify redirect to admin dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test the authentication flow step by step
async function testAuthFlow() {
  console.log('\n🔄 Testing Authentication Flow Step by Step...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // Step 1: Check server health
    console.log('📋 Step 1: Server Health Check');
    try {
      const healthResponse = await axios.get(`${baseURL}/backend/health`);
      console.log('   ✅ Server is healthy:', healthResponse.data.status);
    } catch (error) {
      console.log('   ❌ Server health check failed:', error.message);
      return;
    }

    // Step 2: Attempt login
    console.log('\n📋 Step 2: Login Attempt');
    try {
      const loginResponse = await axios.post(`${baseURL}/backend/auth/login`, {
        email: 'admin@kijumbe.com',
        password: 'admin123456'
      });
      
      console.log('   ✅ Login successful');
      console.log('   ✅ User:', loginResponse.data.user.name);
      console.log('   ✅ Role:', loginResponse.data.user.role);
      console.log('   ✅ Token received:', !!loginResponse.data.token);
      
      const token = loginResponse.data.token;
      
      // Step 3: Verify token
      console.log('\n📋 Step 3: Token Verification');
      try {
        const profileResponse = await axios.get(`${baseURL}/backend/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('   ✅ Token is valid');
        console.log('   ✅ Profile accessed:', profileResponse.data.user.email);
        
      } catch (error) {
        console.log('   ❌ Token verification failed:', error.response?.status);
      }
      
    } catch (error) {
      console.log('   ❌ Login failed:', error.response?.status, error.response?.data?.error);
    }

    console.log('\n🎯 Authentication flow test completed!');

  } catch (error) {
    console.error('❌ Flow test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('🚀 Starting Frontend Authentication Tests...\n');
  
  // Run basic tests first
  testFrontendAuth().then(() => {
    // Then run flow tests
    return testAuthFlow();
  }).then(() => {
    console.log('\n✨ All tests completed!');
  }).catch(error => {
    console.error('❌ Test execution failed:', error.message);
  });
}

module.exports = { testFrontendAuth, testAuthFlow };
