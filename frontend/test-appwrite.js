// Quick Appwrite connection test
import { client } from './src/config/appwrite.js';

async function testAppwriteConnection() {
  console.log('🔧 Testing Appwrite Connection...');
  console.log('📍 Endpoint:', import.meta.env.VITE_APPWRITE_ENDPOINT);
  console.log('🆔 Project ID:', import.meta.env.VITE_APPWRITE_PROJECT_ID);
  console.log('📝 Project Name:', import.meta.env.VITE_APPWRITE_PROJECT_NAME);
  console.log('');

  try {
    const result = await client.ping();
    console.log('✅ Appwrite connection successful!');
    console.log('📊 Response:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Appwrite connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code || 'Unknown');
    return false;
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAppwriteConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testAppwriteConnection };
