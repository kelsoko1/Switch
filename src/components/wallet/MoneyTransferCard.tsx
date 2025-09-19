import React from 'react';
import { Send, Smartphone, Building2, CreditCard, ArrowRight } from 'lucide-react';

const MoneyTransferCard: React.FC = () => {
  const transferMethods = [
    {
      id: 'mobile',
      name: 'Mobile Money',
      description: 'M-Pesa, Tigo Pesa, Airtel Money',
      icon: Smartphone,
      color: 'blue'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct bank to bank transfer',
      icon: Building2,
      color: 'green'
    },
    {
      id: 'card',
      name: 'Card Payment',
      description: 'Visa, Mastercard, Local cards',
      icon: CreditCard,
      color: 'orange'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Money Transfer</h3>
            <p className="text-sm opacity-90">Send money to friends, family & businesses</p>
          </div>
          <Send className="w-6 h-6 opacity-50" />
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transferMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <button
                key={method.id}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`w-12 h-12 bg-${method.color}-100 rounded-full flex items-center justify-center mr-4`}>
                  <IconComponent className={`w-6 h-6 text-${method.color}-600`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoneyTransferCard;
