const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    console.log('Health:', healthData);
    
    // Test login endpoint
    console.log('\n2. Testing login endpoint...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@kijumbe.com',
        password: 'admin123456'
      })
    });
    const loginData = await loginResponse.json();
    console.log('Login:', loginData);
    
    if (loginData.success && loginData.token) {
      // Test profile endpoint
      console.log('\n3. Testing profile endpoint...');
      const profileResponse = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      const profileData = await profileResponse.json();
      console.log('Profile:', profileData);
      
      // Test groups endpoint
      console.log('\n4. Testing groups endpoint...');
      const groupsResponse = await fetch('http://localhost:3000/api/groups/my-groups', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      const groupsData = await groupsResponse.json();
      console.log('Groups:', groupsData);
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

testAPI();
