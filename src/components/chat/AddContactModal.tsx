import { useState } from 'react';
import type { FC } from 'react';
import { X, Share2, Copy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { contactManager } from '../../lib/contacts';

interface AddContactModalProps {
  onClose: () => void;
  onContactAdded?: () => void;
}

export const AddContactModal: FC<AddContactModalProps> = ({
  onClose,
  onContactAdded,
}) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'invite'>('add');
  
  // Generate invite links
  const { whatsappLink, smsLink } = contactManager.generateInviteLinks();
  
  const handleAddContact = async () => {
    if (!email.trim() || !user) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      await contactManager.addContact(user.$id, email.trim());
      
      setSuccess('Contact added successfully!');
      onContactAdded?.();
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error adding contact:', error);
      setError('Failed to add contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Invite link copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };
  
  const openWhatsApp = () => {
    window.open(whatsappLink, '_blank');
  };
  
  const openSMS = () => {
    window.location.href = smsLink;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {activeTab === 'add' ? 'Add Contact' : 'Invite to Switch'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'add'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              Add Contact
            </button>
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'invite'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              Invite Friends
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {activeTab === 'add' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleAddContact}
                disabled={!email.trim() || isLoading}
                className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding...' : 'Add Contact'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Invite your friends to join Switch so you can chat and make payments together.
              </p>
              
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium mb-2">Share invite link</p>
                <div className="flex items-center justify-between">
                  <div className="truncate flex-1 text-gray-600 text-sm">
                    {window.location.origin}/auth/register
                  </div>
                  <button 
                    onClick={() => copyToClipboard(`${window.location.origin}/auth/register`)}
                    className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={openWhatsApp}
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  WhatsApp
                </button>
                
                <button
                  onClick={openSMS}
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  SMS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
