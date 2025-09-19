// Simple script to test Appwrite connectivity
import { Client, Account } from 'node-appwrite';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import fetch from 'node-fetch';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log('Testing Appwrite connectivity...');

// Initialize Appwrite client
const client = new Client();

// Set Appwrite endpoint and project ID from environment variables
const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '68ac2652001ca468e987';

console.log('Using endpoint:', endpoint);
console.log('Using project ID:', projectId.substring(0, 4) + '...');

client
  .setEndpoint(endpoint)
  .setProject(projectId);

// Initialize Account
const account = new Account(client);

// Test connection by trying to get current session
async function testConnection() {
  try {
    console.log('Attempting to connect to Appwrite...');
    
    // Simple ping to check connectivity
    const response = await fetch(`${endpoint}/health/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully connected to Appwrite!');
      console.log('Response:', data);
    } else {
      console.error('❌ Failed to connect to Appwrite. Status:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Error details:', error);
    
    // If it's a network error, provide more helpful information
    if (error.message.includes('ECONNREFUSED') || 
        error.message.includes('ECONNRESET') || 
        error.message.includes('ETIMEDOUT')) {
      console.log('\n🔍 Troubleshooting suggestions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify that Appwrite is running and accessible');
      console.log('3. Check if there are any firewall or proxy settings blocking the connection');
      console.log('4. Verify that the Appwrite endpoint URL is correct');
      console.log('5. Try accessing the Appwrite console in your browser to confirm service availability');
    }
  }
}

testConnection();
