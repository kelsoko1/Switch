const express = require('express');
const { body, validationResult } = require('express-validator');
const { 
  account, 
  databases, 
  storage,
  teams,
  avatars,
  locale,
  DATABASE_ID, 
  COLLECTIONS, 
  BUCKETS,
  TEAM_ROLES,
  Query, 
  ID,
  generateId 
} = require('../config/appwrite');
const { authenticate, authorize } = require('../middleware/appwriteAuth');
const logger = require('../utils/logger');

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

// Helper function to get user roles
const getUserRoles = async (userId) => {
  const userTeams = await teams.list([
    Query.equal('userId', userId)
  ]);

  return userTeams.teams
    .map(team => team.roles)
    .flat()
    .filter((role, index, self) => self.indexOf(role) === index);
};

// Helper function to create user session
const createUserSession = async (userId, email, name, roles = []) => {
  try {
    // Create session in Appwrite
    const session = await account.createSession(email, '');
    
    // Store session in database
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USER_SESSIONS,
      generateId(),
      {
        userId,
        sessionId: session.$id,
        ip: session.ip,
        os: session.osName,
        device: session.deviceName,
        client: session.clientName,
        expiresAt: session.expire
      },
      [
        `user:${userId}`,
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`
      ]
    );

    return {
      sessionId: session.$id,
      userId: session.userId,
      expiresAt: session.expire,
      roles
    };
  } catch (error) {
    logger.error('Error creating user session:', error);
    throw error;
  }
};

// Register new user
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('role').optional().isIn(['member', 'kiongozi', 'admin']).withMessage('Valid role required')
], validateRequest, async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'member' } = req.body;
    const userId = generateId();

    // Check if user already exists
    try {
      await account.getSession('current');
      return res.status(400).json({
        success: false,
        message: 'User already logged in'
      });
    } catch (error) {
      // User not logged in, continue with registration
    }

    // Create user in Appwrite Auth
    const user = await account.create(userId, email, password, name);
    
    // Create user profile in database
    const userProfile = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      {
        name,
        email,
        phone: phone || '',
        role,
        status: 'active',
        emailVerified: false,
        phoneVerified: false,
        lastLogin: null,
        preferences: { theme: 'light', notifications: true },
        metadata: {}
      },
      [
        `user:${userId}`,
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`
      ]
    );

    // Add user to appropriate team based on role
    if (role === 'admin') {
      try {
        await teams.createMembership(
          'admin', // Team ID for admins
          [TEAM_ROLES.ADMIN],
          email
        );
      } catch (error) {
        logger.warn(`Could not add user to admin team: ${error.message}`);
      }
    }

    // Create session
    const session = await createUserSession(userId, email, name, [role]);

    // Send verification email
    try {
      await account.createVerification(
        `${process.env.FRONTEND_URL}/verify-email`
      );
    } catch (error) {
      logger.error('Error sending verification email:', error);
      // Continue even if verification email fails
    }

    // Send welcome email
    try {
      // This would be handled by an Appwrite function in production
      logger.info(`Sending welcome email to ${email}`);
    } catch (error) {
      logger.error('Error sending welcome email:', error);
    }

    logger.info(`✅ New user registered: ${email} (${role})`);

    // Prepare response
    const userResponse = {
      id: user.$id,
      name: user.name,
      email: user.email,
      phone: userProfile.phone,
      role,
      status: 'active',
      emailVerified: false,
      phoneVerified: false,
      preferences: userProfile.preferences,
      createdAt: user.$createdAt,
      session: {
        id: session.sessionId,
        expiresAt: session.expiresAt
      }
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: userResponse
    });

  } catch (error) {
    logger.error('Registration error:', error);
    
    // Clean up if user was created but profile creation failed
    if (req.body.email) {
      try {
        await account.deleteSessions();
      } catch (e) {
        logger.error('Error cleaning up failed registration:', e);
      }
    }
    
    next(error);
  }
});

