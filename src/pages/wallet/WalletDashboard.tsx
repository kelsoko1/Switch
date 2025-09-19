import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import KijumbeServiceCard from '../../components/wallet/KijumbeServiceCard';
import UtilityPaymentsCard from '../../components/wallet/UtilityPaymentsCard';
import MoneyTransferCard from '../../components/wallet/MoneyTransferCard';
import TransportationCard from '../../components/wallet/TransportationCard';
import InvestmentCard from '../../components/wallet/InvestmentCard';
import DebugInfo from '../../components/DebugInfo';
import { 
  Wallet as WalletIcon, 
  CreditCard, 
  Send, 
  ArrowDownLeft, 
  TrendingUp, 
  History,
  Settings,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { appwrite, COLLECTIONS } from '../../lib/appwrite';
import { Query } from 'appwrite';

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

interface Transaction {
  $id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'utility_payment' | 'transfer' | 'kijumbe_contribution' | 'kijumbe_payout' | 'transportation' | 'investment';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  service: 'kijumbe' | 'utilities' | 'transfers' | 'transportation' | 'investment' | 'general';
  createdAt: string;
}

const WalletDashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWalletData();
    } else {
      setWalletLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchWalletData = async () => {
    if (!user) return;
    
    setError(null);
    setWalletLoading(true);
    
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        // Use demo data when Appwrite is not configured
        setWallet({
          $id: 'demo_wallet',
          userId: user.id,
          balance: 50000, // Demo balance
          pin_set: false,
          dailyLimit: 100000,
          monthlyLimit: 1000000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setTransactions([
          {
            $id: 'demo_tx_1',
            userId: user.id,
            amount: 25000,
            type: 'deposit',
            status: 'completed',
            description: 'Initial deposit',
            service: 'general',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          },
          {
            $id: 'demo_tx_2',
            userId: user.id,
            amount: 5000,
            type: 'utility_payment',
            status: 'completed',
            description: 'Electricity bill payment',
            service: 'utilities',
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          }
        ]);
        setWalletLoading(false);
        return;
      }

      // Fetch or create wallet using Appwrite
      const walletResponse = await appwrite.listDocuments(COLLECTIONS.WALLETS, [
        Query.equal('userId', user.id),
        Query.limit(1)
      ]);
      
      if (walletResponse.documents.length > 0) {
        setWallet(walletResponse.documents[0] as Wallet);
      } else {
        // Create a new wallet if none exists
        const newWallet = await appwrite.createDocument(COLLECTIONS.WALLETS, {
          userId: user.id,
          balance: 0,
          pin_set: false,
          dailyLimit: 100000, // TZS 100,000
          monthlyLimit: 1000000, // TZS 1,000,000
        }, [`read("user:${user.id}")`, `write("user:${user.id}")`]);
        setWallet(newWallet as Wallet);
      }

      // Fetch recent transactions
      const transactionsResponse = await appwrite.listDocuments(COLLECTIONS.TRANSACTIONS, [
        Query.equal('userId', user.id),
        Query.orderDesc('createdAt'),
        Query.limit(10)
      ]);
      setTransactions(transactionsResponse.documents as Transaction[]);

    } catch (err: any) {
      console.error('Failed to fetch wallet data:', err);
      setError(err.message || 'Failed to load wallet data.');
    } finally {
      setWalletLoading(false);
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
      case 'utility_payment': return { label: 'Utility Payment', icon: '⚡', color: 'text-blue-600' };
      case 'transfer': return { label: 'Transfer', icon: '💸', color: 'text-purple-600' };
      case 'kijumbe_contribution': return { label: 'Kijumbe Contribution', icon: '👥', color: 'text-green-600' };
      case 'kijumbe_payout': return { label: 'Kijumbe Payout', icon: '💰', color: 'text-green-600' };
      case 'transportation': return { label: 'Transportation', icon: '🚗', color: 'text-orange-600' };
      case 'investment': return { label: 'Investment', icon: '📈', color: 'text-indigo-600' };
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

  if (walletLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <WalletIcon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please log in to view your wallet and manage your funds.</p>
          <div className="bg-purple-100 text-purple-800 p-4 rounded-lg mb-6">
            <p>Use the test page to create an account:</p>
            <p>Go to /test/appwrite</p>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
            <p className="text-gray-600">Welcome back, {user?.email || 'User'}!</p>
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
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <History className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Unified Wallet Balance */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-80">Total Balance</p>
              <p className="text-4xl font-bold mt-1">
                {showBalance ? formatCurrency(wallet?.balance ?? 0) : '********'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Daily Limit</p>
              <p className="text-lg font-semibold">
                {showBalance ? formatCurrency(wallet?.dailyLimit ?? 0) : '********'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={wallet?.pin_set ? 'text-green-200' : 'text-yellow-200'}>
              {wallet?.pin_set ? '🔒 PIN Secured' : '⚠️ PIN not set'}
            </span>
            <span className="opacity-80">
              Monthly Limit: {showBalance ? formatCurrency(wallet?.monthlyLimit ?? 0) : '********'}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Send className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Send Money</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <ArrowDownLeft className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Receive</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <CreditCard className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Top Up</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Invest</span>
            </button>
          </div>
        </div>

        {/* Financial Services Cards */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Financial Services</h2>
          
          {/* Kijumbe Service Card */}
          <KijumbeServiceCard wallet={wallet} onTransaction={fetchWalletData} />

          {/* Utility Payments Card */}
          <UtilityPaymentsCard />

          {/* Money Transfer Card */}
          <MoneyTransferCard />

          {/* Transportation Card */}
          <TransportationCard />

          {/* Investment & Savings Card */}
          <InvestmentCard />
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
                        {tx.type === 'deposit' || tx.type === 'kijumbe_payout' ? '+' : '-'}
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

      {/* Debug Info */}
      <DebugInfo />
    </div>
  );
};

export default WalletDashboard;
