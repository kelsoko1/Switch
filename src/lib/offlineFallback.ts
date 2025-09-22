/**
 * Offline Fallback System for Switch App
 * 
 * This module provides offline fallback functionality when the Appwrite backend
 * is not accessible. It uses localStorage to store critical data and provides
 * mock implementations of key services.
 */

import { COLLECTIONS } from './appwrite';

// Storage keys
const STORAGE_KEYS = {
  USER: 'switch_offline_user',
  WALLET: 'switch_offline_wallet',
  TRANSACTIONS: 'switch_offline_transactions',
  SETTINGS: 'switch_offline_settings',
};

// Default user data
const DEFAULT_USER = {
  $id: 'offline_user',
  name: 'Offline User',
  email: 'offline@example.com',
  emailVerification: true,
  phoneVerification: true,
  prefs: {
    theme: 'light',
    language: 'en',
    textSize: 'medium',
    notifications: {
      email: true,
      push: true,
      transactions: true,
      security: true,
      marketing: false,
    },
  },
};

// Default wallet data
const DEFAULT_WALLET = {
  $id: 'offline_wallet',
  user_id: 'offline_user',
  balance: 50000,
  currency: 'TZS',
  daily_limit: 100000,
  monthly_limit: 1000000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'active',
  preferred_payment_methods: ['mobile_money', 'bank_transfer'],
  auto_topup: {
    enabled: false,
    threshold: 5000,
    amount: 10000,
    method: 'mobile_money',
  },
};

// Helper functions
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from storage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Initialize offline data if not already present
const initializeOfflineData = (): void => {
  // Initialize user data
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    saveToStorage(STORAGE_KEYS.USER, DEFAULT_USER);
  }

  // Initialize wallet data
  if (!localStorage.getItem(STORAGE_KEYS.WALLET)) {
    saveToStorage(STORAGE_KEYS.WALLET, DEFAULT_WALLET);
  }

  // Initialize transactions data
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, []);
  }

  // Initialize settings data
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    saveToStorage(STORAGE_KEYS.SETTINGS, {
      theme: 'light',
      language: 'en',
      textSize: 'medium',
    });
  }
};

// Offline auth service
export const offlineAuth = {
  getCurrentUser: () => {
    return getFromStorage(STORAGE_KEYS.USER, DEFAULT_USER);
  },

  createEmailPasswordSession: (email: string, password: string) => {
    console.log('Using offline mode for login');
    
    // In offline mode, we only accept specific demo credentials
    // This is a simple validation - in a real app, you'd use a more secure approach
    if (email !== 'demo@example.com' && password !== 'demo123') {
      console.error('Invalid credentials in offline mode');
      return Promise.reject(new Error('Invalid email or password'));
    }
    
    const user = getFromStorage(STORAGE_KEYS.USER, DEFAULT_USER);
    user.email = email; // Update the email to match what the user entered
    saveToStorage(STORAGE_KEYS.USER, user);
    return Promise.resolve({ userId: user.$id });
  },

  createAnonymousSession: () => {
    console.log('Creating offline anonymous session');
    return Promise.resolve({ userId: 'anonymous' });
  },

  getAccount: () => {
    return Promise.resolve(getFromStorage(STORAGE_KEYS.USER, DEFAULT_USER));
  },

  updateName: (name: string) => {
    const user = getFromStorage(STORAGE_KEYS.USER, DEFAULT_USER);
    user.name = name;
    saveToStorage(STORAGE_KEYS.USER, user);
    return Promise.resolve(user);
  },

  updateEmail: (email: string) => {
    const user = getFromStorage(STORAGE_KEYS.USER, DEFAULT_USER);
    user.email = email;
    saveToStorage(STORAGE_KEYS.USER, user);
    return Promise.resolve(user);
  },

  updatePrefs: (prefs: Record<string, any>) => {
    const user = getFromStorage(STORAGE_KEYS.USER, DEFAULT_USER);
    user.prefs = { ...user.prefs, ...prefs };
    saveToStorage(STORAGE_KEYS.USER, user);
    return Promise.resolve(user);
  },
};

