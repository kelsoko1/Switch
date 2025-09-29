const express = require('express');
const { body, validationResult } = require('express-validator');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const { authenticateToken, requireKiongozi, requireAdmin } = require('../middleware/auth-mock');

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

// Create a new savings group (Kiongozi only)
router.post('/create', authenticateToken, requireKiongozi, [
  body('name').trim().isLength({ min: 3 }).withMessage('Group name must be at least 3 characters'),
  body('max_members').isInt({ min: 2, max: 50 }).withMessage('Max members must be between 2 and 50'),
  body('rotation_duration').isInt({ min: 1, max: 12 }).withMessage('Rotation duration must be between 1 and 12 months'),
  body('contribution_amount').isFloat({ min: 1000 }).withMessage('Contribution amount must be at least 1000 TZS')
], validateRequest, async (req, res) => {
  try {
    const { name, max_members, rotation_duration, contribution_amount } = req.body;

    // Check if user already has a group
    const existingGroups = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      [`kiongozi_id.equal("${req.user.id}")`]
    );

    if (existingGroups.documents.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have a savings group' 
      });
    }

    // Create the group
    const group = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      'unique()',
      {
        name,
        kiongozi_id: req.user.id,
        max_members: parseInt(max_members),
        rotation_duration: parseInt(rotation_duration),
        contribution_amount: parseFloat(contribution_amount),
        status: 'active',
        current_rotation: 1,
        created_at: new Date().toISOString()
      }
    );

    // Add Kiongozi as first member
    const member = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      'unique()',
      {
        group_id: group.$id,
        user_id: req.user.id,
        member_number: 1,
        rotation_order: 1,
        status: 'active',
        joined_at: new Date().toISOString()
      }
    );

    console.log(`✅ Group created: ${name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Savings group created successfully',
      data: {
        group,
        group_id: group.$id,
        kiongozi_id: req.user.id
      }
    });

  } catch (error) {
    console.error('Group creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create group',
      error: error.message 
    });
  }
});

// Get user's groups
router.get('/my-groups', authenticateToken, async (req, res) => {
  try {
    // Get groups where user is a member
    const memberships = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [`user_id.equal("${req.user.id}")`]
    );

    const groupIds = memberships.documents.map(m => m.group_id);
    
    if (groupIds.length === 0) {
      return res.json({
        success: true,
        data: { groups: [] }
      });
    }

    // Get group details
    const groups = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      groupIds.map(id => `$id.equal("${id}")`).join(' || ')
    );

    // Add member info to each group
    const groupsWithInfo = await Promise.all(groups.documents.map(async (group) => {
      const groupMembers = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MEMBERS,
        [`group_id.equal("${group.$id}")`]
      );
      
      const userMember = groupMembers.documents.find(m => m.user_id === req.user.id);
      
      return {
        ...group,
        current_members: groupMembers.documents.length,
        role: group.kiongozi_id === req.user.id ? 'kiongozi' : 'member',
        member_info: userMember
      };
    }));

    res.json({
      success: true,
      data: {
        groups: groupsWithInfo
      }
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch groups',
      error: error.message 
    });
  }
});

// Get all groups (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const groups = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS
    );

    // Add member count to each group
    const groupsWithCounts = await Promise.all(groups.documents.map(async (group) => {
      const groupMembers = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MEMBERS,
        [`group_id.equal("${group.$id}")`]
      );
      
      return {
        ...group,
        current_members: groupMembers.documents.length
      };
    }));

    res.json({
      success: true,
      data: {
        groups: groupsWithCounts,
        total: groupsWithCounts.length
      }
    });

  } catch (error) {
    console.error('Get all groups error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch groups',
      error: error.message 
    });
  }
});

// Get group details
router.get('/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      groupId
    );

    // Get all members
    const groupMembers = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [`group_id.equal("${groupId}")`]
    );
    
    // Get member details
    const memberDetails = await Promise.all(groupMembers.documents.map(async (member) => {
      try {
        const user = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          member.user_id
        );
        return {
          ...member,
          user: {
            id: user.$id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        };
      } catch (error) {
        return {
          ...member,
          user: null
        };
      }
    }));

    res.json({
      success: true,
      data: {
        group,
        members: memberDetails,
        is_kiongozi: group.kiongozi_id === req.user.id
      }
    });

  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch group details',
      error: error.message 
    });
  }
});

module.exports = router;
