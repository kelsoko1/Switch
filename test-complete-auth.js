#!/usr/bin/env node

/**
 * Comprehensive Authentication System Test
 * Tests all authentication endpoints and functionalities
 */

const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:3000/backend/auth';

// Test data
const superAdminCreds = {
  email: 'admin@kijumbe.com',
  password: 'admin123456'
};

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'testpass123',
  role: 'member'
};

const testAdmin = {
  name: 'Test Admin',
  email: 'testadmin@example.com',
  password: 'adminpass123',
  role: 'admin'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  try {
    const response = await makeRequest(`${API_BASE}/health`);
    if (response.status === 200) {
      console.log('   ✅ Health check passed');
      console.log(`   📊 Users count: ${response.data.users_count}`);
      console.log(`   👑 Super admin exists: ${response.data.super_admin_exists}`);
      return true;
    } else {
      console.log('   ❌ Health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Health check error:', error.message);
    return false;
  }
}

async function testSuperAdminLogin() {
  console.log('👑 Testing super admin login...');
  try {
    const response = await makeRequest(`${API_BASE}/login`, {
      method: 'POST',
      body: superAdminCreds
    });

    if (response.status === 200 && response.data.success) {
      console.log('   ✅ Super admin login successful');
      console.log(`   👤 User: ${response.data.data.user.name}`);
      console.log(`   🔑 Role: ${response.data.data.user.role}`);
      console.log(`   🛡️  Super Admin: ${response.data.data.user.isSuperAdmin}`);
      return response.data.data.token;
    } else {
      console.log('   ❌ Super admin login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('   ❌ Super admin login error:', error.message);
    return null;
  }
}

async function testUserRegistration() {
  console.log('📝 Testing user registration...');
  try {
    const response = await makeRequest(`${API_BASE}/register`, {
      method: 'POST',
      body: testUser
    });

    if (response.status === 201 && response.data.success) {
      console.log('   ✅ User registration successful');
      console.log(`   👤 User: ${response.data.data.user.name}`);
      console.log(`   📧 Email: ${response.data.data.user.email}`);
      console.log(`   🔑 Role: ${response.data.data.user.role}`);
      return response.data.data.token;
    } else {
      console.log('   ❌ User registration failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('   ❌ User registration error:', error.message);
    return null;
  }
}

async function testUserLogin() {
  console.log('🔐 Testing user login...');
  try {
    const response = await makeRequest(`${API_BASE}/login`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    });

    if (response.status === 200 && response.data.success) {
      console.log('   ✅ User login successful');
      console.log(`   👤 User: ${response.data.data.user.name}`);
      console.log(`   🔑 Role: ${response.data.data.user.role}`);
      return response.data.data.token;
    } else {
      console.log('   ❌ User login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('   ❌ User login error:', error.message);
    return null;
  }
}

async function testGetProfile(token) {
  console.log('👤 Testing get profile...');
  try {
    const response = await makeRequest(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200 && response.data.success) {
      console.log('   ✅ Get profile successful');
      console.log(`   👤 User: ${response.data.data.user.name}`);
      console.log(`   📧 Email: ${response.data.data.user.email}`);
      return true;
    } else {
      console.log('   ❌ Get profile failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Get profile error:', error.message);
    return false;
  }
}

async function testGetUsers(adminToken) {
  console.log('👥 Testing get all users (admin)...');
  try {
    const response = await makeRequest(`${API_BASE}/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (response.status === 200 && response.data.success) {
      console.log('   ✅ Get users successful');
      console.log(`   📊 Total users: ${response.data.data.total}`);
      response.data.data.users.forEach(user => {
        console.log(`   👤 ${user.name} (${user.email}) - ${user.role}`);
      });
      return true;
    } else {
      console.log('   ❌ Get users failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Get users error:', error.message);
    return false;
  }
}

async function testCreateAdmin(superAdminToken) {
  console.log('👨‍💼 Testing create admin (super admin only)...');
  try {
    const response = await makeRequest(`${API_BASE}/create-admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: testAdmin
    });

    if (response.status === 201 && response.data.success) {
      console.log('   ✅ Create admin successful');
      console.log(`   👤 Admin: ${response.data.data.user.name}`);
      console.log(`   📧 Email: ${response.data.data.user.email}`);
      console.log(`   🔑 Role: ${response.data.data.user.role}`);
      return true;
    } else {
      console.log('   ❌ Create admin failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Create admin error:', error.message);
    return false;
  }
}

async function testLogout(token) {
  console.log('🚪 Testing logout...');
  try {
    const response = await makeRequest(`${API_BASE}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200 && response.data.success) {
      console.log('   ✅ Logout successful');
      return true;
    } else {
      console.log('   ❌ Logout failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Logout error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Kijumbe Authentication System Test Suite');
  console.log('===========================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  const healthOk = await testHealthCheck();
  results.tests.push({ name: 'Health Check', passed: healthOk });
  healthOk ? results.passed++ : results.failed++;

  if (!healthOk) {
    console.log('\n❌ Server appears to be down. Make sure to start the server first:');
    console.log('   npm start');
    return;
  }

  console.log('');

  // Test 2: Super Admin Login
  const superAdminToken = await testSuperAdminLogin();
  const superAdminLoginOk = !!superAdminToken;
  results.tests.push({ name: 'Super Admin Login', passed: superAdminLoginOk });
  superAdminLoginOk ? results.passed++ : results.failed++;

  console.log('');

  // Test 3: User Registration
  const userToken = await testUserRegistration();
  const registrationOk = !!userToken;
  results.tests.push({ name: 'User Registration', passed: registrationOk });
  registrationOk ? results.passed++ : results.failed++;

  console.log('');

  // Test 4: User Login
  const loginToken = await testUserLogin();
  const loginOk = !!loginToken;
  results.tests.push({ name: 'User Login', passed: loginOk });
  loginOk ? results.passed++ : results.failed++;

  console.log('');

  // Test 5: Get Profile
  if (userToken) {
    const profileOk = await testGetProfile(userToken);
    results.tests.push({ name: 'Get Profile', passed: profileOk });
    profileOk ? results.passed++ : results.failed++;
    console.log('');
  }

  // Test 6: Get Users (Admin)
  if (superAdminToken) {
    const getUsersOk = await testGetUsers(superAdminToken);
    results.tests.push({ name: 'Get Users (Admin)', passed: getUsersOk });
    getUsersOk ? results.passed++ : results.failed++;
    console.log('');
  }

  // Test 7: Create Admin
  if (superAdminToken) {
    const createAdminOk = await testCreateAdmin(superAdminToken);
    results.tests.push({ name: 'Create Admin', passed: createAdminOk });
    createAdminOk ? results.passed++ : results.failed++;
    console.log('');
  }

  // Test 8: Logout
  if (userToken) {
    const logoutOk = await testLogout(userToken);
    results.tests.push({ name: 'Logout', passed: logoutOk });
    logoutOk ? results.passed++ : results.failed++;
    console.log('');
  }

  // Results summary
  console.log('📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  console.log('\n📝 Individual Test Results:');
  results.tests.forEach(test => {
    console.log(`   ${test.passed ? '✅' : '❌'} ${test.name}`);
  });

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Authentication system is working correctly.');
    console.log('\n🚀 System is ready for use:');
    console.log('   📧 Super Admin: admin@kijumbe.com');
    console.log('   🔑 Password: admin123456');
    console.log('   🌐 URL: http://localhost:3000');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server logs and configuration.');
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
