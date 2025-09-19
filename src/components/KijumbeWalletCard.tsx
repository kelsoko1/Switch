import React, { useState, useEffect } from 'react';
import { useAppwrite } from '../contexts/AppwriteContext';
import { db, walletHelpers, utils, COLLECTIONS } from '../lib/appwrite';
import { 
  Wallet as WalletIcon, 
  Plus, 
  Minus, 
  History, 
  Settings,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Target,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface WalletData {
  $id: string;
  user_id: string;
  balance: number;
  pin_set: boolean;
  created_at: string;
  updated_at: string;
}

interface TransactionData {
  $id: string;
  user_id: string;
  type: 'deposit' | 'withdraw' | 'contribution' | 'refund';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface SavingsGoal {
  $id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

const KijumbeWalletCard: React.FC = () => {
  const { user, isAuthenticated } = useAppwrite();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadWalletData();
    }
  }, [isAuthenticated, user]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      // Load wallet
      const walletData = await walletHelpers.getUserWallet(user.$id);
      if (walletData) {
        setWallet(walletData);
      } else {
        // Create wallet if it doesn't exist
        const newWallet = await walletHelpers.createUserWallet(user.$id, 0);
        setWallet(newWallet);
      }

      // Load recent transactions
      const transactionsData = await walletHelpers.getUserTransactions(user.$id, 1, 5);
      setTransactions(transactionsData.documents);

      // Load savings goals
      const goalsData = await walletHelpers.getUserSavingsGoals(user.$id);
      setSavingsGoals(goalsData);

    } catch (err: any) {
      console.error('Error loading wallet data:', err);
      setError(err.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeDisplay = (type: string) => {
    const types = {
      deposit: { label: 'Deposit', icon: '💰', color: 'text-green-600' },
      withdraw: { label: 'Withdraw', icon: '💸', color: 'text-red-600' },
      contribution: { label: 'Group Contribution', icon: '👥', color: 'text-blue-600' },
      refund: { label: 'Refund', icon: '↩️', color: 'text-purple-600' },
    };
    return types[type as keyof typeof types] || { label: type, icon: '❓', color: 'text-gray-600' };
  };

  const getTransactionStatusDisplay = (status: string) => {
    const statuses = {
      pending: { label: 'Pending', bg: 'bg-yellow-100', color: 'text-yellow-800' },
      completed: { label: 'Completed', bg: 'bg-green-100', color: 'text-green-800' },
      failed: { label: 'Failed', bg: 'bg-red-100', color: 'text-red-800' },
    };
    return statuses[status as keyof typeof statuses] || { label: status, bg: 'bg-gray-100', color: 'text-gray-800' };
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Kijumbe Savings</h3>
          <p className="mt-1 text-sm text-gray-500">Please log in to access your savings wallet</p>
          <div className="mt-4">
            <a 
              href="/test/appwrite" 
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading wallet...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading wallet</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={loadWalletData}
                className="mt-2 text-sm text-red-600 hover:text-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Kijumbe Savings</h3>
            <p className="text-sm opacity-90">Rotational savings platform</p>
          </div>
          <WalletIcon className="h-8 w-8 opacity-50" />
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Savings Balance</p>
            <div className="flex items-center">
              {showBalance ? (
                <p className="text-2xl font-bold text-gray-900">
                  {utils.formatCurrency(wallet?.balance || 0)}
                </p>
              ) : (
                <p className="text-2xl font-bold text-gray-900">••••••</p>
              )}
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="ml-2 p-1 hover:bg-gray-200 rounded"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {wallet?.pin_set ? '🔒 Secured' : '⚠️ PIN not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Active Goals</p>
            <p className="text-lg font-semibold text-gray-900">
              {savingsGoals.filter(goal => goal.status === 'active').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-lg font-semibold text-gray-900">
              {utils.formatCurrency(transactions
                .filter(t => t.type === 'deposit' && new Date(t.created_at).getMonth() === new Date().getMonth())
                .reduce((sum, t) => sum + t.amount, 0)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'overview'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'goals'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'history'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                <ArrowDownLeft className="h-5 w-5 mr-2" />
                Add Money
              </button>
              <button className="flex items-center justify-center p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                <Users className="h-5 w-5 mr-2" />
                Join Group
              </button>
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
              {transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.slice(0, 3).map((transaction) => {
                    const typeDisplay = getTransactionTypeDisplay(transaction.type);
                    const statusDisplay = getTransactionStatusDisplay(transaction.status);
                    
                    return (
                      <div key={transaction.$id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{typeDisplay.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{typeDisplay.label}</p>
                            <p className="text-xs text-gray-500">{transaction.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${typeDisplay.color}`}>
                            {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                            {utils.formatCurrency(transaction.amount)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${statusDisplay.bg} ${statusDisplay.color}`}>
                            {statusDisplay.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <History className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-4">
            {savingsGoals.length > 0 ? (
              savingsGoals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                return (
                  <div key={goal.$id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        goal.status === 'active' ? 'bg-green-100 text-green-800' :
                        goal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{utils.formatCurrency(goal.current_amount)}</span>
                        <span>{utils.formatCurrency(goal.target_amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Target: {utils.formatDate(goal.target_date)}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No savings goals</h3>
                <p className="mt-1 text-sm text-gray-500">Create your first savings goal to get started</p>
                <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Create Goal
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {transactions.length > 0 ? (
              transactions.map((transaction) => {
                const typeDisplay = getTransactionTypeDisplay(transaction.type);
                const statusDisplay = getTransactionStatusDisplay(transaction.status);
                
                return (
                  <div key={transaction.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{typeDisplay.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{typeDisplay.label}</p>
                        <p className="text-xs text-gray-500">{utils.formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${typeDisplay.color}`}>
                        {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                        {utils.formatCurrency(transaction.amount)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${statusDisplay.bg} ${statusDisplay.color}`}>
                        {statusDisplay.label}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <History className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                <p className="mt-1 text-sm text-gray-500">Your transaction history will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Powered by Kijumbe</p>
          <button className="text-xs text-green-600 hover:text-green-700">
            View Full Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default KijumbeWalletCard;
