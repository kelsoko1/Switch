import { supabase } from './supabase';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'stream_payment' | 'gift';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  stream_id?: string | null;
  recipient_id?: string | null;
}

export interface Wallet {
  balance: number;
  transactions: Transaction[];
}

export class PaymentManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getWallet(): Promise<Wallet> {
    try {
      // Use localStorage for demo purposes
      const walletKey = `wallet_${this.userId}`;
      const savedWallet = localStorage.getItem(walletKey);
      
      if (savedWallet) {
        return JSON.parse(savedWallet);
      }
      
      // Create initial wallet with sample data
      const initialWallet: Wallet = {
        balance: 500,
        transactions: [
          {
            id: `tx_${Date.now()}_1`,
            user_id: this.userId,
            amount: 500,
            type: 'deposit',
            status: 'completed',
            created_at: new Date().toISOString(),
          },
          {
            id: `tx_${Date.now()}_2`,
            user_id: this.userId,
            amount: 25,
            type: 'stream_payment',
            status: 'completed',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };
      
      localStorage.setItem(walletKey, JSON.stringify(initialWallet));
      return initialWallet;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      // Return empty wallet instead of throwing error
      return {
        balance: 0,
        transactions: [],
      };
    }
  }

  async deposit(amount: number): Promise<Transaction> {
    try {
      const wallet = await this.getWallet();
      
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        user_id: this.userId,
        amount,
        type: 'deposit',
        status: 'completed',
        created_at: new Date().toISOString(),
      };
      
      const updatedWallet: Wallet = {
        balance: wallet.balance + amount,
        transactions: [newTransaction, ...wallet.transactions],
      };
      
      const walletKey = `wallet_${this.userId}`;
      localStorage.setItem(walletKey, JSON.stringify(updatedWallet));
      
      return newTransaction;
    } catch (error) {
      console.error('Error making deposit:', error);
      throw error;
    }
  }

  async purchaseStream(streamId: string, amount: number): Promise<Transaction> {
    try {
      const wallet = await this.getWallet();
      
      if (wallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        user_id: this.userId,
        amount,
        type: 'stream_payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        stream_id: streamId,
      };
      
      const updatedWallet: Wallet = {
        balance: wallet.balance - amount,
        transactions: [newTransaction, ...wallet.transactions],
      };
      
      const walletKey = `wallet_${this.userId}`;
      localStorage.setItem(walletKey, JSON.stringify(updatedWallet));
      
      return newTransaction;
    } catch (error) {
      console.error('Error purchasing stream:', error);
      throw error;
    }
  }

  async sendGift(streamId: string, recipientId: string, amount: number): Promise<Transaction> {
    try {
      const wallet = await this.getWallet();
      
      if (wallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        user_id: this.userId,
        amount,
        type: 'gift',
        status: 'completed',
        created_at: new Date().toISOString(),
        stream_id: streamId,
        recipient_id: recipientId,
      };
      
      const updatedWallet: Wallet = {
        balance: wallet.balance - amount,
        transactions: [newTransaction, ...wallet.transactions],
      };
      
      const walletKey = `wallet_${this.userId}`;
      localStorage.setItem(walletKey, JSON.stringify(updatedWallet));
      
      return newTransaction;
    } catch (error) {
      console.error('Error sending gift:', error);
      throw error;
    }
  }
}