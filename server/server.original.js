const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth-mock'); // Using mock auth for development for production
const groupRoutes = require('./routes/groups');
const whatsappRoutes = require('./routes/whatsapp');
const adminRoutes = require('./routes/admin');
const walletRoutes = require('./routes/wallet');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { rateLimiter, authRateLimiter } = require('./middleware/rateLimiter');
const { initializeWhatsAppBot } = require('./services/whatsapp-bot');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// CORS configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Rate limiting middleware
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/backend/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes - moved to /backend
app.use('/backend/auth', authRateLimiter, authRoutes);
app.use('/backend/groups', groupRoutes);
app.use('/backend/whatsapp', whatsappRoutes);
app.use('/backend/admin', adminRoutes);
app.use('/backend/wallet', walletRoutes);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Error handling middleware
app.use(errorHandler);

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for backend API routes
  if (req.path.startsWith('/backend')) {
    return res.status(404).json({
      success: false,
      message: 'API route not found'
    });
  }
  
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Initialize WhatsApp bot
initializeWhatsAppBot().catch(console.error);

// Port configuration
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kijumbe Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/backend`);
  console.log(`📊 Health Check: http://localhost:${PORT}/backend/health`);
  
  // Display webhook URL if available
  if (process.env.GREENAPI_WEBHOOK_URL) {
    console.log(`📱 WhatsApp Webhook: ${process.env.GREENAPI_WEBHOOK_URL}`);
    console.log(`🔗 Copy this URL to your GreenAPI console for webhook configuration`);
  } else {
    console.log(`⚠️  WhatsApp Webhook URL not configured. Run 'npm run dev:tunnel' to set up ngrok tunnel.`);
    console.log(`🔗 Your current ngrok URL: https://92f0d73be6c3.ngrok-free.app/backend/whatsapp/webhook`);
  }
});

module.exports = app;
