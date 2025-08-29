require('dotenv').config();
const axios = require('axios');

async function fix466Error() {
  console.log('🔧 FIXING 466 ERROR - MESSAGE SENDING ISSUE...\n');
  
  try {
    const instanceId = process.env.GREENAPI_ID_INSTANCE;
    const apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE;
    const baseUrl = 'https://7105.api.greenapi.com';
    
    if (!instanceId || !apiToken) {
      console.error('❌ CRITICAL: Missing Green API credentials in .env file!');
      console.error('   Please check GREENAPI_ID_INSTANCE and GREENAPI_API_TOKEN_INSTANCE');
      return;
    }
    
    console.log('📊 Current Status:');
    console.log('   Instance ID:', instanceId);
    console.log('   API Token:', apiToken ? `${apiToken.substring(0, 10)}...` : 'NOT SET');
    
    // Step 1: Check instance status and restrictions
    console.log('\n📱 Step 1: Checking instance status and restrictions...');
    try {
      const statusResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/getStateInstance/${apiToken}`,
        { timeout: 10000 }
      );
      console.log('✅ Instance Status:', statusResponse.data.stateInstance);
      
      // Check if instance has restrictions
      if (statusResponse.data.stateInstance === 'authorized') {
        console.log('✅ Instance is authorized');
      } else {
        console.log('❌ Instance not authorized - this causes 466 errors');
        return;
      }
      
    } catch (error) {
      console.error('❌ Cannot check instance status:', error.message);
      console.error('Detailed error:', JSON.stringify(error.response?.data || {}, null, 2));
      return;
    }
    
    // Step 2: Check Green API account status
    console.log('\n💳 Step 2: Checking account status...');
    try {
      const accountResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/getAccountState/${apiToken}`,
        { timeout: 10000 }
      );
      console.log('✅ Account Status:', JSON.stringify(accountResponse.data, null, 2));
      
    } catch (error) {
      console.error('❌ Cannot get account status:', error.message);
      console.error('Detailed error:', JSON.stringify(error.response?.data || {}, null, 2));
    }
    
    // Step 3: Test with different phone number formats
    console.log('\n🔢 Step 3: Testing different phone number formats...');
    
    const testNumbers = [
      '255748002591',      // Full international format
      '+255748002591',     // With plus
      '0748002591',        // Local format
      '748002591'          // Short format
    ];
    
    let successfulNumber = null;
    
    for (const testNum of testNumbers) {
      console.log(`\n📱 Testing: ${testNum}`);
      
      try {
        const sendResponse = await axios.post(
          `${baseUrl}/waInstance${instanceId}/SendMessage/${apiToken}`,
          {
            chatId: `${testNum}@c.us`,
            message: `🧪 Test message - ${new Date().toLocaleTimeString()}`
          },
          { timeout: 10000 }
        );
        
        if (sendResponse.data.idMessage) {
          console.log('✅ SUCCESS! Message ID:', sendResponse.data.idMessage);
          console.log('💡 This number format works!');
          successfulNumber = testNum;
          break;
        }
        
      } catch (error) {
        console.error('❌ Send message error:', error.message);
        
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }
    
    if (!successfulNumber) {
      console.log('\n❌ FAILED: Could not send message with any number format');
    }
    
    // Step 4: Detailed error analysis
    console.log('\n🔍 Detailed Error Analysis:');
    console.log('💡 Common 466 Error Causes:');
    console.log('   • Monthly quota exceeded');
    console.log('   • Number not in allowed list');
    console.log('   • Instance has restrictions');
    console.log('   • Rate limiting active');
    
    // Step 5: Recommendations
    console.log('\n🔧 Recommended Actions:');
    console.log('1. Check Green API Dashboard:');
    console.log('   • Go to https://console.green-api.com/');
    console.log('   • Verify instance status');
    console.log('   • Check monthly quota');
    console.log('   • Review allowed numbers');
    
    console.log('\n2. Verify Credentials:');
    console.log('   • Confirm Instance ID is correct');
    console.log('   • Verify API Token is valid');
    
    console.log('\n3. Contact Support:');
    console.log('   • If issues persist');
    console.log('   • Explain 466 error details');
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    console.error('Full error details:', error);
  }
}

async function implementWorkaround() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔄 IMPLEMENTING WORKAROUND FOR 466 ERROR');
  console.log('═'.repeat(60));
  
  console.log('\n💡 Since 466 error prevents sending, let\'s implement a workaround:');
  
  console.log('\n1️⃣ Test Mode for Development:');
  console.log('   • Enable test mode in bot');
  console.log('   • Log messages instead of sending');
  console.log('   • Test conversation flow locally');
  
  console.log('\n2️⃣ Queue Messages for Later:');
  console.log('   • Store failed messages');
  console.log('   • Retry when quota resets');
  console.log('   • Implement fallback system');
  
  console.log('\n3️⃣ Alternative Sending Methods:');
  console.log('   • Use different Green API endpoints');
  console.log('   • Try alternative phone formats');
  console.log('   • Check for API alternatives');
  
  console.log('\n4️⃣ Immediate Testing:');
  console.log('   • Test with your own number');
  console.log('   • Verify webhook reception');
  console.log('   • Check bot processing logic');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🔧 FIXING 466 ERROR - MESSAGE SENDING');
  console.log('═══════════════════════════════════════\n');
  
  await fix466Error();
  await implementWorkaround();
  
  console.log('\n🏁 Fix analysis completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Check Green API dashboard for quota/restrictions');
  console.log('   2. Test with different phone numbers');
  console.log('   3. Contact Green API support if needed');
  console.log('   4. Implement workaround while fixing root cause');
}

main().catch(console.error);
