require('dotenv').config();
const axios = require('axios');

async function debugMessageFlow() {
  console.log('🔍 DEBUGGING MESSAGE FLOW...\n');
  
  try {
    const instanceId = process.env.GREENAPI_ID_INSTANCE;
    const apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE;
    const baseUrl = 'https://7105.api.greenapi.com';
    
    // Step 1: Check if there are pending notifications
    console.log('📊 Step 1: Checking pending notifications...');
    try {
      const response = await axios.get(
        `${baseUrl}/waInstance${instanceId}/receiveNotification/${apiToken}`
      );
      
      if (response.data && response.data.body) {
        console.log('✅ Found notification:', response.data.body.typeWebhook);
        console.log('📨 Data:', JSON.stringify(response.data.body, null, 2));
        
        // Step 2: Test bot processing
        await testBotProcessing(response.data.body);
        
      } else {
        console.log('ℹ️ No pending notifications');
        console.log('💡 Send a new WhatsApp message to test');
      }
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.includes('webhook')) {
        console.log('ℹ️ Webhook is active - checking recent webhook activity...');
        console.log('💡 Check your server console for webhook logs');
      } else {
        console.log('❌ Error:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

async function testBotProcessing(webhookData) {
  console.log('\n🤖 Step 2: Testing bot message processing...');
  
  try {
    if (webhookData.typeWebhook === 'incomingMessageReceived') {
      const { chatId, senderData, messageData } = webhookData;
      const phoneNumber = senderData.sender.replace('@c.us', '');
      const message = messageData.textMessageData?.textMessage || '';
      
      console.log(`📱 Processing message from ${phoneNumber}: "${message}"`);
      
      // Test bot processing
      const KijumbeBot = require('./services/whatsapp-bot-nodejs');
      const bot = new KijumbeBot();
      
      console.log('✅ Bot instance created');
      
      // Test message processing
      await bot.processMessage(phoneNumber, message, messageData);
      console.log('✅ Bot processed message successfully!');
      
      // Check bot status
      const status = bot.getStatus();
      console.log('📊 Bot Status:', status);
      
    } else {
      console.log('ℹ️ Not an incoming message webhook:', webhookData.typeWebhook);
    }
  } catch (error) {
    console.error('❌ Error testing bot processing:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function checkServerLogs() {
  console.log('\n📋 Step 3: Server Log Analysis...');
  console.log('💡 Check your server console for these messages:');
  console.log('   📨 "Webhook received from [phone]"');
  console.log('   🤖 "Processing message: [message]"');
  console.log('   📤 "Sending response to [phone]"');
  console.log('   ✅ "Message sent successfully"');
  console.log('   ❌ Any error messages');
  
  console.log('\n🔍 Common Issues:');
  console.log('   1. Bot not loaded in server');
  console.log('   2. Message processing errors');
  console.log('   3. Green API send failures');
  console.log('   4. Database connection issues');
}

async function suggestNextSteps() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔧 NEXT STEPS TO FIX RESPONSE ISSUE');
  console.log('═'.repeat(60));
  
  console.log('\n📱 Immediate Test:');
  console.log('   1. Send "Hello" to bot number');
  console.log('   2. Watch server console for logs');
  console.log('   3. Look for error messages');
  
  console.log('\n🔍 Debug Commands:');
  console.log('   1. Check bot status: node -e "require(\'./services/whatsapp-bot-nodejs\').getStatus()"');
  console.log('   2. Test bot directly: node -e "const bot = require(\'./services/whatsapp-bot-nodejs\'); bot.processMessage(\'test\', \'Hello\', {});"');
  
  console.log('\n💡 Most Likely Issues:');
  console.log('   • Bot not properly loaded in server');
  console.log('   • Message processing errors');
  console.log('   • Green API send failures');
  console.log('   • Database connection problems');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🔧 DEBUGGING MESSAGE FLOW');
  console.log('═══════════════════════════════════════\n');
  
  await debugMessageFlow();
  await checkServerLogs();
  await suggestNextSteps();
  
  console.log('\n🏁 Debug completed!');
  console.log('\n📋 Check your server console and try the debug commands above');
}

main().catch(console.error);
