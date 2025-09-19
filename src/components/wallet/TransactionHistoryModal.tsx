import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Download, Calendar, ArrowUpDown } from 'lucide-react';

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

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onLoadMore,
  hasMore,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

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
      hour: '2-digit',
      minute: '2-digit',
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

  // Filter and sort transactions
  useEffect(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Status'],
      ...filteredTransactions.map(tx => [
        formatDate(tx.createdAt),
        getTransactionTypeDisplay(tx.type).label,
        tx.description,
        formatCurrency(tx.amount),
        getTransactionStatusDisplay(tx.status).label,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportTransactions}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="transfer">Transfer</option>
                  <option value="utility_payment">Utility Payment</option>
                  <option value="kijumbe_contribution">Kijumbe Contribution</option>
                  <option value="kijumbe_payout">Kijumbe Payout</option>
                  <option value="transportation">Transportation</option>
                  <option value="investment">Investment</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="type">Type</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                </button>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const typeDisplay = getTransactionTypeDisplay(tx.type);
                const statusDisplay = getTransactionStatusDisplay(tx.status);
                return (
                  <div key={tx.$id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <span className="text-2xl mr-4">{typeDisplay.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{typeDisplay.label}</p>
                        <p className="text-sm text-gray-500">{tx.description}</p>
                        <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
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
              })
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found</p>
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? (
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
                ) : null}
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredTransactions.filter(tx => tx.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
