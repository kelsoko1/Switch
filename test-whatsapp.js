#!/usr/bin/env node

/**
 * WhatsApp Integration Test Script
 * Tests the WhatsApp bot functionality and API endpoints
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/backend`;

// Test phone number (update this with your test number)
const TEST_PHONE = process.env.TEST_PHONE || '+255738071080';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test functions
async function testServerHealth() {
  try {
    logInfo('Testing server health...');
    const response = await axios.get(`${BASE_URL}/health`);
    
    if (response.status === 200) {
      logSuccess('Server is running and healthy');
      log(`   Status: ${response.data.status}`, 'cyan');
      log(`   Environment: ${response.data.environment}`, 'cyan');
      return true;
    } else {
      logError('Server health check failed');
      return false;
    }
  } catch (error) {
    logError(`Server health check failed: ${error.message}`);
    return false;
  }
}

async function testWhatsAppStatus() {
  try {
    logInfo('Testing WhatsApp bot status...');
    const response = await axios.get(`${API_BASE}/whatsapp/status`);
    
    if (response.status === 200) {
      logSuccess('WhatsApp status endpoint working');
      log(`   Bot Status: ${response.data.botStatus}`, 'cyan');
      log(`   Bot Phone: ${response.data.botPhone}`, 'cyan');
      log(`   Instance ID: ${response.data.instanceId}`, 'cyan');
      return true;
    } else {
      logError('WhatsApp status endpoint failed');
      return false;
    }
  } catch (error) {
    logError(`WhatsApp status check failed: ${error.message}`);
    return false;
  }
}

async function testWhatsAppStatistics() {
  try {
    logInfo('Testing WhatsApp statistics...');
    const response = await axios.get(`${API_BASE}/whatsapp/statistics`);
    
    if (response.status === 200) {
      logSuccess('WhatsApp statistics endpoint working');
      const stats = response.data.statistics;
      log(`   Total Messages: ${stats.totalMessages}`, 'cyan');
      log(`   Success Rate: ${stats.successRate}%`, 'cyan');
      log(`   Incoming: ${stats.totalIncoming}`, 'cyan');
      log(`   Outgoing: ${stats.totalOutgoing}`, 'cyan');
      return true;
    } else {
      logError('WhatsApp statistics endpoint failed');
      return false;
    }
  } catch (error) {
    logError(`WhatsApp statistics check failed: ${error.message}`);
    return false;
  }
}

async function testWhatsAppMessages() {
  try {
    logInfo('Testing WhatsApp messages endpoint...');
    const response = await axios.get(`${API_BASE}/whatsapp/messages?limit=5`);
    
    if (response.status === 200) {
      logSuccess('WhatsApp messages endpoint working');
      log(`   Total Messages: ${response.data.total}`, 'cyan');
      log(`   Showing: ${response.data.messages.length}`, 'cyan');
      return true;
    } else {
      logError('WhatsApp messages endpoint failed');
      return false;
    }
  } catch (error) {
    logError(`WhatsApp messages check failed: ${error.message}`);
    return false;
  }
}

async function testSendTestMessage() {
  try {
    logInfo('Testing WhatsApp message sending...');
    const response = await axios.post(`${API_BASE}/whatsapp/test-connection`, {
      phoneNumber: TEST_PHONE
    });
    
    if (response.status === 200) {
      logSuccess('Test message sent successfully');
      log(`   Response: ${response.data.message}`, 'cyan');
      return true;
    } else {
      logError('Test message sending failed');
      return false;
    }
  } catch (error) {
    logError(`Test message sending failed: ${error.message}`);
    if (error.response?.data?.error) {
      log(`   Error details: ${error.response.data.error}`, 'red');
    }
    return false;
  }
}

async function testSendNotification() {
  try {
    logInfo('Testing WhatsApp notification sending...');
    const response = await axios.post(`${API_BASE}/whatsapp/send-notification`, {
      phoneNumber: TEST_PHONE,
      message: `🧪 Test notification from Kijumbe WhatsApp Bot\n\nTimestamp: ${new Date().toLocaleString()}\nThis is a test of the notification system.`
    });
    
    if (response.status === 200) {
      logSuccess('Notification sent successfully');
      log(`   Response: ${response.data.message}`, 'cyan');
      return true;
    } else {
      logError('Notification sending failed');
      return false;
    }
  } catch (error) {
    logError(`Notification sending failed: ${error.message}`);
    if (error.response?.data?.error) {
      log(`   Error details: ${error.response.data.error}`, 'red');
    }
    return false;
  }
}

async function testBulkNotification() {
  try {
    logInfo('Testing WhatsApp bulk notification...');
    const response = await axios.post(`${API_BASE}/whatsapp/send-bulk-notification`, {
      phoneNumbers: [TEST_PHONE],
      message: `📢 Bulk test message from Kijumbe WhatsApp Bot\n\nTimestamp: ${new Date().toLocaleString()}\nThis is a test of the bulk messaging system.`
    });
    
    if (response.status === 200) {
      logSuccess('Bulk notification sent successfully');
      log(`   Total: ${response.data.total}`, 'cyan');
      log(`   Successful: ${response.data.successful}`, 'cyan');
      log(`   Failed: ${response.data.failed}`, 'cyan');
      return true;
    } else {
      logError('Bulk notification sending failed');
      return false;
    }
  } catch (error) {
    logError(`Bulk notification sending failed: ${error.message}`);
    if (error.response?.data?.error) {
      log(`   Error details: ${error.response.data.error}`, 'red');
    }
    return false;
  }
}

async function testWebhookEndpoint() {
  try {
    logInfo('Testing webhook endpoint...');
    const response = await axios.post(`${API_BASE}/whatsapp/webhook`, {
      body: {
        typeWebhook: 'incomingMessageReceived',
        chatId: `${TEST_PHONE.replace('+', '')}@c.us`,
        senderData: {
          sender: `${TEST_PHONE.replace('+', '')}@c.us`
        },
        messageData: {
          textMessageData: {
            textMessage: 'TEST MESSAGE'
          }
        }
      }
    });
    
    if (response.status === 200) {
      logSuccess('Webhook endpoint working');
      log(`   Response: ${response.data.status}`, 'cyan');
      return true;
    } else {
      logError('Webhook endpoint failed');
      return false;
    }
  } catch (error) {
    logError(`Webhook endpoint test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting WhatsApp Integration Tests', 'bright');
  log('=====================================', 'bright');
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'WhatsApp Status', fn: testWhatsAppStatus },
    { name: 'WhatsApp Statistics', fn: testWhatsAppStatistics },
    { name: 'WhatsApp Messages', fn: testWhatsAppMessages },
    { name: 'Webhook Endpoint', fn: testWebhookEndpoint },
    { name: 'Test Message', fn: testSendTestMessage },
    { name: 'Send Notification', fn: testSendNotification },
    { name: 'Bulk Notification', fn: testBulkNotification }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    log(`\n📋 Running: ${test.name}`, 'magenta');
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Test ${test.name} crashed: ${error.message}`);
      failed++;
    }
  }
  
  // Summary
  log('\n📊 Test Results Summary', 'bright');
  log('======================', 'bright');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');
  log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, 'cyan');
  
  if (failed === 0) {
    log('\n🎉 All tests passed! WhatsApp integration is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above and fix any issues.', 'yellow');
  }
  
  // Environment check
  log('\n🔧 Environment Check', 'bright');
  log('==================', 'bright');
  log(`Base URL: ${BASE_URL}`, 'cyan');
  log(`API Base: ${API_BASE}`, 'cyan');
  log(`Test Phone: ${TEST_PHONE}`, 'cyan');
  log(`GreenAPI Instance: ${process.env.GREENAPI_ID_INSTANCE || 'Not set'}`, 'cyan');
  log(`GreenAPI Token: ${process.env.GREENAPI_API_TOKEN_INSTANCE ? 'Set' : 'Not set'}`, 'cyan');
  log(`GreenAPI Bot Phone: ${process.env.GREENAPI_BOT_PHONE || 'Not set'}`, 'cyan');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testServerHealth,
  testWhatsAppStatus,
  testWhatsAppStatistics,
  testWhatsAppMessages,
  testSendTestMessage,
  testSendNotification,
  testBulkNotification,
  testWebhookEndpoint
};
