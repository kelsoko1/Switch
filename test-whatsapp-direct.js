require('dotenv').config();
const axios = require('axios');

async function testGreenAPIDirectly() {
  console.log('🧪 Testing Green API Connection...');
  
  const config = {
    instanceId: process.env.GREENAPI_ID_INSTANCE,
    apiToken: process.env.GREENAPI_API_TOKEN_INSTANCE,
    baseUrl: process.env.GREENAPI_API_URL || 'https://7105.api.greenapi.com'
  };
  
  console.log(`📱 Instance ID: ${config.instanceId}`);
  console.log(`🌐 Base URL: ${config.baseUrl}`);
  
  try {
    // Test instance status
    const statusUrl = `${config.baseUrl}/waInstance${config.instanceId}/getStateInstance/${config.apiToken}`;
    console.log('🔍 Checking instance status...');
    
    const response = await axios.get(statusUrl);
    console.log('✅ Instance Status:', response.data);
    
    if (response.data.stateInstance === 'authorized') {
      console.log('🎉 Green API is ready and authorized!');
      
      // Test sending a message to yourself (optional)
      console.log('\n💬 You can now send WhatsApp messages directly!');
      console.log('📱 Bot Phone:', process.env.GREENAPI_BOT_PHONE);
      console.log('🌐 Send a message to the bot phone to test automatic responses.');
      
    } else {
      console.log('⚠️ Instance not authorized. Please check your Green API setup.');
    }
    
  } catch (error) {
    console.error('❌ Green API test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

async function testBotProcessing() {
  console.log('\n🤖 Testing Bot Message Processing...');
  
  try {
    const KijumbeWhatsAppBot = require('./services/whatsapp-bot-nodejs');
    const bot = new KijumbeWhatsAppBot();
    
    console.log('✅ Bot class loaded successfully');
    console.log('📱 Bot Status:', bot.getStatus());
    
    // Test processing a welcome message
    console.log('\n💬 Testing message processing...');
    await bot.processMessage('255123456789', 'Hello');
    
    console.log('✅ Message processing completed');
    
  } catch (error) {
    console.error('❌ Bot processing test failed:', error.message);
  }
}

async function main() {
  console.log('═════════════════════════════════════');
  console.log('🔧 WHATSAPP BOT INTEGRATION DIAGNOSTIC');
  console.log('═════════════════════════════════════\n');
  
  await testGreenAPIDirectly();
  await testBotProcessing();
  
  console.log('\n🏁 Diagnostic completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Ensure Green API instance is authorized');
  console.log('   2. Send a WhatsApp message to: ' + (process.env.GREENAPI_BOT_PHONE || '255738071080'));
  console.log('   3. The bot will automatically respond via webhook');
  console.log('   4. Check server logs for bot activity');
}

main().catch(console.error);
