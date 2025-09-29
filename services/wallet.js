const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite-fixed');
const selcomService = require('./selcom');

class WalletService {
  constructor() {
    this.transactionTypes = {
      DEPOSIT: 'deposit',
      WITHDRAWAL: 'withdrawal',
      TRANSFER: 'transfer',
      PAYMENT: 'payment',
      REFUND: 'refund',
      FEE: 'fee'
    };

    this.transactionStatus = {
      PENDING: 'pending',
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled'
    };
  }

  /**
   * Create or get user wallet
   */
  async createWallet(userId) {
    try {
      // Check if wallet already exists
      const existingWallets = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WALLETS,
        [`user_id.equal("${userId}")`]
      );

      if (existingWallets.documents.length > 0) {
        return {
          success: true,
          data: existingWallets.documents[0]
        };
      }

      // Create new wallet
      const wallet = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.WALLETS,
        'unique()',
        {
          user_id: userId,
          balance: 0,
          currency: 'TZS',
          status: 'active',
          pin_hash: null,
          pin_set: false,
          daily_limit: 1000000, // 1M TZS
          monthly_limit: 10000000, // 10M TZS
          daily_spent: 0,
          monthly_spent: 0,
          last_reset_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );

      return {
        success: true,
        data: wallet
      };

    } catch (error) {
      console.error('Wallet creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user wallet
   */
  async getWallet(userId) {
    try {
      const wallets = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WALLETS,
        [`user_id.equal("${userId}")`]
      );

      if (wallets.documents.length === 0) {
        // Create wallet if it doesn't exist
        return await this.createWallet(userId);
      }

      return {
        success: true,
        data: wallets.documents[0]
      };

    } catch (error) {
      console.error('Get wallet failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set wallet PIN
   */
  async setWalletPin(userId, pin) {
    try {
      const bcrypt = require('bcryptjs');
      const pinHash = await bcrypt.hash(pin, 12);

      const wallets = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WALLETS,
        [`user_id.equal("${userId}")`]
      );

      if (wallets.documents.length === 0) {
        return {
          success: false,
          error: 'Wallet not found'
        };
      }

      const wallet = wallets.documents[0];
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WALLETS,
        wallet.$id,
        {
          pin_hash: pinHash,
          pin_set: true,
          updated_at: new Date().toISOString()
        }
      );

      return {
        success: true,
        message: 'PIN set successfully'
      };

    } catch (error) {
      console.error('Set wallet PIN failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify wallet PIN
   */
  async verifyWalletPin(userId, pin) {
    try {
      const bcrypt = require('bcryptjs');
      const wallets = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WALLETS,
        [`user_id.equal("${userId}")`]
      );

      if (wallets.documents.length === 0) {
        return {
          success: false,
          error: 'Wallet not found'
        };
      }

      const wallet = wallets.documents[0];
      if (!wallet.pin_set || !wallet.pin_hash) {
        return {
          success: false,
          error: 'PIN not set'
        };
      }

      const isValid = await bcrypt.compare(pin, wallet.pin_hash);
      return {
        success: isValid,
        error: isValid ? null : 'Invalid PIN'
      };

    } catch (error) {
      console.error('Verify wallet PIN failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create wallet transaction
   */
  async createTransaction(transactionData) {
    try {
      const {
        userId,
        type,
        amount,
        description,
        reference,
        metadata = {}
      } = transactionData;

      const transaction = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.WALLET_TRANSACTIONS,
        'unique()',
        {
          user_id: userId,
          type: type,
          amount: amount,
          description: description,
          reference: reference,
          status: this.transactionStatus.PENDING,
          metadata: JSON.stringify(metadata),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );

      return {
        success: true,
        data: transaction
      };

    } catch (error) {
      console.error('Create transaction failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update wallet balance
   */
  async updateBalance(userId, amount, type) {
    try {
      const walletResult = await this.getWallet(userId);
      if (!walletResult.success) {
        return walletResult;
      }

      const wallet = walletResult.data;
      let newBalance = wallet.balance;

      if (type === this.transactionTypes.DEPOSIT || type === this.transactionTypes.REFUND) {
        newBalance += amount;
      } else if (type === this.transactionTypes.WITHDRAWAL || type === this.transactionTypes.PAYMENT || type === this.transactionTypes.FEE) {
        if (wallet.balance < amount) {
          return {
            success: false,
            error: 'Insufficient balance'
          };
        }
        newBalance -= amount;
      }

      // Check daily and monthly limits
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().substring(0, 7);

      let dailySpent = wallet.daily_spent;
      let monthlySpent = wallet.monthly_spent;

      // Reset daily spent if it's a new day
      if (wallet.last_reset_date !== today) {
        dailySpent = 0;
      }

      // Reset monthly spent if it's a new month
      if (wallet.last_reset_date.substring(0, 7) !== currentMonth) {
        monthlySpent = 0;
      }

      // Update spent amounts for outgoing transactions
      if (type === this.transactionTypes.WITHDRAWAL || type === this.transactionTypes.PAYMENT || type === this.transactionTypes.FEE) {
        dailySpent += amount;
        monthlySpent += amount;

        if (dailySpent > wallet.daily_limit) {
          return {
            success: false,
            error: 'Daily limit exceeded'
          };
        }

        if (monthlySpent > wallet.monthly_limit) {
          return {
            success: false,
            error: 'Monthly limit exceeded'
          };
        }
      }

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WALLETS,
        wallet.$id,
        {
          balance: newBalance,
          daily_spent: dailySpent,
          monthly_spent: monthlySpent,
          last_reset_date: today,
          updated_at: new Date().toISOString()
        }
      );

      return {
        success: true,
        data: {
          newBalance,
          dailySpent,
          monthlySpent
        }
      };

    } catch (error) {
      console.error('Update balance failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process deposit
   */
  async processDeposit(userId, amount, paymentMethod, paymentData) {
    try {
      // Create transaction record
      const transactionResult = await this.createTransaction({
        userId,
        type: this.transactionTypes.DEPOSIT,
        amount,
        description: `Deposit via ${paymentMethod}`,
        reference: `DEP_${Date.now()}`,
        metadata: {
          paymentMethod,
          paymentData
        }
      });

      if (!transactionResult.success) {
        return transactionResult;
      }

      const transaction = transactionResult.data;

      // Process payment based on method
      let paymentResult;
      switch (paymentMethod) {
        case 'mobile_money':
          paymentResult = await selcomService.processMobileMoneyPayment({
            amount,
            phoneNumber: paymentData.phoneNumber,
            orderId: transaction.$id,
            description: `Wallet deposit - ${amount} TZS`
          });
          break;
        case 'bank_transfer':
          paymentResult = await selcomService.processBankTransfer({
            amount,
            bankCode: paymentData.bankCode,
            accountNumber: paymentData.accountNumber,
            accountName: paymentData.accountName,
            orderId: transaction.$id,
            description: `Wallet deposit - ${amount} TZS`
          });
          break;
        case 'card':
          paymentResult = await selcomService.createPaymentOrder({
            amount,
            currency: 'TZS',
            orderId: transaction.$id,
            customerPhone: paymentData.phoneNumber,
            customerEmail: paymentData.email,
            customerName: paymentData.name,
            description: `Wallet deposit - ${amount} TZS`,
            callbackUrl: `${process.env.FRONTEND_URL}/wallet/deposit/success`,
            cancelUrl: `${process.env.FRONTEND_URL}/wallet/deposit/cancel`
          });
          break;
        default:
          return {
            success: false,
            error: 'Invalid payment method'
          };
      }

      if (!paymentResult.success) {
        // Update transaction status to failed
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.WALLET_TRANSACTIONS,
          transaction.$id,
          {
            status: this.transactionStatus.FAILED,
            updated_at: new Date().toISOString()
          }
        );

        return {
          success: false,
          error: paymentResult.error
        };
      }

      return {
        success: true,
        data: {
          transaction,
          paymentResult: paymentResult.data,
          paymentUrl: paymentResult.paymentUrl
        }
      };

    } catch (error) {
      console.error('Process deposit failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process withdrawal
   */
  async processWithdrawal(userId, amount, pin, withdrawalData) {
    try {
      // Verify PIN
      const pinResult = await this.verifyWalletPin(userId, pin);
      if (!pinResult.success) {
        return pinResult;
      }

      // Create transaction record
      const transactionResult = await this.createTransaction({
        userId,
        type: this.transactionTypes.WITHDRAWAL,
        amount,
        description: `Withdrawal to ${withdrawalData.method}`,
        reference: `WTH_${Date.now()}`,
        metadata: {
          withdrawalData
        }
      });

      if (!transactionResult.success) {
        return transactionResult;
      }

      const transaction = transactionResult.data;

      // Update balance
      const balanceResult = await this.updateBalance(userId, amount, this.transactionTypes.WITHDRAWAL);
      if (!balanceResult.success) {
        // Update transaction status to failed
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.WALLET_TRANSACTIONS,
          transaction.$id,
          {
            status: this.transactionStatus.FAILED,
            updated_at: new Date().toISOString()
          }
        );

        return balanceResult;
      }

      // Update transaction status to completed
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WALLET_TRANSACTIONS,
        transaction.$id,
        {
          status: this.transactionStatus.COMPLETED,
          updated_at: new Date().toISOString()
        }
      );

      return {
        success: true,
        data: {
          transaction,
          newBalance: balanceResult.data.newBalance
        }
      };

    } catch (error) {
      console.error('Process withdrawal failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId, page = 1, limit = 20, type = null) {
    try {
      let queries = [`user_id.equal("${userId}")`];
      
      if (type) {
        queries.push(`type.equal("${type}")`);
      }

      const transactions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WALLET_TRANSACTIONS,
        queries,
        limit,
        (page - 1) * limit,
        'created_at',
        'DESC'
      );

      return {
        success: true,
        data: {
          transactions: transactions.documents,
          total: transactions.total,
          page,
          limit
        }
      };

    } catch (error) {
      console.error('Get transaction history failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Complete payment callback
   */
  async completePaymentCallback(orderId, status, paymentData) {
    try {
      // Find transaction by order ID
      const transactions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WALLET_TRANSACTIONS,
        [`reference.equal("${orderId}")`]
      );

      if (transactions.documents.length === 0) {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }

      const transaction = transactions.documents[0];

      if (status === 'COMPLETED' || status === 'SUCCESS') {
        // Update balance
        const balanceResult = await this.updateBalance(
          transaction.user_id,
          transaction.amount,
          transaction.type
        );

        if (balanceResult.success) {
          // Update transaction status
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.WALLET_TRANSACTIONS,
            transaction.$id,
            {
              status: this.transactionStatus.COMPLETED,
              updated_at: new Date().toISOString()
            }
          );

          return {
            success: true,
            data: {
              transaction,
              newBalance: balanceResult.data.newBalance
            }
          };
        } else {
          // Update transaction status to failed
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.WALLET_TRANSACTIONS,
            transaction.$id,
            {
              status: this.transactionStatus.FAILED,
              updated_at: new Date().toISOString()
            }
          );

          return balanceResult;
        }
      } else {
        // Update transaction status to failed
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.WALLET_TRANSACTIONS,
          transaction.$id,
          {
            status: this.transactionStatus.FAILED,
            updated_at: new Date().toISOString()
          }
        );

        return {
          success: false,
          error: 'Payment failed'
        };
      }

    } catch (error) {
      console.error('Complete payment callback failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new WalletService();
