import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Phone, AlertCircle, Check, Copy, Search, User } from 'lucide-react';
import { userService } from '../../services/appwrite/userService';
import { useAuth } from '../../contexts/AuthContext';

interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  phone?: string;
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userId: string, email: string, phone: string, message: string) => Promise<void>;
  groupName: string;
  groupId: string;
  currentUserId: string;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ 
  isOpen, 
  onClose, 
  onInvite, 
  groupName 
}) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppwriteUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppwriteUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { currentUser } = useAuth();

  // Search for users in Appwrite
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const users = await userService.searchUsers(searchQuery, 5);
        // Filter out current user and already added members
        const filteredUsers = users.filter(user => 
          user.$id !== currentUser?.$id
        );
        setSearchResults(filteredUsers);
      } catch (error) {
        console.error('Error searching users:', error);
        setError('Imeshindwa kutafuta watumiaji');
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUser?.$id]);

  const handleUserSelect = (user: AppwriteUser) => {
    setSelectedUser(user);
    setEmail(user.email);
    setPhone(user.phone || '');
    setSearchQuery(user.name);
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // If user is selected from search, use their details
    const userEmail = selectedUser?.email || email;
    const userPhone = selectedUser?.phone || phone;
    const userId = selectedUser?.$id || '';

    if (!userEmail.trim() && !userPhone.trim()) {
      setError('Tafadhali ingiza barua pepe au nambari ya simu');
      return;
    }

    if (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      setError('Barua pepe si sahihi');
      return;
    }

    if (userPhone && !/^(\+255|0)[0-9]{9}$/.test(userPhone)) {
      setError('Nambari ya simu si sahihi');
      return;
    }

    setIsLoading(true);
    try {
      await onInvite(userId, userEmail, userPhone, message);
      setSuccess('Mwaliko umetumwa kwa mafanikio!');
      
      // Generate invite link
      const link = `${window.location.origin}/kijumbe/join?group=${encodeURIComponent(groupName)}&token=${Date.now()}`;
      setInviteLink(link);
      
      setTimeout(() => {
        onClose();
        setEmail('');
        setPhone('');
        setMessage('');
        setSearchQuery('');
        setSelectedUser(null);
        setSearchResults([]);
        setSuccess('');
        setInviteLink('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Imeshindwa kutuma mwaliko');
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setSuccess('Kiungo kimekiliwa kwenye clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Alika Mwanachama</h2>
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

          {/* Group Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Kikundi: {groupName}</h3>
            <p className="text-sm text-gray-600">
              Mwaliko utatumwa kwa njia ya barua pepe au SMS
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Tafuta mwanachama
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Andika jina au barua pepe"
                />
              </div>
              
              {/* Search results dropdown */}
              {searchResults.length > 0 && (
                <div className="mt-2 border rounded-lg bg-white shadow-lg z-10 max-h-60 overflow-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.$id}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Barua pepe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="ingiza barua pepe"
                    disabled={!!selectedUser}
                  />
                </div>
              </div>

            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Nambari ya simu (hakikisha iko na mwenyewe)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="ingiza nambari ya simu"
                  disabled={!!selectedUser}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ingiza nambari ya simu ya Tanzania (+255 au 0)
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ujumbe wa Mwaliko
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Karibu kwenye kikundi cha Kijumbe..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ujumbe huu utaongezwa kwenye mwaliko
            </p>
          </div>

          {/* Invite Link */}
          {inviteLink && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Kiungo cha Mwaliko</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Unaweza kushiriki kiungo hiki moja kwa moja
              </p>
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
              disabled={isLoading || (!email && !phone)}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tuma Mwaliko
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
