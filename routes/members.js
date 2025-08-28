const express = require('express');
const { body, validationResult } = require('express-validator');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const { authenticateToken, requireKiongozi } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateMemberValidation = [
  body('status').isIn(['active', 'suspended', 'removed']).withMessage('Valid status required'),
  body('rotation_order').optional().isInt({ min: 1 }).withMessage('Valid rotation order required')
];

// Get group members
router.get('/group/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify user is a member of the group
    const membership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', groupId),
        databases.queries.equal('user_id', req.user.id)
      ]
    );

    if (membership.documents.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

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
              email: user.email,
              role: user.role
            }
          };
        } catch (error) {
          return member;
        }
      })
    );

    // Sort by member number
    memberDetails.sort((a, b) => a.member_number - b.member_number);

    res.json({
      members: memberDetails
    });

  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
});

// Update member (Kiongozi only)
router.put('/:memberId', authenticateToken, requireKiongozi, updateMemberValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { memberId } = req.params;
    const { status, rotation_order } = req.body;

    // Get member details
    const member = await databases.getDocument(DATABASE_ID, COLLECTIONS.MEMBERS, memberId);

    // Verify user is Kiongozi of this group
    const kiongoziMembership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', member.group_id),
        databases.queries.equal('user_id', req.user.id),
        databases.queries.equal('member_number', 1)
      ]
    );

    if (kiongoziMembership.documents.length === 0) {
      return res.status(403).json({ error: 'Only the group Kiongozi can update members' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (rotation_order) updateData.rotation_order = parseInt(rotation_order);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedMember = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      memberId,
      updateData
    );

    res.json({
      message: 'Member updated successfully',
      member: updatedMember
    });

  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Remove member from group (Kiongozi only)
router.delete('/:memberId', authenticateToken, requireKiongozi, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get member details
    const member = await databases.getDocument(DATABASE_ID, COLLECTIONS.MEMBERS, memberId);

    // Verify user is Kiongozi of this group
    const kiongoziMembership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', member.group_id),
        databases.queries.equal('user_id', req.user.id),
        databases.queries.equal('member_number', 1)
      ]
    );

    if (kiongoziMembership.documents.length === 0) {
      return res.status(403).json({ error: 'Only the group Kiongozi can remove members' });
    }

    // Cannot remove Kiongozi (member number 1)
    if (member.member_number === 1) {
      return res.status(400).json({ error: 'Cannot remove the group Kiongozi' });
    }

    // Update member status to removed
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      memberId,
      { status: 'removed' }
    );

    res.json({
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get member profile
router.get('/profile/:memberId', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get member details
    const member = await databases.getDocument(DATABASE_ID, COLLECTIONS.MEMBERS, memberId);

    // Verify user is a member of the same group
    const membership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', member.group_id),
        databases.queries.equal('user_id', req.user.id)
      ]
    );

    if (membership.documents.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user details
    const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, member.user_id);

    // Get group details
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, member.group_id);

    // Get member's transactions
    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [
        databases.queries.equal('group_id', member.group_id),
        databases.queries.equal('user_id', member.user_id)
      ],
      50
    );

    res.json({
      member: {
        id: member.$id,
        member_number: member.member_number,
        rotation_order: member.rotation_order,
        status: member.status,
        joined_at: member.joined_at
      },
      user: {
        id: user.$id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      },
      group: {
        id: group.$id,
        name: group.name,
        contribution_amount: group.contribution_amount
      },
      transactions: transactions.documents,
      total_transactions: transactions.total
    });

  } catch (error) {
    console.error('Get member profile error:', error);
    res.status(500).json({ error: 'Failed to fetch member profile' });
  }
});

// Get member statistics
router.get('/statistics/:memberId', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get member details
    const member = await databases.getDocument(DATABASE_ID, COLLECTIONS.MEMBERS, memberId);

    // Verify user is a member of the same group
    const membership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', member.group_id),
        databases.queries.equal('user_id', req.user.id)
      ]
    );

    if (membership.documents.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get member's transactions
    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [
        databases.queries.equal('group_id', member.group_id),
        databases.queries.equal('user_id', member.user_id)
      ]
    );

    // Calculate statistics
    const stats = {
      total_contributions: 0,
      total_payouts: 0,
      total_penalties: 0,
      total_insurance: 0,
      pending_amount: 0,
      completed_amount: 0,
      total_transactions: transactions.total
    };

    transactions.documents.forEach(transaction => {
      if (transaction.status === 'completed') {
        switch (transaction.type) {
          case 'contribution':
            stats.total_contributions += transaction.amount;
            stats.completed_amount += transaction.amount;
            break;
          case 'payout':
            stats.total_payouts += transaction.amount;
            stats.completed_amount += transaction.amount;
            break;
          case 'penalty':
            stats.total_penalties += transaction.amount;
            stats.completed_amount += transaction.amount;
            break;
          case 'insurance':
            stats.total_insurance += transaction.amount;
            stats.completed_amount += transaction.amount;
            break;
        }
      } else if (transaction.status === 'pending') {
        stats.pending_amount += transaction.amount;
      }
    });

    res.json({
      member_id: memberId,
      statistics: stats
    });

  } catch (error) {
    console.error('Get member statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch member statistics' });
  }
});

// Get member's payment history
router.get('/payments/:memberId', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get member details
    const member = await databases.getDocument(DATABASE_ID, COLLECTIONS.MEMBERS, memberId);

    // Verify user is a member of the same group
    const membership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', member.group_id),
        databases.queries.equal('user_id', req.user.id)
      ]
    );

    if (membership.documents.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get member's payments
    const payments = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      [
        databases.queries.equal('group_id', member.group_id),
        databases.queries.equal('user_id', member.user_id)
      ],
      50
    );

    res.json({
      member_id: memberId,
      payments: payments.documents,
      total_payments: payments.total
    });

  } catch (error) {
    console.error('Get member payments error:', error);
    res.status(500).json({ error: 'Failed to fetch member payments' });
  }
});

// Get member's rotation schedule
router.get('/rotation/:memberId', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get member details
    const member = await databases.getDocument(DATABASE_ID, COLLECTIONS.MEMBERS, memberId);

    // Verify user is a member of the same group
    const membership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', member.group_id),
        databases.queries.equal('user_id', req.user.id)
      ]
    );

    if (membership.documents.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get group details
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, member.group_id);

    // Get all members for rotation order
    const allMembers = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [databases.queries.equal('group_id', member.group_id)]
    );

    // Sort by rotation order
    allMembers.documents.sort((a, b) => a.rotation_order - b.rotation_order);

    // Calculate rotation schedule
    const rotationSchedule = allMembers.documents.map((m, index) => {
      const estimatedDate = new Date(group.created_at);
      estimatedDate.setMonth(estimatedDate.getMonth() + (m.rotation_order - 1) * group.rotation_duration);
      
      return {
        member_number: m.member_number,
        rotation_order: m.rotation_order,
        estimated_payout_date: estimatedDate.toISOString(),
        is_current: m.rotation_order === group.current_rotation,
        is_completed: m.rotation_order < group.current_rotation
      };
    });

    res.json({
      member_id: memberId,
      group: {
        name: group.name,
        rotation_duration: group.rotation_duration,
        current_rotation: group.current_rotation,
        contribution_amount: group.contribution_amount
      },
      rotation_schedule: rotationSchedule
    });

  } catch (error) {
    console.error('Get member rotation error:', error);
    res.status(500).json({ error: 'Failed to fetch member rotation schedule' });
  }
});

module.exports = router;
