#!/usr/bin/env node

/**
 * Test script to check WhatsApp routes loading
 */

const express = require('express');
const path = require('path');

// Test the greenAPI service
console.log('🔍 Testing Green API service...');
try {
  const greenAPI = require('./services/greenapi');
  console.log('✅ Green API service loaded successfully');
  console.log('   Config:', {
    instanceId: greenAPI.config.instanceId,
    baseUrl: greenAPI.config.baseUrl,
    botPhone: greenAPI.config.botPhone
  });
  
  // Test queue status method
  const queueStatus = greenAPI.getQueueStatus();
  console.log('✅ Queue status method working:', queueStatus);
  
} catch (error) {
  console.error('❌ Failed to load Green API service:', error.message);
  process.exit(1);
}

// Test the WhatsApp routes
console.log('\n🔍 Testing WhatsApp routes...');
try {
  const whatsappRoutes = require('./routes/whatsapp');
  console.log('✅ WhatsApp routes loaded successfully');
  
  // Check if it's a router
  if (whatsappRoutes.stack) {
    console.log('✅ Router has middleware stack');
    console.log('   Number of routes:', whatsappRoutes.stack.length);
    
    // List the routes
    whatsappRoutes.stack.forEach((layer, index) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods);
        console.log(`   ${index + 1}. ${methods.join(',').toUpperCase()} ${layer.route.path}`);
      }
    });
  } else {
    console.log('⚠️  Router structure unexpected:', typeof whatsappRoutes);
  }
  
} catch (error) {
  console.error('❌ Failed to load WhatsApp routes:', error.message);
  process.exit(1);
}

// Test basic Express app
console.log('\n🔍 Testing Express app setup...');
try {
  const app = express();
  
  // Test route registration
  app.use('/test', whatsappRoutes);
  console.log('✅ Routes registered successfully');
  
  // Test a simple request
  const testReq = { method: 'GET', url: '/queue-status' };
  const testRes = {
    json: (data) => {
      console.log('✅ Response method working');
      console.log('   Data:', data);
    },
    status: (code) => {
      console.log(`✅ Status method working: ${code}`);
      return testRes;
    }
  };
  
  // Simulate the request
  console.log('\n🔍 Simulating queue-status request...');
  const queueRoute = whatsappRoutes.stack.find(layer => 
    layer.route && layer.route.path === '/queue-status'
  );
  
  if (queueRoute) {
    console.log('✅ Found queue-status route');
    // Try to execute it
    try {
      queueRoute.handle(testReq, testRes, () => {});
    } catch (error) {
      console.log('⚠️  Route execution failed:', error.message);
    }
  } else {
    console.log('❌ queue-status route not found');
  }
  
} catch (error) {
  console.error('❌ Express app test failed:', error.message);
}

console.log('\n🎉 Route testing completed!');
