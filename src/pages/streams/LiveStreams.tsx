import React, { useState, useEffect } from 'react';
import { Plus, Users, Heart, Share2, Gift, Video, Upload, Radio } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StatusArea from '../../components/status/StatusArea';
import { videoService } from '../../services/videoService';

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedStreams, setLikedStreams] = useState<Set<string>>(new Set());
  const [streamLikes, setStreamLikes] = useState<Record<string, number>>({});
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch videos and shorts from Appwrite
        const [videos, shorts] = await Promise.all([
          videoService.getVideos(),
          videoService.getShorts()
        ]);
        
        // Convert videos and shorts to stream format
        const videoStreams: Stream[] = videos.map(video => ({
          id: video.$id,
          title: video.title,
          streamer: video.userName,
          avatar: video.userAvatar || 'https://via.placeholder.com/40',
          thumbnail: video.thumbnailUrl || video.videoUrl,
          viewers: video.views,
          likes: video.likes,
          tags: video.tags,
          isPaid: false,
          createdAt: video.$createdAt
        }));
        
        const shortStreams: Stream[] = shorts.map(short => ({
          id: short.$id,
          title: short.caption || 'Short Video',
          streamer: short.userName,
          avatar: short.userAvatar || 'https://via.placeholder.com/40',
          thumbnail: short.thumbnailUrl || short.videoUrl,
          viewers: short.views,
          likes: short.likes,
          tags: ['short'],
          isPaid: false,
          createdAt: short.$createdAt
        }));
        
        setStreams([...videoStreams, ...shortStreams]);
      } catch (err) {
        console.error('Error fetching streams:', err);
        setError('Failed to load content. Please try again later.');
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

  // Sort streams by viewers (most popular first)
  const sortedStreams = [...filteredStreams].sort((a: Stream, b: Stream) => {
    return b.viewers - a.viewers;
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
    <div className="h-full flex flex-col bg-white">
      {/* Status Area - WhatsApp-like statuses */}
      <StatusArea />
      
      {/* YouTube-Style Filters Bar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Tabs */}
            {[
              { id: 'all', label: 'All', icon: '🔥' },
              { id: 'gaming', label: 'Gaming', icon: '🎮' },
              { id: 'music', label: 'Music', icon: '🎵' },
              { id: 'education', label: 'Education', icon: '📚' },
              { id: 'wellness', label: 'Wellness', icon: '🧘' },
              { id: 'tech', label: 'Tech', icon: '💻' },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Streams Grid - YouTube Style */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-3 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sortedStreams.map((stream) => (
            <Link
              key={stream.id}
              to={`/streams/live/${stream.id}`}
              className="group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-2">
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Live Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
                {/* Viewers Count */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-xs font-medium rounded flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {stream.viewers.toLocaleString()}
                </div>
                {/* Price Badge */}
                {stream.isPaid && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded">
                    ${stream.price}
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Stream Info - YouTube Style */}
              <div className="flex gap-2">
                {/* Avatar */}
                <img
                  src={stream.avatar}
                  alt={stream.streamer}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-gray-700">
                    {stream.title}
                  </h3>
                  <p className="text-xs text-gray-600">{stream.streamer}</p>
                  
                  {/* Tags */}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {stream.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-gray-100 text-xs text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Actions - Compact */}
                  <div className="flex items-center gap-3 mt-2 text-gray-500">
                    <button 
                      onClick={(e) => handleLike(stream.id, e)}
                      className={`flex items-center gap-1 text-xs hover:text-red-500 transition-colors ${
                        likedStreams.has(stream.id) ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedStreams.has(stream.id) ? 'fill-current' : ''}`} />
                      <span>{streamLikes[stream.id] || stream.likes}</span>
                    </button>
                    <button 
                      onClick={(e) => handleShare(stream.id, e)}
                      className="flex items-center gap-1 text-xs hover:text-blue-500 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleGift(stream.id, e)}
                      className="flex items-center gap-1 text-xs hover:text-purple-500 transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Create Menu Button - YouTube Style */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Menu Options */}
        {showCreateMenu && (
          <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-2 mb-2 min-w-[200px] animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={() => {
                navigate('/streams/create');
                setShowCreateMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Radio className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Go Live</p>
                <p className="text-xs text-gray-500">Start streaming now</p>
              </div>
            </button>
            
            <button
              onClick={() => {
                navigate('/streams/upload');
                setShowCreateMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Upload Video</p>
                <p className="text-xs text-gray-500">Share a recorded video</p>
              </div>
            </button>
            
            <button
              onClick={() => {
                navigate('/streams/shorts/create');
                setShowCreateMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Create Short</p>
                <p className="text-xs text-gray-500">Quick video clip</p>
              </div>
            </button>
          </div>
        )}
        
        {/* Main + Button */}
        <button
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 ${
            showCreateMenu 
              ? 'bg-gray-900 rotate-45' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

export default LiveStreams;