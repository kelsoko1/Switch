import { useEffect, useState, useCallback } from 'react';
import xmppService from '../services/xmpp';
import webrtcService from '../services/webrtc';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to manage real-time communication (chat and video calls)
 */
function useRealtime() {
  const { user } = useAuth();
  const [isXmppConnected, setIsXmppConnected] = useState(false);
  const [isWebRTCReady, setIsWebRTCReady] = useState(false);
  const [activeCalls, setActiveCalls] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeChat, setActiveChat] = useState(null);

  // Connect to XMPP service when user logs in
  useEffect(() => {
    if (!user) return;

    const connectXMPP = async () => {
      try {
        await xmppService.connect(user.id, user.xmppPassword);
        setIsXmppConnected(true);
        
        // Set up message handler
        const handleMessage = (message) => {
          // Update unread count if message is not from active chat
          if (!activeChat || message.from !== activeChat.id) {
            setUnreadCount(prev => prev + 1);
          }
          // TODO: Emit message event for components to handle
        };
        
        xmppService.onMessage(handleMessage);
        
        return () => {
          xmppService.disconnect();
          setIsXmppConnected(false);
        };
      } catch (error) {
        console.error('Failed to connect to XMPP:', error);
      }
    };

    connectXMPP();
  }, [user, activeChat]);

  // Initialize WebRTC service
  useEffect(() => {
    if (!user) return;

    const initWebRTC = async () => {
      try {
        await webrtcService.initialize();
        setIsWebRTCReady(true);
        
        // Set up WebRTC event handlers
        webrtcService.on('publishers', handleNewPublishers);
        webrtcService.on('publisherLeft', handlePublisherLeft);
        
        return () => {
          webrtcService.disconnect();
          setIsWebRTCReady(false);
        };
      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
      }
    };

    initWebRTC();
  }, [user]);

  // Handle new video publishers (incoming calls)
  const handleNewPublishers = useCallback((publishers) => {
    const newCalls = publishers.map(publisher => ({
      id: publisher.id,
      displayName: publisher.display,
      roomId: publisher.room,
      timestamp: new Date()
    }));
    
    setActiveCalls(prevCalls => [...prevCalls, ...newCalls]);
  }, []);

  // Handle publisher leaving (call ended)
  const handlePublisherLeft = useCallback((publisherId) => {
    setActiveCalls(prevCalls => 
      prevCalls.filter(call => call.id !== publisherId)
    );
  }, []);

  // Start a video call
  const startCall = useCallback(async (userId, displayName) => {
    if (!isWebRTCReady) {
      throw new Error('WebRTC not ready');
    }
    
    // Create a room for the call
    const roomId = `call-${user.id}-${userId}-${Date.now()}`;
    await webrtcService.connectToRoom(roomId, displayName);
    
    // Get user media
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    
    // Publish stream
    await webrtcService.publish(stream);
    
    // Return the room ID for sharing with the other participant
    return roomId;
  }, [isWebRTCReady, user?.id]);

  // Join an existing call
  const joinCall = useCallback(async (roomId, displayName) => {
    if (!isWebRTCReady) {
      throw new Error('WebRTC not ready');
    }
    
    await webrtcService.connectToRoom(roomId, displayName);
    
    // Get user media
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    
    // Publish stream
    await webrtcService.publish(stream);
    
    // Remove from active calls
    setActiveCalls(prev => prev.filter(call => call.roomId !== roomId));
  }, [isWebRTCReady]);

  // End the current call
  const endCall = useCallback(() => {
    return webrtcService.disconnect();
  }, []);

  // Send a chat message
  const sendMessage = useCallback(async (to, message) => {
    if (!isXmppConnected) {
      throw new Error('XMPP not connected');
    }
    
    return xmppService.sendMessage(to, message);
  }, [isXmppConnected]);

  // Set active chat and reset unread count
  const setActiveChatWithReset = useCallback((chatId) => {
    setActiveChat(chatId);
    if (chatId) {
      setUnreadCount(0);
    }
  }, []);

  return {
    // Connection status
    isXmppConnected,
    isWebRTCReady,
    
    // Chat functionality
    sendMessage,
    unreadCount,
    activeChat,
    setActiveChat: setActiveChatWithReset,
    
    // Video call functionality
    activeCalls,
    startCall,
    joinCall,
    endCall,
    
    // Services for direct access if needed
    xmppService,
    webrtcService
  };
}

export default useRealtime;
