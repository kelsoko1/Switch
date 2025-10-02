import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Film, Image as ImageIcon, Check, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { videoService } from '../../services/videoService';

const UploadVideo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    
    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      setError('Video size must be less than 500MB');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file for thumbnail');
      return;
    }
    
    setThumbnail(file);
    const url = URL.createObjectURL(file);
    setThumbnailUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setError('Please select a video and enter a title');
      return;
    }

    if (!user) {
      setError('You must be logged in to upload videos');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Upload video file
      setUploadProgress(20);
      const videoUpload = await videoService.uploadVideoFile(selectedFile);
      
      // Upload thumbnail if provided
      setUploadProgress(50);
      let thumbnailUrl: string | undefined;
      if (thumbnail) {
        const thumbnailUpload = await videoService.uploadThumbnail(thumbnail);
        thumbnailUrl = thumbnailUpload.url;
      }

      // Create video document
      setUploadProgress(80);
      await videoService.createVideo({
        title,
        description,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        videoUrl: videoUpload.url,
        thumbnailUrl,
        isPublic,
        userId: user.$id,
        userName: user.name,
        userAvatar: (user.prefs as any)?.avatar
      });

      setUploadProgress(100);

      // Success - navigate back
      setTimeout(() => {
        navigate('/streams');
      }, 500);
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    navigate('/streams');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Upload Video</h1>
          <button
            onClick={handleCancel}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Video Upload */}
          <div className="space-y-6">
            {/* Video Upload Area */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Video File</h2>
              
              {!selectedFile ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Click to upload video
                  </p>
                  <p className="text-sm text-gray-500">
                    MP4, MOV, AVI up to 500MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-black">
                    <video
                      src={previewUrl || ''}
                      controls
                      className="w-full aspect-video object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Film className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thumbnail</h2>
              
              {!thumbnailUrl ? (
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Upload thumbnail
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG (1280x720 recommended)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    className="w-full aspect-video object-cover rounded-xl"
                  />
                  <button
                    onClick={() => {
                      setThumbnail(null);
                      setThumbnailUrl(null);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove thumbnail
                  </button>
                </div>
              )}
              
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Right Column - Video Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Details</h2>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers about your video"
                    maxLength={5000}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{description.length}/5000</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select category</option>
                    <option value="gaming">Gaming</option>
                    <option value="music">Music</option>
                    <option value="education">Education</option>
                    <option value="wellness">Wellness</option>
                    <option value="tech">Tech</option>
                    <option value="entertainment">Entertainment</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="gaming, tutorial, fun (comma separated)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Visibility
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={isPublic}
                        onChange={() => setIsPublic(true)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-900">Public - Anyone can watch</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isPublic}
                        onChange={() => setIsPublic(false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-900">Private - Only you can watch</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="font-medium text-gray-900">Uploading...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{uploadProgress}% complete</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || isUploading}
                className="flex-1 px-6 py-3 bg-blue-600 rounded-lg font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Upload Video
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;
