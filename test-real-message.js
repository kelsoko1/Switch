require('dotenv').config();
const KijumbeBot = require('./services/whatsapp-bot-nodejs');

async function testRealMessage() {
  console.log('🧪 TESTING REAL MESSAGE FLOW...\n');
  
  try {
    // Step 1: Create bot instance
    console.log('📱 Step 1: Creating bot instance...');
    const bot = new KijumbeBot();
    console.log('✅ Bot instance created');
    
    // Step 2: Simulate real webhook data
    console.log('\n📨 Step 2: Simulating real webhook data...');
    
    // This is what Green API sends in a real webhook
    const mockWebhookData = {
      typeWebhook: 'incomingMessageReceived',
      instanceData: {
        idInstance: 7105299826,
        wid: '255738071080@c.us',
        typeInstance: 'whatsapp'
      },
      data: {
        idMessage: 'test123',
        timestamp: Date.now(),
        statusMessage: 'SENT',
        sendByApi: false
      },
      chatId: '255748002591@c.us', // This is the sender's number
      senderData: {
        chatId: '255748002591@c.us',
        sender: '255748002591@c.us',
        senderName: 'Test User',
        senderNumber: '255748002591'
      },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: {
          textMessage: 'Hello'
        }
      }
    };
    
    console.log('📨 Mock webhook data:');
    console.log('   Sender:', mockWebhookData.senderData.sender);
    console.log('   Chat ID:', mockWebhookData.chatId);
    console.log('   Message:', mockWebhookData.messageData.textMessageData.textMessage);
    
    // Step 3: Test bot processing with real webhook data
    console.log('\n🤖 Step 3: Testing bot with real webhook data...');
    
    const phoneNumber = mockWebhookData.senderData.sender.replace('@c.us', '');
    const message = mockWebhookData.messageData.textMessageData.textMessage;
    
    console.log(`📱 Processing message from ${phoneNumber}: "${message}"`);
    
    // Test the actual processMessage method
    await bot.processMessage(phoneNumber, message, mockWebhookData.messageData);
    
    console.log('✅ Message processed successfully!');
    
    // Step 4: Check what the bot actually sent
    console.log('\n📤 Step 4: Checking what was sent...');
    console.log('💡 Check your WhatsApp to see if you received the response');
    console.log('💡 The bot should have sent a welcome message');
    
    // Step 5: Test with a different number format
    console.log('\n🔢 Step 5: Testing different number formats...');
    
    const testNumbers = [
      '255748002591',
      '+255748002591', 
      '0748002591',
      '748002591'
    ];
    
    for (const testNum of testNumbers) {
      console.log(`\n📱 Testing number format: ${testNum}`);
      try {
        await bot.processMessage(testNum, 'Test message', {});
        console.log('✅ Processed successfully');
      } catch (error) {
        console.log('❌ Failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function explainTheIssue() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔍 ANALYSIS OF THE ISSUE');
  console.log('═'.repeat(60));
  
  console.log('\n✅ What\'s Working:');
  console.log('   • Green API can send messages');
  console.log('   • Bot processes messages correctly');
  console.log('   • Webhook receives notifications');
  
  console.log('\n❌ What\'s Not Working:');
  console.log('   • Bot responses not reaching WhatsApp');
  console.log('   • Possible phone number format mismatch');
  console.log('   • Messages might be going to wrong number');
  
  console.log('\n🔍 Most Likely Causes:');
  console.log('   1. Phone number format in webhook vs send');
  console.log('   2. Bot sending to wrong number');
  console.log('   3. Green API restrictions on certain numbers');
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Check what number you\'re testing with');
  console.log('   2. Verify the bot is sending to that number');
  console.log('   3. Check Green API dashboard for restrictions');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🧪 TESTING REAL MESSAGE FLOW');
  console.log('═══════════════════════════════════════\n');
  
  await testRealMessage();
  await explainTheIssue();
  
  console.log('\n🏁 Test completed!');
  console.log('\n📋 Check your WhatsApp for the test messages');
  console.log('   If you don\'t receive them, there\'s a number format issue');
}

main().catch(console.error);
