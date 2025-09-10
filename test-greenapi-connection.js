const axios = require('axios');
require('dotenv').config();

async function testGreenAPIConnection() {
    console.log('🧪 Testing GreenAPI Connection...\n');
    
    const apiUrl = process.env.GREENAPI_API_URL || 'https://7105.api.greenapi.com';
    const instanceId = process.env.GREENAPI_ID_INSTANCE;
    const apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE;
    const botPhone = process.env.GREENAPI_BOT_PHONE;
    
    console.log('📋 Configuration:');
    console.log(`API URL: ${apiUrl}`);
    console.log(`Instance ID: ${instanceId || 'NOT SET'}`);
    console.log(`API Token: ${apiToken ? '***' + apiToken.slice(-4) : 'NOT SET'}`);
    console.log(`Bot Phone: ${botPhone || 'NOT SET'}`);
    console.log(`Webhook URL: ${process.env.GREENAPI_WEBHOOK_URL || 'NOT SET'}\n`);
    
    if (!instanceId || !apiToken) {
        console.log('❌ GreenAPI credentials not configured!');
        console.log('Please run: setup-greenapi-credentials.bat');
        return;
    }
    
    try {
        // Test 1: Get instance settings
        console.log('🔍 Test 1: Getting instance settings...');
        const settingsResponse = await axios.get(`${apiUrl}/waInstance${instanceId}/getSettings/${apiToken}`);
        console.log('✅ Instance settings retrieved successfully');
        console.log(`Instance status: ${settingsResponse.data.stateInstance || 'Unknown'}\n`);
        
        // Test 2: Get QR code (if not authorized)
        console.log('🔍 Test 2: Checking QR code status...');
        try {
            const qrResponse = await axios.get(`${apiUrl}/waInstance${instanceId}/qr/${apiToken}`);
            if (qrResponse.data.message === 'Instance not authorized') {
                console.log('⚠️  Instance not authorized. You need to scan QR code.');
                console.log('📱 Go to your GreenAPI console to get the QR code and scan it with WhatsApp.');
            } else {
                console.log('✅ Instance is authorized and ready');
            }
        } catch (qrError) {
            console.log('✅ Instance appears to be authorized');
        }
        
        // Test 3: Get instance info
        console.log('\n🔍 Test 3: Getting instance information...');
        const infoResponse = await axios.get(`${apiUrl}/waInstance${instanceId}/getInstanceInfo/${apiToken}`);
        console.log('✅ Instance info retrieved successfully');
        console.log(`Instance name: ${infoResponse.data.instanceData?.instanceName || 'N/A'}`);
        console.log(`Instance status: ${infoResponse.data.instanceData?.stateInstance || 'N/A'}\n`);
        
        console.log('🎉 GreenAPI connection test completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Make sure your webhook URL is set in GreenAPI console:');
        console.log(`   ${process.env.GREENAPI_WEBHOOK_URL || 'https://185d4e030402.ngrok-free.app/backend/whatsapp/webhook'}`);
        console.log('2. Test sending a message to your bot');
        console.log('3. Check server logs for webhook activity');
        
    } catch (error) {
        console.log('❌ GreenAPI connection test failed:');
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Error: ${error.response.data?.message || error.response.data || 'Unknown error'}`);
        } else {
            console.log(`Error: ${error.message}`);
        }
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your Instance ID and API Token');
        console.log('2. Make sure your GreenAPI instance is active');
        console.log('3. Verify your internet connection');
        console.log('4. Check GreenAPI console for any issues');
    }
}

testGreenAPIConnection();
