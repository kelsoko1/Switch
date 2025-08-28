#!/usr/bin/env node

/**
 * Simple test server to isolate WhatsApp routes issue
 */

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📍 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
