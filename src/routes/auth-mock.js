const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Mock users file path
const mockUsersFile = path.join(__dirname, '../../mock-users.json');

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

// Save mock users
function saveMockUsers(users) {
  try {
    fs.writeFileSync(mockUsersFile, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving mock users:', error);
    return false;
  }
}

// Login user (mock version)
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Load mock users
    const users = loadMockUsers();

    // Find user
    const user = users.find(u => u.email === email);

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

    // For mock users, we'll use simple password comparison
    // In production, you'd use bcrypt.compare(password, user.password)
    if (password !== user.password) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    user.last_login = new Date().toISOString();
    saveMockUsers(users);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
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

// Get user profile (mock version)
router.get('/profile', async (req, res) => {
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
    
    // Load mock users
    const users = loadMockUsers();
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ 
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

// Create superadmin user (mock version)
router.post('/create-superadmin', async (req, res) => {
  try {
    const { name, email, password, type = 'admin' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Load existing users
    const users = loadMockUsers();

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new superadmin user
    const newUser = {
      id: `superadmin_${type}_${Date.now()}`,
      name,
      email,
      password, // In production, hash this
      role: type,
      isSuperAdmin: true,
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: null,
      permissions: ['all']
    };

    users.push(newUser);
    saveMockUsers(users);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        isSuperAdmin: newUser.isSuperAdmin
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

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

module.exports = router;
