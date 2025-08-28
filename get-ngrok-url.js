const axios = require('axios');

async function getNgrokUrl() {
  try {
    console.log('🔍 Getting ngrok tunnel information...\n');
    
    const response = await axios.get('http://localhost:4040/api/tunnels');
    const tunnels = response.data.tunnels;
    
    if (tunnels && tunnels.length > 0) {
      const tunnel = tunnels[0];
      console.log('✅ Ngrok tunnel found!');
      console.log('🔗 Public URL:', tunnel.public_url);
      console.log('🌐 Protocol:', tunnel.proto);
      console.log('📍 Local URL:', tunnel.config.addr);
      
      console.log('\n📋 WEBHOOK CONFIGURATION:');
      console.log('═'.repeat(50));
      console.log('🔗 Webhook URL:');
      console.log(`${tunnel.public_url}/api/whatsapp/webhook`);
      console.log('\n🔐 Webhook Authorization Header:');
      console.log('Leave this field EMPTY (no authorization required)');
      
      console.log('\n💡 Copy the Webhook URL above and paste it in Green API');
      console.log('   The authorization header can be left empty.');
      
    } else {
      console.log('❌ No ngrok tunnels found');
      console.log('💡 Make sure ngrok is running: ngrok http 3000');
    }
    
  } catch (error) {
    console.log('❌ Cannot connect to ngrok');
    console.log('💡 Make sure ngrok is running: ngrok http 3000');
    console.log('   Error:', error.message);
  }
}

getNgrokUrl();
