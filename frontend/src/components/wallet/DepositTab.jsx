import { useState, useEffect } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const DepositTab = () => {
  const { 
    paymentMethods, 
    loading, 
    error, 
    deposit, 
    formatCurrency,
    fetchPaymentMethods 
  } = useWallet()

  const [selectedMethod, setSelectedMethod] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentData, setPaymentData] = useState({})
  const [step, setStep] = useState(1) // 1: method, 2: details, 3: confirmation
  const [depositResult, setDepositResult] = useState(null)

  useEffect(() => {
    if (!paymentMethods) {
      fetchPaymentMethods()
    }
  }, [paymentMethods, fetchPaymentMethods])

  const handleMethodSelect = (method) => {
    setSelectedMethod(method)
    setPaymentData({})
    setStep(2)
  }

  const handlePaymentDataChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDeposit = async () => {
    if (!amount || !selectedMethod) return

    const result = await deposit(parseFloat(amount), selectedMethod, paymentData)
    setDepositResult(result)
    
    if (result.success) {
      setStep(3)
    }
  }

  const getMethodIcon = (method) => {
    switch (method) {
      case 'mobile_money':
        return <Smartphone className="h-6 w-6" />
      case 'bank_transfer':
        return <Building2 className="h-6 w-6" />
      case 'card':
        return <CreditCard className="h-6 w-6" />
      default:
        return <CreditCard className="h-6 w-6" />
    }
  }

  const getMethodName = (method) => {
    switch (method) {
      case 'mobile_money':
        return 'Mobile Money'
      case 'bank_transfer':
        return 'Bank Transfer'
      case 'card':
        return 'Card Payment'
      default:
        return method
    }
  }

  const renderPaymentForm = () => {
    switch (selectedMethod) {
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
                value={paymentData.phoneNumber || ''}
                onChange={(e) => handlePaymentDataChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <select
                value={paymentData.provider || ''}
                onChange={(e) => handlePaymentDataChange('provider', e.target.value)}
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
                value={paymentData.bankCode || ''}
                onChange={(e) => handlePaymentDataChange('bankCode', e.target.value)}
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
                value={paymentData.accountNumber || ''}
                onChange={(e) => handlePaymentDataChange('accountNumber', e.target.value)}
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
                value={paymentData.accountName || ''}
                onChange={(e) => handlePaymentDataChange('accountName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="Full name"
                value={paymentData.name || ''}
                onChange={(e) => handlePaymentDataChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                value={paymentData.email || ''}
                onChange={(e) => handlePaymentDataChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+255 123 456 789"
                value={paymentData.phoneNumber || ''}
                onChange={(e) => handlePaymentDataChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (step === 1) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Select Payment Method</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods && Object.entries(paymentMethods).map(([key, method]) => (
            <button
              key={key}
              onClick={() => handleMethodSelect(key)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{method.icon}</span>
                <h4 className="font-medium text-gray-900">{method.name}</h4>
              </div>
              <p className="text-sm text-gray-500">
                {method.providers.slice(0, 2).join(', ')}
                {method.providers.length > 2 && ` +${method.providers.length - 2} more`}
              </p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setStep(1)}
            className="mr-4 text-gray-400 hover:text-gray-600"
          >
            ← Back
          </button>
          <div className="flex items-center">
            {getMethodIcon(selectedMethod)}
            <h3 className="text-lg font-medium text-gray-900 ml-3">
              {getMethodName(selectedMethod)} Deposit
            </h3>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (TZS)
            </label>
            <input
              type="number"
              min="1000"
              step="100"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum deposit: {formatCurrency(1000)}
            </p>
          </div>

          {renderPaymentForm()}

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

          <button
            onClick={handleDeposit}
            disabled={loading || !amount || !selectedMethod}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                Deposit {formatCurrency(amount || 0)}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {depositResult?.success ? (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Deposit Initiated Successfully
            </h3>
            <p className="text-gray-600 mb-6">
              Your deposit of {formatCurrency(amount)} has been initiated. 
              {depositResult.data?.paymentUrl && (
                <span> Please complete the payment using the link below.</span>
              )}
            </p>
            
            {depositResult.data?.paymentUrl && (
              <a
                href={depositResult.data.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Complete Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            )}

            <button
              onClick={() => {
                setStep(1)
                setAmount('')
                setPaymentData({})
                setDepositResult(null)
              }}
              className="ml-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Make Another Deposit
            </button>
          </div>
        ) : (
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Deposit Failed
            </h3>
            <p className="text-gray-600 mb-6">
              {depositResult?.message || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={() => {
                setStep(1)
                setAmount('')
                setPaymentData({})
                setDepositResult(null)
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

  return null
}

export default DepositTab
