#!/usr/bin/env node

/**
 * Kijumbe WhatsApp Bot - Main Entry Point
 * Node.js WhatsApp Bot for Rotational Savings
 * Replaces the previous Python bot with a modern menu-driven system
 */

require('dotenv').config();
const KijumbeWhatsAppBot = require('./services/whatsapp-bot-nodejs');

// Configuration validation
function validateConfiguration() {
  const required = [
    'GREENAPI_ID_INSTANCE',
    'GREENAPI_API_TOKEN_INSTANCE',
    'APPWRITE_ENDPOINT',
    'APPWRITE_PROJECT_ID'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    console.error('   ' + missing.join(', '));
    console.error('\n💡 Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  console.log('✅ Configuration validated successfully');
}

// Initialize the bot
async function initializeBot() {
  try {
    console.log('🚀 Starting Kijumbe WhatsApp Bot...');
    console.log('📱 Instance ID:', process.env.GREENAPI_ID_INSTANCE);
    console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
    
    // Validate configuration
    validateConfiguration();
    
    // Create bot instance
    const bot = new KijumbeWhatsAppBot();
    
    // Setup graceful shutdown
    setupGracefulShutdown(bot);
    
    // Start the bot
    bot.start();
    
    console.log('✅ Kijumbe WhatsApp Bot is running!');
    console.log('📞 Bot Phone:', process.env.GREENAPI_BOT_PHONE || 'Not configured');
    console.log('🔗 Webhook URL:', process.env.GREENAPI_WEBHOOK_URL || 'Not configured');
    console.log('\n🎯 Bot Features:');
    console.log('   • Menu-driven conversation flow');
    console.log('   • User registration and role management');
    console.log('   • Group creation and joining');
    console.log('   • Contribution processing');
    console.log('   • Balance and history tracking');
    console.log('   • Interactive help system');
    console.log('\n💡 Send a message to the bot to start interacting!');
    
    return bot;
    
  } catch (error) {
    console.error('❌ Failed to initialize bot:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your .env file configuration');
    console.error('   2. Verify Green API credentials');
    console.error('   3. Ensure Appwrite connection is working');
    console.error('   4. Check network connectivity');
    process.exit(1);
  }
}

// Setup graceful shutdown
function setupGracefulShutdown(bot) {
  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    
    if (bot) {
      bot.stop();
    }
    
    console.log('✅ Bot stopped successfully');
    process.exit(0);
  };

  // Handle different shutdown signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    if (bot) {
      bot.stop();
    }
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    if (bot) {
      bot.stop();
    }
    process.exit(1);
  });
}

// Performance monitoring
function setupPerformanceMonitoring() {
  const startTime = Date.now();
  
  setInterval(() => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const memory = process.memoryUsage();
    
    console.log(`\n📊 Bot Performance (${new Date().toLocaleTimeString()}):`);
    console.log(`   ⏱️  Uptime: ${uptime}s`);
    console.log(`   🧠 Memory: ${Math.round(memory.heapUsed / 1024 / 1024)}MB`);
    console.log(`   💾 RSS: ${Math.round(memory.rss / 1024 / 1024)}MB`);
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🤖 KIJUMBE WHATSAPP BOT - NODE.JS V2.0');
  console.log('📱 Rotational Savings WhatsApp Automation');
  console.log('═══════════════════════════════════════\n');
  
  // Setup performance monitoring in production
  if (process.env.NODE_ENV === 'production') {
    setupPerformanceMonitoring();
  }
  
  // Initialize and start the bot
  const bot = await initializeBot();
  
  // Keep the process running
  console.log('\n🎯 Bot is now ready to receive messages...');
  console.log('💬 Users can start by sending any message to begin registration');
  console.log('📋 Type Ctrl+C to stop the bot\n');
}

// Run the bot if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error starting bot:', error);
    process.exit(1);
  });
}

module.exports = {
  KijumbeWhatsAppBot,
  initializeBot,
  main
};
