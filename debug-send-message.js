require('dotenv').config();
const axios = require('axios');

async function debugSendMessage() {
  console.log('🔍 DEBUGGING GREEN API MESSAGE SENDING...\n');
  
  try {
    const instanceId = process.env.GREENAPI_ID_INSTANCE;
    const apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE;
    const baseUrl = 'https://7105.api.greenapi.com';
    
    console.log('📊 Configuration:');
    console.log('   Instance ID:', instanceId);
    console.log('   API Token:', apiToken ? `${apiToken.substring(0, 10)}...` : 'NOT SET');
    console.log('   Base URL:', baseUrl);
    
    // Step 1: Check instance status
    console.log('\n📱 Step 1: Checking instance status...');
    try {
      const statusResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/getStateInstance/${apiToken}`
      );
      console.log('✅ Instance Status:', statusResponse.data.stateInstance);
      
      if (statusResponse.data.stateInstance !== 'authorized') {
        console.log('❌ Instance not authorized - this will prevent sending messages');
        return;
      }
      
    } catch (error) {
      console.log('❌ Cannot check instance status:', error.response?.status, error.response?.data);
      return;
    }
    
    // Step 2: Test sending a simple message
    console.log('\n💬 Step 2: Testing message sending...');
    const testPhone = '255748002591';
    const testMessage = '🧪 Test message from debug script - ' + new Date().toLocaleTimeString();
    
    console.log(`📱 Sending test message to ${testPhone}:`);
    console.log(`   Message: ${testMessage}`);
    
    try {
      const sendResponse = await axios.post(
        `${baseUrl}/waInstance${instanceId}/SendMessage/${apiToken}`,
        {
          chatId: `${testPhone}@c.us`,
          message: testMessage
        }
      );
      
      console.log('✅ Green API Response:', JSON.stringify(sendResponse.data, null, 2));
      
      if (sendResponse.data.idMessage) {
        console.log('🎉 Message sent successfully!');
        console.log('   Message ID:', sendResponse.data.idMessage);
      } else {
        console.log('⚠️ Response received but no message ID');
      }
      
    } catch (error) {
      console.log('❌ Send message failed:', error.response?.status);
      console.log('Error details:', error.response?.data);
      
      if (error.response?.status === 466) {
        console.log('💡 466 Error: Monthly quota exceeded or number not allowed');
        console.log('   Check your Green API dashboard for quota status');
      } else if (error.response?.status === 400) {
        console.log('💡 400 Error: Bad request - check message format');
      } else if (error.response?.status === 401) {
        console.log('💡 401 Error: Unauthorized - check API token');
      } else if (error.response?.status === 403) {
        console.log('💡 403 Error: Forbidden - check instance permissions');
      }
    }
    
    // Step 3: Check message history
    console.log('\n📚 Step 3: Checking message history...');
    try {
      const historyResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/getChatHistory/${apiToken}`,
        {
          params: {
            chatId: `${testPhone}@c.us`,
            count: 5
          }
        }
      );
      
      if (historyResponse.data && historyResponse.data.length > 0) {
        console.log('✅ Chat history found:');
        historyResponse.data.forEach((msg, index) => {
          console.log(`   ${index + 1}. ${msg.type}: ${msg.textMessage || 'No text'}`);
        });
      } else {
        console.log('ℹ️ No chat history found');
      }
      
    } catch (error) {
      console.log('❌ Cannot get chat history:', error.response?.status, error.response?.data);
    }
    
    // Step 4: Check Green API settings
    console.log('\n⚙️ Step 4: Checking Green API settings...');
    try {
      const settingsResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/getSettings/${apiToken}`
      );
      
      console.log('✅ Settings retrieved:');
      console.log('   Webhook URL:', settingsResponse.data.webhookUrl || 'NOT SET');
      console.log('   Outgoing Webhook:', settingsResponse.data.outgoingWebhook || 'NOT SET');
      console.log('   Outgoing Message Webhook:', settingsResponse.data.outgoingMessageWebhook || 'NOT SET');
      
    } catch (error) {
      console.log('❌ Cannot get settings:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

async function suggestFixes() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔧 POTENTIAL FIXES FOR MESSAGE SENDING');
  console.log('═'.repeat(60));
  
  console.log('\n🔍 Common Issues & Solutions:');
  console.log('   1. ❌ Monthly quota exceeded');
  console.log('      💡 Check Green API dashboard for quota status');
  console.log('      💡 Upgrade plan if needed');
  
  console.log('\n   2. ❌ Number not in allowed list');
  console.log('      💡 Green API may restrict to specific numbers');
  console.log('      💡 Check allowed numbers in dashboard');
  
  console.log('\n   3. ❌ Instance not properly authorized');
  console.log('      💡 Re-authorize instance in Green API');
  console.log('      💡 Check QR code scanning');
  
  console.log('\n   4. ❌ API endpoint format issue');
  console.log('      💡 Verify API URL format');
  console.log('      💡 Check API documentation');
  
  console.log('\n📱 Immediate Actions:');
  console.log('   1. Check Green API dashboard for quota');
  console.log('   2. Verify instance authorization');
  console.log('   3. Check allowed phone numbers');
  console.log('   4. Test with a different number');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🔧 DEBUGGING GREEN API MESSAGE SENDING');
  console.log('═══════════════════════════════════════\n');
  
  await debugSendMessage();
  await suggestFixes();
  
  console.log('\n🏁 Debug completed!');
  console.log('\n📋 Check the results above to identify the issue');
}

main().catch(console.error);
