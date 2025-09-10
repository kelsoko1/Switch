const axios = require('axios');

// Test authentication and WhatsApp endpoints
async function testAuth() {
  const baseURL = 'http://localhost:3000/api';
  
  try {
    console.log('🔐 Testing authentication...');
    
    // Login as admin
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@kijumbe.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.token;
      
      // Test WhatsApp status endpoint
      console.log('📱 Testing WhatsApp status...');
      const statusResponse = await axios.get(`${baseURL}/whatsapp/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statusResponse.data.success) {
        console.log('✅ WhatsApp status endpoint working');
        console.log('Status:', statusResponse.data.data);
      } else {
        console.log('❌ WhatsApp status failed:', statusResponse.data.message);
      }
      
      // Test WhatsApp statistics endpoint
      console.log('📊 Testing WhatsApp statistics...');
      const statsResponse = await axios.get(`${baseURL}/whatsapp/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.data.success) {
        console.log('✅ WhatsApp statistics endpoint working');
      } else {
        console.log('❌ WhatsApp statistics failed:', statsResponse.data.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuth();
