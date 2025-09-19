import React from 'react';
import { Zap, Lightbulb, Droplets, Wifi, Phone, Plus } from 'lucide-react';

const UtilityPaymentsCard: React.FC = () => {
  const utilities = [
    { id: 'electricity', name: 'Electricity', icon: Lightbulb, color: 'yellow', provider: 'TANESCO' },
    { id: 'water', name: 'Water', icon: Droplets, color: 'blue', provider: 'DAWASCO' },
    { id: 'internet', name: 'Internet', icon: Wifi, color: 'purple', provider: 'Vodacom' },
    { id: 'mobile', name: 'Mobile', icon: Phone, color: 'green', provider: 'Airtime' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Utility Payments</h3>
            <p className="text-sm opacity-90">Pay bills for electricity, water, internet & more</p>
          </div>
          <Zap className="w-6 h-6 opacity-50" />
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {utilities.map((utility) => {
            const IconComponent = utility.icon;
            return (
              <button
                key={utility.id}
                className={`flex flex-col items-center p-4 bg-${utility.color}-50 rounded-lg hover:bg-${utility.color}-100 transition-colors`}
              >
                <IconComponent className={`w-8 h-8 text-${utility.color}-600 mb-2`} />
                <span className="text-sm font-medium text-gray-900">{utility.name}</span>
                <span className="text-xs text-gray-500">{utility.provider}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add More Utilities</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UtilityPaymentsCard;