// Login user
// Logout current session
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // Get current session
    const session = await account.getSession('current');
    
    // Delete the session from Appwrite
    await account.deleteSession(session.$id);
    
    // Log the logout
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LOGS,
      generateId(),
      {
        userId: req.userId,
        action: 'logout',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          sessionId: session.$id
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
});

// Logout from all devices
router.post('/logout/all', authenticate, async (req, res, next) => {
  try {
    // Get current session ID to exclude from deletion
    const currentSession = await account.getSession('current');
    
    // Delete all sessions except current one
    await account.deleteSessions();
    
    // Log the action
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LOGS,
      generateId(),
      {
        userId: req.userId,
        action: 'logout_all',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          currentSessionId: currentSession.$id
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    logger.error('Logout all error:', error);
    next(error);
  }
});

// Get current session
router.get('/session', authenticate, async (req, res, next) => {
  try {
    const session = await account.getSession('current');
    const user = await account.get();
    const userProfile = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      user.$id
    );
    
    const roles = await getUserRoles(user.$id);
    
    res.json({
      success: true,
      data: {
        session: {
          id: session.$id,
          ip: session.ip,
          os: session.osName,
          osVersion: session.osVersion,
          client: session.clientName,
          clientVersion: session.clientVersion,
          device: session.deviceName,
          deviceBrand: session.deviceBrand,
          deviceModel: session.deviceModel,
          countryCode: session.countryCode,
          countryName: session.countryName,
          current: true,
          expiresAt: session.expire
        },
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          avatar: userProfile.avatar || null,
          roles,
          status: userProfile.status,
          emailVerified: user.emailVerification || false,
          phoneVerified: userProfile.phoneVerified || false,
          preferences: userProfile.preferences || {},
          createdAt: user.$createdAt,
          updatedAt: userProfile.$updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all active sessions
router.get('/sessions', authenticate, async (req, res, next) => {
  try {
    const sessions = await account.getSessions();
    const currentSession = await account.getSession('current');
    
    const formattedSessions = sessions.sessions.map(session => ({
      id: session.$id,
      ip: session.ip,
      os: session.osName,
      osVersion: session.osVersion,
      client: session.clientName,
      clientVersion: session.clientVersion,
      device: session.deviceName,
      deviceBrand: session.deviceBrand,
      deviceModel: session.deviceModel,
      countryCode: session.countryCode,
      countryName: session.countryName,
      current: session.$id === currentSession.$id,
      expiresAt: session.expire
    }));
    
    res.json({
      success: true,
      data: {
        sessions: formattedSessions
      }
    });
  } catch (error) {
    next(error);
  }
});

// Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], validateRequest, async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    try {
      const users = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('email', email)]
      );
      
      if (users.documents.length === 0) {
        // Don't reveal if user doesn't exist
        return res.json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.'
        });
      }
      
      // Create password reset token
      await account.createRecovery(
        email,
        `${process.env.FRONTEND_URL}/reset-password`
      );
      
      // Log the action
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.LOGS,
        generateId(),
        {
          action: 'password_reset_requested',
          email,
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      
      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
      
    } catch (error) {
      logger.error('Password reset request error:', error);
      
      // Don't reveal if user doesn't exist
      if (error.code === 404) {
        return res.json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.'
        });
      }
      
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('secret').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], validateRequest, async (req, res, next) => {
  try {
    const { userId, secret, password } = req.body;
    
    // Verify and update password
    await account.updateRecovery(userId, secret, password, password);
    
    // Log the action
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LOGS,
      generateId(),
      {
        userId,
        action: 'password_reset_completed',
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    );
    
    res.json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.'
    });
    
  } catch (error) {
    logger.error('Password reset error:', error);
    
    if (error.code === 401) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset link.'
      });
    }
    
    next(error);
  }
});

