import React from 'react';
import { TrendingUp, Home, ArrowRight } from 'lucide-react';

const InvestmentCard: React.FC = () => {
  const investmentOptions = [
    {
      id: 'stocks',
      name: 'Stocks & Bonds',
      description: 'Invest in local & international markets',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'real-estate',
      name: 'Real Estate',
      description: 'Property investment opportunities',
      icon: Home,
      color: 'blue'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Investment & Savings</h3>
            <p className="text-sm opacity-90">Grow your money with smart investments</p>
          </div>
          <TrendingUp className="w-6 h-6 opacity-50" />
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investmentOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`w-12 h-12 bg-${option.color}-100 rounded-full flex items-center justify-center mr-4`}>
                  <IconComponent className={`w-6 h-6 text-${option.color}-600`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900">{option.name}</h4>
                  <p className="text-sm text-gray-500">{option.description}</p>
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

export default InvestmentCard;
