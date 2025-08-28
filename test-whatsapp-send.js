require('dotenv').config();
const axios = require('axios');

async function testWhatsAppSending() {
  console.log('📱 Testing WhatsApp Message Sending...\n');
  
  try {
    // Test 1: Check Green API instance status
    console.log('📊 Step 1: Checking Green API instance...');
    const instanceId = process.env.GREENAPI_ID_INSTANCE;
    const apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE;
    const baseUrl = process.env.GREENAPI_API_URL || 'https://7105.api.greenapi.com';
    
    console.log(`🆔 Instance ID: ${instanceId}`);
    console.log(`🌐 Base URL: ${baseUrl}`);
    
    const statusResponse = await axios.get(
      `${baseUrl}/waInstance${instanceId}/getStateInstance/${apiToken}`
    );
    console.log('✅ Instance Status:', statusResponse.data);
    
    if (statusResponse.data.stateInstance !== 'authorized') {
      console.log('❌ Instance not authorized');
      return;
    }
    
    // Test 2: Try to send a message to a different number
    console.log('\n💬 Step 2: Testing message sending...');
    
    // Try sending to a different number (not the bot's own number)
    const testNumbers = [
      '255700000001',  // Test number
      '255700000002',  // Another test number
      '255738071081'   // Different number
    ];
    
    for (const phoneNumber of testNumbers) {
      try {
        console.log(`\n📱 Trying to send to: ${phoneNumber}`);
        
        const messagePayload = {
          chatId: `${phoneNumber}@c.us`,
          message: 'Hello! This is a test from Kijumbe Bot. 🎉'
        };
        
        const sendResponse = await axios.post(
          `${baseUrl}/waInstance${instanceId}/SendMessage/${apiToken}`,
          messagePayload
        );
        
        console.log(`✅ Message sent successfully to ${phoneNumber}:`, sendResponse.data);
        break; // Stop after first successful send
        
      } catch (error) {
        if (error.response) {
          console.log(`❌ Failed to send to ${phoneNumber}:`, error.response.status, error.response.data);
          
          if (error.response.status === 466) {
            console.log('   💡 Error 466: Phone number format issue or instance restriction');
            console.log('   🔧 Try a different phone number or check instance settings');
          }
        } else {
          console.log(`❌ Error sending to ${phoneNumber}:`, error.message);
        }
      }
    }
    
    // Test 3: Check if we can receive messages
    console.log('\n📥 Step 3: Testing message receiving...');
    try {
      const receiveResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/receiveNotification/${apiToken}`
      );
      
      if (receiveResponse.data && receiveResponse.data.body) {
        console.log('✅ Can receive notifications:', receiveResponse.data.body.typeWebhook);
      } else {
        console.log('ℹ️ No pending notifications');
      }
      
    } catch (error) {
      console.log('❌ Error checking notifications:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function demonstrateRealUsage() {
  console.log('\n' + '═'.repeat(50));
  console.log('🎯 REAL WHATSAPP BOT USAGE');
  console.log('═'.repeat(50));
  console.log('\n📱 To test the bot with real WhatsApp messages:');
  console.log('   1. Send a WhatsApp message to: ' + (process.env.GREENAPI_BOT_PHONE || '255738071080'));
  console.log('   2. The bot will automatically respond via webhook');
  console.log('   3. Try these commands:');
  console.log('      • "Hello" - Get welcome message');
  console.log('      • "1" - Select Kiongozi role');
  console.log('      • "2" - Select Mwanachama role');
  console.log('      • "John Doe" - Enter your name');
  console.log('      • "1" - View groups');
  console.log('      • "2" - Make contribution');
  console.log('      • "3" - Check balance');
  console.log('      • "7" - Get help');
  console.log('\n🔧 The bot is integrated with your server and ready to respond!');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🔧 WHATSAPP BOT SENDING TEST');
  console.log('═══════════════════════════════════════\n');
  
  await testWhatsAppSending();
  await demonstrateRealUsage();
  
  console.log('\n🏁 Test completed!');
  console.log('\n💡 Next Steps:');
  console.log('   1. Send a real WhatsApp message to the bot number');
  console.log('   2. The bot will respond automatically');
  console.log('   3. Check server logs for webhook activity');
}

main().catch(console.error);
