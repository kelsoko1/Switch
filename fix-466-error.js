require('dotenv').config();
const axios = require('axios');

async function fix466Error() {
  console.log('🔧 FIXING 466 ERROR - MESSAGE SENDING ISSUE...\n');
  
  try {
    const instanceId = process.env.GREENAPI_ID_INSTANCE;
    const apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE;
    const baseUrl = 'https://7105.api.greenapi.com';
    
    console.log('📊 Current Status:');
    console.log('   Instance ID:', instanceId);
    console.log('   API Token:', apiToken ? `${apiToken.substring(0, 10)}...` : 'NOT SET');
    
    // Step 1: Check instance status and restrictions
    console.log('\n📱 Step 1: Checking instance status and restrictions...');
    try {
      const statusResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/getStateInstance/${apiToken}`
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
      console.log('❌ Cannot check instance status:', error.response?.status, error.response?.data);
      return;
    }
    
    // Step 2: Check Green API account status
    console.log('\n💳 Step 2: Checking account status...');
    try {
      const accountResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/getAccountState/${apiToken}`
      );
      console.log('✅ Account Status:', JSON.stringify(accountResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Cannot get account status:', error.response?.status, error.response?.data);
    }
    
    // Step 3: Test with different phone number formats
    console.log('\n🔢 Step 3: Testing different phone number formats...');
    
    const testNumbers = [
      '255748002591',      // Full international format
      '+255748002591',     // With plus
      '0748002591',        // Local format
      '748002591'          // Short format
    ];
    
    for (const testNum of testNumbers) {
      console.log(`\n📱 Testing: ${testNum}`);
      
      try {
        const sendResponse = await axios.post(
          `${baseUrl}/waInstance${instanceId}/SendMessage/${apiToken}`,
          {
            chatId: `${testNum}@c.us`,
            message: `🧪 Test message - ${new Date().toLocaleTimeString()}`
          }
        );
        
        if (sendResponse.data.idMessage) {
          console.log('✅ SUCCESS! Message ID:', sendResponse.data.idMessage);
          console.log('💡 This number format works!');
          break;
        }
        
      } catch (error) {
        if (error.response?.status === 466) {
          console.log('❌ 466 Error: Quota exceeded or number restricted');
        } else if (error.response?.status === 400) {
          console.log('❌ 400 Error: Bad request format');
        } else {
          console.log('❌ Error:', error.response?.status, error.response?.data);
        }
      }
    }
    
    // Step 4: Check for quota and restrictions
    console.log('\n📊 Step 4: Checking for quota and restrictions...');
    console.log('💡 466 Error usually means:');
    console.log('   • Monthly quota exceeded');
    console.log('   • Number not in allowed list');
    console.log('   • Instance has restrictions');
    console.log('   • Rate limiting active');
    
    // Step 5: Provide solutions
    console.log('\n🔧 Step 5: Solutions to try...');
    console.log('\n1️⃣ Check Green API Dashboard:');
    console.log('   • Go to https://console.green-api.com/');
    console.log('   • Check your instance status');
    console.log('   • Verify monthly quota');
    console.log('   • Check allowed numbers');
    
    console.log('\n2️⃣ Try Different Numbers:');
    console.log('   • Test with your own number');
    console.log('   • Test with numbers in allowed list');
    console.log('   • Check if demo numbers work');
    
    console.log('\n3️⃣ Check Instance Settings:');
    console.log('   • Verify instance authorization');
    console.log('   • Check for any restrictions');
    console.log('   • Look for rate limiting');
    
    console.log('\n4️⃣ Contact Green API Support:');
    console.log('   • If quota is exceeded');
    console.log('   • If numbers are restricted');
    console.log('   • For account limitations');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
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
