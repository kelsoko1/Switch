#!/usr/bin/env node

/**
 * Test script for WhatsApp Bot Webhook Integration
 * Tests the bot's response through the server webhook
 */

require('dotenv').config();
const axios = require('axios');

const SERVER_URL = 'http://localhost:3000';
const TEST_PHONE = '255123456789'; // Test phone number

async function testBotIntegration() {
  console.log('🧪 Testing WhatsApp Bot Webhook Integration...\n');

  try {
    // Test 1: Check bot status
    console.log('📊 Test 1: Checking bot status...');
    const statusResponse = await axios.get(`${SERVER_URL}/api/whatsapp/bot-status`);
    console.log('✅ Bot Status:', statusResponse.data);
    console.log('');

    // Test 2: Test new user welcome
    console.log('👋 Test 2: Testing new user welcome...');
    const welcomeResponse = await axios.post(`${SERVER_URL}/api/whatsapp/test-bot`, {
      phoneNumber: TEST_PHONE,
      message: 'Hello'
    });
    console.log('✅ Welcome Response:', welcomeResponse.data);
    console.log('');

    // Test 3: Test role selection
    console.log('👤 Test 3: Testing role selection...');
    const roleResponse = await axios.post(`${SERVER_URL}/api/whatsapp/test-bot`, {
      phoneNumber: TEST_PHONE,
      message: '1'
    });
    console.log('✅ Role Selection Response:', roleResponse.data);
    console.log('');

    // Test 4: Test name input
    console.log('📝 Test 4: Testing name input...');
    const nameResponse = await axios.post(`${SERVER_URL}/api/whatsapp/test-bot`, {
      phoneNumber: TEST_PHONE,
      message: 'John Kiongozi'
    });
    console.log('✅ Name Input Response:', nameResponse.data);
    console.log('');

    // Test 5: Test main menu
    console.log('🏠 Test 5: Testing main menu navigation...');
    const menuResponse = await axios.post(`${SERVER_URL}/api/whatsapp/test-bot`, {
      phoneNumber: TEST_PHONE,
      message: '1'
    });
    console.log('✅ Menu Navigation Response:', menuResponse.data);
    console.log('');

    console.log('🎉 All bot integration tests completed successfully!');
    console.log('📱 The bot is now ready to respond automatically via WhatsApp webhook.');

  } catch (error) {
    console.error('❌ Bot integration test failed:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Server not running. Please start the server first with: npm start');
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the server is running: npm start');
    console.log('   2. Check your .env configuration');
    console.log('   3. Verify database connection');
    console.log('   4. Check Green API credentials');
    
    process.exit(1);
  }
}

async function testWebhookSimulation() {
  console.log('🌐 Testing webhook simulation...\n');

  try {
    // Simulate a webhook payload from Green API
    const webhookPayload = {
      typeWebhook: 'incomingMessageReceived',
      chatId: `${TEST_PHONE}@c.us`,
      senderData: {
        sender: `${TEST_PHONE}@c.us`
      },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: {
          textMessage: 'Hi'
        }
      }
    };

    console.log('📡 Simulating webhook payload...');
    const webhookResponse = await axios.post(`${SERVER_URL}/api/whatsapp/webhook`, {
      body: webhookPayload
    });
    
    console.log('✅ Webhook Response:', webhookResponse.data);
    console.log('');
    
    console.log('🎯 Webhook simulation completed successfully!');
    console.log('📨 The bot processed the simulated WhatsApp message.');

  } catch (error) {
    console.error('❌ Webhook simulation failed:', error.response?.data || error.message);
  }
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🤖 WHATSAPP BOT WEBHOOK INTEGRATION TEST');
  console.log('═══════════════════════════════════════\n');

  await testBotIntegration();
  console.log('\n' + '═'.repeat(40) + '\n');
  await testWebhookSimulation();
  
  console.log('\n🏁 All tests completed!');
  console.log('💬 Your bot is now ready to respond automatically to WhatsApp messages.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testBotIntegration, testWebhookSimulation };