// Verify email
router.get('/verify-email', async (req, res, next) => {
  try {
    const { userId, secret } = req.query;
    
    if (!userId || !secret) {
      return res.redirect(`${process.env.FRONTEND_URL}/verification-failed?error=missing_params`);
    }
    
    // Verify email
    await account.updateVerification(userId, secret);
    
    // Update user profile
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      {
        emailVerified: true
      }
    );
    
    // Log the action
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LOGS,
      generateId(),
      {
        userId,
        action: 'email_verified',
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    );
    
    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL}/verification-success`);
    
  } catch (error) {
    logger.error('Email verification error:', error);
    
    if (error.code === 401) {
      return res.redirect(`${process.env.FRONTEND_URL}/verification-failed?error=invalid_token`);
    }
    
    res.redirect(`${process.env.FRONTEND_URL}/verification-failed?error=unknown`);
  }
});

// Resend verification email
router.post('/resend-verification', authenticate, async (req, res, next) => {
  try {
    const user = await account.get();
    
    // Check if email is already verified
    if (user.emailVerification) {
      return res.json({
        success: true,
        message: 'Email is already verified.'
      });
    }
    
    // Send verification email
    await account.createVerification(
      `${process.env.FRONTEND_URL}/verify-email`
    );
    
    // Log the action
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LOGS,
      generateId(),
      {
        userId: user.$id,
        action: 'verification_email_resent',
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    );
    
    res.json({
      success: true,
      message: 'Verification email has been resent. Please check your inbox.'
    });
    
  } catch (error) {
    logger.error('Resend verification email error:', error);
    next(error);
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await account.get();
    const userProfile = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      user.$id
    );
    
    const roles = await getUserRoles(user.$id);
    
    res.json({
      success: true,
      data: {
        id: user.$id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        avatar: userProfile.avatar || null,
        roles,
        status: userProfile.status,
        emailVerified: user.emailVerification || false,
        phoneVerified: userProfile.phoneVerified || false,
        preferences: userProfile.preferences || {},
        createdAt: user.$createdAt,
        updatedAt: userProfile.$updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('phone').optional().trim(),
  body('preferences').optional().isObject()
], validateRequest, async (req, res, next) => {
  try {
    const { name, phone, preferences } = req.body;
    const userId = req.userId;
    
    const updateData = {};
    const accountUpdate = {};
    
    // Update name in Appwrite account if provided
    if (name) {
      await account.updateName(name);
      updateData.name = name;
    }
    
    // Update phone in Appwrite account if provided
    if (phone !== undefined) {
      accountUpdate.phone = phone;
      updateData.phone = phone;
      
      // If phone is being set to empty, mark as not verified
      if (!phone) {
        updateData.phoneVerified = false;
      }
    }
    
    // Update preferences if provided
    if (preferences) {
      updateData.preferences = preferences;
    }
    
    // Update user profile in database
    const updatedProfile = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      updateData
    );
    
    // Update Appwrite account if needed
    if (Object.keys(accountUpdate).length > 0) {
      await account.updatePhone(accountUpdate.phone || '');
    }
    
    // Log the action
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LOGS,
      generateId(),
      {
        userId,
        action: 'profile_updated',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          updatedFields: Object.keys(updateData)
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
    
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
});

// Update user password
router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], validateRequest, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;
    
    // Update password in Appwrite
    await account.updatePassword(newPassword, currentPassword);
    
    // Log the action
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LOGS,
      generateId(),
      {
        userId,
        action: 'password_updated',
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    );
    
    // Logout from all other sessions
    await account.deleteSessions();
    
    // Create new session
    const session = await account.createEmailSession(
      (await account.get()).email,
      newPassword
    );
    
    res.json({
      success: true,
      message: 'Password updated successfully. You have been logged out from all other devices.',
      data: {
        sessionId: session.$id,
        expiresAt: session.expire
      }
    });
    
  } catch (error) {
    logger.error('Update password error:', error);
    
    if (error.code === 401) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    next(error);
  }
});

// Request account deletion
router.post('/request-deletion', authenticate, async (req, res, next) => {
  try {
    const user = await account.get();
    const userId = user.$id;
    
    // Create a deletion request
    const deletionRequest = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNT_DELETION_REQUESTS || 'account_deletion_requests',
      generateId(),
      {
        userId,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        metadata: {
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      },
      [
        `user:${userId}`,
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`
      ]
    );
    
    // Send confirmation email
    try {
      // This would be handled by an Appwrite function in production
      logger.info(`Account deletion requested for user ${userId}`);
    } catch (emailError) {
      logger.error('Failed to send account deletion email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Account deletion requested. You will receive a confirmation email shortly.',
      data: {
        deletionRequestId: deletionRequest.$id,
        scheduledFor: deletionRequest.scheduledFor
      }
    });
    
  } catch (error) {
    logger.error('Account deletion request error:', error);
    next(error);
  }
});

