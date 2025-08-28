const express = require('express');
const { body, validationResult } = require('express-validator');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const { authenticateToken, requireGroupMember } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createTransactionValidation = [
  body('group_id').notEmpty().withMessage('Group ID is required'),
  body('type').isIn(['contribution', 'payout', 'penalty', 'insurance', 'overdraft']).withMessage('Valid transaction type required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
  body('description').trim().isLength({ min: 3 }).withMessage('Description must be at least 3 characters')
];

// Create a new transaction
router.post('/create', authenticateToken, requireGroupMember, createTransactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { group_id, type, amount, description } = req.body;

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

    // Create transaction
    const transaction = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      'unique()',
      {
        group_id,
        user_id: req.user.id,
        type,
        amount: parseFloat(amount),
        description,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    );

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: {
        id: transaction.$id,
        group_id: transaction.group_id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
        created_at: transaction.created_at
      }
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction', details: error.message });
  }
});

// Get transactions for a group
router.get('/group/:groupId', authenticateToken, requireGroupMember, async (req, res) => {
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

    // Get all transactions for the group
    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [databases.queries.equal('group_id', groupId)],
      100 // Limit to 100 transactions
    );

    // Get user details for each transaction
    const transactionsWithUsers = await Promise.all(
      transactions.documents.map(async (transaction) => {
        try {
          const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, transaction.user_id);
          return {
            ...transaction,
            user: {
              id: user.$id,
              name: user.name,
              phone: user.phone
            }
          };
        } catch (error) {
          return transaction;
        }
      })
    );

    res.json({
      transactions: transactionsWithUsers
    });

  } catch (error) {
    console.error('Get group transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get user's transactions
router.get('/my-transactions', authenticateToken, async (req, res) => {
  try {
    // Mock transactions for development (since we're using local storage for auth)
    console.log(`Fetching transactions for user: ${req.user.email} (${req.user.userId})`);
    
    // Return mock transactions for demonstration
    const mockTransactions = [
      {
        $id: 'transaction_demo_1',
        group_id: 'group_demo_1',
        user_id: req.user.userId,
        type: 'contribution',
        amount: 50000,
        description: 'Monthly contribution for July 2025',
        status: 'completed',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        group: {
          id: 'group_demo_1',
          name: 'Kijumbe Demo Group 1'
        }
      },
      {
        $id: 'transaction_demo_2',
        group_id: 'group_demo_2',
        user_id: req.user.userId,
        type: 'contribution',
        amount: 25000,
        description: 'Monthly contribution for July 2025',
        status: 'pending',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        group: {
          id: 'group_demo_2',
          name: 'Kijumbe Demo Group 2'
        }
      },
      {
        $id: 'transaction_demo_3',
        group_id: 'group_demo_1',
        user_id: req.user.userId,
        type: 'payout',
        amount: 400000,
        description: 'Rotation payout for August 2025',
        status: 'completed',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        group: {
          id: 'group_demo_1',
          name: 'Kijumbe Demo Group 1'
        }
      }
    ];

    res.json({
      transactions: mockTransactions,
      message: 'Mock data - using local storage for development'
    });

  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
  }
});

// Update transaction status (for admins/Kiongozi)
router.put('/:transactionId/status', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get transaction
    const transaction = await databases.getDocument(DATABASE_ID, COLLECTIONS.TRANSACTIONS, transactionId);

    // Check if user has permission to update this transaction
    const membership = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [
        databases.queries.equal('group_id', transaction.group_id),
        databases.queries.equal('user_id', req.user.id)
      ]
    );

    const isKiongozi = membership.documents.length > 0 && 
      membership.documents[0].member_number === 1;

    if (!isKiongozi && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only Kiongozi or admin can update transaction status' });
    }

    // Update transaction
    const updatedTransaction = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      transactionId,
      { status }
    );

    res.json({
      message: 'Transaction status updated successfully',
      transaction: updatedTransaction
    });

  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

// Get transaction summary for a group
router.get('/group/:groupId/summary', authenticateToken, requireGroupMember, async (req, res) => {
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

    // Get all transactions for the group
    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [databases.queries.equal('group_id', groupId)]
    );

    // Calculate summary
    const summary = {
      total_contributions: 0,
      total_payouts: 0,
      total_penalties: 0,
      total_insurance: 0,
      total_overdrafts: 0,
      pending_amount: 0,
      completed_amount: 0
    };

    transactions.documents.forEach(transaction => {
      if (transaction.status === 'completed') {
        switch (transaction.type) {
          case 'contribution':
            summary.total_contributions += transaction.amount;
            summary.completed_amount += transaction.amount;
            break;
          case 'payout':
            summary.total_payouts += transaction.amount;
            summary.completed_amount += transaction.amount;
            break;
          case 'penalty':
            summary.total_penalties += transaction.amount;
            summary.completed_amount += transaction.amount;
            break;
          case 'insurance':
            summary.total_insurance += transaction.amount;
            summary.completed_amount += transaction.amount;
            break;
          case 'overdraft':
            summary.total_overdrafts += transaction.amount;
            summary.completed_amount += transaction.amount;
            break;
        }
      } else if (transaction.status === 'pending') {
        summary.pending_amount += transaction.amount;
      }
    });

    res.json({
      summary,
      total_transactions: transactions.documents.length
    });

  } catch (error) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction summary' });
  }
});

module.exports = router;
