import React, { useState } from 'react';
import { Crown, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const DemoSetup = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState(null);
  const [demoInfo, setDemoInfo] = useState(null);

  const handleDemoSetup = async () => {
    setIsSettingUp(true);
    setError(null);

    try {
      const response = await api.post('/demo/setup');
      setDemoInfo(response.data);
      setSetupComplete(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Demo setup failed');
    } finally {
      setIsSettingUp(false);
    }
  };

  if (setupComplete) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-green-800">Demo Setup Complete!</h3>
        </div>
        
        <div className="space-y-3 text-green-700">
          <p><strong>Demo Super Admin Account Created:</strong></p>
          <div className="bg-white p-3 rounded border border-green-200">
            <p><strong>Email:</strong> {demoInfo?.demoUser?.email}</p>
            <p><strong>Password:</strong> {demoInfo?.demoUser?.password}</p>
            <p><strong>Role:</strong> {demoInfo?.demoUser?.role}</p>
            <p><strong>User ID:</strong> {demoInfo?.demoUser?.id}</p>
          </div>
          
          <p><strong>Demo Group Created:</strong></p>
          <div className="bg-white p-3 rounded border border-green-200">
            <p><strong>Name:</strong> {demoInfo?.demoGroup?.name}</p>
            <p><strong>Group ID:</strong> {demoInfo?.demoGroup?.id}</p>
          </div>
          
          <p className="text-sm mt-4">
            🎉 You can now login with these credentials and have full super admin access!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Crown className="w-6 h-6 text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-purple-800">Demo Super Admin Setup</h3>
      </div>
      
      <div className="space-y-3 text-purple-700 mb-4">
        <p>
          This will create a demo super admin account with full access to all features for development and testing.
        </p>
        
        <div className="bg-white p-3 rounded border border-purple-200">
          <p><strong>Demo Account Details:</strong></p>
          <p>• Email: demo@kijumbe.com</p>
          <p>• Password: demo123456</p>
          <p>• Role: Super Admin (full access)</p>
          <p>• Includes: Demo savings group</p>
        </div>
        
        <p className="text-sm">
          <Zap className="w-4 h-4 inline mr-1" />
          Perfect for testing all features locally without setting up real accounts!
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleDemoSetup}
        disabled={isSettingUp}
        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {isSettingUp ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Setting up Demo...
          </>
        ) : (
          <>
            <Crown className="w-4 h-4 mr-2" />
            Create Demo Super Admin
          </>
        )}
      </button>
    </div>
  );
};

export default DemoSetup;
