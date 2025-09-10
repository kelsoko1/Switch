import { useState, useEffect } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { useAuth } from '../../contexts/AuthContext'
import { walletAPI } from '../../services/api'
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
  AlertCircle
} from 'lucide-react'

// Import the tab components
import DepositTab from '../../components/wallet/DepositTab'
import WithdrawTab from '../../components/wallet/WithdrawTab'
import HistoryTab from '../../components/wallet/HistoryTab'
import SettingsTab from '../../components/wallet/SettingsTab'
import ContributionsTab from '../../components/wallet/ContributionsTab'
import SavingsGoalsTab from '../../components/wallet/SavingsGoalsTab'

const MemberWallet = () => {
  const { user } = useAuth()
  const { 
    wallet, 
    stats, 
    loading, 
    error, 
    fetchWallet, 
    fetchStats,
    formatCurrency,
    formatDate,
    getTransactionTypeDisplay,
    getTransactionStatusDisplay
  } = useWallet()

  const [activeTab, setActiveTab] = useState('overview')
  const [recentTransactions, setRecentTransactions] = useState([])

  useEffect(() => {
    if (wallet) {
      fetchRecentTransactions()
    }
  }, [wallet])

  const fetchRecentTransactions = async () => {
    try {
      const response = await walletAPI.getTransactions(1, 5)
      if (response) {
        setRecentTransactions(response.transactions)
      }
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error)
    }
  }

  if (loading && !wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading wallet</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchWallet}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet found</h3>
          <p className="mt-1 text-sm text-gray-500">We couldn't find a wallet for your account.</p>
          <div className="mt-6">
            <button
              onClick={fetchWallet}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Wallet
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Savings Wallet</h1>
        <p className="mt-2 text-gray-600">Manage your personal savings and group contributions</p>
      </div>

      {/* Wallet Overview Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium opacity-90">Savings Balance</h2>
            <p className="text-3xl font-bold mt-2">{formatCurrency(wallet.balance)}</p>
            <p className="text-sm opacity-75 mt-1">Available for savings and contributions</p>
          </div>
          <div className="text-right">
            <WalletIcon className="h-12 w-12 opacity-50" />
            <p className="text-sm opacity-75 mt-2">
              {wallet.pin_set ? '🔒 Secured' : '⚠️ PIN not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <WalletIcon className="h-5 w-5 mr-2" />
                Overview
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('deposit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deposit'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ArrowDownLeft className="h-5 w-5 mr-2" />
                Add Money
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('contributions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contributions'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Group Contributions
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('savings-goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'savings-goals'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                My Goals
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'withdraw'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ArrowUpRight className="h-5 w-5 mr-2" />
                Withdraw
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                History
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Quick Actions - Only show for overview tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setActiveTab('deposit')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <ArrowDownLeft className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Add Money</h3>
                <p className="text-sm text-gray-500">Fund your savings</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('contributions')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Contributions</h3>
                <p className="text-sm text-gray-500">Group savings</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('savings-goals')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">My Goals</h3>
                <p className="text-sm text-gray-500">Personal targets</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <ArrowUpRight className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Withdraw</h3>
                <p className="text-sm text-gray-500">Access funds</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Saved</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.totalDepositAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Group Contributions</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.totalDepositAmount * 0.3)} {/* Mock data */}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-full">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Goals Progress</p>
                <p className="text-lg font-semibold text-gray-900">
                  75% {/* Mock data */}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.totalDepositAmount * 0.1)} {/* Mock data */}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => {
                const typeDisplay = getTransactionTypeDisplay(transaction.type)
                const statusDisplay = getTransactionStatusDisplay(transaction.status)
                
                return (
                  <div key={transaction.$id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{typeDisplay.icon}</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {typeDisplay.label}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          transaction.type === 'deposit' || transaction.type === 'refund' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                          {statusDisplay.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-8 text-center">
                <History className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">Start by adding money to your savings wallet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'deposit' && (
        <div className="mt-8">
          <DepositTab />
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="mt-8">
          <WithdrawTab />
        </div>
      )}

      {activeTab === 'contributions' && (
        <div className="mt-8">
          <ContributionsTab />
        </div>
      )}

      {activeTab === 'savings-goals' && (
        <div className="mt-8">
          <SavingsGoalsTab />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="mt-8">
          <HistoryTab />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="mt-8">
          <SettingsTab />
        </div>
      )}
    </div>
  )
}

export default MemberWallet
