import React, { useState } from 'react';
import { X, TrendingUp, AlertCircle, Check, DollarSign } from 'lucide-react';
import { formatCurrency, validateCurrencyInput, LOAN_AMOUNTS } from '../../utils/currency';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestLoan: (amount: number, purpose: string, repaymentPeriod: number) => Promise<void>;
  groupName: string;
  maxLoanAmount: number;
  myContribution: number;
}

const LoanModal: React.FC<LoanModalProps> = ({ 
  isOpen, 
  onClose, 
  onRequestLoan, 
  groupName, 
  maxLoanAmount,
  myContribution 
}) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentPeriod, setRepaymentPeriod] = useState('3');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = LOAN_AMOUNTS;
  const repaymentPeriods = [
    { value: '1', label: 'Mwezi 1' },
    { value: '3', label: 'Miezi 3' },
    { value: '6', label: 'Miezi 6' },
    { value: '12', label: 'Miezi 12' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateCurrencyInput(amount, 10000, maxLoanAmount);
    if (!validation.isValid) {
      setError(validation.error || 'Kiasi si sahihi');
      return;
    }

    const amountNum = validation.amount;
    if (amountNum > myContribution * 2) {
      setError('Mikopo haiwezi kuwa zaidi ya mara 2 ya mchango wako');
      return;
    }

    if (!purpose.trim()) {
      setError('Tafadhali eleza madhumuni ya mikopo');
      return;
    }

    setIsLoading(true);
    try {
      await onRequestLoan(amountNum, purpose, parseInt(repaymentPeriod));
      setAmount('');
      setPurpose('');
      setRepaymentPeriod('3');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Imeshindwa kuomba mikopo');
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
          <h2 className="text-xl font-bold text-gray-900">Omba Mikopo</h2>
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
              Mikopo ya juu: {formatCurrency(maxLoanAmount)}
            </p>
            <p className="text-sm text-gray-600">
              Mchango wako: {formatCurrency(myContribution)}
            </p>
            <p className="text-sm text-gray-600">
              Mikopo ya juu inayoruhusiwa: {formatCurrency(myContribution * 2)}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kiasi cha Mikopo (TZS)
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
                min="10000"
                max={maxLoanAmount}
                step="1000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Madhumuni ya Mikopo *
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Mfano: Biashara, Elimu, Matibabu..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Repayment Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Muda wa Malipo *
            </label>
            <select
              value={repaymentPeriod}
              onChange={(e) => setRepaymentPeriod(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              {repaymentPeriods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* Loan Terms */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Masharti ya Mikopo</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Mikopo inatolewa kwa mfumo wa kura</li>
              <li>• Kila mwanachama anaweza kupiga kura</li>
              <li>• Malipo yanafanywa kwa mfumo wa mchango</li>
              <li>• Ada ya riba: 5% kwa mwezi</li>
              <li>• Mikopo inaweza kukataliwa na wanachama</li>
            </ul>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Muhtasari wa Mikopo</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kiasi:</span>
                <span className="font-medium">
                  {amount ? formatCurrency(parseFloat(amount) || 0) : 'TZS 0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Muda wa Malipo:</span>
                <span className="font-medium">
                  {repaymentPeriods.find(p => p.value === repaymentPeriod)?.label || 'Miezi 3'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ada ya Riba (5%):</span>
                <span className="font-medium">
                  {amount ? formatCurrency((parseFloat(amount) || 0) * 0.05) : 'TZS 0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Jumla ya Malipo:</span>
                <span className="font-bold text-lg">
                  {amount ? formatCurrency((parseFloat(amount) || 0) * 1.05) : 'TZS 0.00'}
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
              disabled={isLoading || !amount || !purpose}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Omba Mikopo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanModal;
