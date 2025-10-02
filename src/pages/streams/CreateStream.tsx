import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera, DollarSign, Mic } from 'lucide-react';
import { SimpleWebRTCManager, createSimpleWebRTCManager } from '../../lib/webrtc-simple';

const CreateStream = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamTitle, setStreamTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('5');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamId] = useState(() => `stream_${Date.now()}`);
  const [isStarting, setIsStarting] = useState(false);

  const categories = ['Gaming', 'Music', 'Education', 'Wellness', 'Tech', 'Art', 'Cooking'];
  const suggestedTags = ['Beginner', 'Advanced', 'Tutorial', 'Entertainment', 'Q&A'];

  useEffect(() => {
    let manager: SimpleWebRTCManager | null = null;
    let mounted = true;

    const initializeStream = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create WebRTC manager with correct signature
        manager = createSimpleWebRTCManager(streamId, true, {
          onConnectionStateChange: (state) => {
            console.log('Connection state:', state);
            if (state === 'failed' || state === 'disconnected') {
              setError('Connection lost. Please check your internet connection.');
            }
          }
        });

        if (!mounted) return;

        // Initialize WebRTC
        await manager.initialize();

        // Start local stream
        const stream = await manager.startStream();
        
        if (mounted && videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to start stream:', error);
        if (mounted) {
          setError('Failed to access camera/microphone. Please check permissions.');
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

  const handleStartStream = async () => {
    if (!streamTitle.trim()) {
      setError('Please enter a stream title');
      return;
    }

    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      // TODO: Save stream metadata to database
      // await database.createDocument(COLLECTIONS.STREAMS, {
      //   streamId,
      //   title: streamTitle,
      //   category: selectedCategory,
      //   tags: selectedTags,
      //   isPaid,
      //   price: isPaid ? parseFloat(price) : 0,
      //   status: 'live'
      // });

      // Navigate to live stream view
      navigate(`/streams/live/${streamId}`);
    } catch (error) {
      console.error('Failed to start stream:', error);
      setError('Failed to start stream. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraEnabled;
      });
      setIsCameraEnabled(!isCameraEnabled);
    }
  };

  const toggleMic = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMicEnabled;
      });
      setIsMicEnabled(!isMicEnabled);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Create Live Stream</h2>
            <button
              onClick={() => navigate('/streams')}
              className="text-gray-500 hover:text-gray-700"
              disabled={isStarting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Stream Preview */}
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Initializing camera...</p>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={toggleCamera}
                  className={`p-2 rounded-full ${
                    isCameraEnabled ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                  } hover:bg-white/30`}
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-full ${
                    isMicEnabled ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                  } hover:bg-white/30`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stream Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stream Title
                </label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="What are you streaming about?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="w-4 h-4 text-purple-500 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Paid Stream</span>
                </label>
                {isPaid && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-6 bg-gray-50">
          <button
            onClick={handleStartStream}
            disabled={isStarting || isLoading || !streamTitle || !selectedCategory}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Starting Stream...
              </>
            ) : isLoading ? (
              'Initializing...'
            ) : (
              'Start Streaming'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStream;