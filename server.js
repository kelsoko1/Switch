const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-domain.com'
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('dev'));

// Import routes
const { router: authRouter } = require('./routes/auth');
const adminRouter = require('./routes/admin');
const groupsRouter = require('./routes/groups');
const membersRouter = require('./routes/members');
const transactionsRouter = require('./routes/transactions');
const paymentsRouter = require('./routes/payments');
const overdraftsRouter = require('./routes/overdrafts');
const whatsappRouter = require('./routes/whatsapp');

// WhatsApp Bot Integration
let whatsappBot = null;
try {
  const KijumbeWhatsAppBot = require('./services/whatsapp-bot-nodejs');
  whatsappBot = new KijumbeWhatsAppBot();
  console.log('✅ WhatsApp Bot loaded for server integration');
} catch (error) {
  console.warn('⚠️ WhatsApp Bot not available:', error.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Kijumbe Application is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  });
});

// API Routes - Backend endpoints
app.use('/backend/auth', authRouter);
app.use('/backend/admin', adminRouter);
app.use('/backend/groups', groupsRouter);
app.use('/backend/members', membersRouter);
app.use('/backend/transactions', transactionsRouter);
app.use('/backend/payments', paymentsRouter);
app.use('/backend/overdrafts', overdraftsRouter);
app.use('/backend/whatsapp', whatsappRouter);

// Serve backend admin interface
app.use('/backend', express.static(path.join(__dirname, 'backend')));

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'frontend/build')));

// API routes for legacy compatibility
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/members', membersRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/overdrafts', overdraftsRouter);
app.use('/api/whatsapp', whatsappRouter);

// Handle React Router routes - serve React app for any unmatched route
app.get('*', (req, res) => {
  // Check if it's an API request
  if (req.path.startsWith('/api/') || req.path.startsWith('/backend/')) {
    return res.status(404).json({ 
      success: false,
      message: 'API endpoint not found',
      path: req.path 
    });
  }
  
  // Serve React app
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  if (res.headersSent) {
    return next(error);
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Kijumbe Application Started!`);
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n✨ Features Enabled:');
  console.log('   ✅ Full Authentication System');
  console.log('   ✅ Super Admin Access');
  console.log('   ✅ Role-based Permissions');
  console.log('   ✅ JWT Token Security');
  console.log('   ✅ User Management');
  console.log('   ✅ API Endpoints');
  
  // Start WhatsApp Bot if available
  if (whatsappBot) {
    try {
      console.log('\n🤖 Starting WhatsApp Bot...');
      await whatsappBot.start();
      console.log('   ✅ WhatsApp Bot is now running and ready!');
      console.log('   📱 Bot Phone:', whatsappBot.getStatus().botPhone);
      console.log('   🔄 Message polling active');
      console.log('   ⚡ Auto-response enabled');
    } catch (error) {
      console.log('   ❌ Failed to start WhatsApp Bot:', error.message);
    }
  }
  
  console.log('\n🔐 Super Admin Credentials:');
  console.log('   📧 Email: admin@kijumbe.com');
  console.log('   🔑 Password: admin123456');
  console.log('\n🌍 Available URLs:');
  console.log(`   🖥️  Frontend: http://localhost:${PORT}`);
  console.log(`   🛡️  Backend Admin: http://localhost:${PORT}/backend`);
  console.log(`   🔌 API Base: http://localhost:${PORT}/backend/auth`);
});
