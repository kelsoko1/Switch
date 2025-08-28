require('dotenv').config();
const axios = require('axios');

async function checkErrors() {
  console.log('🔍 Checking Green API errors...\n');
  
  const instanceId = process.env.GREENAPI_ID_INSTANCE;
  const apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE;
  const baseUrl = 'https://7105.api.greenapi.com';
  
  console.log('📊 Config:', { instanceId, apiToken: apiToken ? 'SET' : 'NOT SET' });
  
  try {
    // Test basic endpoint
    const response = await axios.get(
      `${baseUrl}/waInstance${instanceId}/getStateInstance/${apiToken}`
    );
    console.log('✅ Instance Status:', response.data.stateInstance);
    
    // Test receive endpoint
    const receiveResponse = await axios.get(
      `${baseUrl}/waInstance${instanceId}/receiveNotification/${apiToken}`
    );
    console.log('✅ Receive working:', receiveResponse.data ? 'YES' : 'NO');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 400) {
      console.log('\n💡 400 Error usually means:');
      console.log('   • Wrong Instance ID');
      console.log('   • Invalid API Token');
      console.log('   • Instance not authorized');
    }
  }
}

checkErrors();
