import { useState } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { 
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'

const WithdrawTab = () => {
  const { 
    wallet, 
    loading, 
    error, 
    withdraw, 
    formatCurrency,
    setError 
  } = useWallet()

  const [amount, setAmount] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [withdrawalMethod, setWithdrawalMethod] = useState('mobile_money')
  const [withdrawalData, setWithdrawalData] = useState({})
  const [withdrawResult, setWithdrawResult] = useState(null)

  const handleWithdraw = async () => {
    if (!amount || !pin) return

    const result = await withdraw(parseFloat(amount), pin, {
      method: withdrawalMethod,
      ...withdrawalData
    })
    
    setWithdrawResult(result)
  }

  const handleWithdrawalDataChange = (field, value) => {
    setWithdrawalData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderWithdrawalForm = () => {
    switch (withdrawalMethod) {
      case 'mobile_money':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+255 123 456 789"
                value={withdrawalData.phoneNumber || ''}
                onChange={(e) => handleWithdrawalDataChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <select
                value={withdrawalData.provider || ''}
                onChange={(e) => handleWithdrawalDataChange('provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select provider</option>
                <option value="mpesa">Vodacom M-Pesa</option>
                <option value="airtel">Airtel Money</option>
                <option value="tigo">Tigo Pesa</option>
                <option value="halopesa">HaloPesa</option>
              </select>
            </div>
          </div>
        )

      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank
              </label>
              <select
                value={withdrawalData.bankCode || ''}
                onChange={(e) => handleWithdrawalDataChange('bankCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select bank</option>
                <option value="CRDB">CRDB Bank</option>
                <option value="NMB">NMB Bank</option>
                <option value="EQUITY">Equity Bank</option>
                <option value="EXIM">Exim Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                placeholder="Account number"
                value={withdrawalData.accountNumber || ''}
                onChange={(e) => handleWithdrawalDataChange('accountNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                placeholder="Account holder name"
                value={withdrawalData.accountName || ''}
                onChange={(e) => handleWithdrawalDataChange('accountName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (withdrawResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {withdrawResult.success ? (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Withdrawal Successful
            </h3>
            <p className="text-gray-600 mb-4">
              Your withdrawal of {formatCurrency(amount)} has been processed successfully.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                New balance: <span className="font-medium">{formatCurrency(withdrawResult.data?.newBalance || 0)}</span>
              </p>
            </div>
            <button
              onClick={() => {
                setAmount('')
                setPin('')
                setWithdrawalData({})
                setWithdrawResult(null)
                setError(null)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Make Another Withdrawal
            </button>
          </div>
        ) : (
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Withdrawal Failed
            </h3>
            <p className="text-gray-600 mb-6">
              {withdrawResult.message || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={() => {
                setWithdrawResult(null)
                setError(null)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <ArrowUpRight className="h-6 w-6 text-red-600 mr-3" />
        <h3 className="text-lg font-medium text-gray-900">Withdraw Funds</h3>
      </div>

      <div className="space-y-6">
        {/* Balance Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Available Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(wallet?.balance || 0)}
          </p>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (TZS)
          </label>
          <input
            type="number"
            min="1000"
            max={wallet?.balance || 0}
            step="100"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Minimum withdrawal: {formatCurrency(1000)}
          </p>
        </div>

        {/* Withdrawal Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setWithdrawalMethod('mobile_money')}
              className={`p-3 border rounded-lg text-left ${
                withdrawalMethod === 'mobile_money'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-2">📱</span>
                <div>
                  <p className="font-medium text-gray-900">Mobile Money</p>
                  <p className="text-sm text-gray-500">M-Pesa, Airtel, etc.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setWithdrawalMethod('bank_transfer')}
              className={`p-3 border rounded-lg text-left ${
                withdrawalMethod === 'bank_transfer'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-2">🏦</span>
                <div>
                  <p className="font-medium text-gray-900">Bank Transfer</p>
                  <p className="text-sm text-gray-500">Direct to account</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Withdrawal Details */}
        {renderWithdrawalForm()}

        {/* PIN Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet PIN
          </label>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              placeholder="Enter your 4-6 digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength="6"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPin ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {!wallet?.pin_set && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ You need to set a PIN before making withdrawals
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={loading || !amount || !pin || !wallet?.pin_set}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              Withdraw {formatCurrency(amount || 0)}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>

        {/* Limits Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Withdrawal Limits</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>Daily limit: {formatCurrency(wallet?.daily_limit || 0)}</p>
            <p>Monthly limit: {formatCurrency(wallet?.monthly_limit || 0)}</p>
            <p>Daily remaining: {formatCurrency((wallet?.daily_limit || 0) - (wallet?.daily_spent || 0))}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WithdrawTab
