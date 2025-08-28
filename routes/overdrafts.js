const express = require('express');
const { body, validationResult } = require('express-validator');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const { authenticateToken, requireKiongozi } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createOverdraftValidation = [
  body('group_id').notEmpty().withMessage('Group ID is required'),
  body('amount').isFloat({ min: 1000 }).withMessage('Amount must be at least 1000 TZS'),
  body('purpose').trim().isLength({ min: 5 }).withMessage('Purpose must be at least 5 characters'),
  body('repayment_period').isInt({ min: 1, max: 12 }).withMessage('Repayment period must be between 1 and 12 months')
];

const updateOverdraftValidation = [
  body('status').isIn(['pending', 'approved', 'rejected', 'active', 'completed', 'defaulted']).withMessage('Valid status required'),
  body('interest_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100'),
  body('notes').optional().trim().isLength({ min: 3 }).withMessage('Notes must be at least 3 characters')
];

// Create overdraft request
router.post('/request', authenticateToken, createOverdraftValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { group_id, amount, purpose, repayment_period } = req.body;

    // Verify user is a member of the group
    const membership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', group_id),
        databases.queries.equal('user_id', req.user.id)
      ]
    );

    if (membership.documents.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Check if user already has a pending or active overdraft
    const existingOverdraft = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.OVERDRAFTS,
      [
        databases.queries.equal('group_id', group_id),
        databases.queries.equal('user_id', req.user.id),
        databases.queries.equal('status', ['pending', 'active'])
      ]
    );

    if (existingOverdraft.documents.length > 0) {
      return res.status(400).json({ error: 'You already have a pending or active overdraft' });
    }

    // Get group details
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, group_id);

    // Calculate maximum overdraft amount (based on user's contributions)
    const userTransactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [
        databases.queries.equal('group_id', group_id),
        databases.queries.equal('user_id', req.user.id),
        databases.queries.equal('type', 'contribution'),
        databases.queries.equal('status', 'completed')
      ]
    );

    let totalContributions = 0;
    userTransactions.documents.forEach(transaction => {
      totalContributions += transaction.amount;
    });

    const maxOverdraftAmount = totalContributions * 0.8; // 80% of total contributions

    if (amount > maxOverdraftAmount) {
      return res.status(400).json({ 
        error: `Maximum overdraft amount is ${maxOverdraftAmount.toLocaleString()} TZS (80% of your contributions)`,
        max_amount: maxOverdraftAmount
      });
    }

    // Create overdraft request
    const overdraft = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.OVERDRAFTS,
      'unique()',
      {
        group_id,
        user_id: req.user.id,
        amount: parseFloat(amount),
        purpose,
        repayment_period: parseInt(repayment_period),
        status: 'pending',
        interest_rate: 5.0, // Default 5% interest rate
        created_at: new Date().toISOString()
      }
    );

    res.status(201).json({
      message: 'Overdraft request created successfully',
      overdraft: {
        id: overdraft.$id,
        amount: overdraft.amount,
        purpose: overdraft.purpose,
        repayment_period: overdraft.repayment_period,
        status: overdraft.status,
        interest_rate: overdraft.interest_rate,
        created_at: overdraft.created_at
      }
    });

  } catch (error) {
    console.error('Create overdraft error:', error);
    res.status(500).json({ error: 'Failed to create overdraft request', details: error.message });
  }
});

// Get user's overdrafts
router.get('/my-overdrafts', authenticateToken, async (req, res) => {
  try {
    const overdrafts = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.OVERDRAFTS,
      [databases.queries.equal('user_id', req.user.id)],
      50
    );

    // Get group details for each overdraft
    const overdraftsWithGroups = await Promise.all(
      overdrafts.documents.map(async (overdraft) => {
        try {
          const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, overdraft.group_id);
          return {
            ...overdraft,
            group: {
              id: group.$id,
              name: group.name
            }
          };
        } catch (error) {
          return overdraft;
        }
      })
    );

    res.json({
      overdrafts: overdraftsWithGroups
    });

  } catch (error) {
    console.error('Get user overdrafts error:', error);
    res.status(500).json({ error: 'Failed to fetch overdrafts' });
  }
});

// Get group overdrafts (for Kiongozi/Admin)
router.get('/group/:groupId', authenticateToken, requireKiongozi, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify user is Kiongozi of this group
    const kiongoziMembership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', groupId),
        databases.queries.equal('user_id', req.user.id),
        databases.queries.equal('member_number', 1)
      ]
    );

    if (kiongoziMembership.documents.length === 0) {
      return res.status(403).json({ error: 'Only the group Kiongozi can view group overdrafts' });
    }

    const overdrafts = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.OVERDRAFTS,
      [databases.queries.equal('group_id', groupId)],
      100
    );

    // Get user details for each overdraft
    const overdraftsWithUsers = await Promise.all(
      overdrafts.documents.map(async (overdraft) => {
        try {
          const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, overdraft.user_id);
          return {
            ...overdraft,
            user: {
              id: user.$id,
              name: user.name,
              phone: user.phone,
              email: user.email
            }
          };
        } catch (error) {
          return overdraft;
        }
      })
    );

    res.json({
      overdrafts: overdraftsWithUsers
    });

  } catch (error) {
    console.error('Get group overdrafts error:', error);
    res.status(500).json({ error: 'Failed to fetch group overdrafts' });
  }
});

