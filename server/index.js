require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const groupsRoutes = require('./routes/groups');

// Initialize Express app
let app;
try {
  app = express();
  console.log('Express app initialized');
} catch (error) {
  console.error('Failed to initialize Express app:', error);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
console.log('Environment loaded, PORT:', PORT);

// Trust proxy
app.set('trust proxy', 1);

// Middleware
try {
  console.log('Setting up middleware...');

  // Get allowed origins from environment or use defaults
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:2025',
    'http://93.127.203.151:2025',
    'http://kijumbesmart.co.tz'
  ].filter(Boolean);

  console.log('Allowed origins:', allowedOrigins);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Appwrite-Project', 'X-Appwrite-Key']
  }));
  console.log('CORS middleware set up');

  app.use(helmet());
  console.log('Helmet middleware set up');

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  console.log('Body parser middleware set up');
} catch (error) {
  console.error('Failed to set up middleware:', error);
  process.exit(1);
}

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', rateLimiter);

// API routes
try {
  console.log('Setting up API routes...');
  app.use('/api/v1/auth', authRoutes);
  console.log('Auth routes set up');
  
  app.use('/api/v1/wallet', walletRoutes);
  console.log('Wallet routes set up');
  
  app.use('/api/v1/admin', adminRoutes);
  console.log('Admin routes set up');
  
  app.use('/api/v1/groups', groupsRoutes);
  console.log('Group routes set up');
} catch (error) {
  console.error('Failed to set up API routes:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle SPA
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('----------------------------------------');
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔒 Appwrite Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log('----------------------------------------');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

module.exports = app;
