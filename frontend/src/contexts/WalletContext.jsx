import { createContext, useContext, useState, useEffect } from 'react'
import { walletAPI } from '../services/api'
import { useAuth } from './AuthContext'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const { user, token } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState(null)
  const [savingsGoals, setSavingsGoals] = useState([])
  const [contributions, setContributions] = useState([])
  const [groupPayments, setGroupPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch wallet data
  const fetchWallet = async () => {
    if (!user || !token) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await walletAPI.getWallet()
      setWallet(response.data.data.wallet)
    } catch (error) {
      console.error('Failed to fetch wallet:', error)
      setError(error.response?.data?.message || 'Failed to fetch wallet')
    } finally {
      setLoading(false)
    }
  }

  // Fetch wallet statistics
  const fetchStats = async () => {
    if (!user || !token) return
    
    try {
      const response = await walletAPI.getStats()
      setStats(response.data.data.stats)
    } catch (error) {
      console.error('Failed to fetch wallet stats:', error)
    }
  }

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    if (!user || !token) return
    
    try {
      const response = await walletAPI.getPaymentMethods()
      setPaymentMethods(response.data.data.paymentMethods)
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
    }
  }

  // Fetch transactions
  const fetchTransactions = async (page = 1, limit = 20, type = null) => {
    try {
      setLoading(true)
      const response = await walletAPI.getTransactions(page, limit, type)
      setTransactions(response.data.data.transactions)
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setError(error.response?.data?.message || 'Failed to fetch transactions')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Set wallet PIN
  const setPin = async (pin, confirmPin) => {
    try {
      setLoading(true)
      setError(null)
      const response = await walletAPI.setPin(pin, confirmPin)
      await fetchWallet() // Refresh wallet data
      return { success: true, message: response.data.message }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to set PIN'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Verify wallet PIN
  const verifyPin = async (pin) => {
    try {
      const response = await walletAPI.verifyPin(pin)
      return { success: response.data.success, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to verify PIN' 
      }
    }
  }

  // Process deposit
  const deposit = async (amount, paymentMethod, paymentData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await walletAPI.deposit(amount, paymentMethod, paymentData)
      await fetchWallet() // Refresh wallet data
      await fetchStats() // Refresh stats
      return { 
        success: true, 
        data: response.data.data,
        message: response.data.message 
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to process deposit'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Process withdrawal
  const withdraw = async (amount, pin, withdrawalData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await walletAPI.withdraw(amount, pin, withdrawalData)
      await fetchWallet() // Refresh wallet data
      await fetchStats() // Refresh stats
      return { 
        success: true, 
        data: response.data.data,
        message: response.data.message 
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to process withdrawal'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Verify payment
  const verifyPayment = async (orderId) => {
    try {
      const response = await walletAPI.verifyPayment(orderId)
      if (response.data.success) {
        await fetchWallet() // Refresh wallet data
        await fetchStats() // Refresh stats
      }
      return response.data
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to verify payment' 
      }
    }
  }

  // Format currency
  const formatCurrency = (amount, currency = 'TZS') => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get transaction type display
  const getTransactionTypeDisplay = (type) => {
    const types = {
      deposit: { label: 'Deposit', color: 'text-green-600', icon: '↗️' },
      withdrawal: { label: 'Withdrawal', color: 'text-red-600', icon: '↙️' },
      transfer: { label: 'Transfer', color: 'text-blue-600', icon: '↔️' },
      payment: { label: 'Payment', color: 'text-orange-600', icon: '💳' },
      refund: { label: 'Refund', color: 'text-green-600', icon: '↩️' },
      fee: { label: 'Fee', color: 'text-gray-600', icon: '💰' }
    }
    return types[type] || { label: type, color: 'text-gray-600', icon: '📄' }
  }

  // Get transaction status display
  const getTransactionStatusDisplay = (status) => {
    const statuses = {
      pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-100' },
      failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-100' },
      cancelled: { label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-100' }
    }
    return statuses[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-100' }
  }

  // Fetch savings goals
  const fetchSavingsGoals = async () => {
    try {
      // This would be a new API endpoint
      // const response = await walletAPI.getSavingsGoals()
      // setSavingsGoals(response.data.data.goals)
    } catch (error) {
      console.error('Failed to fetch savings goals:', error)
    }
  }

  // Fetch contributions
  const fetchContributions = async () => {
    try {
      // This would be a new API endpoint
      // const response = await walletAPI.getContributions()
      // setContributions(response.data.data.contributions)
    } catch (error) {
      console.error('Failed to fetch contributions:', error)
    }
  }

  // Fetch group payments
  const fetchGroupPayments = async () => {
    try {
      // This would be a new API endpoint
      // const response = await walletAPI.getGroupPayments()
      // setGroupPayments(response.data.data.payments)
    } catch (error) {
      console.error('Failed to fetch group payments:', error)
    }
  }

  // Create savings goal
  const createSavingsGoal = async (goalData) => {
    try {
      setLoading(true)
      setError(null)
      // This would be a new API endpoint
      // const response = await walletAPI.createSavingsGoal(goalData)
      await fetchSavingsGoals()
      return { success: true, message: 'Savings goal created successfully' }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create savings goal'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Update savings goal
  const updateSavingsGoal = async (goalId, goalData) => {
    try {
      setLoading(true)
      setError(null)
      // This would be a new API endpoint
      // const response = await walletAPI.updateSavingsGoal(goalId, goalData)
      await fetchSavingsGoals()
      return { success: true, message: 'Savings goal updated successfully' }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update savings goal'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Delete savings goal
  const deleteSavingsGoal = async (goalId) => {
    try {
      setLoading(true)
      setError(null)
      // This would be a new API endpoint
      // const response = await walletAPI.deleteSavingsGoal(goalId)
      await fetchSavingsGoals()
      return { success: true, message: 'Savings goal deleted successfully' }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete savings goal'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Make group contribution
  const makeContribution = async (groupId, amount) => {
    try {
      setLoading(true)
      setError(null)
      // This would be a new API endpoint
      // const response = await walletAPI.makeContribution(groupId, amount)
      await fetchWallet() // Refresh wallet data
      await fetchContributions()
      return { success: true, message: 'Contribution made successfully' }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to make contribution'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Process group payment (Kiongozi only)
  const processGroupPayment = async (paymentData) => {
    try {
      setLoading(true)
      setError(null)
      // This would be a new API endpoint
      // const response = await walletAPI.processGroupPayment(paymentData)
      await fetchGroupPayments()
      return { success: true, message: 'Payment processed successfully' }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to process payment'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Initialize wallet data only when user is authenticated
  useEffect(() => {
    if (user && token) {
      fetchWallet()
      fetchStats()
      fetchPaymentMethods()
      fetchSavingsGoals()
      fetchContributions()
      fetchGroupPayments()
    }
  }, [user, token])

  const value = {
    wallet,
    transactions,
    stats,
    paymentMethods,
    savingsGoals,
    contributions,
    groupPayments,
    loading,
    error,
    fetchWallet,
    fetchStats,
    fetchPaymentMethods,
    fetchTransactions,
    fetchSavingsGoals,
    fetchContributions,
    fetchGroupPayments,
    setPin,
    verifyPin,
    deposit,
    withdraw,
    verifyPayment,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    makeContribution,
    processGroupPayment,
    formatCurrency,
    formatDate,
    getTransactionTypeDisplay,
    getTransactionStatusDisplay,
    setError
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
