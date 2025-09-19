import React, { useEffect, useState, useContext } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  QrCode,
  Scan,
  X,
  Copy,
  Check,
  Shield,
  Bell,
  Settings,
  AlertCircle,
  FileText,
  Download,
  Search,
  Calendar,
  Filter,
  ChevronDown,
  CreditCard,
  Wallet as WalletIcon,
  DollarSign,
  Send,
  Clock,
  User,
  Smartphone,
  Building as Bank,
  Bitcoin,
} from 'lucide-react';
import { PaymentManager, type Transaction, type Wallet } from '../../lib/payments';
import { AuthContext } from '../../App';
import { useAppwrite } from '../../contexts/AppwriteContext';
import KijumbeWalletCard from '../../components/KijumbeWalletCard';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};

const TransactionIcon = ({ type }: { type: Transaction['type'] }) => {
  switch (type) {
    case 'deposit':
      return <ArrowUpRight className="w-5 h-5 text-green-500" />;
    case 'withdrawal':
      return <ArrowDownRight className="w-5 h-5 text-red-500" />;
    case 'stream_payment':
      return <ArrowDownRight className="w-5 h-5 text-purple-500" />;
    case 'gift':
      return <ArrowDownRight className="w-5 h-5 text-pink-500" />;
    default:
      return null;
  }
};

