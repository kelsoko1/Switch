import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, XCircle, Check } from 'lucide-react';
import { statusViewService, StatusView } from '../../services/statusService';

interface CreateStatusModalProps {
  onClose: () => void;
  onStatusCreated: (status: StatusView) => void;
}

const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  onClose,
  onStatusCreated,
}) => {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Please select an image or video file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, []);

  const handleSubmit = async () => {
    if (!caption.trim() && !selectedFile) {
      setError('Please add a caption or select a file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let status: StatusView | null;

      if (selectedFile) {
        status = await statusViewService.createStatusWithMedia(selectedFile, caption);
      } else {
        status = await statusViewService.createStatusWithText(caption);
      }

      if (!status) {
        throw new Error('Failed to create status');
      }

      onStatusCreated(status);
      onClose();
    } catch (err) {
      console.error('Error creating status:', err);
      setError('Failed to create status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Status</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Media preview */}
          {previewUrl && (
            <div className="relative mb-4">
              {selectedFile?.type.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={previewUrl}
                  className="w-full h-64 object-cover rounded-lg"
                  controls
                />
              )}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Caption input */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
          />

          {/* Error message */}
          {error && (
            <div className="mt-2 text-red-500 text-sm">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center text-purple-600 hover:text-purple-700"
          >
            <Camera className="w-5 h-5 mr-1" />
            <span>Add Media</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!caption.trim() && !selectedFile)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Creating...</span>
            ) : (
              <>
                <Check className="w-5 h-5 mr-1" />
                <span>Create</span>
              </>
            )}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CreateStatusModal;
