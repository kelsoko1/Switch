import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Radio, Users, MessageCircle, Heart, Send, Mic, MicOff, Video, VideoOff, Loader } from 'lucide-react';
import { SimpleWebRTCManager, createSimpleWebRTCManager } from '../../lib/webrtc-simple';
import { useAuth } from '../../contexts/AuthContext';
import { liveStreamService } from '../../services/liveStreamService';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
}



const CreateStreamNew: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  // Stream state
  const [streamManager, setStreamManager] = useState<SimpleWebRTCManager | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamId] = useState(() => `stream_${Date.now()}`);
  
  // Stream settings
  const [streamTitle, setStreamTitle] = useState('');
  const [showSettings, setShowSettings] = useState(true);
  
  // Controls
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  
  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    let manager: SimpleWebRTCManager | null = null;
    let mounted = true;

    const initializeStream = async () => {
      try {
        setIsLoading(true);
        setError(null);

        manager = createSimpleWebRTCManager(streamId, true, {
          onConnectionStateChange: (state) => {
            console.log('Connection state:', state);
            if (state === 'failed' || state === 'disconnected') {
              setError('Connection lost. Please check your internet connection.');
            }
          }
        });

        if (!mounted) return;
        setStreamManager(manager);

        await manager.initialize();
        const stream = await manager.startStream();

        if (videoRef.current && mounted) {
          videoRef.current.srcObject = stream;
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing stream:', err);
        if (mounted) {
          setError('Failed to access camera. Please check permissions.');
          setIsLoading(false);
        }
      }
    };

    initializeStream();

    return () => {
      mounted = false;
      if (manager) {
        manager.stopStream();
      }
    };
  }, [streamId]);

  // Auto-scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Load existing comments when stream starts
  useEffect(() => {
    if (!isLive) return;

    const loadComments = async () => {
      try {
        const streamComments = await liveStreamService.getStreamComments(streamId);

        const loadedComments: Comment[] = streamComments.map(doc => ({
          id: doc.$id,
          userId: doc.userId,
          userName: doc.userName,
          userAvatar: doc.userAvatar,
          message: doc.message,
          timestamp: new Date(doc.timestamp)
        }));

        setComments(loadedComments);
      } catch (err) {
        console.error('Error loading comments:', err);
      }
    };

    loadComments();
  }, [isLive, streamId]);

  const handleGoLive = async () => {
    if (!streamTitle.trim()) {
      setError('Please enter a stream title');
      return;
    }

    if (!user) {
      setError('You must be logged in to stream');
      return;
    }

    try {
      // Create stream using service
      await liveStreamService.createStream({
        streamId,
        title: streamTitle,
        streamerId: user.$id,
        streamerName: user.name,
        streamerAvatar: (user.prefs as any)?.avatar
      });

      setIsLive(true);
      setShowSettings(false);
      setError(null);
      
      // Simulate viewer count updates (replace with real-time subscription)
      const interval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 5));
      }, 5000);

      return () => clearInterval(interval);
    } catch (err) {
      console.error('Error starting stream:', err);
      setError('Failed to start stream. Please try again.');
    }
  };

  const handleEndStream = async () => {
    try {
      // End stream using service
      await liveStreamService.endStream(streamId, viewerCount, likeCount);
    } catch (err) {
      console.error('Error ending stream:', err);
    }

    if (streamManager) {
      streamManager.stopStream();
    }
    navigate('/streams');
  };

  const toggleMic = () => {
    if (streamManager) {
      const newState = !isMicEnabled;
      streamManager.toggleAudio(newState);
      setIsMicEnabled(newState);
    }
  };

  const toggleCamera = () => {
    if (streamManager) {
      const newState = !isCameraEnabled;
      streamManager.toggleVideo(newState);
      setIsCameraEnabled(newState);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.$id,
      userName: user.name,
      userAvatar: (user.prefs as any)?.avatar,
      message: newComment,
      timestamp: new Date()
    };

    try {
      // Save comment using service
      await liveStreamService.addComment({
        streamId,
        userId: user.$id,
        userName: user.name,
        userAvatar: (user.prefs as any)?.avatar,
        message: newComment
      });

      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      console.error('Error sending comment:', err);
      // Still show comment locally even if save fails
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const handleLike = async () => {
    const newLikeCount = likeCount + 1;
    setLikeCount(newLikeCount);

    try {
      // Update like count using service
      await liveStreamService.updateLikeCount(streamId, newLikeCount);
    } catch (err) {
      console.error('Error updating likes:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white">Setting up camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={handleEndStream}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {isLive && (
            <div className="flex items-center gap-3">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              <div className="bg-black/50 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                {viewerCount}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowComments(!showComments)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        {isLive && (
          <div className="mt-3">
            <h2 className="text-white font-semibold text-lg">{streamTitle}</h2>
            <p className="text-white/80 text-sm">{user?.name}</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-10 p-4 bg-red-500 text-white rounded-lg">
          {error}
        </div>
      )}

      {/* Settings Modal (Before Going Live) */}
      {showSettings && !isLive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Go Live</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream Title *
                </label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="What's your stream about?"
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">{streamTitle.length}/100</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/streams')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoLive}
                  disabled={!streamTitle.trim()}
                  className="flex-1 px-6 py-3 bg-red-600 rounded-lg font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Radio className="w-5 h-5" />
                  Go Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Sidebar */}
      {isLive && showComments && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-black/70 backdrop-blur-sm flex flex-col">
          {/* Comments Header */}
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </h3>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs">Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {comment.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/90 text-sm font-medium">{comment.userName}</p>
                    <p className="text-white text-sm break-words">{comment.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder="Say something..."
                maxLength={200}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                onClick={handleSendComment}
                disabled={!newComment.trim()}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      {isLive && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            {/* Left: Stream Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMic}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${
                  isMicEnabled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-red-600 text-white'
                }`}
              >
                {isMicEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              
              <button
                onClick={toggleCamera}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${
                  isCameraEnabled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-red-600 text-white'
                }`}
              >
                {isCameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
            </div>

            {/* Center: Like Button */}
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all hover:scale-110">
                <Heart className="w-7 h-7" />
              </div>
              <span className="text-white text-sm font-semibold">{likeCount}</span>
            </button>

            {/* Right: End Stream */}
            <button
              onClick={handleEndStream}
              className="px-6 py-3 bg-red-600 rounded-full font-semibold text-white hover:bg-red-700 transition-colors"
            >
              End Stream
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateStreamNew;
