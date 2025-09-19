import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import SendMoneyModal from '../../components/wallet/SendMoneyModal';
import ReceiveMoneyModal from '../../components/wallet/ReceiveMoneyModal';
import TopUpModal from '../../components/wallet/TopUpModal';
import SettingsModal from '../../components/wallet/SettingsModal';
import TransactionHistoryModal from '../../components/wallet/TransactionHistoryModal';
import { 
  Wallet as WalletIcon, 
  CreditCard, 
  Send, 
  ArrowDownLeft, 
  History,
  Settings,
  Eye,
  EyeOff,
  Plus,
  LogIn,
  Bell
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

const WalletSimple = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  
  // Modal states
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Simulate loading and set demo data
      setTimeout(() => {
        setWallet({
          $id: 'demo_wallet',
          userId: user.id,
          balance: 75000, // Demo balance
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
            amount: 30000,
            type: 'deposit',
            status: 'completed',
            description: 'Mobile money deposit',
            service: 'general',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            $id: 'demo_tx_2',
            userId: user.id,
            amount: 15000,
            type: 'utility_payment',
            status: 'completed',
            description: 'Water bill payment',
            service: 'utilities',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            $id: 'demo_tx_3',
            userId: user.id,
            amount: 20000,
            type: 'transfer',
            status: 'completed',
            description: 'Send money to John',
            service: 'transfers',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
          }
        ]);
        setWalletLoading(false);
      }, 1000);
    } else {
      setWalletLoading(false);
    }
  }, [isAuthenticated, user]);

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

  // Handler functions
  const handleSendMoney = async (recipient: string, amount: number, message: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update wallet balance
    if (wallet) {
      setWallet({
        ...wallet,
        balance: wallet.balance - amount,
        updatedAt: new Date().toISOString(),
      });
    }

    // Add transaction
    const newTransaction: Transaction = {
      $id: `tx_${Date.now()}`,
      userId: user?.id || '',
      amount,
      type: 'transfer',
      status: 'completed',
      description: `Send money to ${recipient}${message ? ` - ${message}` : ''}`,
      service: 'transfers',
      createdAt: new Date().toISOString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    addNotification(`Successfully sent ${formatCurrency(amount)} to ${recipient}`);
  };

  const handleTopUp = async (method: string, amount: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update wallet balance
    if (wallet) {
      setWallet({
        ...wallet,
        balance: wallet.balance + amount,
        updatedAt: new Date().toISOString(),
      });
    }

    // Add transaction
    const newTransaction: Transaction = {
      $id: `tx_${Date.now()}`,
      userId: user?.id || '',
      amount,
      type: 'deposit',
      status: 'completed',
      description: `Top up via ${method}`,
      service: 'general',
      createdAt: new Date().toISOString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    addNotification(`Successfully topped up ${formatCurrency(amount)} via ${method}`);
  };

  const handleUpdateSettings = async (settings: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (settings.type === 'limits' && wallet) {
      setWallet({
        ...wallet,
        dailyLimit: settings.dailyLimit,
        monthlyLimit: settings.monthlyLimit,
        updatedAt: new Date().toISOString(),
      });
    }
    
    addNotification('Settings updated successfully');
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]); // Keep only last 5 notifications
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
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
            <p className="text-sm">Demo Mode Available</p>
            <p className="text-xs mt-1">Log in to access your personal wallet</p>
          </div>
          <button className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center mx-auto">
            <LogIn className="w-4 h-4 mr-2" />
            Go to Login
          </button>
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
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => setShowHistoryModal(true)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <History className="w-5 h-5 text-gray-600" />
            </button>
            {notifications.length > 0 && (
              <div className="relative">
                <Bell className="w-5 h-5 text-purple-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Wallet Balance */}
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
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => setShowSendModal(true)}
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Send className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Send Money</span>
            </button>
            <button 
              onClick={() => setShowReceiveModal(true)}
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ArrowDownLeft className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Receive</span>
            </button>
            <button 
              onClick={() => setShowTopUpModal(true)}
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <CreditCard className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Top Up</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button 
              onClick={() => setShowHistoryModal(true)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
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

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">i</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
              <p className="text-sm text-blue-700 mt-1">
                You're viewing demo wallet data. Configure Appwrite to access your real wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-40">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in"
            >
              {notification}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <SendMoneyModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={handleSendMoney}
        balance={wallet?.balance || 0}
      />

      <ReceiveMoneyModal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        userEmail={user?.email || ''}
      />

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onTopUp={handleTopUp}
        balance={wallet?.balance || 0}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        wallet={wallet}
        onUpdateSettings={handleUpdateSettings}
      />

      <TransactionHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        transactions={transactions}
        onLoadMore={() => {}} // Implement pagination if needed
        hasMore={false}
        isLoading={false}
      />
    </div>
  );
};

export default WalletSimple;