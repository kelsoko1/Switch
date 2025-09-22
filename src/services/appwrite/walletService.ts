import { AppwriteService } from './appwriteService';
import { COLLECTIONS } from '@/lib/constants';
import { Query } from 'appwrite';

export interface Wallet {
  $id: string;
  user_id: string;
  balance: number;
  currency: string;
  pin_set: boolean;
  pin_hash?: string;
  daily_limit: number;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
  serviceBalances?: Record<string, number>;
}

export interface Transaction {
  $id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'utility_payment' | 'transfer' | 'kijumbe_contribution' | 'kijumbe_payout' | 'transportation' | 'investment';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  service: 'kijumbe' | 'utilities' | 'transfers' | 'transportation' | 'investment' | 'general';
  reference_id?: string;
  recipient_id?: string;
  created_at: string;
}

export class WalletService extends AppwriteService {
  constructor() {
    super();
  }

  // Get user wallet
  async getUserWallet(userId: string): Promise<Wallet | null> {
    try {
      const result = await this.listDocuments(COLLECTIONS.WALLETS, [
        Query.equal('user_id', userId)
      ]);

      if (result.documents.length > 0) {
        const wallet = result.documents[0] as unknown as Wallet;
        
        // Get service balances and add them to the wallet object
        const serviceBalances = await this.getServiceBalances(userId);
        wallet.serviceBalances = serviceBalances;
        
        return wallet;
      }

      // If no wallet exists, create one
      return await this.createUserWallet(userId);
    } catch (error) {
      console.error('Error getting user wallet:', error);
      return null;
    }
  }

