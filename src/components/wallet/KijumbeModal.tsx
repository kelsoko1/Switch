import React, { useState } from 'react';
import { X, Users, Plus, Minus, Calendar, AlertCircle, Check, TrendingUp } from 'lucide-react';

interface KijumbeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContribute: (groupId: string, amount: number) => Promise<void>;
  onWithdraw: (groupId: string, amount: number) => Promise<void>;
  balance: number;
}

const KijumbeModal: React.FC<KijumbeModalProps> = ({ isOpen, onClose, onContribute, onWithdraw, balance }) => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'contribute' | 'withdraw'>('contribute');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const kijumbeGroups = [
    {
      id: 'group_1',
      name: 'Vikundi vya Kijumbe',
      description: 'Mikopo ya Kikundi cha Kijumbe',
      members: 12,
      totalAmount: 450000,
      nextMeeting: '2024-01-15',
      contributionAmount: 25000,
    },
    {
      id: 'group_2',
      name: 'Mikopo ya Haraka',
      description: 'Mikopo ya haraka ya kikundi',
      members: 8,
      totalAmount: 200000,
      nextMeeting: '2024-01-20',
      contributionAmount: 15000,
    },
    {
      id: 'group_3',
      name: 'Ushirika wa Kijumbe',
      description: 'Ushirika wa kijumbe wa muda mrefu',
      members: 15,
      totalAmount: 750000,
      nextMeeting: '2024-01-25',
      contributionAmount: 30000,
    },
  ];

  const quickAmounts = [5000, 10000, 15000, 25000, 50000];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedGroup) {
      setError('Tafadhali chagua kikundi');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Tafadhali ingiza kiasi sahihi');
      return;
    }

    if (amountNum < 1000) {
      setError('Kiasi cha chini ni TZS 1,000');
      return;
    }

    if (action === 'withdraw' && amountNum > balance) {
      setError('Akiba haitoshi');
      return;
    }

    setIsLoading(true);
    try {
      if (action === 'contribute') {
        await onContribute(selectedGroup, amountNum);
      } else {
        await onWithdraw(selectedGroup, amountNum);
      }
      // Reset form
      setAmount('');
      setSelectedGroup('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Imeshindwa kufanya shughuli');
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
          <h2 className="text-xl font-bold text-gray-900">Kijumbe</h2>
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

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chagua Shughuli
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAction('contribute')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  action === 'contribute'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  <span className="font-medium">Weka Pesa</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setAction('withdraw')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  action === 'withdraw'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Minus className="w-5 h-5 mr-2" />
                  <span className="font-medium">Toa Pesa</span>
                </div>
              </button>
            </div>
          </div>

          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chagua Kikundi
            </label>
            <div className="space-y-2">
              {kijumbeGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedGroup(group.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-colors ${
                    selectedGroup === group.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-6 h-6 text-red-500 mr-3" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{group.name}</p>
                        <p className="text-sm text-gray-500">{group.description}</p>
                        <p className="text-xs text-gray-400">
                          Wanachama: {group.members} • Jumla: {formatCurrency(group.totalAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(group.contributionAmount)}
                      </p>
                      <p className="text-xs text-gray-500">kwa mwezi</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
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
              min="1000"
              max="1000000"
              step="1000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Akiba: {formatCurrency(balance)}
            </p>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Muhtasari wa Shughuli</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kikundi:</span>
                <span className="font-medium">
                  {kijumbeGroups.find(g => g.id === selectedGroup)?.name || 'Chagua kikundi'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shughuli:</span>
                <span className="font-medium">
                  {action === 'contribute' ? 'Weka Pesa' : 'Toa Pesa'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kiasi:</span>
                <span className="font-medium">
                  {amount ? formatCurrency(parseFloat(amount) || 0) : 'TZS 0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Jumla:</span>
                <span className="font-bold text-lg">
                  {amount ? formatCurrency(parseFloat(amount) || 0) : 'TZS 0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Group Info */}
          {selectedGroup && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Taarifa za Kikundi</h4>
              {(() => {
                const group = kijumbeGroups.find(g => g.id === selectedGroup);
                return group ? (
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Wanachama: {group.members}</p>
                    <p>• Jumla ya Pesa: {formatCurrency(group.totalAmount)}</p>
                    <p>• Mkutano Ujao: {new Date(group.nextMeeting).toLocaleDateString('sw-TZ')}</p>
                    <p>• Kiasi cha Kawaida: {formatCurrency(group.contributionAmount)}</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

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
              disabled={isLoading || !selectedGroup || !amount}
              className={`flex-1 px-4 py-3 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center ${
                action === 'contribute' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  {action === 'contribute' ? (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Weka Pesa
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 mr-2" />
                      Toa Pesa
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KijumbeModal;
