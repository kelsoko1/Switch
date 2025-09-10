const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/backend';
const TEST_USER = {
  email: 'test@kijumbe.com',
  password: 'test123456'
};

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${testName}${message ? `: ${message}` : ''}`);
  
  testResults.tests.push({ name: testName, passed, message });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test functions
async function testHealthCheck() {
  const result = await makeRequest('GET', '/health');
  logTest('Health Check', result.success && result.status === 200);
}

async function testUserLogin() {
  const result = await makeRequest('POST', '/auth/login', TEST_USER);
  if (result.success && result.data.success) {
    global.authToken = result.data.data.token;
    logTest('User Login', true);
    return true;
  } else {
    logTest('User Login', false, result.error?.message);
    return false;
  }
}

async function testGetWallet() {
  const result = await makeRequest('GET', '/wallet', null, global.authToken);
  logTest('Get Wallet', result.success && result.data.success);
  return result.success ? result.data.data.wallet : null;
}

async function testSetPin(wallet) {
  if (!wallet || wallet.pin_set) {
    logTest('Set PIN', true, 'PIN already set or wallet not found');
    return true;
  }

  const result = await makeRequest('POST', '/wallet/pin', {
    pin: '1234',
    confirmPin: '1234'
  }, global.authToken);

  logTest('Set PIN', result.success && result.data.success);
  return result.success;
}

async function testVerifyPin() {
  const result = await makeRequest('POST', '/wallet/pin/verify', {
    pin: '1234'
  }, global.authToken);

  logTest('Verify PIN', result.success && result.data.success);
  return result.success;
}

async function testGetPaymentMethods() {
  const result = await makeRequest('GET', '/wallet/payment-methods', null, global.authToken);
  logTest('Get Payment Methods', result.success && result.data.success);
  return result.success;
}

async function testGetWalletStats() {
  const result = await makeRequest('GET', '/wallet/stats', null, global.authToken);
  logTest('Get Wallet Stats', result.success && result.data.success);
  return result.success;
}

async function testGetTransactions() {
  const result = await makeRequest('GET', '/wallet/transactions', null, global.authToken);
  logTest('Get Transactions', result.success && result.data.success);
  return result.success;
}

async function testDeposit() {
  const result = await makeRequest('POST', '/wallet/deposit', {
    amount: 10000,
    paymentMethod: 'mobile_money',
    paymentData: {
      phoneNumber: '+255123456789',
      provider: 'mpesa'
    }
  }, global.authToken);

  logTest('Initiate Deposit', result.success && result.data.success);
  return result.success;
}

async function testWithdraw() {
  const result = await makeRequest('POST', '/wallet/withdraw', {
    amount: 1000,
    pin: '1234',
    withdrawalData: {
      method: 'mobile_money',
      phoneNumber: '+255123456789',
      provider: 'mpesa'
    }
  }, global.authToken);

  logTest('Withdraw Funds', result.success && result.data.success);
  return result.success;
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Kijumbe Wallet Tests...\n');

  // Basic connectivity tests
  await testHealthCheck();
  
  // Authentication tests
  const loginSuccess = await testUserLogin();
  if (!loginSuccess) {
    console.log('\n❌ Authentication failed. Cannot continue with wallet tests.');
    return;
  }

  // Wallet tests
  const wallet = await testGetWallet();
  await testSetPin(wallet);
  await testVerifyPin();
  await testGetPaymentMethods();
  await testGetWalletStats();
  await testGetTransactions();
  
  // Transaction tests (these will fail in test environment without real Selcom setup)
  await testDeposit();
  await testWithdraw();

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.passed + testResults.failed}`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.message}`);
      });
  }

  console.log('\n💡 Note: Payment-related tests may fail without proper Selcom configuration.');
  console.log('   This is expected in a test environment.');
}

// Run tests
runTests().catch(console.error);
