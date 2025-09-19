import React, { useState, useEffect } from 'react';
import { useKijumbeAuth } from '../../contexts/KijumbeAuthContext';
import { appwrite, COLLECTIONS } from '../../lib/appwrite';
import { Query } from 'appwrite';
import {
  Wallet as WalletIcon,
  Plus,
  Users,
  Target,
  History,
  Settings,
  Eye,
  EyeOff,
  Crown,
  TrendingUp,
  UserPlus,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Wallet {
  $id: string;
  userId: string;
  balance: number;
  pin_set: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  createdAt: string;
  updatedAt: string;
}

interface Group {
  $id: string;
  kiongoziId: string;
  name: string;
  description: string;
  contributionAmount: number;
  cycleDuration: number; // in days
  maxMembers: number;
  currentMembers: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

interface Transaction {
  $id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'contribution' | 'group_management' | 'commission';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  groupId?: string;
  createdAt: string;
}

const KiongoziWallet: React.FC = () => {
  const { user, isAuthenticated } = useKijumbeAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWalletData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchWalletData = async () => {
    if (!user) return;
    
    setError(null);
    setLoading(true);
    
    try {
      // Fetch wallet
      const walletResponse = await appwrite.listDocuments(COLLECTIONS.WALLETS, [
        Query.equal('userId', user.$id),
        Query.limit(1)
      ]);
      
      if (walletResponse.documents.length > 0) {
        setWallet(walletResponse.documents[0] as Wallet);
      } else {
        // Create a new wallet if none exists
        const newWallet = await appwrite.createDocument(COLLECTIONS.WALLETS, {
          userId: user.$id,
          balance: 0,
          pin_set: false,
          dailyLimit: 500000, // TZS 500,000 for Kiongozi
          monthlyLimit: 5000000, // TZS 5,000,000 for Kiongozi
        }, [`read("user:${user.$id}")`, `write("user:${user.$id}")`]);
        setWallet(newWallet as Wallet);
      }

      // Fetch groups managed by this Kiongozi
      const groupsResponse = await appwrite.listDocuments(COLLECTIONS.GROUPS, [
        Query.equal('kiongoziId', user.$id),
        Query.orderDesc('createdAt')
      ]);
      setGroups(groupsResponse.documents as Group[]);

      // Fetch recent transactions
      const transactionsResponse = await appwrite.listDocuments(COLLECTIONS.TRANSACTIONS, [
        Query.equal('userId', user.$id),
        Query.orderDesc('createdAt'),
        Query.limit(10)
      ]);
      setTransactions(transactionsResponse.documents as Transaction[]);

    } catch (err: any) {
      console.error('Failed to fetch wallet data:', err);
      setError(err.message || 'Failed to load wallet data.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransactionTypeDisplay = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return { label: 'Deposit', icon: '⬆️', color: 'text-green-600' };
      case 'withdrawal': return { label: 'Withdrawal', icon: '⬇️', color: 'text-red-600' };
      case 'contribution': return { label: 'Group Contribution', icon: '👥', color: 'text-blue-600' };
      case 'group_management': return { label: 'Group Management', icon: '👑', color: 'text-purple-600' };
      case 'commission': return { label: 'Commission', icon: '💰', color: 'text-orange-600' };
      default: return { label: type, icon: '📄', color: 'text-gray-600' };
    }
  };

  const getTransactionStatusDisplay = (status: Transaction['status']) => {
    const statuses = {
      pending: { label: 'Pending', bg: 'bg-yellow-100', color: 'text-yellow-800' },
      completed: { label: 'Completed', bg: 'bg-green-100', color: 'text-green-800' },
      failed: { label: 'Failed', bg: 'bg-red-100', color: 'text-red-800' },
    };
    return statuses[status as keyof typeof statuses] || { label: status, bg: 'bg-gray-100', color: 'text-gray-800' };
  };

  const getGroupStatusDisplay = (status: Group['status']) => {
    const statuses = {
      active: { label: 'Active', bg: 'bg-green-100', color: 'text-green-800' },
      completed: { label: 'Completed', bg: 'bg-blue-100', color: 'text-blue-800' },
      paused: { label: 'Paused', bg: 'bg-yellow-100', color: 'text-yellow-800' },
    };
    return statuses[status as keyof typeof statuses] || { label: status, bg: 'bg-gray-100', color: 'text-gray-800' };
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <WalletIcon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please log in to view your Kiongozi wallet and manage your groups.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error loading wallet</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchWalletData}
              className="bg-red-100 px-4 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Crown className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kiongozi Wallet</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Kiongozi'}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {showBalance ? <EyeOff className="w-5 h-5 text-gray-600" /> : <Eye className="w-5 h-5 text-gray-600" />}
            </button>
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-80">Kiongozi Balance</p>
              <p className="text-4xl font-bold mt-1">
                {showBalance ? formatCurrency(wallet?.balance ?? 0) : '********'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Groups Managed</p>
              <p className="text-2xl font-semibold">{groups.length}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={wallet?.pin_set ? 'text-green-200' : 'text-yellow-200'}>
              {wallet?.pin_set ? '🔒 PIN Secured' : '⚠️ PIN not set'}
            </span>
            <span className="opacity-80">
              Total Members: {groups.reduce((sum, group) => sum + group.currentMembers, 0)}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kiongozi Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Plus className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Group</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <UserPlus className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Add Members</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Analytics</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Calendar className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Schedule</span>
            </button>
          </div>
        </div>

        {/* Groups Management */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Groups</h2>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium">
              + Create New Group
            </button>
          </div>
          {groups.length > 0 ? (
            <div className="space-y-4">
              {groups.map((group) => {
                const statusDisplay = getGroupStatusDisplay(group.status);
                return (
                  <div key={group.$id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                        <p className="text-gray-600 text-sm">{group.description}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                        {statusDisplay.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Contribution</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(group.contributionAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Members</p>
                        <p className="font-semibold text-gray-900">{group.currentMembers}/{group.maxMembers}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cycle</p>
                        <p className="font-semibold text-gray-900">{group.cycleDuration} days</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-semibold text-gray-900">{formatDate(group.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200">
                        Manage
                      </button>
                      <button className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200">
                        View Members
                      </button>
                      <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200">
                        Analytics
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No groups created yet</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                Create Your First Group
              </button>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Contributions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(groups.reduce((sum, group) => sum + (group.contributionAmount * group.currentMembers), 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groups.reduce((sum, group) => sum + group.currentMembers, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Groups</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groups.filter(group => group.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All
            </button>
          </div>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const typeDisplay = getTransactionTypeDisplay(tx.type);
                const statusDisplay = getTransactionStatusDisplay(tx.status);
                return (
                  <div key={tx.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{typeDisplay.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{typeDisplay.label}</p>
                        <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${typeDisplay.color}`}>
                        {tx.type === 'deposit' || tx.type === 'commission' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                        {statusDisplay.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KiongoziWallet;
