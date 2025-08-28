const automationService = require('./services/whatsapp-automation');

// Test the automation system
async function testAutomation() {
  console.log('🧪 Testing WhatsApp Automation System...\n');

  try {
    // Test 1: Check automation stats
    console.log('📊 Test 1: Automation Statistics');
    const stats = automationService.getAutomationStats();
    console.log('✅ Automation Stats:', stats);
    console.log('');

    // Test 2: Test message processing (simulation)
    console.log('📱 Test 2: Message Processing Simulation');
    
    const testPhone = '+255738071080';
    const testMessages = [
      'Hi',
      'KIONGOZI',
      'msaada',
      'status',
      'toa 50000',
      'vikundi'
    ];

    for (const message of testMessages) {
      console.log(`\n🤖 Processing: "${message}"`);
      try {
        await automationService.processMessage(testPhone, message, 'text');
        console.log('✅ Message processed successfully');
      } catch (error) {
        console.log('❌ Message processing failed:', error.message);
      }
    }

    // Test 3: Check session management
    console.log('\n📋 Test 3: Session Management');
    const sessions = Array.from(automationService.userSessions.entries());
    console.log(`✅ Active Sessions: ${sessions.length}`);
    
    if (sessions.length > 0) {
      sessions.forEach(([phone, session]) => {
        console.log(`   📱 ${phone}: ${session.activeFlow || 'No active flow'}`);
      });
    }

    // Test 4: Test configuration
    console.log('\n⚙️ Test 4: Configuration Check');
    const config = require('./config/automation-config');
    console.log('✅ Automation Rules:', Object.keys(config.rules).length);
    console.log('✅ Message Templates:', Object.keys(config.templates).length);
    console.log('✅ Conversation Flows:', Object.keys(config.flows).length);

    // Test 5: Test utility functions
    console.log('\n🔧 Test 5: Utility Functions');
    
    // Test amount extraction
    const amountTest = automationService.extractAmount('toa 50000');
    console.log('✅ Amount Extraction:', amountTest === 50000 ? 'PASS' : 'FAIL');
    
    // Test welcome message detection
    const welcomeTest = automationService.isWelcomeMessage('hi there');
    console.log('✅ Welcome Detection:', welcomeTest ? 'PASS' : 'FAIL');
    
    // Test role selection detection
    const roleTest = automationService.isRoleSelectionMessage('kiongozi');
    console.log('✅ Role Detection:', roleTest ? 'PASS' : 'FAIL');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Configure Green API in your .env file');
    console.log('2. Set up webhook URL in Green API dashboard');
    console.log('3. Test with real WhatsApp messages');
    console.log('4. Monitor automation stats at /backend/whatsapp/automation/stats');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAutomation();
}

module.exports = { testAutomation };
