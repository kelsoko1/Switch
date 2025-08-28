const jwt = require('jsonwebtoken');

// Get JWT secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'kijumbe_default_secret_key_for_development_only';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Set user info from decoded token
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name || 'Super Admin',
      isSuperAdmin: decoded.role === 'superadmin' || false
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Middleware to check if user is Kiongozi (group leader)
const requireKiongozi = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'kiongozi' && req.user.role !== 'admin' && !req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Kiongozi access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Middleware to check if user is group member
const requireGroupMember = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!['member', 'kiongozi', 'admin'].includes(req.user.role) && !req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Group member access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireKiongozi,
  requireGroupMember
};