  // Create user wallet
  async createUserWallet(userId: string, initialBalance: number = 0): Promise<Wallet> {
    try {
      // Check if wallet already exists
      const existingWallet = await this.listDocuments(COLLECTIONS.WALLETS, [
        Query.equal('user_id', userId)
      ]);

      if (existingWallet.documents.length > 0) {
        console.log(`Wallet already exists for user ${userId}`);
        return existingWallet.documents[0] as unknown as Wallet;
      }

      const walletId = this.generateId('wallet_');
      const walletData = {
        user_id: userId,
        balance: initialBalance,
        currency: 'TZS', // Add default currency
        pin_set: false,
        daily_limit: 1000000, // Default 1M TZS
        monthly_limit: 10000000, // Default 10M TZS
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log(`Creating new wallet for user ${userId}`);
      const wallet = await this.createDocument(
        COLLECTIONS.WALLETS,
        walletId,
        walletData,
        [
          `read("user:${userId}")`, 
          `write("user:${userId}")`
        ]
      );

      // Create initial deposit transaction
      if (initialBalance > 0) {
        await this.createTransaction(userId, {
          amount: initialBalance,
          type: 'deposit',
          status: 'completed',
          description: 'Initial wallet deposit',
          service: 'general'
        });
      }

      // Initialize service balances
      const serviceBalances = {
        kijumbe: 0,
        utilities: 0,
        transportation: 0,
        investment: 0
      };

      return { ...wallet, serviceBalances } as unknown as Wallet;
    } catch (error) {
      console.error('Error creating user wallet:', error);
      throw error;
    }
  }

  // Get user transactions
  async getUserTransactions(userId: string, page: number = 1, limit: number = 20, type?: string): Promise<{ documents: Transaction[], total: number }> {
    try {
      const queries = [
        Query.equal('user_id', userId),
        Query.orderDesc('created_at'),
        Query.limit(limit),
        Query.offset((page - 1) * limit)
      ];

      if (type) {
        queries.push(Query.equal('type', type));
      }

      const result = await this.listDocuments(COLLECTIONS.WALLET_TRANSACTIONS, queries);

      return {
        documents: result.documents as unknown as Transaction[],
        total: result.total
      };
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return { documents: [], total: 0 };
    }
  }

  // Create transaction
  async createTransaction(userId: string, transactionData: Partial<Transaction>): Promise<Transaction | null> {
    try {
      // Get user wallet first
      const wallet = await this.getUserWallet(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const transactionId = this.generateId('txn_');
      const transaction = await this.createDocument(
        COLLECTIONS.WALLET_TRANSACTIONS,
        transactionId,
        {
          user_id: userId,
          wallet_id: wallet.$id,
          amount: transactionData.amount || 0,
          type: transactionData.type || 'deposit',
          status: transactionData.status || 'pending',
          description: transactionData.description || '',
          service: transactionData.service || 'general',
          reference_id: transactionData.reference_id || null,
          recipient_id: transactionData.recipient_id || null,
          created_at: new Date().toISOString(),
        },
        [`read("user:${userId}")`, `write("user:${userId}")`]
      );

      // Update wallet balance if transaction is completed
      if (transactionData.status === 'completed') {
        await this.updateWalletBalance(wallet.$id, transactionData);
      }

      return transaction as unknown as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  // Update wallet balance based on transaction
  private async updateWalletBalance(walletId: string, transaction: Partial<Transaction>): Promise<void> {
    try {
      const wallet = await this.getDocument(COLLECTIONS.WALLETS, walletId) as unknown as Wallet;
      let newBalance = wallet.balance;

      // Calculate new balance based on transaction type
      switch (transaction.type) {
        case 'deposit':
        case 'kijumbe_payout':
          newBalance += transaction.amount || 0;
          break;
        case 'withdrawal':
        case 'utility_payment':
        case 'transfer':
        case 'kijumbe_contribution':
        case 'transportation':
        case 'investment':
          newBalance -= transaction.amount || 0;
          break;
      }

      // Update wallet with new balance
      await this.updateDocument(COLLECTIONS.WALLETS, walletId, {
        balance: newBalance,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  }

  // Set wallet PIN
  async setWalletPin(userId: string, pinHash: string): Promise<boolean> {
    try {
      const wallet = await this.getUserWallet(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      await this.updateDocument(COLLECTIONS.WALLETS, wallet.$id, {
        pin_set: true,
        pin_hash: pinHash, // In production, this should be properly hashed
        updated_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error setting wallet PIN:', error);
      return false;
    }
  }

  // Get service balances for a user
  async getServiceBalances(userId: string): Promise<Record<string, number>> {
    try {
      // Default service balances
      const serviceBalances: Record<string, number> = {
        kijumbe: 0,
        utilities: 0,
        transportation: 0,
        investment: 0
      };
      
      // Get transactions grouped by service
      const result = await this.listDocuments(COLLECTIONS.WALLET_TRANSACTIONS, [
        Query.equal('user_id', userId),
        Query.equal('status', 'completed')
      ]);
      
      // Calculate balances based on transaction types and services
      if (result.documents.length > 0) {
        for (const tx of result.documents as unknown as Transaction[]) {
          const service = tx.service || 'general';
          
          if (!serviceBalances[service]) {
            serviceBalances[service] = 0;
          }
          
          // Add or subtract based on transaction type
          if (tx.type === 'deposit' || tx.type === 'kijumbe_payout') {
            serviceBalances[service] += tx.amount;
          } else if (tx.type === 'withdrawal' || tx.type === 'utility_payment' || 
                     tx.type === 'transfer' || tx.type === 'kijumbe_contribution' || 
                     tx.type === 'transportation' || tx.type === 'investment') {
            serviceBalances[service] -= tx.amount;
          }
        }
      }
      
      return serviceBalances;
    } catch (error) {
      console.error('Error getting service balances:', error);
      return {
        kijumbe: 0,
        utilities: 0,
        transportation: 0,
        investment: 0
      };
    }
  }

  // Update transaction status
  async updateTransactionStatus(transactionId: string, status: 'pending' | 'completed' | 'failed'): Promise<boolean> {
    try {
      const transaction = await this.getDocument(COLLECTIONS.WALLET_TRANSACTIONS, transactionId) as unknown as Transaction;
      
      await this.updateDocument(COLLECTIONS.WALLET_TRANSACTIONS, transactionId, {
        status,
        updated_at: new Date().toISOString(),
      });

      // If status is completed, update wallet balance
      if (status === 'completed') {
        await this.updateWalletBalance(transaction.wallet_id, transaction);
      }

      return true;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return false;
    }
  }

  // Transfer money between wallets
  async transferMoney(senderId: string, recipientId: string, amount: number, description: string): Promise<boolean> {
    try {
      // Get sender wallet
      const senderWallet = await this.getUserWallet(senderId);
      if (!senderWallet) {
        throw new Error('Sender wallet not found');
      }

      // Check if sender has enough balance
      if (senderWallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Get recipient wallet
      const recipientWallet = await this.getUserWallet(recipientId);
      if (!recipientWallet) {
        throw new Error('Recipient wallet not found');
      }

      // Create sender transaction (withdrawal)
      const senderTransaction = await this.createTransaction(senderId, {
        amount,
        type: 'transfer',
        status: 'completed',
        description: `Transfer to ${recipientId}: ${description}`,
        service: 'transfers',
        recipient_id: recipientId
      });

      // Create recipient transaction (deposit)
      await this.createTransaction(recipientId, {
        amount,
        type: 'deposit',
        status: 'completed',
        description: `Transfer from ${senderId}: ${description}`,
        service: 'transfers',
        reference_id: senderTransaction ? senderTransaction.$id : undefined
      });

      return true;
    } catch (error) {
      console.error('Error transferring money:', error);
      return false;
    }
  }
  
  // Update wallet settings
  async updateWalletSettings(walletId: string, settings: Record<string, any>): Promise<boolean> {
    try {
      await this.updateDocument(COLLECTIONS.WALLETS, walletId, settings);
      return true;
    } catch (error) {
      console.error('Error updating wallet settings:', error);
      return false;
    }
  }
  

}

export const walletService = new WalletService();
export default walletService;
