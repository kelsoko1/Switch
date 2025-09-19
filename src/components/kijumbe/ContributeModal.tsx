import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, Check, Plus } from 'lucide-react';
import { formatCurrency, validateCurrencyInput, KIJUMBE_AMOUNTS } from '../../utils/currency';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContribute: (amount: number, description: string) => Promise<void>;
  groupName: string;
  contributionAmount: number;
  balance: number;
}

const ContributeModal: React.FC<ContributeModalProps> = ({ 
  isOpen, 
  onClose, 
  onContribute, 
  groupName, 
  contributionAmount,
  balance 
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = [contributionAmount, contributionAmount * 2, contributionAmount * 3, ...KIJUMBE_AMOUNTS];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateCurrencyInput(amount, 1000, balance);
    if (!validation.isValid) {
      setError(validation.error || 'Kiasi si sahihi');
      return;
    }

    const amountNum = validation.amount;

    setIsLoading(true);
    try {
      await onContribute(amountNum, description || `Mchango wa ${groupName}`);
      setAmount('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Imeshindwa kuongeza mchango');
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
          <h2 className="text-xl font-bold text-gray-900">Weka Mchango</h2>
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

          {/* Group Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Kikundi: {groupName}</h3>
            <p className="text-sm text-gray-600">
              Kiasi cha kawaida: {formatCurrency(contributionAmount)}
            </p>
            <p className="text-sm text-gray-600">
              Akiba yako: {formatCurrency(balance)}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kiasi cha Mchango (TZS)
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
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ingiza kiasi"
                min="1000"
                step="1000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maelezo (Si lazima)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mchango wa mwezi wa Januari..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Muhtasari wa Mchango</h3>
            <div className="space-y-2">
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
              disabled={isLoading || !amount}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Weka Mchango
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributeModal;
