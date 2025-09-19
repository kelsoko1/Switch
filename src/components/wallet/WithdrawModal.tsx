import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building2, AlertCircle, Check } from 'lucide-react';
import { formatCurrency, validateCurrencyInput, UTILITY_AMOUNTS } from '../../utils/currency';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, method: string) => Promise<void>;
  balance: number;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onWithdraw, balance }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const withdrawalMethods = [
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'Vodacom M-Pesa, Airtel Money, Tigo Pesa',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Building2,
      description: 'Direct bank transfer',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
    },
  ];

  const quickAmounts = UTILITY_AMOUNTS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedMethod) {
      setError('Please select a withdrawal method');
      return;
    }

    const validation = validateCurrencyInput(amount, 1000, balance);
    if (!validation.isValid) {
      setError(validation.error || 'Kiasi si sahihi');
      return;
    }

    const amountNum = validation.amount;

    if (amountNum > balance) {
      setError('Insufficient balance for this withdrawal');
      return;
    }

    setIsLoading(true);
    try {
      await onWithdraw(amountNum, selectedMethod);
      // Reset form
      setAmount('');
      setSelectedMethod('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process withdrawal');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Current Balance */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Balance:</span>
              <span className="font-bold text-lg text-gray-900">{formatCurrency(balance)}</span>
            </div>
          </div>

          {/* Withdrawal Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Withdrawal Method
            </label>
            <div className="space-y-2">
              {withdrawalMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-colors ${
                      selectedMethod === method.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${method.bgColor}`}>
                        <Icon className={`w-5 h-5 ${method.color}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                      {selectedMethod === method.id && (
                        <Check className="w-5 h-5 text-purple-500 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amount (TZS)
            </label>
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={quickAmount > balance}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    amount === quickAmount.toString()
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : quickAmount > balance
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {formatCurrency(quickAmount)}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter custom amount"
              min="1000"
              max={balance.toString()}
              step="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Min: TZS 1,000 • Max: {formatCurrency(balance)}
            </p>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Transaction Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Withdrawal Amount:</span>
                <span className="font-medium">
                  {amount ? formatCurrency(parseFloat(amount) || 0) : 'TZS 0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="font-medium">TZS 0.00</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Total to Receive:</span>
                <span className="font-bold text-lg">
                  {amount ? formatCurrency(parseFloat(amount) || 0) : 'TZS 0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Remaining Balance:</span>
                <span className="font-bold text-lg">
                  {amount ? formatCurrency(balance - (parseFloat(amount) || 0)) : formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !amount || !selectedMethod}
            className={`w-full py-3 rounded-lg font-medium ${
              isLoading || !amount || !selectedMethod
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isLoading ? 'Processing...' : 'Withdraw Funds'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
