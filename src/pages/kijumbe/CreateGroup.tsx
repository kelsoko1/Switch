import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign, Calendar, FileText, AlertCircle, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    meetingFrequency: 'monthly',
    maxMembers: '',
    startDate: '',
  });

  const meetingFrequencies = [
    { value: 'weekly', label: 'Kila Wiki' },
    { value: 'monthly', label: 'Kila Mwezi' },
    { value: 'quarterly', label: 'Kila Robo Mwaka' },
  ];


  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Tafadhali ingiza jina la kikundi');
      return;
    }

    if (!formData.contributionAmount || parseFloat(formData.contributionAmount) <= 0) {
      setError('Tafadhali ingiza kiasi cha mchango');
      return;
    }

    if (!formData.maxMembers || parseInt(formData.maxMembers) < 2) {
      setError('Kikundi lazima kiwe na wanachama angalau 2');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Kikundi kimeundwa kwa mafanikio!');
      addNotification(`Kikundi "${formData.name}" kimeundwa kwa mafanikio!`);
      setTimeout(() => {
        navigate('/kijumbe');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Imeshindwa kuunda kikundi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="h-full bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/kijumbe')}
            className="p-2 hover:bg-gray-700 rounded-lg mr-3"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Unganisha Kikundi Kipya</h1>
            <p className="text-gray-300 text-sm">Undoa kikundi cha Kijumbe na uongoze wanachama</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Jina la Kikundi *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ingiza jina la kikundi"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maelezo ya Kikundi
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Eleza malengo na sheria za kikundi..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Contribution Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kiasi cha Mchango (TZS) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                name="contributionAmount"
                value={formData.contributionAmount}
                onChange={handleInputChange}
                placeholder="0"
                min="1000"
                step="1000"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Kiasi cha chini: {formatCurrency(1000)}
            </p>
          </div>

          {/* Meeting Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mzunguko wa Mikutano *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="meetingFrequency"
                value={formData.meetingFrequency}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                {meetingFrequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Idadi ya Juu ya Wanachama *
            </label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleInputChange}
              placeholder="10"
              min="2"
              max="50"
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <p className="text-gray-400 text-sm mt-1">
              Kikundi kinaweza kuwa na wanachama 2-50
            </p>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tarehe ya Kuanza *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Group Rules */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Sheria za Kikundi</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Kila mwanachama lazima alipe mchango wake kwa wakati</li>
              <li>• Mikopo inatolewa kwa mfumo wa kura</li>
              <li>• Kikundi kinaweza kukusanya ada ya uongozi</li>
              <li>• Mwanachama yeyote anaweza kuondoka kikundi</li>
              <li>• Kikundi kinaweza kumfukuza mwanachama mwenye tabia mbaya</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/kijumbe')}
              className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ghairi
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Unganisha Kikundi
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-40">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in"
            >
              {notification}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateGroup;
