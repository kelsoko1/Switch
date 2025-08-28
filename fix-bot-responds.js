require('dotenv').config();
const axios = require('axios');

async function diagnoseAndFixBot() {
  console.log('🔧 DIAGNOSING AND FIXING BOT RESPONSE ISSUES...\n');
  
  try {
    const instanceId = process.env.GREENAPI_ID_INSTANCE;
    const apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE;
    const baseUrl = process.env.GREENAPI_API_URL || 'https://7105.api.greenapi.com';
    
    console.log('📊 Step 1: Checking Green API Configuration...');
    
    // Check instance status
    const statusResponse = await axios.get(
      `${baseUrl}/waInstance${instanceId}/getStateInstance/${apiToken}`
    );
    console.log('✅ Instance Status:', statusResponse.data.stateInstance);
    
    // Check current webhook settings
    const settingsResponse = await axios.get(
      `${baseUrl}/waInstance${instanceId}/getSettings/${apiToken}`
    );
    console.log('🔗 Current Webhook URL:', settingsResponse.data.webhookUrl || 'NOT SET');
    
    // Step 2: Fix webhook configuration
    console.log('\n🔧 Step 2: Fixing Webhook Configuration...');
    
    // For local development, we need to use ngrok or similar
    const webhookUrl = process.env.GREENAPI_WEBHOOK_URL;
    
    if (!webhookUrl || webhookUrl === 'https://your-domain.com/backend/whatsapp/webhook') {
      console.log('❌ Webhook URL not configured properly!');
      console.log('\n💡 SOLUTION: Use ngrok for local development');
      console.log('   1. Install ngrok: npm install -g ngrok');
      console.log('   2. Start tunnel: ngrok http 3000');
      console.log('   3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)');
      console.log('   4. Update your .env file:');
      console.log('      GREENAPI_WEBHOOK_URL=https://abc123.ngrok.io/api/whatsapp/webhook');
      
      return;
    }
    
    // Set webhook URL
    try {
      const setWebhookResponse = await axios.post(
        `${baseUrl}/waInstance${instanceId}/setWebhook/${apiToken}`,
        { webhookUrl }
      );
      console.log('✅ Webhook URL set successfully:', setWebhookResponse.data);
    } catch (error) {
      console.error('❌ Failed to set webhook:', error.response?.data || error.message);
    }
    
    // Step 3: Test webhook endpoint
    console.log('\n🧪 Step 3: Testing Webhook Endpoint...');
    try {
      const webhookTest = await axios.get(webhookUrl);
      console.log('✅ Webhook endpoint is accessible');
    } catch (error) {
      console.log('❌ Webhook endpoint not accessible:', error.message);
      console.log('💡 This means Green API cannot send messages to your server');
    }
    
    // Step 4: Test message receiving
    console.log('\n📱 Step 4: Testing Message Reception...');
    try {
      const receiveResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/receiveNotification/${apiToken}`
      );
      
      if (receiveResponse.data && receiveResponse.data.body) {
        console.log('✅ Can receive notifications:', receiveResponse.data.body.typeWebhook);
        console.log('📨 Notification data:', JSON.stringify(receiveResponse.data.body, null, 2));
      } else {
        console.log('ℹ️ No pending notifications');
      }
    } catch (error) {
      console.log('❌ Error checking notifications:', error.message);
    }
    
    // Step 5: Manual message test
    console.log('\n💬 Step 5: Manual Message Test...');
    console.log('📱 Send a WhatsApp message to:', process.env.GREENAPI_BOT_PHONE);
    console.log('⏰ Wait 10 seconds to see if webhook receives it...');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check for new notifications
    try {
      const newNotification = await axios.get(
        `${baseUrl}/waInstance${instanceId}/receiveNotification/${apiToken}`
      );
      
      if (newNotification.data && newNotification.data.body) {
        console.log('🎉 NEW MESSAGE RECEIVED!');
        console.log('📨 Message data:', JSON.stringify(newNotification.data.body, null, 2));
        
        // Process the message manually
        await processIncomingMessage(newNotification.data.body);
        
      } else {
        console.log('ℹ️ No new messages received');
      }
    } catch (error) {
      console.log('❌ Error checking for new messages:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

async function processIncomingMessage(webhookData) {
  console.log('\n🤖 Processing incoming message manually...');
  
  try {
    if (webhookData.typeWebhook === 'incomingMessageReceived') {
      const { chatId, senderData, messageData } = webhookData;
      const phoneNumber = senderData.sender.replace('@c.us', '');
      const message = messageData.textMessageData?.textMessage || '';
      
      console.log(`📱 Message from ${phoneNumber}: ${message}`);
      
      // Simulate bot processing
      const KijumbeBot = require('./services/whatsapp-bot-nodejs');
      const bot = new KijumbeBot();
      
      await bot.processMessage(phoneNumber, message, messageData);
      console.log('✅ Message processed by bot');
      
    } else {
      console.log('ℹ️ Not an incoming message webhook');
    }
  } catch (error) {
    console.error('❌ Error processing message:', error.message);
  }
}

async function demonstrateSolution() {
  console.log('\n' + '═'.repeat(60));
  console.log('💡 COMPLETE SOLUTION FOR BOT RESPONSES');
  console.log('═'.repeat(60));
  
  console.log('\n🔍 The Problem:');
  console.log('   • Bot is running but not receiving real WhatsApp messages');
  console.log('   • Green API webhook is not configured');
  console.log('   • Server is local but webhook needs public URL');
  
  console.log('\n🔧 The Solution:');
  console.log('   1. Use ngrok to create public tunnel');
  console.log('   2. Configure webhook URL in Green API');
  console.log('   3. Test webhook connectivity');
  console.log('   4. Verify message reception');
  
  console.log('\n📱 After fixing:');
  console.log('   • Send "Hello" to bot number');
  console.log('   • Bot will receive webhook notification');
  console.log('   • Bot will process and respond automatically');
  console.log('   • Full conversation flow will work');
  
  console.log('\n🚀 Performance Optimizations Active:');
  console.log('   ⚡ Message caching for instant responses');
  console.log('   🔄 Fast polling (1 second intervals)');
  console.log('   📊 Parallel message processing');
  console.log('   🚀 Response queue optimization');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🔧 BOT RESPONSE DIAGNOSIS & FIX');
  console.log('═══════════════════════════════════════\n');
  
  await diagnoseAndFixBot();
  await demonstrateSolution();
  
  console.log('\n🏁 Diagnosis completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Set up ngrok tunnel');
  console.log('   2. Configure webhook URL');
  console.log('   3. Test with real WhatsApp message');
  console.log('   4. Bot will respond automatically');
}

main().catch(console.error);
