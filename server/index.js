require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const groupsRoutes = require('./routes/groups');
const xmppRoutes = require('./routes/xmpp');
const janusRoutes = require('./routes/janus');

// Import services
const xmppService = require('./services/xmpp.service');
const janusService = require('./services/janus.service');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS and path
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
  },
  path: "/socket.io/",
  serveClient: false,
  transports: ["websocket", "polling"]
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  logger.info(`New socket connection: ${socket.id}`);
  
  // Handle XMPP messages
  socket.on("xmpp:message", async (data) => {
    try {
      const { from, to, message } = data;
      await xmppService.sendMessage(from, to, message);
      io.to(socket.id).emit("xmpp:message:sent", { success: true });
    } catch (error) {
      logger.error("Error sending XMPP message:", error);
      io.to(socket.id).emit("xmpp:message:error", { 
        error: error.message || "Failed to send message" 
      });
    }
  });

  // Handle Janus room creation
  socket.on("janus:create-room", async (data) => {
    try {
      const { roomId, userId, options } = data;
      const session = await janusService.createSession(userId);
      const result = await janusService.createRoom(session, roomId, options);
      io.to(socket.id).emit("janus:room:created", result);
    } catch (error) {
      logger.error("Error creating Janus room:", error);
      io.to(socket.id).emit("janus:error", { 
        error: error.message || "Failed to create room" 
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Rate limiting configuration
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});

// Trust proxy
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"]
};
app.use(cors(corsOptions));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: "same-site" },
  crossOriginEmbedderPolicy: false,
}));

// Body parsing middleware with increased limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/xmpp', xmppRoutes);
app.use('/api/janus', janusRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    services: {
      xmpp: xmppService.isConnected ? "connected" : "disconnected",
      janus: janusService.sessions.size > 0 ? "active" : "inactive"
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    }
  });
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  
  // Initialize XMPP service
  xmppService.on("connected", (address) => {
    logger.info(`XMPP service connected as ${address}`);
  });

  xmppService.on("error", (error) => {
    logger.error("XMPP service error:", error);
  });

  // Initialize Janus service
  logger.info("Janus WebRTC service initialized");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Close server and exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});