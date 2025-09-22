import type { FC } from 'react';
import { MessageCircle, Share2 } from 'lucide-react';
import { contactManager } from '../../lib/contacts';

interface EmptyContactsStateProps {
  onAddContact: () => void;
}

export const EmptyContactsState: FC<EmptyContactsStateProps> = ({ onAddContact }) => {
  const { whatsappLink, smsLink } = contactManager.generateInviteLinks();
  
  const copyToClipboard = () => {
    const inviteLink = `${window.location.origin}/auth/register`;
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };
  
  const openWhatsApp = () => {
    window.open(whatsappLink, '_blank');
  };
  
  const openSMS = () => {
    window.location.href = smsLink;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No contacts yet</h3>
      <p className="text-gray-500 mb-6">
        Add contacts to start chatting or invite friends to join Switch
      </p>
      
      <div className="space-y-4 w-full max-w-xs">
        <button 
          onClick={onAddContact}
          className="w-full py-3 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Add Contact
        </button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">or invite friends</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={openWhatsApp}
            className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
          
          <button
            onClick={openSMS}
            className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            SMS
          </button>
          
          <button
            onClick={copyToClipboard}
            className="col-span-2 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Copy Invite Link
          </button>
        </div>
      </div>
    </div>
  );
};
