#!/usr/bin/env node

/**
 * Test script to verify the fixed endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/backend';

async function testEndpoints() {
    console.log('🧪 Testing fixed endpoints...\n');

    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health endpoint working:', health.data.status);
        console.log('');

        // Test auth verify endpoint
        console.log('2. Testing auth verify endpoint...');
        try {
            const verify = await axios.get(`${BASE_URL}/auth/verify`, {
                headers: { 'Authorization': 'Bearer invalid_token' }
            });
            console.log('❌ Should have failed with invalid token');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Auth verify endpoint working (correctly rejected invalid token)');
            } else {
                console.log('❌ Unexpected error:', error.response?.status);
            }
        }
        console.log('');

        // Test WhatsApp status endpoint
        console.log('3. Testing WhatsApp status endpoint...');
        const whatsappStatus = await axios.get(`${BASE_URL}/whatsapp/status`);
        console.log('✅ WhatsApp status endpoint working');
        console.log('   Bot Status:', whatsappStatus.data.botStatus);
        console.log('   Instance ID:', whatsappStatus.data.instanceId);
        console.log('');

        // Test WhatsApp queue status endpoint
        console.log('4. Testing WhatsApp queue status endpoint...');
        const queueStatus = await axios.get(`${BASE_URL}/whatsapp/queue-status`);
        console.log('✅ WhatsApp queue status endpoint working');
        console.log('   Queue Length:', queueStatus.data.queueStatus?.queueLength);
        console.log('');

        console.log('🎉 All endpoint tests completed successfully!');
        console.log('The WhatsApp integration should now work properly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run tests
testEndpoints();
