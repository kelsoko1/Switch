// Simple test file to debug server startup
require('dotenv').config();
console.log('Environment variables loaded');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('APPWRITE_ENDPOINT:', process.env.APPWRITE_ENDPOINT);

// Try importing middleware
try {
  console.log('Importing errorHandler...');
  const errorHandler = require('./middleware/errorHandler');
  console.log('errorHandler imported successfully');
  
  console.log('Importing rateLimiter...');
  const { rateLimiter } = require('./middleware/rateLimiter');
  console.log('rateLimiter imported successfully');
} catch (error) {
  console.error('Error importing middleware:', error);
}

// Try importing routes
try {
  console.log('Importing routes...');
  const authRoutes = require('./routes/auth');
  console.log('authRoutes imported successfully');
  
  const walletRoutes = require('./routes/wallet');
  console.log('walletRoutes imported successfully');
  
  const adminRoutes = require('./routes/admin');
  console.log('adminRoutes imported successfully');
  
  const groupsRoutes = require('./routes/groups');
  console.log('groupsRoutes imported successfully');
} catch (error) {
  console.error('Error importing routes:', error);
}

console.log('Test completed');
