import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { COLLECTIONS } from '@/lib/constants';
import { useWalletRealtime, useTransactionsRealtime } from '@/hooks/useRealtime';
import SendMoneyModal from '../../components/wallet/SendMoneyModal';
import ReceiveMoneyModal from '../../components/wallet/ReceiveMoneyModal';
import TopUpModal from '../../components/wallet/TopUpModal';
import SettingsModal from '../../components/wallet/SettingsModal';
import TransactionHistoryModal from '../../components/wallet/TransactionHistoryModal';
import UtilityPaymentsModal from '../../components/wallet/UtilityPaymentsModal';
import KijumbeModal from '../../components/wallet/KijumbeModal';
import WithdrawModal from '../../components/wallet/WithdrawModal';
import { 
  Wallet as WalletIcon, 
  Send, 
  ArrowDownLeft, 
  History,
  Settings,
  Eye,
  EyeOff,
  Bell,
  Zap
} from 'lucide-react';
import { walletService, Wallet } from '../../services/appwrite';
import { Transaction } from '../../services/appwrite/walletService';

const WalletTanzania = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [showKijumbeModal, setShowKijumbeModal] = useState(false);
  
  // Notifications
  interface NotificationType {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: Date;
  }

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  
  // Add notification function
  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const notification: NotificationType = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };
  
  // Service selection
  const [selectedService, setSelectedService] = useState('kijumbe');

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      
      if (!user?.$id) {
        throw new Error('User not authenticated');
      }
      
      // Fetch wallet data using Appwrite service
      const walletData = await walletService.getUserWallet(user.$id);
      
      if (!walletData) {
        throw new Error('Failed to fetch wallet data');
      }
      
      // Fetch service balances
      const serviceBalances = await walletService.getServiceBalances(user.$id);
      
      // Normalize field names to match our component's expectations
      const normalizedWallet = {
        ...walletData,
        userId: walletData.user_id,
        dailyLimit: walletData.daily_limit,
        monthlyLimit: walletData.monthly_limit,
        createdAt: walletData.created_at,
        updatedAt: walletData.updated_at,
        serviceBalances // Add service balances to wallet object
      };
      
      setWallet(normalizedWallet as any);
      
      // Fetch transactions using Appwrite service
      const transactionsResult = await walletService.getUserTransactions(user.$id, 1, 20);
      
      // Use transactions directly from the service without normalizing
      setTransactions(transactionsResult.documents);
      setWalletLoading(false);
      
      // Set up real-time subscriptions
      console.log('Setting up real-time subscriptions for wallet and transactions');
      
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setWalletLoading(false);
      // Add notification for error
      addNotification('Failed to load wallet data. Please try again.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchWalletData();
  }, []);
  
  // Use real-time hooks for wallet and transactions
  const realtimeWallet = useWalletRealtime(wallet);
  const { transactions: realtimeTransactions } = useTransactionsRealtime(transactions);
  
  // Update state when real-time data changes
  useEffect(() => {
    if (realtimeWallet && wallet?.$id === realtimeWallet.$id) {
      console.log('Updating wallet from real-time data:', realtimeWallet);
      setWallet(realtimeWallet);
    }
  }, [realtimeWallet]);
  
  useEffect(() => {
    if (realtimeTransactions && realtimeTransactions.length > 0) {
      console.log('Updating transactions from real-time data:', realtimeTransactions);
      setTransactions(realtimeTransactions);
    }
  }, [realtimeTransactions]);
  
  const handleRefresh = () => {
    fetchWalletData();
  };

  // Load more transactions for pagination
  const loadMoreTransactions = async (page: number = 2) => {
    try {
      if (!user?.$id) return;
      
      setIsRefreshing(true);
      const transactionsResult = await walletService.getUserTransactions(user.$id, page, 20);
      
      // Append new transactions to existing ones
      setTransactions(prev => [...prev, ...transactionsResult.documents]);
    } catch (error) {
      console.error('Error fetching more transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load more transaction history',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateWallet = async () => {
    try {
      setWalletLoading(true);
      if (!user?.$id) {
        throw new Error('User not authenticated');
      }
      
      const newWallet = await walletService.createUserWallet(user.$id, 0);
      if (newWallet) {
        setWallet(newWallet);
        toast({
          title: 'Wallet Created',
          description: 'Your wallet has been created successfully.',
        });
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast({
        title: 'Failed to Create Wallet',
        description: 'There was an error creating your wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setWalletLoading(false);
    }
  };

  // Removed unused renderTransactionItem function

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
  const handleSendMoney = async (recipient: string, amount: number, message: string): Promise<void> => {
    try {
      if (!user?.$id) {
        throw new Error('User not authenticated');
      }
      
      // Use Appwrite service to transfer money
      const success = await walletService.transferMoney(
        user.$id,
        recipient,
        amount,
        message
      );
      
      if (!success) {
        throw new Error('Failed to send money');
      }
      
      // Refresh wallet data
      await fetchWalletData();
      
      // Add success notification
      addNotification(`Successfully sent ${formatCurrency(amount)} to ${recipient}`, 'success');
      
      // Show toast notification
      toast({
        title: 'Money Sent',
        description: `Successfully sent ${formatCurrency(amount)} to ${recipient}`,
      });
      
      return;
    } catch (error: any) {
      console.error('Error sending money:', error);
      
      // Add error notification
      addNotification(error.message || 'Failed to send money. Please try again.', 'error');
      
      // Show toast notification
      toast({
        title: 'Transaction Failed',
        description: error.message || 'Failed to send money. Please try again.',
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const handleTopUp = async (amount: number, method: string): Promise<void> => {
    try {
      if (!user?.$id) {
        throw new Error('User not authenticated');
      }
      
      setIsRefreshing(true);
      
      // Create a deposit transaction using Appwrite service
      const transaction = await walletService.createTransaction(user.$id, {
        amount,
        type: 'deposit',
        status: 'completed', // Mark as completed immediately for demo purposes
        description: `Top up via ${method}`,
        service: 'general'
      });

      if (transaction) {
        // Add notification
        addNotification(`Successfully topped up ${formatCurrency(amount)} via ${method}`, 'success');
        
        // Show toast
        toast({
          title: 'Top Up Successful',
          description: `Successfully topped up ${formatCurrency(amount)} via ${method}.`,
        });
        
        // Refresh wallet data
        await fetchWalletData();
      } else {
        throw new Error('Failed to process top up');
      }
    } catch (error: any) {
      console.error('Error topping up:', error);
      
      // Add notification
      addNotification(error.message || 'Failed to process top up. Please try again.', 'error');
      
      // Show toast
      toast({
        title: 'Top Up Failed',
        description: error.message || 'Failed to process top up. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleWithdraw = async (amount: number, method: string) => {
    try {
      setIsRefreshing(true);
      if (!user?.$id) {
        throw new Error('User not authenticated');
      }
      
      // Check if wallet has enough balance
      if (wallet && wallet.balance < amount) {
        throw new Error('Insufficient balance for withdrawal');
      }
      
      const transaction = await walletService.createTransaction(user.$id, {
        amount,
        type: 'withdrawal',
        status: 'completed', // Mark as completed immediately for demo purposes
        description: `Withdrawal via ${method}`,
        service: 'general'
      });

      if (transaction) {
        // Add notification
        addNotification(`Successfully withdrew ${formatCurrency(amount)} via ${method}`, 'success');
        
        // Show toast
        toast({
          title: 'Withdrawal Successful',
          description: `Successfully withdrew ${formatCurrency(amount)} via ${method}.`,
        });
        
        // Refresh wallet data
        await fetchWalletData();
      } else {
        throw new Error('Failed to process withdrawal');
      }
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      
      // Add notification
      addNotification(error.message || 'Failed to process withdrawal. Please try again.', 'error');
      
      // Show toast
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleKijumbeContribute = async (groupId: string, amount: number): Promise<void> => {
    try {
      if (!user?.$id) {
        throw new Error('User not authenticated');
      }
      
      setIsRefreshing(true);
      
      // Create a kijumbe contribution transaction
      const transaction = await walletService.createTransaction(user.$id, {
        amount,
        type: 'kijumbe_contribution',
        status: 'completed',
        description: `Contribution to Kijumbe group: ${groupId}`,
        service: 'kijumbe',
        reference_id: groupId
      });
      
      if (!transaction) {
        throw new Error('Failed to process contribution');
      }
      
      // Refresh wallet data
      await fetchWalletData();
      
      // Add notification
      addNotification(`Umechangia ${formatCurrency(amount)} kwenye kikundi cha Kijumbe`, 'success');
      
      // Show toast
      toast({
        title: 'Contribution Successful',
        description: `You have successfully contributed ${formatCurrency(amount)} to Kijumbe group.`,
      });
      
      return;
    } catch (error: any) {
      console.error('Error contributing to Kijumbe group:', error);
      
      // Add notification
      addNotification(error.message || 'Failed to process contribution', 'error');
      
      // Show toast
      toast({
        title: 'Contribution Failed',
        description: error.message || 'Failed to process contribution',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleKijumbeWithdraw = async (groupId: string, amount: number) => {
    try {
      if (!user?.$id) {
        throw new Error('User not authenticated');
      }
      
      setIsRefreshing(true);
      
      // Create transaction using the service
      const transaction = await walletService.createTransaction(user.$id, {
        amount,
        type: 'kijumbe_payout',
        status: 'completed',
        description: `Mikopo ya Kijumbe - Kikundi: ${groupId}`,
        service: 'kijumbe',
        reference_id: groupId
      });
      
      if (!transaction) {
        throw new Error('Failed to process withdrawal');
      }
      
      // Refresh wallet data
      await fetchWalletData();
      
      // Add notification
      addNotification(`Umepewa mikopo ya ${formatCurrency(amount)} kutoka kikundi cha Kijumbe`, 'success');
      
      // Show toast
      toast({
        title: 'Kijumbe Withdrawal',
        description: `Umepewa mikopo ya ${formatCurrency(amount)} kutoka kikundi cha Kijumbe`
      });
    } catch (error: any) {
      console.error('Error withdrawing from Kijumbe group:', error);
      
      // Add notification
      addNotification(error.message || 'Failed to process withdrawal', 'error');
      
      // Show toast
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUtilityPayment = async (provider: string, amount: number, accountNumber: string): Promise<void> => {
    try {
      if (!user?.$id) {
        throw new Error('User not authenticated');
      }
      
      setIsRefreshing(true);
      
      // Check if wallet has enough balance
      if (wallet && wallet.balance < amount) {
        throw new Error('Insufficient balance for utility payment');
      }
      
      // Create a utility payment transaction
      const transaction = await walletService.createTransaction(user.$id, {
        amount,
        type: 'utility_payment',
        status: 'completed',
        description: `Payment to ${provider} - Account: ${accountNumber}`,
        service: 'utilities',
        reference_id: `${provider}_${accountNumber}`
      });
      
      if (!transaction) {
        throw new Error('Failed to process utility payment');
      }
      
      // Refresh wallet data
      await fetchWalletData();
      
      // Add notification
      addNotification(`Successfully paid ${formatCurrency(amount)} to ${provider}`, 'success');
      
      // Show toast
      toast({
        title: 'Payment Successful',
        description: `Successfully paid ${formatCurrency(amount)} to ${provider} for account ${accountNumber}.`,
      });
    } catch (error: any) {
      console.error('Error processing utility payment:', error);
      
      // Add notification
      addNotification(error.message || 'Failed to process utility payment', 'error');
      
      // Show toast
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to process utility payment',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateSettings = async (settings: {
    type: string;
    dailyLimit?: number;
    monthlyLimit?: number;
  }): Promise<void> => {
    try {
      if (!user?.$id || !wallet) {
        throw new Error('User not authenticated or wallet not found');
      }
      
      setIsRefreshing(true);
      
      // Update wallet settings
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (settings.dailyLimit !== undefined) {
        updateData.daily_limit = settings.dailyLimit;
      }
      
      if (settings.monthlyLimit !== undefined) {
        updateData.monthly_limit = settings.monthlyLimit;
      }
      
      // Update wallet document directly through the service
      await walletService.updateWalletSettings(wallet.$id, updateData);
      
      // Refresh wallet data
      await fetchWalletData();
      
      // Add notification
      addNotification('Mipangilio imesasishwa', 'success');
      
      // Show toast
      toast({
        title: 'Settings Updated',
        description: 'Your wallet settings have been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      
      // Add notification
      addNotification(error.message || 'Failed to update settings', 'error');
      
      // Show toast
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  if (walletLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-gray-900">
        <div className="text-center max-w-md">
          <WalletIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Ingia kwenye Akaunti Yako</h2>
          <p className="text-gray-300 mb-6">Tafadhali ingia ili uone akiba yako na kusimamia pesa zako.</p>
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1"
            >
              <svg 
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRefreshing ? 'Inasasishwa...' : 'Sasisha'}
            </button>
            <p className="text-xs mt-1">Ingia ili ufikie akiba yako ya kibinafsi</p>
          </div>
          <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center mx-auto">
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Nenda kwenye Ingia
          </button>
        </div>
      </div>
    );
  }

  const serviceCards = [
    {
      id: 'kijumbe',
      title: 'Kijumbe',
      subtitle: 'Mikopo ya Kikundi',
      icon: WalletIcon,
      color: 'bg-red-500',
      textColor: 'text-white',
      description: 'Jiunge na vikundi vya kijumbe na uweke pesa pamoja',
      features: ['Mikopo ya kikundi', 'Mikopo ya haraka', 'Ushirika wa kijumbe']
    },
    {
      id: 'utilities',
      title: 'Lipa Bili',
      subtitle: 'Malipo ya Huduma',
      icon: Zap,
      color: 'bg-green-500',
      textColor: 'text-white',
      description: 'Lipa bili za umeme, maji, na huduma zingine',
      features: ['TANESCO', 'DAWASCO', 'Vodacom', 'Airtel']
    },
    {
      id: 'transportation',
      title: 'Usafiri',
      subtitle: 'Malipo ya Usafiri',
      icon: Send,
      color: 'bg-orange-500',
      textColor: 'text-white',
      description: 'Lipa na usafiri wa mabasi, teksi, na huduma zingine',
      features: ['DART', 'Uber', 'Bolt', 'Mabasi ya Jiji']
    }
  ];

  const quickActions = [
    {
      id: 'lipa',
      title: 'Lipa',
      icon: WalletIcon,
      color: 'bg-red-500',
      action: () => setShowTopUpModal(true)
    },
    {
      id: 'tuma',
      title: 'Tuma Pesa',
      icon: Send,
      color: 'bg-blue-500',
      action: () => setShowSendModal(true)
    },
    {
      id: 'toa',
      title: 'Toa Pesa',
      icon: ArrowDownLeft,
      color: 'bg-orange-500',
      action: () => setShowReceiveModal(true)
    },
    {
      id: 'weka',
      title: 'Weka',
      icon: ArrowDownLeft,
      color: 'bg-green-500',
      action: () => setShowTopUpModal(true)
    },
    {
      id: 'lipa-bili',
      title: 'Lipa Bili',
      icon: Zap,
      color: 'bg-green-600',
      action: () => setShowUtilityModal(true)
    },
    {
      id: 'malamiko',
      title: 'Malamiko',
      icon: Bell,
      color: 'bg-red-600',
      action: () => addNotification('Mfumo wa malamiko utajengwa hivi karibuni')
    },
    {
      id: 'akanti',
      title: 'Akaunti Yangu',
      icon: Settings,
      color: 'bg-gray-600',
      action: () => setShowSettingsModal(true)
    },
    {
      id: 'historia',
      title: 'Historia',
      icon: History,
      color: 'bg-purple-500',
      action: () => setShowHistoryModal(true)
    },
    {
      id: 'kijumbe',
      title: 'Kijumbe',
      icon: WalletIcon,
      color: 'bg-red-600',
      action: () => navigate('/kijumbe')
    }
  ];

  return (
    <div className="h-full bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-gray-800 font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-white text-lg font-bold">Switch Wallet</h1>
              <p className="text-gray-300 text-sm">Karibu, {user?.email || 'Mtumiaji'}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              {showBalance ? <EyeOff className="w-5 h-5 text-gray-300" /> : <Eye className="w-5 h-5 text-gray-300" />}
            </button>
            {notifications.length > 0 && (
              <div className="relative">
                <Bell className="w-6 h-6 text-red-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Service Selection */}
        <div className="bg-red-600 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-4">
              {serviceCards.map((service) => (
                <label key={service.id} className="flex items-center">
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    checked={selectedService === service.id}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white font-medium">{service.title}</span>
                </label>
              ))}
            </div>
            <button className="text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-white text-sm mr-2">TZS</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
            </div>
            <div className="text-white text-sm">
              {selectedService === 'kijumbe' && 'Mikopo ya Kikundi'}
              {selectedService === 'utilities' && 'Malipo ya Huduma'}
              {selectedService === 'transportation' && 'Usafiri'}
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Akiba Yako</span>
            <span className="text-gray-300 text-sm">Kikomo cha Siku: {formatCurrency(wallet?.daily_limit || 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white text-3xl font-bold">
              {showBalance ? formatCurrency(wallet?.balance || 0) : '••••••'}
            </span>
            <div className="text-right">
              <div className="text-green-400 text-sm">✓ Akaunti Imethibitishwa</div>
              <div className="text-yellow-400 text-sm">⚠ PIN haijasasishwa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="p-4 space-y-4">
        {serviceCards.map((service) => (
          <button
            key={service.id}
            onClick={() => {
              if (service.id === 'kijumbe') {
                navigate('/kijumbe');
              } else if (service.id === 'utilities') {
                setShowUtilityModal(true);
              }
            }}
            className={`${service.color} rounded-lg p-4 w-full text-left ${selectedService === service.id ? 'ring-2 ring-white' : ''} hover:opacity-90 transition-opacity`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <service.icon className="w-8 h-8 text-white mr-3" />
                <div>
                  <h3 className={`text-xl font-bold ${service.textColor}`}>{service.title}</h3>
                  <p className={`text-sm ${service.textColor} opacity-90`}>{service.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${service.textColor}`}>
                  {wallet && wallet.serviceBalances && wallet.serviceBalances[service.id] ? 
                    formatCurrency(wallet.serviceBalances[service.id]) : 
                    formatCurrency(0)}
                </div>
                <div className={`text-sm ${service.textColor} opacity-90`}>
                  {service.id === 'kijumbe' && 'Mikopo ya Kikundi'}
                  {service.id === 'utilities' && 'Bili za Mwezi'}
                  {service.id === 'transportation' && 'Usafiri wa Mwezi'}
                </div>
              </div>
            </div>
            <p className={`text-sm ${service.textColor} opacity-90 mb-3`}>{service.description}</p>
            <div className="flex flex-wrap gap-2">
              {service.features.map((feature, index) => (
                <span key={index} className={`px-2 py-1 rounded-full text-xs ${service.textColor} bg-white bg-opacity-20`}>
                  {feature}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="p-4">
        <h2 className="text-white text-lg font-semibold mb-4">Vitendo vya Haraka</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`${action.color} rounded-lg p-4 text-white text-center hover:opacity-90 transition-opacity`}
            >
              <action.icon className="w-8 h-8 mx-auto mb-2" />
              <span className="text-xs font-medium">{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">Miamala ya Hivi Karibuni</h2>
            <Button 
              onClick={handleCreateWallet} 
              disabled={walletLoading} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {walletLoading ? 'Inaunda...' : 'Unda Pochi Yako Sasa'}
            </Button>
          </div>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 3).map((tx) => {
                const typeDisplay = getTransactionTypeDisplay(tx.type);
                const statusDisplay = getTransactionStatusDisplay(tx.status);
                return (
                  <div key={tx.$id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{typeDisplay.icon}</span>
                      <div>
                        <p className="text-white font-medium">{typeDisplay.label}</p>
                        <p className="text-gray-400 text-sm">{formatDate(tx.created_at)}</p>
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
              <p className="text-gray-400">Hakuna miamala ya hivi karibuni</p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-40">
          {notifications.map((notification) => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              {notification.message}
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
        onTopUp={(method: string, amount: number) => handleTopUp(amount, method)} 
        balance={wallet?.balance || 0} 
      />
      <WithdrawModal 
        isOpen={showWithdrawModal} 
        onClose={() => setShowWithdrawModal(false)} 
        onWithdraw={(amount: number, method: string) => handleWithdraw(amount, method)} 
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
        transactions={transactions.map(tx => ({
          ...tx,
          userId: tx.user_id,
          createdAt: tx.created_at
        }))}
        onLoadMore={() => loadMoreTransactions(Math.ceil(transactions.length / 20) + 1)}
        hasMore={transactions.length >= 20}
        isLoading={isRefreshing}
      />

      <UtilityPaymentsModal
        isOpen={showUtilityModal}
        onClose={() => setShowUtilityModal(false)}
        onPay={handleUtilityPayment}
        balance={wallet?.balance || 0}
      />

      <KijumbeModal
        isOpen={showKijumbeModal}
        onClose={() => setShowKijumbeModal(false)}
        onContribute={handleKijumbeContribute}
        onWithdraw={handleKijumbeWithdraw}
        balance={wallet?.balance || 0}
      />
    </div>
  );
};

export default WalletTanzania;
