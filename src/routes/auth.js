const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const { authenticateToken, requireAdmin } = require('../middleware/auth-mock');

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// Register new user
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['member', 'kiongozi', 'admin']).withMessage('Valid role required')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password, role = 'member' } = req.body;

    // Check if user already exists
    try {
      await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, email);
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    } catch (error) {
      // User doesn't exist, continue with registration
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in Appwrite
    const user = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      'unique()', // Auto-generate ID
      {
        name,
        email,
        password: hashedPassword,
        role,
        isSuperAdmin: false,
        status: 'active',
        created_at: new Date().toISOString(),
        last_login: null,
        permissions: role === 'admin' ? ['admin'] : ['user']
      }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.$id,
        email: user.email,
        role: user.role,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
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
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in Appwrite
    const users = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [`email.equal("${email}")`]
    );

    if (users.documents.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const user = users.documents[0];

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
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      user.$id,
      {
        last_login: new Date().toISOString()
      }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.$id,
        email: user.email,
        role: user.role,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
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
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      req.user.id
    );

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

// Create superadmin user (development only)
router.post('/create-superadmin', async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Superadmin creation not allowed in production'
      });
    }

    const { name, email, password, type = 'admin' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate type
    const validTypes = ['member', 'kiongozi', 'admin'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be one of: member, kiongozi, admin'
      });
    }

    // Check if superadmin already exists
    try {
      const existingUsers = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [`email.equal("${email}")`]
      );

      if (existingUsers.documents.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    } catch (error) {
      // User doesn't exist, continue
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create superadmin user with specified type
    const user = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      'unique()',
      {
        name,
        email,
        password: hashedPassword,
        role: type, // Use the specified type (member, kiongozi, admin)
        isSuperAdmin: true, // This is what gives superadmin powers
        status: 'active',
        created_at: new Date().toISOString(),
        last_login: null,
        permissions: ['all']
      }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.$id,
        email: user.email,
        role: user.role,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`✅ Superadmin created: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Superadmin created successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Superadmin creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create superadmin',
      error: error.message
    });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS
    );

    const usersWithoutPasswords = users.documents.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      data: {
        users: usersWithoutPasswords,
        total: usersWithoutPasswords.length
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

module.exports = router;
