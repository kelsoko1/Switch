const axios = require('axios');

async function quickTest() {
  try {
    console.log('🧪 Quick Bot Integration Test...');
    
    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test bot status
    try {
      const response = await axios.get('http://localhost:3000/api/whatsapp/bot-status');
      console.log('✅ Bot Status:', response.data);
    } catch (error) {
      console.log('❌ Server not ready or not running');
      console.log('   Please make sure server is running on port 3000');
      return;
    }
    
    // Test direct message processing
    try {
      const testResponse = await axios.post('http://localhost:3000/api/whatsapp/test-bot', {
        phoneNumber: '255123456789',
        message: 'Hello'
      });
      console.log('✅ Test Message Response:', testResponse.data);
      console.log('🎉 Bot integration working! Messages will be processed automatically.');
    } catch (error) {
      console.log('❌ Test failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

quickTest();
