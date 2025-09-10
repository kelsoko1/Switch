const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/backend';
const TEST_USER = {
  email: 'admin@kijumbe.com',
  password: 'admin123456'
};

async function testWalletAPI() {
  console.log('🧪 Testing Kijumbe Wallet API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }

    // Test 2: User Login
    console.log('\n2. Testing user login...');
    let authToken;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
      if (loginResponse.data.success) {
        authToken = loginResponse.data.data.token;
        console.log('✅ Login successful');
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
        return;
      }
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      return;
    }

    // Test 3: Get Wallet
    console.log('\n3. Testing wallet retrieval...');
    try {
      const walletResponse = await axios.get(`${BASE_URL}/wallet`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (walletResponse.data.success) {
        console.log('✅ Wallet retrieved successfully');
        console.log('   Balance:', walletResponse.data.data.wallet.balance);
        console.log('   Currency:', walletResponse.data.data.wallet.currency);
        console.log('   PIN Set:', walletResponse.data.data.wallet.pin_set);
      } else {
        console.log('❌ Wallet retrieval failed:', walletResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Wallet retrieval failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Get Payment Methods
    console.log('\n4. Testing payment methods...');
    try {
      const paymentMethodsResponse = await axios.get(`${BASE_URL}/wallet/payment-methods`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (paymentMethodsResponse.data.success) {
        console.log('✅ Payment methods retrieved successfully');
        const methods = Object.keys(paymentMethodsResponse.data.data.paymentMethods);
        console.log('   Available methods:', methods.join(', '));
      } else {
        console.log('❌ Payment methods failed:', paymentMethodsResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Payment methods failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Get Wallet Stats
    console.log('\n5. Testing wallet stats...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/wallet/stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (statsResponse.data.success) {
        console.log('✅ Wallet stats retrieved successfully');
        const stats = statsResponse.data.data.stats;
        console.log('   Total transactions:', stats.totalTransactions);
        console.log('   Daily limit:', stats.dailyLimit);
        console.log('   Monthly limit:', stats.monthlyLimit);
      } else {
        console.log('❌ Wallet stats failed:', statsResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Wallet stats failed:', error.response?.data?.message || error.message);
    }

    // Test 6: Get Transactions
    console.log('\n6. Testing transaction history...');
    try {
      const transactionsResponse = await axios.get(`${BASE_URL}/wallet/transactions`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (transactionsResponse.data.success) {
        console.log('✅ Transaction history retrieved successfully');
        console.log('   Total transactions:', transactionsResponse.data.data.total);
      } else {
        console.log('❌ Transaction history failed:', transactionsResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Transaction history failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Wallet API testing completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Open your browser and go to: http://localhost:3000');
    console.log('   2. Login with: admin@kijumbe.com / admin123456');
    console.log('   3. Navigate to the Wallet section');
    console.log('   4. Set up your wallet PIN');
    console.log('   5. Test deposit and withdrawal functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWalletAPI();
