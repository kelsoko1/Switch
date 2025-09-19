import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Contribution {
  amount: number;
  // Add other contribution properties as needed
}

interface FundCollection {
  id: string;
  title: string;
  target_amount: number;
  deadline?: string;
  contributions?: Contribution[];
}

interface ContributeModalProps {
  collection: FundCollection;
  onClose: () => void;
  onContributed: () => void;
}

const ContributeModal: React.FC<ContributeModalProps> = ({ collection, onClose, onContributed }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const totalCollected = collection.contributions?.reduce(
    (sum, contribution) => sum + contribution.amount,
    0
  ) || 0;
  const remaining = Math.max(0, collection.target_amount - totalCollected);
  const progress = Math.min(100, (totalCollected / collection.target_amount) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contributionAmount = parseFloat(amount);
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (contributionAmount > remaining) {
      setError(`Maximum remaining amount is $${remaining.toFixed(2)}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call to record contribution
      // await appwrite.createDocument('contributions', {
      //   collection_id: collection.id,
      //   amount: contributionAmount,
      //   message: message || null,
      //   user_id: currentUser?.$id,
      // });
      
      onContributed();
      onClose();
    } catch (err) {
      console.error('Error submitting contribution:', err);
      setError('Failed to process contribution. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-2">Contribute to {collection.title}</h2>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">
              ${totalCollected.toFixed(2)} raised of ${collection.target_amount.toFixed(2)}
            </span>
            <span className="text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-500 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          {collection.deadline && (
            <p className="text-sm text-gray-500 mt-1">
              Deadline: {new Date(collection.deadline).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={`0.00 (max $${remaining.toFixed(2)})`}
                min="0.01"
                max={remaining}
                step="0.01"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maximum: ${remaining.toFixed(2)} remaining
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Add a note with your contribution..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Contribute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributeModal;
