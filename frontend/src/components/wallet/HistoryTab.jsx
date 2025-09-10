import { useState, useEffect } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { 
  History, 
  Filter, 
  Search,
  Download,
  ArrowUpDown,
  Calendar
} from 'lucide-react'

const HistoryTab = () => {
  const { 
    transactions, 
    loading, 
    error, 
    fetchTransactions,
    formatCurrency,
    formatDate,
    getTransactionTypeDisplay,
    getTransactionStatusDisplay
  } = useWallet()

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedType, setSelectedType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('DESC')

  const transactionTypes = [
    { value: '', label: 'All Transactions' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'transfer', label: 'Transfers' },
    { value: 'payment', label: 'Payments' },
    { value: 'refund', label: 'Refunds' },
    { value: 'fee', label: 'Fees' }
  ]

  useEffect(() => {
    loadTransactions()
  }, [currentPage, selectedType, sortBy, sortOrder])

  const loadTransactions = async () => {
    const result = await fetchTransactions(currentPage, 20, selectedType || null)
    if (result) {
      setTotalPages(Math.ceil(result.total / 20))
    }
  }

  const handleTypeFilter = (type) => {
    setSelectedType(type)
    setCurrentPage(1)
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(field)
      setSortOrder('DESC')
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true
    return (
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Status', 'Reference'],
      ...filteredTransactions.map(t => [
        formatDate(t.created_at),
        t.type,
        t.description,
        t.amount,
        t.status,
        t.reference
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <History className="h-6 w-6 text-gray-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
          </div>
          <button
            onClick={exportTransactions}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="sm:w-48">
            <select
              value={selectedType}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {transactionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_at-DESC">Newest First</option>
              <option value="created_at-ASC">Oldest First</option>
              <option value="amount-DESC">Amount: High to Low</option>
              <option value="amount-ASC">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => {
            const typeDisplay = getTransactionTypeDisplay(transaction.type)
            const statusDisplay = getTransactionStatusDisplay(transaction.status)
            
            return (
              <div key={transaction.$id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{typeDisplay.icon}</span>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {typeDisplay.label}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                          {statusDisplay.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {transaction.description}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(transaction.created_at)}
                        {transaction.reference && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Ref: {transaction.reference}</span>
                          </>
                        )}
                      </div>
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
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="px-6 py-8 text-center">
            <History className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by making your first transaction.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-t border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryTab
