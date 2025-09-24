import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Send,
  Gift,
  Heart,
  Star,
  ThumbsUp,
  Share2,
  Users,
  X,
  Plus,
  MoreVertical,
} from 'lucide-react';
import { SimpleWebRTCManager, createSimpleWebRTCManager } from '../../lib/webrtc-simple';
import { JanusWebRTC, createJanusWebRTC } from '../../lib/janus-webrtc';
import { ChatManager, type ChatMessage } from '../../lib/chat';
import { useAuth } from '../../contexts/AuthContext';

interface StreamViewProps {
  useJanus?: boolean;
}

const StreamView: React.FC<StreamViewProps> = ({ useJanus = false }) => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // State
  const [streamManager, setStreamManager] = useState<SimpleWebRTCManager | null>(null);
  const [janusManager, setJanusManager] = useState<JanusWebRTC | null>(null);
  const [chatManager, setChatManager] = useState<ChatManager | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize stream and chat
  useEffect(() => {
    if (!id || !user) return;
    
    let streamManagerInstance: SimpleWebRTCManager | null = null;
    let janusManagerInstance: JanusWebRTC | null = null;
    let chatManagerInstance: ChatManager | null = null;
    
    const initializeStream = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (useJanus) {
          // Initialize Janus WebRTC stream manager
          janusManagerInstance = createJanusWebRTC(id, user.$id);
          await janusManagerInstance.initialize();
          setJanusManager(janusManagerInstance);
        } else {
          // Initialize simple WebRTC stream manager
          streamManagerInstance = createSimpleWebRTCManager({
            onRemoteStream: (stream) => {
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
            },
            onViewerCountChange: (count) => {
              setViewerCount(count);
            }
          });
          await streamManagerInstance.initialize();
          setStreamManager(streamManagerInstance);
        }

        // Initialize chat manager
        chatManagerInstance = new ChatManager();
        setChatManager(chatManagerInstance);

        // Load chat history
        const history = await chatManagerInstance.getChatHistory(id);
        setMessages(history);
      } catch (err) {
        console.error('Error initializing stream:', err);
        setError('Failed to initialize stream');
      } finally {
        setIsLoading(false);
      }
    };

    initializeStream();

    // Cleanup
    return () => {
      if (streamManagerInstance) {
        streamManagerInstance.cleanup();
      }
      if (janusManagerInstance) {
        janusManagerInstance.cleanup();
      }
      if (chatManagerInstance) {
        chatManagerInstance.cleanup();
      }
    };
  }, [id, user, useJanus]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Message handling
  const handleSendMessage = async () => {
    if (!message.trim() || !chatManager || !user) return;

    try {
      const newMessage = await chatManager.sendMessage(id, message);
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
      }
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading stream...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Stream view */}
      <div className="flex-1 bg-black relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />

        {/* Stream info */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>{viewerCount}</span>
            </div>
          </div>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Stream actions */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowGiftMenu(!showGiftMenu)}
              className="p-2 text-white hover:bg-white/10 rounded-full"
            >
              <Gift className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowReactionMenu(!showReactionMenu)}
              className="p-2 text-white hover:bg-white/10 rounded-full"
            >
              <Heart className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 text-white hover:bg-white/10 rounded-full"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat panel */}
      <div className="w-96 bg-white flex flex-col border-l">
        {/* Chat header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat</h2>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Chat messages */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
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

        {/* Chat input */}
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
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="p-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gift menu */}
      {showGiftMenu && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Send a Gift</h3>
              <button
                onClick={() => setShowGiftMenu(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Gift options */}
            <div className="grid grid-cols-3 gap-4">
              <button className="p-4 border rounded-lg hover:bg-gray-50">
                <Star className="w-8 h-8 mx-auto mb-2" />
                <span>Star</span>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50">
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <span>Heart</span>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50">
                <ThumbsUp className="w-8 h-8 mx-auto mb-2" />
                <span>Like</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamView;
