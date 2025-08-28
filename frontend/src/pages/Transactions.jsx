import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import api from '../services/api';

const Transactions = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions/my-transactions');
      setTransactions(response.data.transactions || []);
    } catch (error) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'contribution': return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'payout': return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
      case 'penalty': return <ArrowDownLeft className="w-5 h-5 text-red-600" />;
      default: return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'contribution': return 'text-green-600';
      case 'payout': return 'text-blue-600';
      case 'penalty': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchTransactions}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Transactions</h1>
        <p className="text-gray-600">View your financial activity across all groups</p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600">Your transaction history will appear here once you start contributing to groups</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction.$id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{transaction.type}</h3>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                        {transaction.group_name && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {transaction.group_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      TZS {transaction.amount?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