// Cancel account deletion
router.post('/cancel-deletion', authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;
    
    // Find and update the deletion request
    const deletionRequests = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ACCOUNT_DELETION_REQUESTS || 'account_deletion_requests',
      [
        Query.equal('userId', userId),
        Query.equal('status', 'pending')
      ]
    );
    
    if (deletionRequests.documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pending deletion request found'
      });
    }
    
    const deletionRequest = deletionRequests.documents[0];
    
    // Update the deletion request status
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.ACCOUNT_DELETION_REQUESTS || 'account_deletion_requests',
      deletionRequest.$id,
      {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        reason: 'User cancelled'
      }
    );
    
    // Log the action
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LOGS,
      generateId(),
      {
        userId,
        action: 'account_deletion_cancelled',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: {
          deletionRequestId: deletionRequest.$id
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Account deletion has been cancelled.'
    });
    
  } catch (error) {
    logger.error('Cancel account deletion error:', error);
    next(error);
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user is already logged in
    try {
      const session = await account.getSession('current');
      if (session) {
        return res.status(400).json({
          success: false,
          message: 'User already logged in'
        });
      }
    } catch (error) {
      // No active session, continue with login
    }

    try {
      // Authenticate with Appwrite
      const session = await account.createEmailSession(email, password);
      
      // Get user account
      const user = await account.get();
      
      // Get user profile
      const userProfile = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        user.$id
      );

      // Check if account is active
      if (userProfile.status !== 'active') {
        // Log out the session if account is not active
        await account.deleteSession(session.$id);
        return res.status(403).json({
          success: false,
          message: 'Your account is not active. Please contact support.'
        });
      }

      // Update last login
      const now = new Date().toISOString();
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        user.$id,
        {
          lastLogin: now,
          lastActive: now
        }
      );

      // Get user roles
      const roles = await getUserRoles(user.$id);

      // Create session in our database
      const userSession = await createUserSession(
        user.$id,
        user.email,
        user.name,
        roles
      );

      // Log successful login
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.LOGS,
        generateId(),
        {
          userId: user.$id,
          action: 'login',
          ip: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            sessionId: session.$id,
            provider: 'email'
          }
        }
      );

      // Prepare response
      const response = {
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          phone: userProfile.phone || null,
          avatar: userProfile.avatar || null,
          roles,
          status: userProfile.status,
          emailVerified: user.emailVerification || false,
          phoneVerified: userProfile.phoneVerified || false,
          preferences: userProfile.preferences || {},
          createdAt: user.$createdAt,
          updatedAt: userProfile.$updatedAt
        },
        session: {
          id: userSession.sessionId,
          expiresAt: userSession.expiresAt
        }
      };

      logger.info(`✅ User logged in: ${user.email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: response
      });

    } catch (error) {
      logger.warn(`Login failed for ${email}: ${error.message}`);
      
      // Log failed login attempt
      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.LOGS,
          generateId(),
          {
            action: 'login_failed',
            email,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            error: error.message,
            metadata: {
              code: error.code || null,
              type: error.type || 'authentication_error'
            }
          }
        );
      } catch (logError) {
        logger.error('Failed to log failed login attempt:', logError);
      }
      
      if (error.code === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'invalid_credentials'
        });
      }
      
      // Handle rate limiting
      if (error.code === 429) {
        return res.status(429).json({
          success: false,
          message: 'Too many login attempts. Please try again later.',
          code: 'rate_limit_exceeded'
        });
      }
      
      next(error);
    }
  } catch (error) {
    next(error);
  }
});
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
