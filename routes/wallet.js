const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth-mock');
const walletService = require('../services/wallet');
const selcomService = require('../services/selcom');

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

// Get user wallet
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await walletService.getWallet(req.user.id);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: {
        wallet: result.data
      }
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet',
      error: error.message
    });
  }
});

// Set wallet PIN
router.post('/pin', [
  authenticateToken,
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits'),
  body('confirmPin').custom((value, { req }) => {
    if (value !== req.body.pin) {
      throw new Error('PIN confirmation does not match');
    }
    return true;
  })
], validateRequest, async (req, res) => {
  try {
    const { pin } = req.body;
    const result = await walletService.setWalletPin(req.user.id, pin);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'PIN set successfully'
    });

  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set PIN',
      error: error.message
    });
  }
});

// Verify wallet PIN
router.post('/pin/verify', [
  authenticateToken,
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], validateRequest, async (req, res) => {
  try {
    const { pin } = req.body;
    const result = await walletService.verifyWalletPin(req.user.id, pin);
    
    res.json({
      success: result.success,
      message: result.success ? 'PIN verified' : result.error
    });

  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify PIN',
      error: error.message
    });
  }
});

// Get supported payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const paymentMethods = selcomService.getSupportedPaymentMethods();
    
    res.json({
      success: true,
      data: {
        paymentMethods
      }
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods',
      error: error.message
    });
  }
});

// Deposit funds
router.post('/deposit', [
  authenticateToken,
  body('amount').isFloat({ min: 1000 }).withMessage('Minimum deposit is 1,000 TZS'),
  body('paymentMethod').isIn(['mobile_money', 'bank_transfer', 'card']).withMessage('Invalid payment method'),
  body('paymentData').isObject().withMessage('Payment data is required')
], validateRequest, async (req, res) => {
  try {
    const { amount, paymentMethod, paymentData } = req.body;
    const result = await walletService.processDeposit(req.user.id, amount, paymentMethod, paymentData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Deposit initiated successfully',
      data: {
        transaction: result.data.transaction,
        paymentUrl: result.data.paymentUrl,
        paymentResult: result.data.paymentResult
      }
    });

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process deposit',
      error: error.message
    });
  }
});

// Withdraw funds
router.post('/withdraw', [
  authenticateToken,
  body('amount').isFloat({ min: 1000 }).withMessage('Minimum withdrawal is 1,000 TZS'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits'),
  body('withdrawalData').isObject().withMessage('Withdrawal data is required')
], validateRequest, async (req, res) => {
  try {
    const { amount, pin, withdrawalData } = req.body;
    const result = await walletService.processWithdrawal(req.user.id, amount, pin, withdrawalData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Withdrawal processed successfully',
      data: {
        transaction: result.data.transaction,
        newBalance: result.data.newBalance
      }
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal',
      error: error.message
    });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const result = await walletService.getTransactionHistory(req.user.id, parseInt(page), parseInt(limit), type);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error.message
    });
  }
});

// Selcom webhook for payment callbacks
router.post('/selcom/webhook', async (req, res) => {
  try {
    const { order_id, status, payment_data } = req.body;
    
    // Verify webhook signature
    const signature = req.headers['x-selcom-signature'];
    if (!selcomService.validateWebhookSignature(req.body, signature)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Process payment callback
    const result = await walletService.completePaymentCallback(order_id, status, payment_data);
    
    if (!result.success) {
      console.error('Payment callback failed:', result.error);
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// Verify payment status
router.post('/verify-payment', [
  authenticateToken,
  body('orderId').notEmpty().withMessage('Order ID is required')
], validateRequest, async (req, res) => {
  try {
    const { orderId } = req.body;
    const result = await selcomService.verifyPayment(orderId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // If payment is successful, complete the transaction
    if (result.data.data?.status === 'COMPLETED' || result.data.data?.status === 'SUCCESS') {
      const callbackResult = await walletService.completePaymentCallback(orderId, 'COMPLETED', result.data.data);
      
      if (callbackResult.success) {
        return res.json({
          success: true,
          message: 'Payment verified and processed',
          data: {
            paymentStatus: result.data.data.status,
            newBalance: callbackResult.data.newBalance
          }
        });
      }
    }

    res.json({
      success: true,
      data: {
        paymentStatus: result.data.data?.status || 'PENDING'
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// Get wallet statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const walletResult = await walletService.getWallet(req.user.id);
    
    if (!walletResult.success) {
      return res.status(400).json({
        success: false,
        message: walletResult.error
      });
    }

    const wallet = walletResult.data;
    
    // Get transaction counts by type
    const transactionResult = await walletService.getTransactionHistory(req.user.id, 1, 1000);
    const transactions = transactionResult.success ? transactionResult.data.transactions : [];
    
    const stats = {
      balance: wallet.balance,
      currency: wallet.currency,
      dailyLimit: wallet.daily_limit,
      monthlyLimit: wallet.monthly_limit,
      dailySpent: wallet.daily_spent,
      monthlySpent: wallet.monthly_spent,
      dailyRemaining: wallet.daily_limit - wallet.daily_spent,
      monthlyRemaining: wallet.monthly_limit - wallet.monthly_spent,
      totalTransactions: transactions.length,
      totalDeposits: transactions.filter(t => t.type === 'deposit' && t.status === 'completed').length,
      totalWithdrawals: transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').length,
      totalDepositAmount: transactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawalAmount: transactions
        .filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0)
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });

  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet statistics',
      error: error.message
    });
  }
});

module.exports = router;
