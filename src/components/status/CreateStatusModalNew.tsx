import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Image as ImageIcon, 
  Type, 
  Smile, 
  Send,
  Palette,
  RotateCcw,
  Check
} from 'lucide-react';
import { StatusView, statusViewService } from '../../services/statusService';
import { useAuth } from '../../contexts/AuthContext';

interface CreateStatusModalProps {
  onClose: () => void;
  onStatusCreated: (status: StatusView) => void;
}

// WhatsApp-style background colors
const BG_COLORS = [
  { name: 'Teal', gradient: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)', solid: '#0D9488' },
  { name: 'Blue', gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', solid: '#2563EB' },
  { name: 'Purple', gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)', solid: '#7C3AED' },
  { name: 'Pink', gradient: 'linear-gradient(135deg, #DB2777 0%, #EC4899 100%)', solid: '#DB2777' },
  { name: 'Orange', gradient: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)', solid: '#EA580C' },
  { name: 'Green', gradient: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)', solid: '#16A34A' },
  { name: 'Indigo', gradient: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', solid: '#4F46E5' },
  { name: 'Red', gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)', solid: '#DC2626' },
];

// Text fonts
const TEXT_FONTS = [
  { name: 'Sans', value: 'font-sans' },
  { name: 'Serif', value: 'font-serif' },
  { name: 'Mono', value: 'font-mono' },
];

// Emojis for quick access
const QUICK_EMOJIS = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '😍', '💯', '✨', '🌟', '💪', '🙌'];

const CreateStatusModalNew: React.FC<CreateStatusModalProps> = ({ onClose, onStatusCreated }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'select' | 'text' | 'camera' | 'image'>('select');
  const [textContent, setTextContent] = useState('');
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when in text mode
  useEffect(() => {
    if (mode === 'text' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  // Initialize camera when in camera mode
  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [mode]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(photoUrl);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Please select an image or video file');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMode('image');
  };

  const handleEmojiClick = (emoji: string) => {
    if (mode === 'text') {
      setTextContent(prev => prev + emoji);
      setShowEmojiPicker(false);
      textareaRef.current?.focus();
    } else {
      setCaption(prev => prev + emoji);
      setShowEmojiPicker(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create a status');
      return;
    }

    if (mode === 'text' && !textContent.trim()) {
      setError('Please enter some text');
      return;
    }

    if ((mode === 'image' || mode === 'camera') && !selectedFile && !capturedPhoto) {
      setError('Please select or capture an image');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let newStatus: StatusView | null = null;

      if (mode === 'text') {
        // Text status
        newStatus = await statusViewService.createStatusWithText(textContent);
      } else if (capturedPhoto) {
        // Camera photo - convert base64 to File
        const response = await fetch(capturedPhoto);
        const blob = await response.blob();
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        newStatus = await statusViewService.createStatusWithMedia(
          caption || 'Photo',
          'image',
          file
        );
      } else if (selectedFile) {
        // Uploaded file
        const fileType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
        newStatus = await statusViewService.createStatusWithMedia(
          caption || (fileType === 'image' ? 'Photo' : 'Video'),
          fileType as 'image' | 'video',
          selectedFile
        );
      } else {
        setError('Invalid status data');
        return;
      }

      if (newStatus) {
        onStatusCreated(newStatus);
        onClose();
      } else {
        setError('Failed to create status');
      }
    } catch (err) {
      console.error('Error creating status:', err);
      setError('Failed to create status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderModeSelection = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Status</h2>
      
      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        {/* Text Status */}
        <button
          onClick={() => setMode('text')}
          className="flex items-center gap-4 p-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <Type className="w-7 h-7 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-white font-semibold text-lg">Text</h3>
            <p className="text-white/80 text-sm">Share your thoughts</p>
          </div>
        </button>

        {/* Camera */}
        <button
          onClick={() => setMode('camera')}
          className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-white font-semibold text-lg">Camera</h3>
            <p className="text-white/80 text-sm">Take a photo</p>
          </div>
        </button>

        {/* Gallery */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-white font-semibold text-lg">Gallery</h3>
            <p className="text-white/80 text-sm">Choose from gallery</p>
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );

  const renderTextMode = () => (
    <div 
      className="relative h-full flex flex-col"
      style={{ background: BG_COLORS[selectedBgIndex].gradient }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20">
        <button
          onClick={() => setMode('select')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-2">
          {/* Color picker */}
          <button
            onClick={() => setSelectedBgIndex((prev) => (prev + 1) % BG_COLORS.length)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <Palette className="w-5 h-5 text-white" />
          </button>
          {/* Font picker */}
          <button
            onClick={() => setSelectedFontIndex((prev) => (prev + 1) % TEXT_FONTS.length)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <Type className="w-5 h-5 text-white" />
          </button>
          {/* Emoji picker */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <Smile className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Text input area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <textarea
          ref={textareaRef}
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Type a status..."
          maxLength={700}
          className={`w-full bg-transparent text-white text-center resize-none outline-none placeholder-white/60 ${TEXT_FONTS[selectedFontIndex].value}`}
          style={{ 
            fontSize: textContent.length > 100 ? '1.5rem' : '2rem',
            lineHeight: '1.4'
          }}
          rows={8}
        />
      </div>

      {/* Character count */}
      <div className="text-center pb-4">
        <span className="text-white/60 text-sm">
          {textContent.length} / 700
        </span>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 w-80">
          <div className="grid grid-cols-6 gap-2">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-3xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Send button */}
      <div className="p-4">
        <button
          onClick={handleSubmit}
          disabled={!textContent.trim() || isLoading}
          className="w-full bg-white text-gray-800 font-semibold py-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
              Posting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Post Status
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderCameraMode = () => (
    <div className="relative h-full bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={() => {
            if (capturedPhoto) {
              setCapturedPhoto(null);
              startCamera();
            } else {
              setMode('select');
            }
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        {capturedPhoto && (
          <button
            onClick={() => {
              setCapturedPhoto(null);
              startCamera();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Camera/Photo preview */}
      <div className="flex-1 flex items-center justify-center relative">
        {capturedPhoto ? (
          <img src={capturedPhoto} alt="Captured" className="max-w-full max-h-full object-contain" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Caption input (shown after capture) */}
      {capturedPhoto && (
        <div className="p-4 bg-black/50">
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="flex-1 bg-transparent text-white outline-none placeholder-white/60"
              maxLength={200}
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-white/80 hover:text-white"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji picker for caption */}
      {showEmojiPicker && capturedPhoto && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 w-80 z-20">
          <div className="grid grid-cols-6 gap-2">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-3xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="p-6">
        {capturedPhoto ? (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-teal-500 text-white font-semibold py-4 rounded-full shadow-lg hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Posting...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Post Status
              </>
            )}
          </button>
        ) : (
          <button
            onClick={capturePhoto}
            disabled={!cameraStream}
            className="w-20 h-20 mx-auto bg-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed border-4 border-gray-300"
          />
        )}
      </div>
    </div>
  );

  const renderImageMode = () => (
    <div className="relative h-full bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={() => {
            setMode('select');
            setSelectedFile(null);
            setPreviewUrl(null);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Image/Video preview */}
      <div className="flex-1 flex items-center justify-center relative">
        {selectedFile?.type.startsWith('image/') && previewUrl && (
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
        )}
        {selectedFile?.type.startsWith('video/') && previewUrl && (
          <video src={previewUrl} controls className="max-w-full max-h-full object-contain" />
        )}
      </div>

      {/* Caption input */}
      <div className="p-4 bg-black/50">
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="flex-1 bg-transparent text-white outline-none placeholder-white/60"
            maxLength={200}
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-white/80 hover:text-white"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 w-80 z-20">
          <div className="grid grid-cols-6 gap-2">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-3xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Send button */}
      <div className="p-6">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-teal-500 text-white font-semibold py-4 rounded-full shadow-lg hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Posting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Post Status
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg z-50 max-w-md">
          {error}
        </div>
      )}

      {/* Render appropriate mode */}
      {mode === 'select' && renderModeSelection()}
      {mode === 'text' && renderTextMode()}
      {mode === 'camera' && renderCameraMode()}
      {mode === 'image' && renderImageMode()}
    </div>
  );
};

export default CreateStatusModalNew;
