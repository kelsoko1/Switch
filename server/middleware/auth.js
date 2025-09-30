const jwt = require('jsonwebtoken');
const { databases } = require('../config/appwrite');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token, authorization denied' 
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from Appwrite
      const user = await databases.getDocument(
        process.env.VITE_APPWRITE_DATABASE_ID,
        process.env.VITE_APPWRITE_COLLECTION_USERS,
        decoded.userId
      );

      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Attach user to request object
      req.user = {
        userId: user.$id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        isActive: user.status === 'active',
        isVerified: user.emailVerification,
        ...(user.profile && { profile: user.profile })
      };

      // Check if user account is active
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive. Please contact support.'
        });
      }

      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid or has expired' 
      });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error during authentication' 
    });
  }
};

/**
 * Role-based access control middleware
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  // Convert single role to array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Grant access if no specific roles required or user has required role
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.$id,
      email: user.email,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Predefined role-based middlewares
const requireUser = authorize(['user', 'admin', 'superadmin']);
const requireAdmin = authorize(['admin', 'superadmin']);
const requireSuperAdmin = authorize(['superadmin']);

module.exports = {
  authenticate,
  authorize,
  generateToken,
  requireUser,
  requireAdmin,
  requireSuperAdmin
};
