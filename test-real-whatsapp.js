require('dotenv').config();
const axios = require('axios');

async function testRealWhatsAppMessage() {
  console.log('📱 Testing Real WhatsApp Message Sending...\n');
  
  try {
    // Test 1: Check bot status
    console.log('📊 Step 1: Checking bot status...');
    const statusResponse = await axios.get('http://localhost:3000/api/whatsapp/bot-status');
    console.log('✅ Bot Status:', statusResponse.data);
    
    if (!statusResponse.data.success) {
      console.log('❌ Bot not ready');
      return;
    }
    
    // Test 2: Send a test message to a real phone number
    console.log('\n💬 Step 2: Sending test message to WhatsApp...');
    
    // You can change this to your own phone number for testing
    const testPhone = process.env.TEST_PHONE || '255738071080'; // Default to bot phone
    
    console.log(`📱 Sending message to: ${testPhone}`);
    console.log('💡 Tip: Make sure this number is in your WhatsApp contacts');
    
    const messagePayload = {
      phoneNumber: testPhone,
      message: 'Hello! This is a test message from Kijumbe Bot. The automation is working! 🎉'
    };
    
    console.log('📤 Sending via bot test endpoint...');
    const response = await axios.post('http://localhost:3000/api/whatsapp/test-bot', messagePayload);
    console.log('✅ Response:', response.data);
    
    console.log('\n🎉 Test completed!');
    console.log('📱 Check your WhatsApp to see if you received the message');
    
  } catch (error) {
    console.error('❌ Test failed:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure server is running: npm start');
    console.log('   2. Check your .env file has correct Green API credentials');
    console.log('   3. Verify the phone number is correct');
  }
}

async function testBotFlow() {
  console.log('\n🤖 Testing Complete Bot Flow...\n');
  
  try {
    // Simulate a complete conversation flow
    const testPhone = '255700000001'; // Test number
    
    console.log('👋 Step 1: Welcome message');
    await axios.post('http://localhost:3000/api/whatsapp/test-bot', {
      phoneNumber: testPhone,
      message: 'Hello'
    });
    
    console.log('👤 Step 2: Role selection');
    await axios.post('http://localhost:3000/api/whatsapp/test-bot', {
      phoneNumber: testPhone,
      message: '1'
    });
    
    console.log('📝 Step 3: Name input');
    await axios.post('http://localhost:3000/api/whatsapp/test-bot', {
      phoneNumber: testPhone,
      message: 'John Test User'
    });
    
    console.log('🏠 Step 4: Main menu');
    await axios.post('http://localhost:3000/api/whatsapp/test-bot', {
      phoneNumber: testPhone,
      message: '1'
    });
    
    console.log('\n✅ Complete bot flow test completed!');
    console.log('📱 The bot is processing messages correctly');
    
  } catch (error) {
    console.error('❌ Bot flow test failed:', error.message);
  }
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('📱 WHATSAPP BOT REAL MESSAGE TEST');
  console.log('═══════════════════════════════════════\n');
  
  await testRealWhatsAppMessage();
  await testBotFlow();
  
  console.log('\n🏁 All tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Send a real WhatsApp message to: ' + (process.env.GREENAPI_BOT_PHONE || '255738071080'));
  console.log('   2. The bot will automatically respond');
  console.log('   3. Try different commands: 1, 2, 3, etc.');
  console.log('   4. Check server logs for bot activity');
}

main().catch(console.error);
