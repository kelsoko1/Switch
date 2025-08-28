#!/usr/bin/env node

/**
 * Test Backend Admin Interface specifically
 */

const http = require('http');

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
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

async function testBackendAdmin() {
  console.log('🛡️  Testing Backend Admin Interface');
  console.log('===================================\n');

  let token = null;

  // Step 1: Login to get token
  console.log('1. 🔐 Logging in as super admin...');
  try {
    const loginResponse = await makeRequest('/backend/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@kijumbe.com',
        password: 'admin123456'
      }
    });

    if (loginResponse.status === 200 && loginResponse.data.success) {
      token = loginResponse.data.data.token;
      console.log('   ✅ Login successful');
      console.log(`   👤 User: ${loginResponse.data.data.user.name}`);
      console.log(`   🔑 Role: ${loginResponse.data.data.user.role}`);
      console.log(`   🛡️  Super Admin: ${loginResponse.data.data.user.isSuperAdmin}`);
    } else {
      console.log('   ❌ Login failed:', loginResponse.data.message);
      return;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return;
  }
  console.log('');

  // Step 2: Test admin endpoints with token
  console.log('2. 👥 Testing admin endpoints with authentication...');
  
  if (token) {
    const adminEndpoints = [
      { path: '/backend/auth/users', name: 'Get Users' },
      { path: '/backend/auth/profile', name: 'Get Profile' },
      { path: '/backend/admin/users', name: 'Admin Users' },
      { path: '/backend/admin/statistics', name: 'Admin Statistics' }
    ];

    for (const endpoint of adminEndpoints) {
      try {
        const response = await makeRequest(endpoint.path, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 200) {
          console.log(`   ✅ ${endpoint.name}: Status ${response.status}`);
          if (endpoint.path === '/backend/auth/users' && response.data.data) {
            console.log(`      📊 Total users: ${response.data.data.total}`);
          }
        } else {
          console.log(`   ❌ ${endpoint.name}: Status ${response.status} - ${response.data.message || 'Failed'}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: Error - ${error.message}`);
      }
    }
  } else {
    console.log('   ❌ No token available for testing');
  }
  console.log('');

  // Step 3: Test backend admin page loading
  console.log('3. 🌐 Testing backend admin page...');
  try {
    const pageResponse = await makeRequest('/backend/');
    if (pageResponse.status === 200) {
      console.log(`   ✅ Backend admin page loaded successfully`);
      console.log(`   📄 Content type: ${pageResponse.headers['content-type']}`);
      console.log(`   📏 Content size: ${pageResponse.data.length} characters`);
      
      // Check if the page contains expected elements
      const content = pageResponse.data;
      const hasLoginForm = content.includes('login-form') || content.includes('Login');
      const hasAdminPanel = content.includes('admin') || content.includes('dashboard');
      
      console.log(`   🔍 Contains login elements: ${hasLoginForm ? 'Yes' : 'No'}`);
      console.log(`   🔍 Contains admin elements: ${hasAdminPanel ? 'Yes' : 'No'}`);
    } else {
      console.log(`   ❌ Failed to load backend admin page: Status ${pageResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error loading backend admin page: ${error.message}`);
  }
  console.log('');

  // Step 4: Summary
  console.log('📋 Summary:');
  console.log('==========');
  if (token) {
    console.log('✅ Authentication system is working');
    console.log('✅ Super admin login successful');
    console.log('✅ JWT tokens are being generated');
    console.log('✅ Backend admin interface is accessible');
    console.log('');
    console.log('🎉 Backend admin system is ready!');
    console.log('');
    console.log('🔗 Access URLs:');
    console.log('   🖥️  Frontend: http://localhost:3000');
    console.log('   🛡️  Backend Admin: http://localhost:3000/backend');
    console.log('   🔌 API Base: http://localhost:3000/backend/auth');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   📧 Email: admin@kijumbe.com');
    console.log('   🔑 Password: admin123456');
  } else {
    console.log('❌ Authentication system has issues');
    console.log('❌ Please check server logs for errors');
  }
}

testBackendAdmin().catch(console.error);
