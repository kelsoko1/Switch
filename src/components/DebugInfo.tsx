import React from 'react';
import { useAppwrite } from '../contexts/AppwriteContext';

const DebugInfo: React.FC = () => {
  const { user, isAuthenticated, loading } = useAppwrite();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.name : 'None'}</div>
        <div>Email: {user ? user.email : 'None'}</div>
        <div>User ID: {user ? user.$id : 'None'}</div>
      </div>
    </div>
  );
};

export default DebugInfo;
