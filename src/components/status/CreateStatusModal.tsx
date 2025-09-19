import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, XCircle, Check } from 'lucide-react';
import { statusService, Status } from '../../services/statusService';

interface CreateStatusModalProps {
  onClose: () => void;
  onStatusCreated: (status: Status) => void;
}

const CreateStatusModal: React.FC<CreateStatusModalProps> = ({ onClose, onStatusCreated }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusType, setStatusType] = useState<'photo' | 'video' | 'text'>('photo');
  const [textContent, setTextContent] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('bg-gradient-to-br from-purple-600 to-blue-500');
  
  const backgrounds = [
    'bg-gradient-to-br from-purple-600 to-blue-500',
    'bg-gradient-to-r from-green-400 to-blue-500',
    'bg-gradient-to-r from-pink-500 to-yellow-500',
    'bg-gradient-to-r from-red-500 to-purple-500',
    'bg-gradient-to-r from-yellow-400 to-orange-500',
    'bg-gradient-to-r from-blue-400 to-emerald-400',
    'bg-gradient-to-r from-indigo-500 to-purple-500',
    'bg-gradient-to-r from-rose-400 to-orange-300',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (selectedFile.type.startsWith('image/')) {
      setStatusType('photo');
    } else if (selectedFile.type.startsWith('video/')) {
      setStatusType('video');
    } else {
      alert('Please select an image or video file');
      return;
    }

    // Check file size (max 15MB)
    if (selectedFile.size > 15 * 1024 * 1024) {
      alert('File size should be less than 15MB');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUploading(true);
      
      let createdStatus: Status;
      
      if (statusType === 'text') {
        // Create text status
        createdStatus = await statusService.createTextStatus(textContent, selectedBackground, caption);
      } else {
        // Create media status
        if (!file) {
          alert('Please select a file or enter text');
          setIsUploading(false);
          return;
        }
        createdStatus = await statusService.createStatus(file, caption);
      }
      
      onStatusCreated(createdStatus);
      onClose();
    } catch (error) {
      console.error('Error creating status:', error);
      alert('Failed to create status. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Same validation as file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.files = e.dataTransfer.files;
      const event = { target: fileInput } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  }, []);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchToTextStatus = () => {
    setStatusType('text');
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md overflow-hidden"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Status</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {/* Status type selector */}
          <div className="flex mb-4 border-b pb-3">
            <button
              onClick={() => setStatusType('photo')}
              className={`flex-1 py-2 text-sm font-medium ${
                statusType === 'photo'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              Photo
            </button>
            <button
              onClick={() => setStatusType('video')}
              className={`flex-1 py-2 text-sm font-medium ${
                statusType === 'video'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              Video
            </button>
            <button
              onClick={switchToTextStatus}
              className={`flex-1 py-2 text-sm font-medium ${
                statusType === 'text'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              }`}
            >
              Text
            </button>
          </div>

          {statusType === 'text' ? (
            <div className="mb-4">
              <div className={`p-6 rounded-lg mb-4 ${selectedBackground} min-h-[200px] flex items-center justify-center`}>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type your status..."
                  className="w-full bg-transparent text-white text-xl font-medium placeholder-white/70 border-none focus:ring-0 resize-none"
                  rows={4}
                  maxLength={200}
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {backgrounds.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setSelectedBackground(bg)}
                    className={`w-8 h-8 rounded-full ${bg} ${selectedBackground === bg ? 'ring-2 ring-purple-600' : ''}`}
                  />
                ))}
              </div>
            </div>
          ) : !preview ? (
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={openFilePicker}
            >
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Add to your status
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Tap to add a {statusType === 'photo' ? 'photo' : 'video'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your status will disappear after 24 hours
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept={statusType === 'photo' ? "image/*" : "video/*"}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="relative">
              {statusType === 'video' ? (
                <video
                  src={preview}
                  className="w-full rounded-lg max-h-[60vh] object-contain bg-black"
                  controls
                  autoPlay
                  loop
                  muted
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-lg max-h-[60vh] object-contain"
                />
              )}
              
              <button
                onClick={removeFile}
                className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6 text-red-500" />
              </button>
            </div>
          )}

          <div className="mt-4">
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Add a caption (optional)
            </label>
            <textarea
              id="caption"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
              {caption.length}/200
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={(statusType !== 'text' && !file) || (statusType === 'text' && !textContent) || isUploading}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Check size={16} />
                Post Status
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStatusModal;
