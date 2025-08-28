#!/usr/bin/env node

/**
 * Test Backend API endpoints specifically
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

async function testBackendAPI() {
  console.log('🧪 Testing Backend Admin API Endpoints');
  console.log('=====================================\n');

  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const response = await makeRequest('/backend/auth/health');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test 2: Backend homepage
  console.log('2. Testing /backend route...');
  try {
    const response = await makeRequest('/backend/');
    console.log(`   Status: ${response.status}`);
    console.log(`   Content type: ${response.headers['content-type']}`);
    console.log(`   Content length: ${response.data.length} characters`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test 3: Login attempt
  console.log('3. Testing login...');
  try {
    const response = await makeRequest('/backend/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@kijumbe.com',
        password: 'admin123456'
      }
    });
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    if (response.data.success) {
      const token = response.data.data.token;
      console.log(`   Token received: ${token ? 'Yes' : 'No'}`);
      
      // Test 4: Protected endpoint
      console.log('\n4. Testing protected endpoint with token...');
      try {
        const profileResponse = await makeRequest('/backend/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(`   Status: ${profileResponse.status}`);
        console.log(`   Response:`, profileResponse.data);
      } catch (error) {
        console.log(`   Error: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test 5: Check if backend admin endpoints exist
  console.log('5. Testing admin endpoints...');
  const adminEndpoints = [
    '/backend/admin/users',
    '/backend/admin/statistics'
  ];
  
  for (const endpoint of adminEndpoints) {
    try {
      const response = await makeRequest(endpoint);
      console.log(`   ${endpoint}: Status ${response.status}`);
    } catch (error) {
      console.log(`   ${endpoint}: Error - ${error.message}`);
    }
  }

  console.log('\n✅ Backend API testing completed!');
}

testBackendAPI().catch(console.error);
