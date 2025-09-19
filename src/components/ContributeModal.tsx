import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { GroupManager, type FundCollection } from '../lib/groups';

interface ContributeModalProps {
  collection: FundCollection;
  onClose: () => void;
  onContributed?: () => void;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  collection,
  onClose,
  onContributed,
}) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const remainingAmount = collection.target_amount - (collection.total_collected ?? 0);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      setIsLoading(true);
      const groupManager = new GroupManager();
      await groupManager.contribute(collection.id, parseFloat(amount));
      onContributed?.();
      onClose();
    } catch (error) {
      console.error('Failed to contribute:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contribute to Fund</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-1">{collection.title}</h3>
            {collection.description && (
              <p className="text-gray-600 mb-4">{collection.description}</p>
            )}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Target Amount:</span>
                <span className="font-semibold">
                  ${collection.target_amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-semibold">${remainingAmount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((collection.total_collected ?? 0) / collection.target_amount) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contribution Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Contributing...' : 'Contribute'}
          </button>
        </div>
      </div>
    </div>
  );
};