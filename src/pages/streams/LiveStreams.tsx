import React, { useState, useEffect } from 'react';
import { Play, Users, Heart, Share2, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusArea from '../../components/status/StatusArea';

interface Stream {
  id: string;
  title: string;
  streamer: string;
  avatar: string;
  thumbnail: string;
  viewers: number;
  likes: number;
  tags: string[];
  isPaid: boolean;
  price?: number;
  createdAt: string;
}

const LiveStreams = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedStreams, setLikedStreams] = useState<Set<string>>(new Set());
  const [streamLikes, setStreamLikes] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        setError(null);
        // Using a mock response since the API endpoint doesn't exist yet
        const mockStreams: Stream[] = [];
        setStreams(mockStreams);
        
        // Uncomment this when your API is ready
        // const response = await axios.get('/api/streams/live');
        // setStreams(response.data || []);
      } catch (err) {
        console.error('Error fetching streams:', err);
        setError('Failed to load live streams. Please try again later.');
        setStreams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  // Initialize stream likes when streams are loaded
  useEffect(() => {
    if (streams.length > 0) {
      const initialLikes: Record<string, number> = {};
      streams.forEach(stream => {
        initialLikes[stream.id] = stream.likes;
      });
      setStreamLikes(initialLikes);
    }
  }, [streams]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading live streams...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  // Filter streams based on selected category
  const filteredStreams = Array.isArray(streams) ? streams.filter((stream: Stream) => 
    selectedCategory === 'all' || (stream.tags && stream.tags.includes(selectedCategory.toLowerCase()))
  ) : [];

  // Sort streams based on active tab
  const sortedStreams = [...filteredStreams].sort((a: Stream, b: Stream) => {
    if (activeTab === 'popular') {
      return b.viewers - a.viewers;
    } else if (activeTab === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // featured (default)
      return (b.viewers * 0.7 + b.likes * 0.3) - (a.viewers * 0.7 + a.likes * 0.3);
    }
  });

  const handleLike = (streamId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking like
    e.stopPropagation();
    
    setLikedStreams(prev => {
      const newLikedStreams = new Set(prev);
      if (newLikedStreams.has(streamId)) {
        newLikedStreams.delete(streamId);
        setStreamLikes(prevLikes => ({
          ...prevLikes,
          [streamId]: prevLikes[streamId] - 1
        }));
      } else {
        newLikedStreams.add(streamId);
        setStreamLikes(prevLikes => ({
          ...prevLikes,
          [streamId]: prevLikes[streamId] + 1
        }));
      }
      return newLikedStreams;
    });
  };

  const handleShare = (streamId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const stream = streams.find(s => s.id === streamId);
    if (stream && navigator.share) {
      navigator.share({
        title: stream.title,
        text: `Check out this live stream: ${stream.title} by ${stream.streamer}`,
        url: window.location.origin + `/streams/live/${streamId}`
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      const url = window.location.origin + `/streams/live/${streamId}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Stream link copied to clipboard!');
      }).catch(console.error);
    }
  };

  const handleGift = (streamId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/streams/live/${streamId}?action=gift`);
  };



  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Status Area - WhatsApp-like statuses */}
      <StatusArea />
      
      {/* Categories */}
      <div className="p-4 border-b bg-white">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Gaming', 'Music', 'Education', 'Wellness', 'Tech'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        {[
          { id: 'featured', label: 'Featured' },
          { id: 'following', label: 'Following' },
          { id: 'trending', label: 'Trending' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Streams Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStreams.map((stream) => (
            <Link
              key={stream.id}
              to={`/streams/live/${stream.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                  LIVE
                </div>
                {stream.isPaid && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded">
                    ${stream.price}
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 text-white text-sm">
                  <Users className="w-4 h-4" />
                  <span>{stream.viewers.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={stream.avatar}
                    alt={stream.streamer}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {stream.title}
                    </h3>
                    <p className="text-sm text-gray-500">{stream.streamer}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-gray-500">
                  <button 
                    onClick={(e) => handleLike(stream.id, e)}
                    className={`flex items-center gap-1 text-sm hover:text-red-500 transition-colors ${
                      likedStreams.has(stream.id) ? 'text-red-500' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedStreams.has(stream.id) ? 'fill-current' : ''}`} />
                    <span>{streamLikes[stream.id] || stream.likes}</span>
                  </button>
                  <button 
                    onClick={(e) => handleShare(stream.id, e)}
                    className="flex items-center gap-1 text-sm hover:text-blue-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button 
                    onClick={(e) => handleGift(stream.id, e)}
                    className="flex items-center gap-1 text-sm hover:text-purple-500 transition-colors"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Gift</span>
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  {stream.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Go Live Button */}
      <button
        onClick={() => navigate('/streams/create')}
        className="absolute bottom-20 right-4 w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-600 transition-colors"
      >
        <Play className="w-6 h-6" />
      </button>
    </div>
  );
};

export default LiveStreams;