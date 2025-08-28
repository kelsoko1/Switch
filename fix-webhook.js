require('dotenv').config();
const axios = require('axios');

async function checkAndFixWebhook() {
  console.log('🔧 Checking and Fixing Webhook Configuration...\n');
  
  try {
    const instanceId = process.env.GREENAPI_ID_INSTANCE;
    const apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE;
    const baseUrl = process.env.GREENAPI_API_URL || 'https://7105.api.greenapi.com';
    
    console.log(`🆔 Instance ID: ${instanceId}`);
    console.log(`🌐 Base URL: ${baseUrl}`);
    
    // Step 1: Check current settings
    console.log('\n📊 Step 1: Checking current Green API settings...');
    const settingsResponse = await axios.get(
      `${baseUrl}/waInstance${instanceId}/getSettings/${apiToken}`
    );
    console.log('✅ Current Settings:', JSON.stringify(settingsResponse.data, null, 2));
    
    // Step 2: Check if webhook is set
    const currentWebhook = settingsResponse.data.incomingWebhook;
    console.log(`\n🔗 Current Webhook URL: ${currentWebhook || 'NOT SET'}`);
    
    if (!currentWebhook) {
      console.log('❌ No webhook URL configured! This is why the bot can\'t receive messages.');
      
      // Step 3: Set webhook URL
      console.log('\n🔧 Step 2: Setting webhook URL...');
      
      // For local testing, we need a public URL or use ngrok
      const webhookUrl = process.env.GREENAPI_WEBHOOK_URL || 'https://your-domain.com/api/whatsapp/webhook';
      
      if (webhookUrl === 'https://your-domain.com/api/whatsapp/webhook') {
        console.log('⚠️  Webhook URL not configured in .env file');
        console.log('💡 You need to either:');
        console.log('   1. Set GREENAPI_WEBHOOK_URL in your .env file');
        console.log('   2. Use ngrok to create a public tunnel');
        console.log('   3. Deploy to a public server');
        
        console.log('\n🔧 Quick Fix: Using ngrok for local testing...');
        console.log('   Run: npx ngrok http 3000');
        console.log('   Then update your .env with the ngrok URL');
        
        return;
      }
      
      try {
        const setWebhookResponse = await axios.post(
          `${baseUrl}/waInstance${instanceId}/setWebhook/${apiToken}`,
          { webhookUrl }
        );
        console.log('✅ Webhook URL set successfully:', setWebhookResponse.data);
      } catch (error) {
        console.error('❌ Failed to set webhook:', error.response?.data || error.message);
      }
    } else {
      console.log('✅ Webhook URL is configured');
      
      // Test if webhook is accessible
      console.log('\n🧪 Step 2: Testing webhook accessibility...');
      try {
        const testResponse = await axios.get(currentWebhook);
        console.log('✅ Webhook endpoint is accessible');
      } catch (error) {
        console.log('❌ Webhook endpoint not accessible:', error.message);
        console.log('💡 This means Green API can\'t send messages to your server');
      }
    }
    
    // Step 4: Start the bot polling
    console.log('\n🤖 Step 3: Starting bot message polling...');
    try {
      const KijumbeBot = require('./services/whatsapp-bot-nodejs');
      const bot = new KijumbeBot();
      
      // Start the bot
      await bot.start();
      
      console.log('✅ Bot started successfully!');
      console.log('📱 Bot Status:', bot.getStatus());
      
      // Keep the bot running for a few seconds to test
      console.log('\n⏳ Bot is now polling for messages...');
      console.log('📱 Send a WhatsApp message to: ' + process.env.GREENAPI_BOT_PHONE);
      console.log('⏰ Waiting 30 seconds to test...');
      
      setTimeout(() => {
        console.log('\n✅ Bot polling test completed');
        console.log('📊 Final Status:', bot.getStatus());
        process.exit(0);
      }, 30000);
      
    } catch (error) {
      console.error('❌ Failed to start bot:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

async function demonstrateSolution() {
  console.log('\n' + '═'.repeat(60));
  console.log('💡 SOLUTION: Why Your Bot Isn\'t Responding');
  console.log('═'.repeat(60));
  console.log('\n🔍 The Problem:');
  console.log('   • Your bot is loaded but NOT running');
  console.log('   • Webhook URL is not configured in Green API');
  console.log('   • Green API can\'t send message notifications to your server');
  console.log('\n🔧 The Solution:');
  console.log('   1. Configure webhook URL in Green API');
  console.log('   2. Start the bot polling for messages');
  console.log('   3. Ensure your server is accessible from the internet');
  console.log('\n📱 After fixing:');
  console.log('   • Send "Hello" to the bot number');
  console.log('   • Bot will automatically respond');
  console.log('   • Full menu system will work');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🔧 WEBHOOK CONFIGURATION FIX');
  console.log('═══════════════════════════════════════\n');
  
  await checkAndFixWebhook();
  await demonstrateSolution();
}

main().catch(console.error);
