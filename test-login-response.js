#!/usr/bin/env node

const http = require('http');

function makeRequest(path, options = {}) {
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
            headers: res.headers,
            rawData: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            rawData: data,
            parseError: e.message
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

async function testLoginResponse() {
  console.log('🔍 Testing Login Response Format');
  console.log('================================\n');

  try {
    const response = await makeRequest('/backend/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@kijumbe.com',
        password: 'admin123456'
      }
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('\n📄 Raw Response:');
    console.log(response.rawData);
    
    if (response.parseError) {
      console.log('\n❌ JSON Parse Error:', response.parseError);
    } else {
      console.log('\n📊 Parsed Response:');
      console.log(JSON.stringify(response.data, null, 2));
      
      console.log('\n🔍 Response Structure Analysis:');
      console.log('- response.success:', response.data.success);
      console.log('- response.data exists:', !!response.data.data);
      console.log('- response.data.user exists:', !!response.data.data?.user);
      console.log('- response.data.token exists:', !!response.data.data?.token);
      
      if (response.data.data?.user) {
        console.log('- user.role:', response.data.data.user.role);
        console.log('- user.isSuperAdmin:', response.data.data.user.isSuperAdmin);
        console.log('- user.name:', response.data.data.user.name);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLoginResponse();
