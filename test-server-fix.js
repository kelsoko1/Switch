const http = require('http');

// Test endpoints
const tests = [
  {
    name: 'Health Check',
    path: '/backend/health',
    method: 'GET'
  },
  {
    name: 'Login Test',
    path: '/backend/auth/login',
    method: 'POST',
    data: JSON.stringify({
      email: 'admin@kijumbe.dev',
      password: 'admin123'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }
];

function runTest(test) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: test.path,
      method: test.method,
      headers: test.headers || {}
    };

    if (test.data && test.method === 'POST') {
      options.headers['Content-Length'] = Buffer.byteLength(test.data);
    }

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: response
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (test.data && test.method === 'POST') {
      req.write(test.data);
    }

    req.end();
  });
}

async function runAllTests() {
  console.log('🧪 Testing server endpoints...\n');

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const result = await runTest(test);
      
      if (result.status === 200) {
        console.log(`✅ ${test.name}: PASSED (Status: ${result.status})`);
        if (test.name === 'Login Test' && result.data.data && result.data.data.token) {
          console.log(`   Token received: ${result.data.data.token.substring(0, 20)}...`);
        }
      } else {
        console.log(`⚠️  ${test.name}: Status ${result.status}`);
        console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED - ${error.message}`);
    }
    console.log('');
  }

  console.log('🎯 Test Results:');
  console.log('- If all tests pass, your server is working correctly');
  console.log('- You can now run: npm run dev:tunnel');
  console.log('- Login credentials: admin@kijumbe.dev / admin123');
}

// Check if server is running
console.log('🚀 Starting server tests...');
console.log('Make sure your server is running on port 3000');
console.log('');

setTimeout(() => {
  runAllTests().catch(console.error);
}, 1000);
