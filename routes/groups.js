const express = require('express');
const { body, validationResult } = require('express-validator');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const { authenticateToken, requireKiongozi } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createGroupValidation = [
  body('name').trim().isLength({ min: 3 }).withMessage('Group name must be at least 3 characters'),
  body('max_members').isInt({ min: 2, max: 50 }).withMessage('Max members must be between 2 and 50'),
  body('rotation_duration').isInt({ min: 1, max: 12 }).withMessage('Rotation duration must be between 1 and 12 months'),
  body('contribution_amount').isFloat({ min: 1000 }).withMessage('Contribution amount must be at least 1000 TZS')
];

const joinGroupValidation = [
  body('group_id').notEmpty().withMessage('Group ID is required')
];

// Create a new savings group (Kiongozi only)
router.post('/create', authenticateToken, requireKiongozi, createGroupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, max_members, rotation_duration, contribution_amount } = req.body;

    // Check if user already has a group
    const existingGroup = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      [databases.queries.equal('kiongozi_id', req.user.id)]
    );

    if (existingGroup.documents.length > 0) {
      return res.status(400).json({ error: 'You already have a savings group' });
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
    await databases.createDocument(
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

    res.status(201).json({
      message: 'Savings group created successfully',
      group: {
        id: group.$id,
        name: group.name,
        max_members: group.max_members,
        rotation_duration: group.rotation_duration,
        contribution_amount: group.contribution_amount,
        status: group.status,
        current_rotation: group.current_rotation,
        created_at: group.created_at
      },
      group_id: group.$id,
      kiongozi_id: req.user.id,
      bot_phone: process.env.GREENAPI_BOT_PHONE
    });

  } catch (error) {
    console.error('Group creation error:', error);
    res.status(500).json({ error: 'Failed to create group', details: error.message });
  }
});

// Join an existing group
router.post('/join', authenticateToken, joinGroupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { group_id } = req.body;

    // Check if group exists and is active
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, group_id);
    
    if (!group || group.status !== 'active') {
      return res.status(404).json({ error: 'Group not found or inactive' });
    }

    // Check if user is already a member
    const existingMember = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', group_id),
        databases.queries.equal('user_id', req.user.id)
      ]
    );

    if (existingMember.documents.length > 0) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    // Check if group is full
    const currentMembers = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [databases.queries.equal('group_id', group_id)]
    );

    if (currentMembers.documents.length >= group.max_members) {
      return res.status(400).json({ error: 'Group is full' });
    }

    // Get next member number and rotation order
    const memberNumber = currentMembers.documents.length + 1;
    const rotationOrder = memberNumber;

    // Add member to group
    const member = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      'unique()',
      {
        group_id,
        user_id: req.user.id,
        member_number: memberNumber,
        rotation_order: rotationOrder,
        status: 'active',
        joined_at: new Date().toISOString()
      }
    );

    res.status(201).json({
      message: 'Successfully joined the group',
      member: {
        id: member.$id,
        group_id: member.group_id,
        member_number: member.member_number,
        rotation_order: member.rotation_order,
        status: member.status
      },
      group: {
        name: group.name,
        max_members: group.max_members,
        current_members: memberNumber
      }
    });

  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group', details: error.message });
  }
});

// Get user's groups
router.get('/my-groups', authenticateToken, async (req, res) => {
  try {
    // Mock data for development (since we're using local storage for auth)
    console.log(`Fetching groups for user: ${req.user.email} (${req.user.userId})`);
    
    // Return mock groups for demonstration
    const mockGroups = [
      {
        $id: 'group_demo_1',
        name: 'Kijumbe Demo Group 1',
        description: 'A sample savings group for testing',
        kiongozi_id: req.user.userId,
        max_members: 20,
        current_members: 8,
        contribution_amount: 50000,
        rotation_duration: 6,
        status: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        role: req.user.isSuperAdmin ? 'admin' : 'kiongozi'
      },
      {
        $id: 'group_demo_2', 
        name: 'Kijumbe Demo Group 2',
        description: 'Another sample group for testing',
        kiongozi_id: 'other_user_id',
        max_members: 15,
        current_members: 12,
        contribution_amount: 25000,
        rotation_duration: 3,
        status: 'active',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        role: 'member'
      }
    ];

    res.json({
      groups: mockGroups,
      message: 'Mock data - using local storage for development'
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups', details: error.message });
  }
});

// Get group details
router.get('/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Get group details
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId);

    // Get all members
    const members = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [databases.queries.equal('group_id', groupId)]
    );

    // Get member details
    const memberDetails = await Promise.all(
      members.documents.map(async (member) => {
        try {
          const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, member.user_id);
          return {
            ...member,
            user: {
              id: user.$id,
              name: user.name,
              phone: user.phone,
              email: user.email
            }
          };
        } catch (error) {
          return member;
        }
      })
    );

    res.json({
      group: {
        id: group.$id,
        name: group.name,
        max_members: group.max_members,
        rotation_duration: group.rotation_duration,
        contribution_amount: group.contribution_amount,
        status: group.status,
        current_rotation: group.current_rotation,
        created_at: group.created_at
      },
      members: memberDetails,
      is_kiongozi: group.kiongozi_id === req.user.id
    });

  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// Update group (Kiongozi only)
router.put('/:groupId', authenticateToken, requireKiongozi, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, contribution_amount } = req.body;

    // Verify user is Kiongozi of this group
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId);
    
    if (group.kiongozi_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the group Kiongozi can update this group' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (contribution_amount) updateData.contribution_amount = parseFloat(contribution_amount);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedGroup = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      groupId,
      updateData
    );

    res.json({
      message: 'Group updated successfully',
      group: updatedGroup
    });

  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Close group (Kiongozi only)
router.post('/:groupId/close', authenticateToken, requireKiongozi, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify user is Kiongozi of this group
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, groupId);
    
    if (group.kiongozi_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the group Kiongozi can close this group' });
    }

    // Update group status
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      groupId,
      { status: 'closed' }
    );

    res.json({
      message: 'Group closed successfully'
    });

  } catch (error) {
    console.error('Close group error:', error);
    res.status(500).json({ error: 'Failed to close group' });
  }
});

module.exports = router;
