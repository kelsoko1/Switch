const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const { authenticateToken, requireGroupMember } = require('../middleware/auth');

const router = express.Router();

// Selcom API configuration
const SELCOM_CONFIG = {
  apiKey: process.env.SELCOM_API_KEY,
  apiSecret: process.env.SELCOM_API_SECRET,
  baseUrl: process.env.SELCOM_BASE_URL || 'https://api.selcom.co.tz'
};

// Validation rules
const createPaymentValidation = [
  body('group_id').notEmpty().withMessage('Group ID is required'),
  body('amount').isFloat({ min: 1000 }).withMessage('Amount must be at least 1000 TZS'),
  body('payment_type').isIn(['contribution', 'penalty', 'insurance']).withMessage('Valid payment type required'),
  body('phone_number').matches(/^(\+255|0)[0-9]{9}$/).withMessage('Valid Tanzanian phone number required')
];

// Create a new payment request
router.post('/create', authenticateToken, requireGroupMember, createPaymentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { group_id, amount, payment_type, phone_number, description } = req.body;

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

    // Get group details
    const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, group_id);

    // Generate unique payment reference
    const paymentRef = `KJ${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment document
    const payment = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      'unique()',
      {
        group_id,
        user_id: req.user.id,
        payment_type,
        amount: parseFloat(amount),
        phone_number,
        payment_reference: paymentRef,
        description: description || `${payment_type} payment`,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    );

    // Initialize Selcom payment
    const selcomPayment = await initializeSelcomPayment(payment, group);

    // Update payment with Selcom details
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      payment.$id,
      {
        selcom_transaction_id: selcomPayment.transaction_id,
        selcom_payment_url: selcomPayment.payment_url,
        updated_at: new Date().toISOString()
      }
    );

    res.status(201).json({
      message: 'Payment request created successfully',
      payment: {
        id: payment.$id,
        payment_reference: payment.payment_reference,
        amount: payment.amount,
        payment_type: payment.payment_type,
        status: payment.status,
        payment_url: selcomPayment.payment_url
      }
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment', details: error.message });
  }
});

// Initialize Selcom payment
const initializeSelcomPayment = async (payment, group) => {
  try {
    const payload = {
      amount: payment.amount * 100, // Convert to cents
      currency: 'TZS',
      reference: payment.payment_reference,
      callback_url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/callback`,
      cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/cancel`,
      phone_number: payment.phone_number,
      description: `${payment.payment_type} for ${group.name}`,
      merchant_name: 'Kijumbe Savings',
      merchant_id: process.env.SELCOM_MERCHANT_ID || 'KIJUMBE001'
    };

    const response = await axios.post(
      `${SELCOM_CONFIG.baseUrl}/v1/payments/initiate`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${SELCOM_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      transaction_id: response.data.transaction_id,
      payment_url: response.data.payment_url
    };

  } catch (error) {
    console.error('Selcom payment initialization error:', error);
    throw new Error('Failed to initialize payment with Selcom');
  }
};

// Payment callback from Selcom
router.post('/callback', async (req, res) => {
  try {
    const { reference, status, transaction_id, amount } = req.body;

    console.log(`💰 Payment callback received: ${reference} - ${status}`);

    // Verify payment exists
    const paymentQuery = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      [databases.queries.equal('payment_reference', reference)]
    );

    if (paymentQuery.documents.length === 0) {
      console.error(`Payment not found for reference: ${reference}`);
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentQuery.documents[0];

    // Update payment status
    let paymentStatus = 'failed';
    if (status === 'success') {
      paymentStatus = 'completed';
    } else if (status === 'pending') {
      paymentStatus = 'pending';
    }

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      payment.$id,
      {
        status: paymentStatus,
        selcom_status: status,
        updated_at: new Date().toISOString()
      }
    );

    // If payment is completed, create transaction
    if (paymentStatus === 'completed') {
      await createPaymentTransaction(payment);
    }

    res.json({ status: 'OK' });

  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

// Payment cancellation
router.post('/cancel', async (req, res) => {
  try {
    const { reference } = req.body;

    console.log(`❌ Payment cancelled: ${reference}`);

    // Update payment status
    const paymentQuery = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      [databases.queries.equal('payment_reference', reference)]
    );

    if (paymentQuery.documents.length > 0) {
      const payment = paymentQuery.documents[0];
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENTS,
        payment.$id,
        {
          status: 'cancelled',
          updated_at: new Date().toISOString()
        }
      );
    }

    res.json({ status: 'OK' });

  } catch (error) {
    console.error('Payment cancellation error:', error);
    res.status(500).json({ error: 'Cancellation processing failed' });
  }
});

// Create transaction from completed payment
const createPaymentTransaction = async (payment) => {
  try {
    // Check if transaction already exists
    const existingTransaction = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [
        databases.queries.equal('group_id', payment.group_id),
        databases.queries.equal('user_id', payment.user_id),
        databases.queries.equal('type', payment.payment_type),
        databases.queries.equal('amount', payment.amount)
      ]
    );

    if (existingTransaction.documents.length > 0) {
      console.log(`Transaction already exists for payment: ${payment.payment_reference}`);
      return;
    }

    // Create transaction
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      'unique()',
      {
        group_id: payment.group_id,
        user_id: payment.user_id,
        type: payment.payment_type,
        amount: payment.amount,
        description: `Payment via Selcom - ${payment.payment_reference}`,
        status: 'completed',
        payment_reference: payment.payment_reference,
        created_at: new Date().toISOString()
      }
    );

    console.log(`✅ Transaction created for payment: ${payment.payment_reference}`);

  } catch (error) {
    console.error('Create payment transaction error:', error);
  }
};

// Get payment status
router.get('/status/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await databases.getDocument(DATABASE_ID, COLLECTIONS.PAYMENTS, paymentId);

    // Verify user has access to this payment
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      payment: {
        id: payment.$id,
        payment_reference: payment.payment_reference,
        amount: payment.amount,
        payment_type: payment.payment_type,
        status: payment.status,
        phone_number: payment.phone_number,
        description: payment.description,
        created_at: payment.created_at,
        updated_at: payment.updated_at
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Get user's payments
router.get('/my-payments', authenticateToken, async (req, res) => {
  try {
    // Mock payments for development (since we're using local storage for auth)
    console.log(`Fetching payments for user: ${req.user.email} (${req.user.userId})`);
    
    // Return mock payments for demonstration
    const mockPayments = [
      {
        $id: 'payment_demo_1',
        group_id: 'group_demo_1',
        user_id: req.user.userId,
        payment_type: 'contribution',
        amount: 50000,
        phone_number: '+255700000001',
        payment_reference: 'KJ1724598231ABCDEF123',
        description: 'Monthly contribution payment',
        status: 'completed',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        group: {
          id: 'group_demo_1',
          name: 'Kijumbe Demo Group 1'
        }
      },
      {
        $id: 'payment_demo_2',
        group_id: 'group_demo_2',
        user_id: req.user.userId,
        payment_type: 'contribution',
        amount: 25000,
        phone_number: '+255700000001',
        payment_reference: 'KJ1724598331DEFGHI456',
        description: 'Monthly contribution payment',
        status: 'pending',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        group: {
          id: 'group_demo_2',
          name: 'Kijumbe Demo Group 2'
        }
      },
      {
        $id: 'payment_demo_3',
        group_id: 'group_demo_1',
        user_id: req.user.userId,
        payment_type: 'penalty',
        amount: 5000,
        phone_number: '+255700000001',
        payment_reference: 'KJ1724598431GHIJKL789',
        description: 'Late payment penalty',
        status: 'failed',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        group: {
          id: 'group_demo_1',
          name: 'Kijumbe Demo Group 1'
        }
      }
    ];

    res.json({
      payments: mockPayments,
      message: 'Mock data - using local storage for development'
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments', details: error.message });
  }
});

// Get group payments (for Kiongozi/Admin)
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

    const payments = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PAYMENTS,
      [databases.queries.equal('group_id', groupId)],
      100
    );

    // Get user details for each payment
    const paymentsWithUsers = await Promise.all(
      payments.documents.map(async (payment) => {
        try {
          const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, payment.user_id);
          return {
            ...payment,
            user: {
              id: user.$id,
              name: user.name,
              phone: user.phone
            }
          };
        } catch (error) {
          return payment;
        }
      })
    );

    res.json({
      payments: paymentsWithUsers
    });

  } catch (error) {
    console.error('Get group payments error:', error);
    res.status(500).json({ error: 'Failed to fetch group payments' });
  }
});

module.exports = router;