const WalletPage = () => {
  const { user: rafikiUser } = React.useContext(AuthContext);
  const { isAuthenticated: rafikiAuthenticated } = useContext(AuthContext);
  const { user: appwriteUser, isAuthenticated: appwriteAuthenticated, loading: appwriteLoading } = useAppwrite();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState<Transaction | null>(null);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const currentUser = appwriteUser || rafikiUser;
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'payment'>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'bank' | 'mobile' | 'crypto'>('mobile');

  useEffect(() => {
    if (appwriteAuthenticated || rafikiAuthenticated) {
      loadWallet();
    }
  }, [appwriteAuthenticated, rafikiAuthenticated]);

  const loadWallet = async () => {
    try {
      setIsLoading(true);
      
      if (!appwriteAuthenticated && !rafikiAuthenticated) {
        setError('Please log in to view your wallet');
        setIsLoading(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please log in to view your wallet');
        setIsLoading(false);
        return;
      }

      setUserId(currentUser?.id || currentUser?.$id || '');
      
      // Create some sample transactions for demo purposes
      const userId = currentUser?.id || currentUser?.$id || '';
      if (!(await hasTransactions(userId))) {
        await createSampleTransactions(userId);
      }
      
      const paymentManager = new PaymentManager(userId);
      const walletData = await paymentManager.getWallet();
      setWallet(walletData);
      setError(null);
    } catch (error) {
      console.error('Failed to load wallet:', error);
      setError('Failed to load wallet. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasTransactions = async (userId: string) => {
    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    return !error && count && count > 0;
  };

  const createSampleTransactions = async (userId: string) => {
    try {
      // Create sample transactions for demo purposes with valid UUIDs
      const sampleTransactions = [
        {
          user_id: userId,
          amount: 500,
          type: 'deposit',
          status: 'completed',
          stream_id: null,
          recipient_id: null,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          amount: 50,
          type: 'withdrawal',
          status: 'completed',
          stream_id: null,
          recipient_id: null,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          amount: 25,
          type: 'stream_payment',
          status: 'completed',
          stream_id: null,
          recipient_id: null,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          amount: 10,
          type: 'gift',
          status: 'completed',
          stream_id: null,
          recipient_id: null,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          amount: 200,
          type: 'deposit',
          status: 'completed',
          recipient_id: null,
          created_at: new Date().toISOString()
        }
      ];

      const { error } = await supabase
        .from('transactions')
        .insert(sampleTransactions);
      
      if (error) {
        console.error('Error creating sample transactions:', error);
      }
    } catch (error) {
      console.error('Error creating sample transactions:', error);
    }
  };

  const handleDeposit = async () => {
    try {
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      const currentUser = appwriteUser || rafikiUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const paymentManager = new PaymentManager(currentUser.id || currentUser.$id);
      await paymentManager.deposit(amount);
      await loadWallet();
      setShowDepositModal(false);
      setDepositAmount('');
    } catch (error) {
      console.error('Failed to deposit:', error);
    }
  };

  const handleCopyUserId = async () => {
    if (userId) {
      try {
        await navigator.clipboard.writeText(userId);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const filteredTransactions = wallet?.transactions.filter(tx => {
    // Filter by search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery || 
      tx.id.toLowerCase().includes(searchLower) ||
      (tx.recipient_id && tx.recipient_id.toLowerCase().includes(searchLower)) ||
      tx.type.toLowerCase().includes(searchLower);
    
    // Filter by transaction type
    const matchesType = 
      typeFilter === 'all' || 
      (typeFilter === 'deposit' && tx.type === 'deposit') ||
      (typeFilter === 'withdrawal' && tx.type === 'withdrawal') ||
      (typeFilter === 'payment' && (tx.type === 'stream_payment' || tx.type === 'gift'));
    
    // Filter by date
    const txDate = new Date(tx.created_at);
    const now = new Date();
    const isToday = txDate.toDateString() === now.toDateString();
    const isThisWeek = now.getTime() - txDate.getTime() < 7 * 24 * 60 * 60 * 1000;
    const isThisMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    
    const matchesDate = 
      dateFilter === 'all' || 
      (dateFilter === 'today' && isToday) ||
      (dateFilter === 'week' && isThisWeek) ||
      (dateFilter === 'month' && isThisMonth);
    
    // Filter by tab
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'sent' && (tx.type === 'withdrawal' || tx.type === 'stream_payment' || tx.type === 'gift')) ||
      (activeTab === 'received' && tx.type === 'deposit');
    
    return matchesSearch && matchesType && matchesDate && matchesTab;
  });

  if (isLoading || appwriteLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!appwriteAuthenticated && !rafikiAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <WalletIcon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please log in to view your wallet, make transactions, and manage your funds.</p>
          <div className="bg-purple-100 text-purple-800 p-4 rounded-lg mb-6">
            <p>Use these credentials to log in:</p>
            <p>Email: test@example.com</p>
            <p>Password: password123</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadWallet}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full bg-gray-50 overflow-y-auto">
        {/* Balance Card */}
        <div className="bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Your Wallet</h1>
            <div className="flex gap-1">
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center justify-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"
              >
                <QrCode className="w-4 h-4" />
                <span>Receive</span>
              </button>
              <button
                onClick={() => setShowScannerModal(true)}
                className="flex items-center justify-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"
              >
                <Scan className="w-4 h-4" />
                <span>Pay</span>
              </button>
              <button
                onClick={() => setShowDepositModal(true)}
                className="flex items-center justify-center w-9 h-9 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                aria-label="Add Funds"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
            <p className="text-white/80 mb-2">Available Balance</p>
            <p className="text-3xl font-bold">{formatCurrency(wallet?.balance ?? 0)}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              <span className="text-white/80">Protected by bank-grade security</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <button 
              onClick={() => setShowPaymentMethodsModal(true)}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              <span>Payment Methods</span>
            </button>
            <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Send className="w-5 h-5" />
              <span>Send Money</span>
            </button>
            <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Clock className="w-5 h-5" />
              <span>Scheduled Payments</span>
            </button>
          </div>
        </div>

        {/* Kijumbe Savings Card */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Savings & Investments</h2>
            <KijumbeWalletCard />
          </div>
        </div>

        {/* Transaction History */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            <div className="flex gap-2">
              {['all', 'sent', 'received'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-4 py-1 rounded-full text-sm font-medium ${
                    activeTab === tab
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Calendar className="w-5 h-5 text-gray-500" />
                <span>{dateFilter === 'all' ? 'All Time' : dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This Week' : 'This Month'}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showDateFilter && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: 'week', label: 'This Week' },
                    { id: 'month', label: 'This Month' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setDateFilter(option.id as typeof dateFilter);
                        setShowDateFilter(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowTypeFilter(!showTypeFilter)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5 text-gray-500" />
                <span>{typeFilter === 'all' ? 'All Types' : typeFilter === 'deposit' ? 'Deposits' : typeFilter === 'withdrawal' ? 'Withdrawals' : 'Payments'}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showTypeFilter && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {[
                    { id: 'all', label: 'All Types' },
                    { id: 'deposit', label: 'Deposits' },
                    { id: 'withdrawal', label: 'Withdrawals' },
                    { id: 'payment', label: 'Payments' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setTypeFilter(option.id as typeof typeFilter);
                        setShowTypeFilter(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {!filteredTransactions?.length ? (
              <div className="p-6 text-center text-gray-500">
                No transactions found
              </div>
            ) : (
              <div className="divide-y">
                {filteredTransactions.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => setShowTransactionDetails(tx)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="p-2 bg-gray-100 rounded-full">
                      <TransactionIcon type={tx.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {tx.type === 'deposit' ? 'Deposit' :
                         tx.type === 'withdrawal' ? 'Withdrawal' :
                         tx.type === 'stream_payment' ? 'Stream Payment' :
                         'Gift Sent'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{formatDate(tx.created_at)}</p>
                    </div>
                    <p className={`font-medium whitespace-nowrap ${
                      tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add Funds</h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex border-b mb-6">
                {[
                  { id: 'mobile', icon: Smartphone, label: 'Mobile Money' },
                  { id: 'bank', icon: Bank, label: 'Bank Transfer' },
                  { id: 'card', icon: CreditCard, label: 'Card' },
                  { id: 'crypto', icon: Bitcoin, label: 'Crypto' },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedPaymentMethod(id as typeof selectedPaymentMethod)}
                    className={`flex-1 py-3 flex flex-col items-center gap-1 ${
                      selectedPaymentMethod === id
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              {selectedPaymentMethod === 'mobile' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
              
              {selectedPaymentMethod === 'bank' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Select your bank</option>
                    <option>Bank of America</option>
                    <option>Chase</option>
                    <option>Wells Fargo</option>
                  </select>
                </div>
              )}
              
              {selectedPaymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {selectedPaymentMethod === 'crypto' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cryptocurrency
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4">
                    <option>Bitcoin (BTC)</option>
                    <option>Ethereum (ETH)</option>
                    <option>USD Coin (USDC)</option>
                  </select>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-2">Send to this address:</p>
                    <p className="font-mono text-sm break-all">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {selectedPaymentMethod === 'crypto' ? 'Generate Address' : 'Add Funds'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal - Compact Version */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Receive Payment</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex space-x-2 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="What's it for?"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg mb-3">
              <QRCodeSVG
                value={JSON.stringify({
                  userId,
                  amount: paymentAmount ? parseFloat(paymentAmount) : undefined,
                  timestamp: Date.now(),
                })}
                size={160}
                level="H"
                includeMargin
              />
              <div className="flex items-center gap-1 mt-2">
                <p className="text-xs text-gray-500 font-mono truncate max-w-[150px]">{userId}</p>
                <button
                  onClick={handleCopyUserId}
                  className="text-primary-500 hover:text-primary-600"
                >
                  {copiedToClipboard ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                <Download className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                <Send className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal - Compact Version */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
              <button
                onClick={() => setShowScannerModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              {/* QR Code Scanner would go here */}
              <div className="text-center">
                <Scan className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Camera access required</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-3">
              <div className="p-1.5 bg-purple-100 rounded-full">
                <User className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Or enter recipient ID manually</p>
              </div>
              <button className="text-purple-500 hover:text-purple-600">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => setShowScannerModal(false)}
              className="w-full py-1.5 px-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Methods Modal */}
      {showPaymentMethodsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Payment Methods</h3>
              <button
                onClick={() => setShowPaymentMethodsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/25</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Default</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Bank className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Bank of America</p>
                  <p className="text-sm text-gray-500">Checking ****6789</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Smartphone className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Mobile Money</p>
                  <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
            
            <button
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Payment Method</span>
            </button>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Transaction Details</h3>
              <button
                onClick={() => setShowTransactionDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-6 p-6 bg-gray-50 rounded-lg">
              <div className={`p-4 rounded-full mb-2 ${
                showTransactionDetails.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <TransactionIcon type={showTransactionDetails.type} />
              </div>
              <p className="text-2xl font-bold mb-1">
                {showTransactionDetails.type === 'deposit' ? '+' : '-'}
                {formatCurrency(showTransactionDetails.amount)}
              </p>
              <p className="text-gray-500">
                {showTransactionDetails.type === 'deposit' ? 'Deposit' :
                 showTransactionDetails.type === 'withdrawal' ? 'Withdrawal' :
                 showTransactionDetails.type === 'stream_payment' ? 'Stream Payment' :
                 'Gift Sent'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {formatDate(showTransactionDetails.created_at)}
              </p>
              <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                showTransactionDetails.status === 'completed' ? 'bg-green-100 text-green-700' :
                showTransactionDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {showTransactionDetails.status.charAt(0).toUpperCase() + showTransactionDetails.status.slice(1)}
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <p className="text-gray-500">Date</p>
                 <p className="font-medium">{formatDate(showTransactionDetails.created_at)}</p>
              </div>
              
              <div className="flex justify-between">
                <p className="text-gray-500">Transaction ID</p>
                <p className="font-medium font-mono">{showTransactionDetails.id.substring(0, 8)}...</p>
              </div>
              
              {showTransactionDetails.recipient_id && (
                <div className="flex justify-between">
                  <p className="text-gray-500">Recipient</p>
                  <p className="font-medium font-mono">{showTransactionDetails.recipient_id.substring(0, 8)}...</p>
                </div>
              )}
              
              {showTransactionDetails.stream_id && (
                <div className="flex justify-between">
                  <p className="text-gray-500">Stream</p>
                  <p className="font-medium font-mono">{showTransactionDetails.stream_id.substring(0, 8)}...</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
                <span>Report Issue</span>
              </button>
              
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>Get Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletPage;