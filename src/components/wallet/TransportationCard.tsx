import React from 'react';
import { Car } from 'lucide-react';

const TransportationCard: React.FC = () => {
  const transportOptions = [
    { id: 'dala-dala', name: 'Dala Dala', description: 'Local buses', color: 'blue' },
    { id: 'taxi', name: 'Taxi', description: 'City taxis', color: 'green' },
    { id: 'boda-boda', name: 'Boda Boda', description: 'Motorcycle taxis', color: 'purple' },
    { id: 'ride-share', name: 'Ride Share', description: 'Uber, Bolt', color: 'orange' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Transportation</h3>
            <p className="text-sm opacity-90">Pay for buses, taxis & ride-sharing</p>
          </div>
          <Car className="w-6 h-6 opacity-50" />
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {transportOptions.map((option) => (
            <button
              key={option.id}
              className={`flex flex-col items-center p-4 bg-${option.color}-50 rounded-lg hover:bg-${option.color}-100 transition-colors`}
            >
              <Car className={`w-8 h-8 text-${option.color}-600 mb-2`} />
              <span className="text-sm font-medium text-gray-900">{option.name}</span>
              <span className="text-xs text-gray-500">{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransportationCard;
