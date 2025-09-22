import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { appwrite } from '../../lib/appwrite';
import { useXMPP } from '../../contexts/XMPPContext';

const DirectChatRoom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage, messages: xmppMessages } = useXMPP();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatGroup, setChatGroup] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  
  useEffect(() => {
    if (!user || !id) return;
    
    const loadChatDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the chat group details
        const group = await appwrite.getDocument('groups', id);
        setChatGroup(group);
        
        // Find the other user in the direct chat
        const otherUserId = group.members.find((memberId: string) => memberId !== user.$id);
        
        if (otherUserId) {
          // Get the contact user details
          const contactUser = await appwrite.getDocument('users', otherUserId);
          setContact(contactUser);
        }
        
        // Get messages
        if (group.messages && group.messages.length > 0) {
          setMessages(group.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Error loading chat details:', err);
        setError('Failed to load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadChatDetails();
  }, [id, user]);
  
  // Filter XMPP messages for this chat
  useEffect(() => {
    if (!contact || !user) return;
    
    // Get XMPP messages for this contact
    const contactJid = `${contact.email.split('@')[0]}@${import.meta.env.VITE_XMPP_DOMAIN || 'localhost'}`;
    const userJid = `${user.email.split('@')[0]}@${import.meta.env.VITE_XMPP_DOMAIN || 'localhost'}`;
    
    const relevantMessages = xmppMessages.filter(msg => 
      (msg.from.startsWith(contactJid) && msg.to.startsWith(userJid)) || 
      (msg.from.startsWith(userJid) && msg.to.startsWith(contactJid))
    );
    
    if (relevantMessages.length > 0) {
      // Convert XMPP messages to app format and add to messages
      const formattedMessages = relevantMessages.map(msg => ({
        id: msg.id,
        user_id: msg.from.startsWith(userJid) ? user.$id : contact.$id,
        content: msg.body,
        created_at: msg.timestamp.toISOString(),
        user: {
          id: msg.from.startsWith(userJid) ? user.$id : contact.$id,
          name: msg.from.startsWith(userJid) ? user.name : contact.name,
          email: msg.from.startsWith(userJid) ? user.email : contact.email,
        }
      }));
      
      // Merge with existing messages and sort by timestamp
      const allMessages = [...messages, ...formattedMessages]
        .filter((msg, index, self) => 
          index === self.findIndex(m => m.id === msg.id)
        )
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      setMessages(allMessages);
    }
  }, [xmppMessages, contact, user]);
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !contact || !chatGroup) return;
    
    try {
      const messageId = `msg_${Date.now()}`;
      const newMessage = {
        id: messageId,
        user_id: user.$id,
        content: messageText.trim(),
        created_at: new Date().toISOString(),
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
        }
      };
      
      // Add message to local state
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      // Try to send via XMPP first
      try {
        const contactJid = `${contact.email.split('@')[0]}@${import.meta.env.VITE_XMPP_DOMAIN || 'localhost'}`;
        await sendMessage(contactJid, messageText.trim());
      } catch (xmppError) {
        console.warn('Failed to send via XMPP, falling back to Appwrite:', xmppError);
        
        // Fall back to Appwrite
        // Update the chat group with the new message
        const updatedMessages = [...(chatGroup.messages || []), newMessage];
        await appwrite.updateDocument('groups', chatGroup.$id, {
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };
  
  const handleInvite = () => {
    const inviteText = `Join me on Switch! ${window.location.origin}/auth/register`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Switch',
        text: inviteText,
        url: `${window.location.origin}/auth/register`
      }).catch(err => {
        console.error('Error sharing:', err);
        navigator.clipboard.writeText(inviteText);
        alert('Invite link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(inviteText);
      alert('Invite link copied to clipboard!');
    }
  };
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/chat')}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Back to Chats
        </button>
      </div>
    );
  }
  
  if (!chatGroup || !contact) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">Chat not found or you don't have access.</p>
        <button
          onClick={() => navigate('/chat')}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Back to Chats
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center">
        <button
          onClick={() => navigate('/chat')}
          className="mr-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center flex-1">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-lg font-medium text-purple-700">
                {contact.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          
          <div className="ml-3">
            <h2 className="font-semibold text-gray-900">{contact.name}</h2>
            <p className="text-xs text-gray-500">{contact.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleInvite}
          className="p-2 text-gray-500 hover:text-gray-700"
          title="Invite to Switch"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.user_id === user?.$id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-purple-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isCurrentUser ? 'text-purple-200' : 'text-gray-500'}`}>
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="ml-2 p-2 bg-purple-500 text-white rounded-full disabled:bg-gray-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectChatRoom;
