require('dotenv').config();
const axios = require('axios');

async function diagnoseErrors() {
  console.log('🔍 DIAGNOSING 400 ERRORS...\n');
  
  try {
    const instanceId = process.env.GREENAPI_ID_INSTANCE;
    const apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE;
    const baseUrl = process.env.GREENAPI_API_URL || 'https://7105.api.greenapi.com';
    
    console.log('📊 Current Configuration:');
    console.log('   Instance ID:', instanceId);
    console.log('   API Token:', apiToken ? `${apiToken.substring(0, 10)}...` : 'NOT SET');
    console.log('   Base URL:', baseUrl);
    
    // Test 1: Check instance status
    console.log('\n🧪 Test 1: Checking instance status...');
    try {
      const statusResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/getStateInstance/${apiToken}`
      );
      console.log('✅ Instance Status:', statusResponse.data.stateInstance);
    } catch (error) {
      console.log('❌ Instance Status Error:', error.response?.status, error.response?.data);
    }
    
    // Test 2: Check API token validity
    console.log('\n🧪 Test 2: Testing API token...');
    try {
      const settingsResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/getSettings/${apiToken}`
      );
      console.log('✅ API Token Valid');
      console.log('   Webhook URL:', settingsResponse.data.webhookUrl || 'NOT SET');
    } catch (error) {
      console.log('❌ API Token Error:', error.response?.status, error.response?.data);
      if (error.response?.status === 400) {
        console.log('💡 This suggests the API token or instance ID is incorrect');
      }
    }
    
    // Test 3: Check receiveNotification endpoint
    console.log('\n🧪 Test 3: Testing receiveNotification...');
    try {
      const receiveResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/receiveNotification/${apiToken}`
      );
      console.log('✅ Receive Notification Working');
      if (receiveResponse.data && receiveResponse.data.body) {
        console.log('   Type:', receiveResponse.data.body.typeWebhook);
      } else {
        console.log('   No pending notifications');
      }
    } catch (error) {
      console.log('❌ Receive Notification Error:', error.response?.status, error.response?.data);
      if (error.response?.status === 400) {
        console.log('💡 400 Error Details:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    // Test 4: Check environment variables
    console.log('\n🧪 Test 4: Environment Variables Check...');
    const requiredVars = [
      'GREENAPI_ID_INSTANCE',
      'GREENAPI_API_TOKEN_INSTANCE',
      'GREENAPI_BOT_PHONE'
    ];
    
    let allVarsSet = true;
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`   ✅ ${varName}: ${varName.includes('TOKEN') ? value.substring(0, 10) + '...' : value}`);
      } else {
        console.log(`   ❌ ${varName}: NOT SET`);
        allVarsSet = false;
      }
    });
    
    if (!allVarsSet) {
      console.log('\n💡 Missing environment variables! Check your .env file');
    }
    
    // Test 5: Check Green API documentation format
    console.log('\n🧪 Test 5: API Format Check...');
    console.log('💡 Green API expects:');
    console.log(`   URL: ${baseUrl}/waInstance${instanceId}/receiveNotification/${apiToken}`);
    console.log('   Method: GET');
    console.log('   No body required');
    
    // Test 6: Try alternative endpoint format
    console.log('\n🧪 Test 6: Alternative endpoint format...');
    try {
      const altResponse = await axios.get(
        `${baseUrl}/waInstance${instanceId}/receiveNotification`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`
          }
        }
      );
      console.log('✅ Alternative format works!');
    } catch (error) {
      console.log('❌ Alternative format failed:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

async function suggestFixes() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔧 SUGGESTED FIXES FOR 400 ERRORS');
  console.log('═'.repeat(60));
  
  console.log('\n🔍 Most Common Causes:');
  console.log('   1. ❌ Incorrect Instance ID');
  console.log('   2. ❌ Invalid API Token');
  console.log('   3. ❌ Wrong API URL format');
  console.log('   4. ❌ Instance not authorized');
  console.log('   5. ❌ API quota exceeded');
  
  console.log('\n💡 Immediate Actions:');
  console.log('   1. 🔑 Double-check your Green API credentials');
  console.log('   2. 📱 Verify instance is authorized in Green API dashboard');
  console.log('   3. 🌐 Check if you\'re using the correct API endpoint');
  console.log('   4. 📊 Verify your Green API account status');
  
  console.log('\n🔄 Next Steps:');
  console.log('   1. Fix the credentials in .env file');
  console.log('   2. Restart the server');
  console.log('   3. Test the webhook again');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🔧 DIAGNOSING 400 ERRORS');
  console.log('═══════════════════════════════════════\n');
  
  await diagnoseErrors();
  await suggestFixes();
  
  console.log('\n🏁 Diagnosis completed!');
  console.log('\n📋 Check your Green API dashboard for:');
  console.log('   • Correct Instance ID');
  console.log('   • Valid API Token');
  console.log('   • Instance authorization status');
}

main().catch(console.error);
