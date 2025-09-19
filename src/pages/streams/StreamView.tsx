import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  Gift,
  Send,
  Users,
  X,
  ArrowLeft,
  MoreVertical,
} from 'lucide-react';
import { SimpleWebRTCManager, createSimpleWebRTCManager } from '../../lib/webrtc-simple';
import { JanusStreamManager, createJanusStreamManager } from '../../lib/janus-webrtc';
import { ChatManager, type ChatMessage } from '../../lib/chat';
import { useAuth } from '../../contexts/AuthContext';

const StreamView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Mock stream data for UI display
  const mockStream = {
    title: 'Morning Yoga Session',
    streamer: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    viewers: 1234,
    likes: 856,
  };
  
  const [streamManager, setStreamManager] = useState<SimpleWebRTCManager | null>(null);
  const [chatManager, setChatManager] = useState<ChatManager | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(mockStream.likes);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mockGifts = [
    { id: 1, name: 'Star', icon: '⭐', price: 5 },
    { id: 2, name: 'Heart', icon: '❤️', price: 10 },
    { id: 3, name: 'Diamond', icon: '💎', price: 50 },
    { id: 4, name: 'Crown', icon: '👑', price: 100 },
  ];

  useEffect(() => {
    if (!id) return;
    
    let streamManagerInstance: JanusStreamManager | SimpleWebRTCManager | null = null;
    let chatManagerInstance: ChatManager | null = null;
    
    const initializeStream = async () => {
      try {
        // Check if Janus is available
        const useJanus = import.meta.env.VITE_USE_JANUS === 'true';
        
        if (useJanus) {
          // Initialize Janus WebRTC stream manager
          const manager = createJanusStreamManager(id, false, {
            onRemoteStream: (stream) => {
              // Set the stream to the video element
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(console.error);
              }
            },
            onMessage: (msg) => {
              console.log('Received Janus message:', msg);
              
              // Handle chat messages if they come through Janus
              if (msg.data && typeof msg.data === 'string') {
                try {
                  const data = JSON.parse(msg.data);
                  if (data.type === 'chat') {
                    console.log('Received chat message via Janus:', data);
                  } else if (data.type === 'reaction') {
                    console.log('Received reaction via Janus:', data);
                  }
                } catch (e) {
                  // Not JSON data, ignore
                }
              }
            },
            onError: (error) => {
              console.error('Janus error:', error);
            }
          });
          
          streamManagerInstance = manager;
          setStreamManager(manager as any);
          
          // Initialize Janus
          await manager.initialize();
          
          // Start watching the stream
          const stream = await manager.startStream();
          
          // Set the stream to the video element if not already set by the onRemoteStream callback
          if (videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(console.error);
          }
        } else {
          // Fallback to SimpleWebRTC
          const manager = createSimpleWebRTCManager(id, false, {
            onConnectionStateChange: (state) => {
              console.log(`WebRTC connection state changed: ${state}`);
            },
            onDataChannelMessage: (data) => {
              if (data.type === 'chat') {
                // Handle chat messages from data channel if needed
                console.log('Received chat message via data channel:', data);
              } else if (data.type === 'reaction') {
                // Handle reactions
                console.log('Received reaction:', data);
              }
            }
          });
          
          streamManagerInstance = manager;
          setStreamManager(manager as any);
          
          // Initialize WebRTC
          await manager.initialize();
          
          // Start watching the stream
          const stream = await manager.startStream();
          
          // Set the stream to the video element
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(console.error);
          }
          
          // Set up event handlers
          manager.onPeerConnected((peerId) => {
            console.log(`Connected to peer: ${peerId}`);
          });
          
          manager.onPeerDisconnected((peerId) => {
            console.log(`Disconnected from peer: ${peerId}`);
          });
          
          manager.onData((data, peerId) => {
            console.log(`Received data from ${peerId}:`, data);
          });
        }
      } catch (error) {
        console.error('Failed to join stream:', error);
        // Show error to user
      }
    };
    
    const initializeChat = async () => {
      try {
        // Initialize chat manager
        const chat = new ChatManager(id, (message) => {
          setMessages(prev => [...prev, message]);
          // Scroll to bottom on new message
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        });
        
        chatManagerInstance = chat;
        setChatManager(chat);
        
        // Load existing messages
        const existingMessages = await chat.getMessages();
        setMessages(existingMessages);
        
        // Start polling for new messages if XMPP is not available
        chat.startPolling(3000);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };
    
    // Initialize both stream and chat
    initializeStream();
    initializeChat();
    
    // Cleanup function
    return () => {
      if (streamManagerInstance) {
        streamManagerInstance.stopStream();
      }
      
      if (chatManagerInstance) {
        chatManagerInstance.disconnect();
      }
    };
  }, [id]);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu && !(event.target as Element).closest('.more-menu-container')) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const handleSendMessage = async () => {
    if (!message.trim() || !chatManager || !user) return;

    try {
      await chatManager.sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error to user
    }
  };

  const handleSendGift = async (gift: typeof mockGifts[0]) => {
    if (!user) {
      alert('Please login to send gifts');
      return;
    }

    try {
      // In a real app, this would integrate with a payment system
      const confirmed = window.confirm(
        `Send ${gift.name} gift for $${gift.price} to ${mockStream.streamer}?`
      );
      
      if (confirmed) {
        // Simulate payment processing
        console.log(`Processing payment for ${gift.name} ($${gift.price})`);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        alert(`Gift sent successfully! ${gift.icon} ${gift.name} sent to ${mockStream.streamer}`);
        
        // In a real app, you would:
        // 1. Process payment through payment gateway
        // 2. Send gift notification to streamer
        // 3. Update streamer's earnings
        // 4. Show gift animation in chat
        // 5. Update gift count/leaderboard
        
        setShowGiftMenu(false);
      }
    } catch (error) {
      console.error('Failed to send gift:', error);
      alert('Failed to send gift. Please try again.');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockStream.title,
        text: `Check out this live stream: ${mockStream.title} by ${mockStream.streamer}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Stream link copied to clipboard!');
      }).catch(console.error);
    }
  };

  const handleMoreOptions = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleReportStream = () => {
    setShowMoreMenu(false);
    const reason = prompt('Please provide a reason for reporting this stream:');
    if (reason) {
      console.log('Stream reported:', reason);
      alert('Thank you for your report. We will review it shortly.');
    }
  };

  const handleBlockStreamer = () => {
    setShowMoreMenu(false);
    const confirmed = window.confirm(`Are you sure you want to block ${mockStream.streamer}?`);
    if (confirmed) {
      console.log('Streamer blocked:', mockStream.streamer);
      alert(`${mockStream.streamer} has been blocked.`);
      navigate('/streams');
    }
  };

  const handleStreamSettings = () => {
    setShowMoreMenu(false);
    console.log('Opening stream settings...');
    // In a real app, this would open a settings modal
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Stream Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/streams')}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src={mockStream.avatar}
                alt={mockStream.streamer}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">{mockStream.streamer}</h3>
                <p className="text-sm text-white/70">{mockStream.title}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm">{mockStream.viewers.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleMoreOptions}
              className="p-2 hover:bg-white/10 rounded-full relative more-menu-container"
            >
              <MoreVertical className="w-6 h-6" />
              {showMoreMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg py-2 min-w-[200px] z-20 more-menu-container">
                  <button 
                    onClick={handleReportStream}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  >
                    Report Stream
                  </button>
                  <button 
                    onClick={handleBlockStreamer}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  >
                    Block Streamer
                  </button>
                  <button 
                    onClick={handleStreamSettings}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stream Content */}
      <div className="flex-1 bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
      </div>

      {/* Stream Footer */}
      <div className="bg-black/90 text-white p-4">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 transition-colors ${
              isLiked ? 'bg-red-500/20 text-red-400' : 'bg-white/10'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button
            onClick={() => setShowGiftMenu(!showGiftMenu)}
            className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <Gift className="w-5 h-5" />
            <span>Gift</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="max-h-40 overflow-y-auto mb-4 space-y-2"
        >
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {msg.user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-white/70">{msg.user?.email}</p>
                <p className="text-white">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Gift Menu */}
        {showGiftMenu && (
          <div className="bg-white rounded-t-2xl p-4 absolute bottom-0 left-0 right-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-black font-semibold">Send a Gift</h3>
              <button
                onClick={() => setShowGiftMenu(false)}
                className="text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {mockGifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift)}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100"
                >
                  <span className="text-2xl mb-2">{gift.icon}</span>
                  <span className="text-black text-sm font-medium">
                    {gift.name}
                  </span>
                  <span className="text-gray-500 text-xs">
                    ${gift.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={user ? "Say something..." : "Login to chat"}
            disabled={!user}
            className="flex-1 bg-white/10 text-white placeholder-white/50 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !user}
            className="p-2 bg-purple-500 rounded-full disabled:bg-gray-500"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamView;