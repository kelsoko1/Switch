const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get JWT secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'kijumbe_default_secret_key_for_development_only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// In-memory user storage (replace with database in production)
const users = new Map();

// Initialize super admin user
const initializeSuperAdmin = async () => {
  const superAdminEmail = 'admin@kijumbe.com';
  
  if (!users.has(superAdminEmail)) {
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const superAdmin = {
      id: 'super_admin_001',
      name: 'System Administrator',
      email: superAdminEmail,
      password: hashedPassword,
      role: 'superadmin',
      isSuperAdmin: true,
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: null,
      permissions: ['all'] // Full access
    };
    
    users.set(superAdminEmail, superAdmin);
    console.log('✅ Super Admin initialized:', superAdminEmail);
  }
};

// Initialize on module load
initializeSuperAdmin().catch(console.error);

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['member', 'kiongozi', 'admin']).withMessage('Valid role required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Authentication service is running',
    timestamp: new Date().toISOString(),
    users_count: users.size,
    super_admin_exists: users.has('admin@kijumbe.com')
  });
});

// Register new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { name, email, password, role = 'member' } = req.body;

    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      isSuperAdmin: false,
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: null,
      permissions: role === 'admin' ? ['admin'] : ['user']
    };

    users.set(email, user);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`✅ User registered: ${email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ 
        success: false,
        message: 'Account is not active' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    user.last_login = new Date().toISOString();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`✅ User logged in: ${email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed',
      error: error.message 
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = users.get(userEmail);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get profile',
      error: error.message 
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('current_password').optional().notEmpty().withMessage('Current password is required'),
  body('new_password').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const userEmail = req.user.email;
    const user = users.get(userEmail);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const { name, current_password, new_password } = req.body;

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update password if provided
    if (current_password && new_password) {
      const isValidPassword = await bcrypt.compare(current_password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ 
          success: false,
          message: 'Current password is incorrect' 
        });
      }

      user.password = await bcrypt.hash(new_password, 12);
    }

    user.updated_at = new Date().toISOString();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`✅ Profile updated: ${userEmail}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile',
      error: error.message 
    });
  }
});

// Logout user
router.post('/logout', authenticateToken, (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    console.log(`✅ User logged out: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Logout failed',
      error: error.message 
    });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, (req, res) => {
  try {
    // Check if user is admin or super admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    const allUsers = Array.from(users.values()).map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      data: {
        users: allUsers,
        total: allUsers.length
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get users',
      error: error.message 
    });
  }
});

// Create admin user (super admin only)
router.post('/create-admin', authenticateToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'superadmin']).withMessage('Valid admin role required')
], async (req, res) => {
  try {
    // Check if user is super admin
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Super admin access required' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const userId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      isSuperAdmin: role === 'superadmin',
      status: 'active',
      created_at: new Date().toISOString(),
      created_by: req.user.email,
      last_login: null,
      permissions: role === 'superadmin' ? ['all'] : ['admin']
    };

    users.set(email, user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`✅ Admin created: ${email} (${role}) by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create admin',
      error: error.message 
    });
  }
});

// Export the router and utility functions
module.exports = {
  router,
  users,
  initializeSuperAdmin
};