// Update overdraft (Kiongozi/Admin only)
router.put('/:overdraftId', authenticateToken, requireKiongozi, updateOverdraftValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { overdraftId } = req.params;
    const { status, interest_rate, notes } = req.body;

    // Get overdraft details
    const overdraft = await databases.getDocument(DATABASE_ID, COLLECTIONS.OVERDRAFTS, overdraftId);

    // Verify user is Kiongozi of this group
    const kiongoziMembership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', overdraft.group_id),
        databases.queries.equal('user_id', req.user.id),
        databases.queries.equal('member_number', 1)
      ]
    );

    if (kiongoziMembership.documents.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the group Kiongozi or admin can update overdrafts' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (interest_rate) updateData.interest_rate = parseFloat(interest_rate);
    if (notes) updateData.notes = notes;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // If status is being changed to approved, set approval date
    if (status === 'approved' && overdraft.status === 'pending') {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = req.user.id;
    }

    // If status is being changed to active, set activation date
    if (status === 'active' && overdraft.status === 'approved') {
      updateData.activated_at = new Date().toISOString();
      updateData.due_date = new Date(Date.now() + (overdraft.repayment_period * 30 * 24 * 60 * 60 * 1000)).toISOString();
    }

    const updatedOverdraft = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.OVERDRAFTS,
      overdraftId,
      updateData
    );

    res.json({
      message: 'Overdraft updated successfully',
      overdraft: updatedOverdraft
    });

  } catch (error) {
    console.error('Update overdraft error:', error);
    res.status(500).json({ error: 'Failed to update overdraft' });
  }
});

// Get overdraft details
router.get('/:overdraftId', authenticateToken, async (req, res) => {
  try {
    const { overdraftId } = req.params;

    const overdraft = await databases.getDocument(DATABASE_ID, COLLECTIONS.OVERDRAFTS, overdraftId);

    // Verify user has access to this overdraft
    if (overdraft.user_id !== req.user.id && req.user.role !== 'admin') {
      // Check if user is Kiongozi of the group
      const kiongoziMembership = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MEMBERS,
        [
          databases.queries.equal('group_id', overdraft.group_id),
          databases.queries.equal('user_id', req.user.id),
          databases.queries.equal('member_number', 1)
        ]
      );

      if (kiongoziMembership.documents.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get user details
    const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, overdraft.user_id);

    // Get group details
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, overdraft.group_id);

    // Calculate repayment details
    let repaymentDetails = null;
    if (overdraft.status === 'active' && overdraft.due_date) {
      const dueDate = new Date(overdraft.due_date);
      const now = new Date();
      const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      const totalAmount = overdraft.amount + (overdraft.amount * (overdraft.interest_rate / 100));
      const monthlyPayment = totalAmount / overdraft.repayment_period;

      repaymentDetails = {
        total_amount: totalAmount,
        monthly_payment: monthlyPayment,
        days_remaining: daysRemaining,
        is_overdue: daysRemaining < 0
      };
    }

    res.json({
      overdraft: {
        id: overdraft.$id,
        amount: overdraft.amount,
        purpose: overdraft.purpose,
        repayment_period: overdraft.repayment_period,
        status: overdraft.status,
        interest_rate: overdraft.interest_rate,
        notes: overdraft.notes,
        created_at: overdraft.created_at,
        approved_at: overdraft.approved_at,
        activated_at: overdraft.activated_at,
        due_date: overdraft.due_date
      },
      user: {
        id: user.$id,
        name: user.name,
        phone: user.phone,
        email: user.email
      },
      group: {
        id: group.$id,
        name: group.name
      },
      repayment_details: repaymentDetails
    });

  } catch (error) {
    console.error('Get overdraft details error:', error);
    res.status(500).json({ error: 'Failed to fetch overdraft details' });
  }
});

// Repay overdraft
router.post('/:overdraftId/repay', authenticateToken, [
  body('amount').isFloat({ min: 1000 }).withMessage('Amount must be at least 1000 TZS')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { overdraftId } = req.params;
    const { amount } = req.body;

    // Get overdraft details
    const overdraft = await databases.getDocument(DATABASE_ID, COLLECTIONS.OVERDRAFTS, overdraftId);

    // Verify user owns this overdraft
    if (overdraft.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only repay your own overdrafts' });
    }

    // Check if overdraft is active
    if (overdraft.status !== 'active') {
      return res.status(400).json({ error: 'Only active overdrafts can be repaid' });
    }

    // Calculate total amount owed
    const totalAmount = overdraft.amount + (overdraft.amount * (overdraft.interest_rate / 100));
    
    // Check if repayment amount is valid
    if (amount > totalAmount) {
      return res.status(400).json({ error: `Repayment amount cannot exceed total amount owed: ${totalAmount.toLocaleString()} TZS` });
    }

    // Create repayment transaction
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      'unique()',
      {
        group_id: overdraft.group_id,
        user_id: req.user.id,
        type: 'overdraft_repayment',
        amount: parseFloat(amount),
        description: `Overdraft repayment - ${overdraft.purpose}`,
        status: 'completed',
        overdraft_id: overdraftId,
        created_at: new Date().toISOString()
      }
    );

    // Update overdraft status if fully repaid
    let newStatus = overdraft.status;
    if (amount >= totalAmount) {
      newStatus = 'completed';
    }

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.OVERDRAFTS,
      overdraftId,
      {
        status: newStatus,
        repaid_amount: (overdraft.repaid_amount || 0) + parseFloat(amount),
        last_repayment_date: new Date().toISOString()
      }
    );

    res.json({
      message: 'Repayment processed successfully',
      amount_paid: amount,
      remaining_balance: Math.max(0, totalAmount - amount),
      new_status: newStatus
    });

  } catch (error) {
    console.error('Repay overdraft error:', error);
    res.status(500).json({ error: 'Failed to process repayment', details: error.message });
  }
});

module.exports = router;
