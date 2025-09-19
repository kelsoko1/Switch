import React, { useState } from 'react';
import { X, Zap, Droplets, Wifi, Phone, CreditCard, AlertCircle, Check } from 'lucide-react';
import { formatCurrency, validateCurrencyInput, UTILITY_AMOUNTS } from '../../utils/currency';

interface UtilityPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: (provider: string, amount: number, accountNumber: string) => Promise<void>;
  balance: number;
}

const UtilityPaymentsModal: React.FC<UtilityPaymentsModalProps> = ({ isOpen, onClose, onPay, balance }) => {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const utilityProviders = [
    {
      id: 'tanesco',
      name: 'TANESCO',
      description: 'Umeme wa Taifa',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-100',
      minAmount: 1000,
      maxAmount: 500000,
    },
    {
      id: 'dawasco',
      name: 'DAWASCO',
      description: 'Maji ya Jiji la Dar es Salaam',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      minAmount: 500,
      maxAmount: 200000,
    },
    {
      id: 'vodacom',
      name: 'Vodacom',
      description: 'Simu na Internet',
      icon: Phone,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      minAmount: 100,
      maxAmount: 100000,
    },
    {
      id: 'airtel',
      name: 'Airtel',
      description: 'Simu na Internet',
      icon: Phone,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      minAmount: 100,
      maxAmount: 100000,
    },
    {
      id: 'halotel',
      name: 'Halotel',
      description: 'Simu na Internet',
      icon: Phone,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      minAmount: 100,
      maxAmount: 100000,
    },
    {
      id: 'ttcl',
      name: 'TTCL',
      description: 'Simu na Internet',
      icon: Wifi,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      minAmount: 100,
      maxAmount: 100000,
    },
  ];

  const quickAmounts = UTILITY_AMOUNTS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProvider) {
      setError('Tafadhali chagua mtoa huduma');
      return;
    }

    if (!accountNumber.trim()) {
      setError('Tafadhali ingiza nambari ya akaunti');
      return;
    }

    const provider = utilityProviders.find(p => p.id === selectedProvider);
    const minAmount = provider?.minAmount || 1000;
    const maxAmount = provider?.maxAmount || 100000;
    
    const validation = validateCurrencyInput(amount, minAmount, maxAmount);
    if (!validation.isValid) {
      setError(validation.error || 'Kiasi si sahihi');
      return;
    }

    const amountNum = validation.amount;
    if (amountNum > balance) {
      setError('Akiba haitoshi');
      return;
    }

    setIsLoading(true);
    try {
      await onPay(selectedProvider, amountNum, accountNumber);
      // Reset form
      setAccountNumber('');
      setAmount('');
      setSelectedProvider('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Imeshindwa kulipa bili');
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
          <h2 className="text-xl font-bold text-gray-900">Lipa Bili</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chagua Mtoa Huduma
            </label>
            <div className="grid grid-cols-2 gap-2">
              {utilityProviders.map((provider) => {
                const Icon = provider.icon;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedProvider === provider.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${provider.bgColor}`}>
                        <Icon className={`w-5 h-5 ${provider.color}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">{provider.name}</p>
                        <p className="text-xs text-gray-500">{provider.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nambari ya Akaunti
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Ingiza nambari ya akaunti"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kiasi (TZS)
            </label>
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    amount === quickAmount.toString()
                      ? 'border-red-500 bg-red-50 text-red-700'
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
              placeholder="Ingiza kiasi"
              min="100"
              max="500000"
              step="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Akiba: {formatCurrency(balance)}
            </p>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Muhtasari wa Malipo</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mtoa Huduma:</span>
                <span className="font-medium">
                  {utilityProviders.find(p => p.id === selectedProvider)?.name || 'Chagua mtoa huduma'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kiasi:</span>
                <span className="font-medium">
                  {amount ? formatCurrency(parseFloat(amount) || 0) : 'TZS 0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ada ya Ushindani:</span>
                <span className="font-medium">TZS 0.00</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Jumla:</span>
                <span className="font-bold text-lg">
                  {amount ? formatCurrency(parseFloat(amount) || 0) : 'TZS 0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ghairi
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedProvider || !amount || !accountNumber}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Lipa Bili
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UtilityPaymentsModal;
