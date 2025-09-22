import React, { useState } from 'react';
import { X, Users, Calendar, DollarSign, AlertCircle, Check, UserPlus } from 'lucide-react';
import { formatCurrency, validateCurrencyInput } from '../../utils/currency';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: {
    name: string;
    description: string;
    contributionAmount: number;
    rotationDuration: number;
    maxMembers: number;
  }) => Promise<void>;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateGroup
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [rotationDuration, setRotationDuration] = useState('30');
  const [maxMembers, setMaxMembers] = useState('5');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const quickAmounts = [5000, 10000, 15000, 25000, 50000];
  const durationOptions = [
    { value: '7', label: 'Kila wiki' },
    { value: '14', label: 'Kila wiki mbili' },
    { value: '30', label: 'Kila mwezi' },
    { value: '90', label: 'Kila miezi mitatu' },
    { value: '180', label: 'Kila miezi sita' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Tafadhali ingiza jina la kikundi');
      return;
    }

    const validation = validateCurrencyInput(contributionAmount, 1000);
    if (!validation.isValid) {
      setError(validation.error || 'Kiasi si sahihi');
      return;
    }

    const amountNum = validation.amount;
    const maxMembersNum = parseInt(maxMembers, 10);
    const rotationDurationNum = parseInt(rotationDuration, 10);

    if (maxMembersNum < 2 || maxMembersNum > 20) {
      setError('Idadi ya wanachama lazima iwe kati ya 2 na 20');
      return;
    }

    setIsLoading(true);
    try {
      await onCreateGroup({
        name,
        description,
        contributionAmount: amountNum,
        rotationDuration: rotationDurationNum,
        maxMembers: maxMembersNum
      });
      
      setSuccess('Kikundi kimeundwa kwa mafanikio!');
      
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Imeshindwa kuunda kikundi');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setContributionAmount('');
    setRotationDuration('30');
    setMaxMembers('5');
    setSuccess('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Unda Kikundi cha Kijumbe</h2>
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

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jina la Kikundi
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kikundi cha Kijumbe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maelezo ya Kikundi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Maelezo kuhusu kikundi..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Contribution Amount */}
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
                  onClick={() => setContributionAmount(quickAmount.toString())}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    contributionAmount === quickAmount.toString()
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
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="Ingiza kiasi"
                min="1000"
                step="1000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Rotation Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Muda wa Zunguko
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRotationDuration(option.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    rotationDuration === option.value
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idadi ya Wanachama
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setMaxMembers(Math.max(2, parseInt(maxMembers, 10) - 1).toString())}
                className="px-3 py-2 border border-gray-300 rounded-l-lg hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                min="2"
                max="20"
                className="w-20 text-center py-2 border-t border-b border-gray-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setMaxMembers(Math.min(20, parseInt(maxMembers, 10) + 1).toString())}
                className="px-3 py-2 border border-gray-300 rounded-r-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kikundi kinaweza kuwa na wanachama 2 hadi 20
            </p>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Muhtasari wa Kikundi</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mchango kwa kila mwanachama:</span>
                <span className="font-medium">
                  {contributionAmount ? formatCurrency(parseFloat(contributionAmount) || 0) : 'TZS 0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jumla ya wanachama:</span>
                <span className="font-medium">{maxMembers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jumla ya mzunguko:</span>
                <span className="font-medium">
                  {contributionAmount ? formatCurrency((parseFloat(contributionAmount) || 0) * parseInt(maxMembers, 10)) : 'TZS 0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Muda wa mzunguko:</span>
                <span className="font-bold">
                  {durationOptions.find(opt => opt.value === rotationDuration)?.label || `Siku ${rotationDuration}`}
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
              disabled={isLoading || !name || !contributionAmount}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Unda Kikundi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