// Offline database service
export const offlineDB = {
  createDocument: (collectionId: string, documentId: string, data: any) => {
    let collection: any[] = [];
    
    switch (collectionId) {
      case COLLECTIONS.TRANSACTIONS:
        collection = getFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
        collection.push({
          $id: documentId || `tx_${Date.now()}`,
          ...data,
          created_at: new Date().toISOString(),
        });
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, collection);
        break;
        
      default:
        console.warn(`Offline mode: Collection ${collectionId} not supported`);
    }
    
    return Promise.resolve({ $id: documentId || `doc_${Date.now()}`, ...data });
  },

  getDocument: (collectionId: string, _documentId: string) => {
    switch (collectionId) {
      case COLLECTIONS.USERS:
        return Promise.resolve(getFromStorage(STORAGE_KEYS.USER, DEFAULT_USER));
        
      case COLLECTIONS.WALLETS:
        return Promise.resolve(getFromStorage(STORAGE_KEYS.WALLET, DEFAULT_WALLET));
        
      default:
        console.warn(`Offline mode: Collection ${collectionId} not supported for direct document retrieval`);
        return Promise.resolve(null);
    }
  },

  listDocuments: (collectionId: string, _queries?: string[]) => {
    switch (collectionId) {
      case COLLECTIONS.TRANSACTIONS:
        const transactions = getFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
        return Promise.resolve({
          total: transactions.length,
          documents: transactions,
        });
        
      default:
        console.warn(`Offline mode: Collection ${collectionId} not supported for listing`);
        return Promise.resolve({ total: 0, documents: [] });
    }
  },

  updateDocument: (collectionId: string, _documentId: string, data: any) => {
    switch (collectionId) {
      case COLLECTIONS.USERS:
        const user = getFromStorage(STORAGE_KEYS.USER, DEFAULT_USER);
        const updatedUser = { ...user, ...data };
        saveToStorage(STORAGE_KEYS.USER, updatedUser);
        return Promise.resolve(updatedUser);
        
      case COLLECTIONS.WALLETS:
        const wallet = getFromStorage(STORAGE_KEYS.WALLET, DEFAULT_WALLET);
        const updatedWallet = { ...wallet, ...data, updated_at: new Date().toISOString() };
        saveToStorage(STORAGE_KEYS.WALLET, updatedWallet);
        return Promise.resolve(updatedWallet);
        
      default:
        console.warn(`Offline mode: Collection ${collectionId} not supported for updates`);
        return Promise.resolve(null);
    }
  },
};

// Wallet-specific helper functions for offline mode
export const offlineWalletHelpers = {
  getUserWallet: (_userId: string) => {
    return Promise.resolve(getFromStorage(STORAGE_KEYS.WALLET, DEFAULT_WALLET));
  },

  getUserTransactions: (_userId: string, page: number = 1, limit: number = 20) => {
    const transactions = getFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTransactions = transactions.slice(start, end);
    
    return Promise.resolve({
      total: transactions.length,
      documents: paginatedTransactions,
    });
  },

  createTransaction: (userId: string, transactionData: any) => {
    // Type assertion to fix the type error
    const transactions: any[] = getFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
    const wallet = getFromStorage(STORAGE_KEYS.WALLET, DEFAULT_WALLET);
    
    // Update wallet balance based on transaction type
    if (transactionData.type === 'deposit') {
      wallet.balance += transactionData.amount;
    } else if (transactionData.type === 'withdrawal') {
      wallet.balance -= transactionData.amount;
    }
    
    // Save updated wallet
    saveToStorage(STORAGE_KEYS.WALLET, wallet);
    
    // Create new transaction
    const newTransaction = {
      $id: `tx_${Date.now()}`,
      user_id: userId,
      ...transactionData,
      created_at: new Date().toISOString(),
      status: 'completed',
    };
    
    // Add to transactions list
    transactions.unshift(newTransaction);
    saveToStorage<any[]>(STORAGE_KEYS.TRANSACTIONS, transactions);
    
    return Promise.resolve(newTransaction);
  },
};

// Initialize offline data
initializeOfflineData();

// Export unified offline fallback
export const offlineFallback = {
  isOfflineMode: true,
  auth: offlineAuth,
  db: offlineDB,
  walletHelpers: offlineWalletHelpers,
};

export default offlineFallback;
