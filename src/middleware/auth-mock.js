const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Mock users file path
const mockUsersFile = path.join(__dirname, '../../mock-users.json');

// Load mock users
function loadMockUsers() {
  if (fs.existsSync(mockUsersFile)) {
    try {
      const data = fs.readFileSync(mockUsersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading mock users:', error);
      return [];
    }
  }
  return [];
}

/**
 * Authentication middleware (mock version)
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Get user from mock users
    const users = loadMockUsers();
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ 
        success: false,
        message: 'Account is not active' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin || false
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

/**
 * Role-based access control middleware
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole) && !req.user.isSuperAdmin) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

/**
 * Admin access middleware
 */
const requireAdmin = requireRole(['admin', 'superadmin']);

/**
 * Kiongozi access middleware
 */
const requireKiongozi = requireRole(['kiongozi', 'admin', 'superadmin']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireKiongozi
};
