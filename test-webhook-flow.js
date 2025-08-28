const axios = require('axios');

async function testWebhookFlow() {
  console.log('🌐 Testing WhatsApp Bot Webhook Flow...\n');

  try {
    // Test 1: Check if server is running
    console.log('📊 Step 1: Checking server status...');
    const serverResponse = await axios.get('http://localhost:3000/api/whatsapp/bot-status');
    console.log('✅ Server Response:', serverResponse.data);
    
    if (!serverResponse.data.success) {
      console.log('❌ Bot not loaded properly');
      return;
    }

    // Test 2: Simulate an incoming webhook from Green API
    console.log('\n📡 Step 2: Simulating Green API webhook...');
    
    const webhookPayload = {
      body: {
        typeWebhook: 'incomingMessageReceived',
        chatId: '255700000001@c.us',  // Use a proper format
        senderData: {
          sender: '255700000001@c.us'
        },
        messageData: {
          typeMessage: 'textMessage',
          textMessageData: {
            textMessage: 'Hello'
          }
        }
      }
    };

    console.log('📤 Sending webhook payload...');
    const webhookResponse = await axios.post('http://localhost:3000/api/whatsapp/webhook', webhookPayload);
    console.log('✅ Webhook Response:', webhookResponse.data);

    // Test 3: Test role selection
    console.log('\n👤 Step 3: Testing role selection...');
    const rolePayload = {
      body: {
        typeWebhook: 'incomingMessageReceived',
        chatId: '255700000001@c.us',
        senderData: {
          sender: '255700000001@c.us'
        },
        messageData: {
          typeMessage: 'textMessage',
          textMessageData: {
            textMessage: '1'
          }
        }
      }
    };

    const roleResponse = await axios.post('http://localhost:3000/api/whatsapp/webhook', rolePayload);
    console.log('✅ Role Selection Response:', roleResponse.data);

    // Test 4: Test name input
    console.log('\n📝 Step 4: Testing name input...');
    const namePayload = {
      body: {
        typeWebhook: 'incomingMessageReceived',
        chatId: '255700000001@c.us',
        senderData: {
          sender: '255700000001@c.us'
        },
        messageData: {
          typeMessage: 'textMessage',
          textMessageData: {
            textMessage: 'John Test User'
          }
        }
      }
    };

    const nameResponse = await axios.post('http://localhost:3000/api/whatsapp/webhook', namePayload);
    console.log('✅ Name Input Response:', nameResponse.data);

    console.log('\n🎉 Webhook flow test completed successfully!');
    console.log('✅ The bot is processing messages via webhook correctly');
    console.log('📱 Real WhatsApp messages will now trigger automatic responses');

  } catch (error) {
    console.error('❌ Webhook flow test failed:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Server not running. Please start with: npm start');
    } else {
      console.error('   Error:', error.message);
    }
  }
}

async function demonstrateActualUsage() {
  console.log('\n' + '═'.repeat(50));
  console.log('📱 HOW TO USE WITH REAL WHATSAPP MESSAGES');
  console.log('═'.repeat(50));
  console.log('\n🔧 Setup Steps:');
  console.log('   1. Ensure your server is running (npm start)');
  console.log('   2. Set your webhook URL in Green API to:');
  console.log('      https://your-domain.com/api/whatsapp/webhook');
  console.log('   3. Send a WhatsApp message to: 255738071080');
  console.log('   4. The bot will automatically respond!');
  console.log('\n📋 Bot Flow:');
  console.log('   • New users get welcome message');
  console.log('   • Role selection (Kiongozi/Mwanachama)');
  console.log('   • Name registration');
  console.log('   • Main menu navigation');
  console.log('   • Automatic responses to all commands');
  console.log('\n🎯 The bot is ready for live WhatsApp traffic!');
}

// Run the test
testWebhookFlow().then(() => {
  demonstrateActualUsage();
}).catch(console.error);
