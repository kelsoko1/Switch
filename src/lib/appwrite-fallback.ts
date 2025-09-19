// Fallback Appwrite implementation for development
// This provides mock functionality when Appwrite is not properly configured

export interface AppwriteUser {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  prefs: any;
  created: string;
  accessedAt: string;
}

export interface AppwriteContextType {
  user: AppwriteUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<AppwriteUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Mock Appwrite client
export const client = {
  setEndpoint: () => client,
  setProject: () => client,
  setKey: () => client,
};

// Mock services
export const account = {
  get: async () => {
    // Return mock user for development
    return {
      $id: 'mock-user-id',
      email: 'test@example.com',
      name: 'Test User',
      emailVerification: true,
      phoneVerification: false,
      prefs: {},
      created: new Date().toISOString(),
      accessedAt: new Date().toISOString(),
    };
  },
  create: async () => {
    return {
      $id: 'mock-user-id',
      email: 'test@example.com',
      name: 'Test User',
    };
  },
  createEmailSession: async () => {
    return { $id: 'mock-session-id' };
  },
  createAnonymousSession: async () => {
    return { $id: 'mock-session-id' };
  },
  deleteSession: async () => ({}),
  deleteSessions: async () => ({}),
  updatePassword: async () => ({}),
  updateEmail: async () => ({}),
  updateName: async () => ({}),
};

export const databases = {
  createDocument: async () => ({ $id: 'mock-doc-id' }),
  getDocument: async () => ({ $id: 'mock-doc-id' }),
  listDocuments: async () => ({ documents: [], total: 0 }),
  updateDocument: async () => ({ $id: 'mock-doc-id' }),
  deleteDocument: async () => ({}),
};

export const storage = {};
export const functions = {};
export const teams = {};
export const locale = {};
export const avatars = {};

// Mock database helpers
export const db = {
  createDocument: async () => ({ $id: 'mock-doc-id' }),
  getDocument: async () => ({ $id: 'mock-doc-id' }),
  listDocuments: async () => ({ documents: [], total: 0 }),
  updateDocument: async () => ({ $id: 'mock-doc-id' }),
  deleteDocument: async () => ({}),
};

// Mock authentication helpers
export const auth = {
  getCurrentUser: async () => {
    // Return mock user for development
    return {
      $id: 'mock-user-id',
      email: 'test@example.com',
      name: 'Test User',
      emailVerification: true,
      phoneVerification: false,
      prefs: {},
      created: new Date().toISOString(),
      accessedAt: new Date().toISOString(),
    };
  },
  createAccount: async () => {
    return {
      $id: 'mock-user-id',
      email: 'test@example.com',
      name: 'Test User',
    };
  },
  createEmailSession: async () => {
    return { $id: 'mock-session-id' };
  },
  createAnonymousSession: async () => {
    return { $id: 'mock-session-id' };
  },
  deleteSession: async () => ({}),
  deleteSessions: async () => ({}),
  updatePassword: async () => ({}),
  updateEmail: async () => ({}),
  updateName: async () => ({}),
};

// Mock wallet helpers
export const walletHelpers = {
  getUserWallet: async () => ({
    $id: 'mock-wallet-id',
    user_id: 'mock-user-id',
    balance: 1000,
    pin_set: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),
  createUserWallet: async () => ({
    $id: 'mock-wallet-id',
    user_id: 'mock-user-id',
    balance: 0,
    pin_set: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),
  getUserTransactions: async () => ({
    documents: [
      {
        $id: 'mock-txn-1',
        user_id: 'mock-user-id',
        type: 'deposit',
        amount: 500,
        description: 'Initial deposit',
        status: 'completed',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        $id: 'mock-txn-2',
        user_id: 'mock-user-id',
        type: 'withdraw',
        amount: 100,
        description: 'ATM withdrawal',
        status: 'completed',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    total: 2,
  }),
  createTransaction: async () => ({ $id: 'mock-txn-id' }),
  getUserSavingsGoals: async () => [
    {
      $id: 'mock-goal-1',
      user_id: 'mock-user-id',
      title: 'Emergency Fund',
      target_amount: 5000,
      current_amount: 1500,
      target_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
    },
  ],
  createSavingsGoal: async () => ({ $id: 'mock-goal-id' }),
};

// Mock group helpers
export const groupHelpers = {
  getUserGroups: async () => [],
  getGroupDetails: async () => null,
  createGroup: async () => ({ $id: 'mock-group-id' }),
};

// Mock utility functions
export const utils = {
  formatCurrency: (amount: number, currency: string = 'TZS') => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },
  formatDate: (date: string | Date) => {
    return new Intl.DateTimeFormat('en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  },
  generateId: (prefix: string = '') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  isValidEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  isValidPhone: (phone: string) => {
    const phoneRegex = /^(\+255|0)[0-9]{9}$/;
    return phoneRegex.test(phone);
  },
};

export const COLLECTIONS = {
  USERS: 'users',
  WALLETS: 'wallets',
  TRANSACTIONS: 'transactions',
  SAVINGS_GOALS: 'savings_goals',
  GROUPS: 'groups',
  GROUP_MEMBERS: 'group_members',
  CONTRIBUTIONS: 'contributions',
  GROUP_PAYMENTS: 'group_payments',
  WHATSAPP_MESSAGES: 'whatsapp_messages',
  SYSTEM_SETTINGS: 'system_settings',
};

export default client;
