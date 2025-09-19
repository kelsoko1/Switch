import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Smile, File, Camera, Music, MapPin, UserPlus, Clock, Heart, Star, 
  ThumbsUp, ArrowLeft, Phone, Video, Users, MoreVertical, X, Search, 
  Paperclip, Send, Mic, Plus, DollarSign 
} from 'lucide-react';
import CreateFundModal from '../../components/modals/CreateFundModal';
import ContributeModal from '../../components/modals/ContributeModal';
import { useAuth } from '../../contexts/AuthContext';
import { appwrite } from '../../lib/appwrite';
import { Query } from 'appwrite';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  online: boolean;
}

interface Message {
  id: string;
  content: string;
  sender: 'me' | 'them';
  timestamp: string;
  type?: 'text' | 'image' | 'audio' | 'video' | 'file';
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
    // Add other contribution properties as needed
  }>;
}

interface Group extends ChatData {
  members?: any[];
  fund_collections?: FundCollection[];
  created_by?: string;
  avatar_url?: string;
}

interface DirectChat extends ChatData {
  online?: boolean;
  participants: string[];
}

interface ChatData {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
  participants: string[];
  type: 'direct' | 'group';
}

const ChatRoom = () => {
  const { id, type } = useParams<{ id: string; type: 'direct' | 'group' }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showMembers, setShowMembers] = useState(false);
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

  // Load direct messages when directChat changes
  useEffect(() => {
    if (directChat?.messages) {
      setDirectMessages(directChat.messages);
    }
  }, [directChat]);
  
  // Load group data
  const loadGroup = useCallback(async () => {
    if (!id) return;
    try {
      const groupData = await appwrite.getDocument('groups', id);
      setGroup(groupData);
    } catch (err) {
      console.error('Error loading group:', err);
    }
  }, [id]);

  // Emoji handling
  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiMenu(false);
  };

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
        const groupData = await appwrite.getDocument('groups', id);
        setGroup(groupData);
        
        // Load group messages
        const messagesResponse = await appwrite.listDocuments('group_messages', [
          Query.equal('group_id', id),
          Query.orderDesc('$createdAt')
        ]);
        setMessages(messagesResponse.documents as unknown as Message[]);
      } else {
        // Load direct chat data
        const chatData = await appwrite.getDocument('direct_chats', id);
        setDirectChat(chatData);
        
        // Load direct messages
        const messagesResponse = await appwrite.listDocuments('direct_messages', [
          Query.equal('chat_id', id),
          Query.orderDesc('$createdAt')
        ]);
        setMessages(messagesResponse.documents as unknown as Message[]);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Failed to load chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Load chat when component mounts or ID changes
  useEffect(() => {
    loadChat();
  }, [loadChat]);

  const handleAttachment = async (attachmentType: string) => {
    console.log('Handling attachment type:', attachmentType);
    try {
      switch (attachmentType) {
        case 'document':
          fileInputRef.current?.click();
          break;
        case 'camera':
          // Handle camera capture
          break;
        case 'gallery':
          // Handle gallery selection
          break;
        case 'audio':
          if (!isRecording) {
            startVoiceRecording();
          } else {
            stopVoiceRecording();
          }
          break;
        case 'location':
          // Handle location sharing
          break;
        case 'contact':
          // Handle contact sharing
          break;
        case 'payment':
          // Handle payment
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error handling attachment:', err);
      setError('Failed to process attachment. Please try again.');
    }
  };

  // Voice recording functions
  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // In a real app, upload the audio blob to your server
        console.log('Audio recorded:', audioBlob);
        audioChunks = [];
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start voice recording. Please check microphone permissions.');
    }
  }, []);

  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  }, [mediaRecorder, isRecording]);

  // Chat actions
  const handlePhoneCall = useCallback(() => {
    // In a real app, implement phone call functionality
    console.log('Initiating phone call...');
  }, []);

  const handleVideoCall = useCallback(() => {
    // In a real app, implement video call functionality
    console.log('Initiating video call...');
  }, []);

  const handleGroupMembers = useCallback(() => {
    setShowMembers(prev => !prev);
  }, []);

  // Message handling
  const handleSend = useCallback(async () => {
    if (!message.trim() || !user) return;
    
    try {
      if (isGroup && group) {
        await appwrite.createDocument('group_messages', {
          group_id: group.$id,
          user_id: user.$id,
          content: message,
          type: 'text'
        });
      } else if (!isGroup && directChat) {
        await appwrite.createDocument('direct_messages', {
          chat_id: directChat.$id,
          sender_id: user.$id,
          recipient_id: directChat.participants.find((p: string) => p !== user?.$id),
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

  // Message handling


  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Attachment options
  const attachmentOptions = useMemo(() => [
    { id: 'document', icon: File, label: 'Document', color: 'bg-purple-500' },
    { id: 'camera', icon: Camera, label: 'Camera', color: 'bg-pink-500' },
    { id: 'gallery', icon: Camera, label: 'Gallery', color: 'bg-blue-500' },
    { id: 'audio', icon: Music, label: 'Audio', color: 'bg-orange-500' },
    { id: 'location', icon: MapPin, label: 'Location', color: 'bg-green-500' },
    { id: 'contact', icon: UserPlus, label: 'Contact', color: 'bg-yellow-500' },
    { id: 'poll', icon: Star, label: 'Poll', color: 'bg-purple-500' },
    { id: 'payment', icon: DollarSign, label: 'Payment', color: 'bg-blue-500' },
  ], []);

  const emojiCategories = [
    { id: 'smileys', icon: Smile, label: 'Smileys' },
    { id: 'animals', icon: Heart, label: 'Animals' },
    { id: 'food', icon: Star, label: 'Food' },
    { id: 'travel', icon: MapPin, label: 'Travel' },
    { id: 'objects', icon: Clock, label: 'Objects' },
  ];

  const getFilteredEmojis = () => {
    // This is a simplified version - in a real app, you'd have actual emoji data
    return ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'];
  };

  const handleMoreOptions = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  // Get direct chat data


  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="h-16 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          {type === 'direct' && directChat ? (
            <>
              <img
                src={directChat.avatar}
                alt={directChat.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold">{directChat.name}</h2>
                <p className="text-xs text-gray-500">
                  {directChat.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </>
          ) : group && (
            <>
              {group.avatar_url ? (
                <img
                  src={group.avatar_url}
                  alt={group.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-purple-700">
                    {group.name[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="font-semibold">{group.name}</h2>
                <p className="text-xs text-gray-500">
                  {group.members?.length} members
                </p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePhoneCall}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Voice Call"
          >
            <Phone className="w-6 h-6" />
          </button>
          <button 
            onClick={handleVideoCall}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Video Call"
          >
            <Video className="w-6 h-6" />
          </button>
          {type === 'group' && (
            <button 
              onClick={handleGroupMembers}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Group Members"
            >
              <Users className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={handleMoreOptions}
            className="text-gray-500 hover:text-gray-700 transition-colors relative more-menu-container"
            title="More Options"
          >
            <MoreVertical className="w-6 h-6" />
            {showMoreMenu && (
              <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg py-2 min-w-[200px] z-20 more-menu-container">
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                  Mute Notifications
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                  Clear Chat
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                  Export Chat
                </button>
                {type === 'group' && (
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                    Leave Group
                  </button>
                )}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Fund Collections (Group Only) */}
      {type === 'group' && group?.fund_collections && group.fund_collections.length > 0 && (
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Active Fund Collections</h3>
            <button
              onClick={() => setShowFundModal(true)}
              className="text-purple-500 hover:text-purple-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {group.fund_collections.map((collection) => {
              const totalCollected = collection.contributions?.reduce(
                (sum, contribution) => sum + contribution.amount,
                0
              ) || 0;
              const progress = (totalCollected / collection.target_amount) * 100;

              return (
                <div
                  key={collection.id}
                  className="min-w-[200px] bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium truncate">{collection.title}</h4>
                    <button
                      onClick={() => {
                        setSelectedCollection(collection);
                        setShowContributeModal(true);
                      }}
                      className="text-purple-500 hover:text-purple-600"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">
                        ${totalCollected.toFixed(2)} raised
                      </span>
                      <span className="text-gray-500">
                        ${collection.target_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  {collection.deadline && (
                    <p className="text-xs text-gray-500">
                      Ends: {new Date(collection.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {type === 'direct' ? (
          directMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.sender === 'me'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'me' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))
        ) : group?.messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.user?.id === group.created_by ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.user?.id === group.created_by
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className={`text-xs ${
                msg.user?.id === group.created_by ? 'text-white/70' : 'text-gray-500'
              }`}>
                {msg.user?.email}
              </p>
              <p>{msg.content}</p>
              <p className={`text-xs mt-1 ${
                msg.user?.id === group.created_by ? 'text-white/70' : 'text-gray-500'
              }`}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Menu */}
      {showAttachmentMenu && (
        <div className="absolute bottom-[80px] left-0 right-0 bg-white border-t shadow-lg p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Share Content</h3>
            <button
              onClick={() => setShowAttachmentMenu(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {attachmentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAttachment(option.id)}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 ${option.color} rounded-full flex items-center justify-center text-white`}>
                  <option.icon className="w-6 h-6" />
                </div>
                <span className="text-sm text-gray-700">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Menu */}
      {showEmojiMenu && (
        <div className="absolute bottom-[80px] left-0 right-0 bg-white border-t shadow-lg p-4 animate-slide-up max-h-[400px] overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Emojis</h3>
            <button
              onClick={() => setShowEmojiMenu(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={emojiSearch}
              onChange={(e) => setEmojiSearch(e.target.value)}
              placeholder="Search emojis..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex border-b mb-4 overflow-x-auto">
            {emojiCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedEmojiCategory(category.id)}
                className={`flex-1 py-3 flex flex-col items-center gap-1 min-w-[80px] ${
                  selectedEmojiCategory === category.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600'
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span className="text-xs">{category.label}</span>
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-8 gap-2 overflow-y-auto max-h-[200px]">
            {getFilteredEmojis().map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Smile className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Paperclip className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          {message.trim() ? (
            <button
              onClick={handleSend}
              className="text-purple-500 hover:text-purple-600"
            >
              <Send className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`transition-colors ${
                isRecording 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title={isRecording ? 'Stop Recording' : 'Voice Message'}
            >
              <Mic className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Create Fund Modal */}
      {showFundModal && (
        <CreateFundModal
          groupId={id}
          onClose={() => setShowFundModal(false)}
          onFundCreated={loadGroup}
        />
      )}

      {/* Contribute Modal */}
      {showContributeModal && selectedCollection && (
        <ContributeModal
          collection={selectedCollection}
          onClose={() => {
            setShowContributeModal(false);
            setSelectedCollection(null);
          }}
          onContributed={loadGroup}
        />
      )}
    </div>
  );
};

export default ChatRoom;