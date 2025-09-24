import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { database, COLLECTIONS } from '../../lib/appwrite';
import { Models } from 'appwrite';
import { useXMPP } from '../../contexts/XMPPContext';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  url?: string;
}

interface DirectChat extends Models.Document {
  members: string[];
  messages?: Message[];
  name: string;
  avatar?: string;
  type: string;
}

const DirectChatRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { sendMessage: sendXMPPMessage } = useXMPP();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatGroup, setChatGroup] = useState<DirectChat | null>(null);
  const [contact, setContact] = useState<Models.Document & { name: string; email: string; avatar?: string; } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChat = async () => {
      if (!id || !user) return;

      try {
        setError(null);
        
        // Get the chat group details
        const chatData = await database.getDocument('direct_chats', id) as DirectChat;
        setChatGroup(chatData);
        
        // Find the other user in the direct chat
        const otherUserId = chatData.members.find(memberId => memberId !== user.$id);
        
        if (otherUserId) {
          // Get the contact user details
          const contactUser = await database.getDocument(COLLECTIONS.USERS, otherUserId) as Models.Document & { name: string; email: string; avatar?: string; };
          setContact(contactUser);
        }
        
        // Load messages
        if (chatData.messages && chatData.messages.length > 0) {
          setMessages(chatData.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Error loading chat:', err);
        setError('Failed to load chat');
      }
    };

    loadChat();
  }, [id, user]);

  const handleSend = async () => {
    if (!message.trim() || !chatGroup || !user || !contact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      sender_id: user.$id,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    try {
      // Try to send via XMPP first
      if (sendXMPPMessage) {
        try {
          await sendXMPPMessage(contact.email, message);
          setMessages(prev => [...prev, newMessage]);
          setMessage('');
          return;
        } catch (xmppError) {
          console.warn('XMPP message failed, falling back to Appwrite:', xmppError);
        }
      }

      // Fall back to Appwrite
      // Update the chat group with the new message
      const updatedMessages = [...(chatGroup.messages || []), newMessage];
      await database.updateDocument('direct_chats', chatGroup.$id, {
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      });

      setMessages(updatedMessages);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat header */}
      <div className="flex items-center p-4 border-b">
        <button
          onClick={() => window.history.back()}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{contact?.name || 'Loading...'}</h2>
          <p className="text-sm text-gray-500">{contact?.email}</p>
        </div>
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === user?.$id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender_id === user?.$id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default DirectChatRoom;
