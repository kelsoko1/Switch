import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Smile, File, Camera, Music, MapPin, UserPlus, Clock, Heart, Star, 
  ArrowLeft, Phone, Video, Users, MoreVertical, X, Search, 
  Paperclip, Send, Mic, Plus, DollarSign 
} from 'lucide-react';
import CreateFundModal from '../../components/modals/CreateFundModal';
import ContributeModal from '../../components/modals/ContributeModal';
import { useAuth } from '../../contexts/AuthContext';
import { database, COLLECTIONS } from '../../lib/appwrite';
import { Query, Models } from 'appwrite';

interface Message {
  id: string;
  sender: 'me' | 'them';
  timestamp: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
  url?: string;
  fileName?: string;
  fileSize?: string;
}

interface AppwriteMessage extends Models.Document {
  content: string;
  user_id: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
  url?: string;
  fileName?: string;
  fileSize?: string;
}

interface FundCollection {
  id: string;
  title: string;
  target_amount: number;
  deadline?: string;
  contributions?: Array<{
    amount: number;
  }>;
}

interface Group extends Models.Document {
  members: string[];
  fund_collections: FundCollection[];
  created_by: string;
  avatar_url?: string;
  name: string;
  type: string;
  messages?: Message[];
}

interface DirectChat extends Models.Document {
  online?: boolean;
  participants: string[];
  type: string;
  name: string;
  avatar?: string;
  messages?: Message[];
}

const ChatRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // State variables
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGroup, setIsGroup] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [directChat, setDirectChat] = useState<DirectChat | null>(null);
  const [directMessages, setDirectMessages] = useState<Message[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<FundCollection | null>(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('smileys');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat data
  const loadChat = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      // Determine if it's a group or direct chat
      const isGroupChat = id.startsWith('group');
      setIsGroup(isGroupChat);
      
      if (isGroupChat) {
        // Load group data
        const groupData = await database.getDocument(COLLECTIONS.GROUPS, id) as unknown as Group;
        setGroup(groupData);
        
        // Load group messages
        const messagesResponse = await database.listDocuments('group_messages', [
          Query.equal('group_id', id),
          Query.orderDesc('$createdAt')
        ]);
        const messages = (messagesResponse.documents as AppwriteMessage[]).map(msg => ({
          id: msg.$id,
          content: msg.content,
          sender: (msg.user_id === user?.$id ? 'me' : 'them') as 'me' | 'them',
          timestamp: msg.$createdAt,
          type: msg.type || 'text',
          url: msg.url,
          fileName: msg.fileName,
          fileSize: msg.fileSize
        }));
        setMessages(messages);
      } else {
        // Load direct chat data
        const chatData = await database.getDocument('direct_chats', id) as unknown as DirectChat;
        setDirectChat(chatData);
        
        // Load direct messages
        const messagesResponse = await database.listDocuments('direct_messages', [
          Query.equal('chat_id', id),
          Query.orderDesc('$createdAt')
        ]);
        const messages = (messagesResponse.documents as AppwriteMessage[]).map(msg => ({
          id: msg.$id,
          content: msg.content,
          sender: (msg.user_id === user?.$id ? 'me' : 'them') as 'me' | 'them',
          timestamp: msg.$createdAt,
          type: msg.type || 'text',
          url: msg.url,
          fileName: msg.fileName,
          fileSize: msg.fileSize
        }));
        setMessages(messages);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Failed to load chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  // Load initial data
  useEffect(() => {
    loadChat();
  }, [loadChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update direct messages when chat changes
  useEffect(() => {
    if (directChat?.messages) {
      setDirectMessages(directChat.messages);
    }
  }, [directChat]);

  // Message handling
  const handleFileUpload = async (file: File | null) => {
    if (!file || !message.trim() || !user) return;
    
    try {
      if (isGroup && group) {
        await database.createDocument('group_messages', {
          group_id: group.$id,
          user_id: user.$id,
          content: message,
          type: 'text'
        });
      } else if (!isGroup && directChat) {
        await database.createDocument('direct_messages', {
          chat_id: directChat.$id,
          sender_id: user.$id,
          recipient_id: directChat.participants.find(p => p !== user.$id),
          content: message,
          type: 'text'
        });
      }
      
      setMessage('');
      await loadChat(); // Refresh messages
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = useCallback(async () => {
    if (!message.trim() || !user) return;
    
    try {
      if (isGroup && group) {
        await database.createDocument('group_messages', {
          group_id: group.$id,
          user_id: user.$id,
          content: message,
          type: 'text'
        });
      } else if (!isGroup && directChat) {
        await database.createDocument('direct_messages', {
          chat_id: directChat.$id,
          sender_id: user.$id,
          recipient_id: directChat.participants.find(p => p !== user.$id),
          content: message,
          type: 'text'
        });
      }
      
      setMessage('');
      await loadChat(); // Refresh messages
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  }, [message, user, isGroup, group, directChat, loadChat]);

  // UI rendering
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Link to="/chat" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold">
              {isGroup ? group?.name : directChat?.name}
            </h2>
            <p className="text-sm text-gray-500">
              {isGroup ? `${group?.members.length} members` : directChat?.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <Video className="w-5 h-5" />
          </button>
          {isGroup && (
            <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
              <Users className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)} 
            className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'me' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender === 'me'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 bg-gray-100 rounded-lg p-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-transparent outline-none resize-none"
              rows={1}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowEmojiMenu(!showEmojiMenu)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-3 bg-purple-600 text-white rounded-full disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ChatRoom;
