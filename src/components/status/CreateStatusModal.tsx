import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Video, Image } from 'lucide-react';
import { StatusView, statusViewService } from '../../services/statusService';

type MediaRecorderType = MediaRecorder;

type MediaError = Error & {
  name: 'NotAllowedError' | 'NotFoundError' | 'NotReadableError' | 'OverconstrainedError' | 'TypeError';
  message: string;
  constraint?: string;
};

interface CreateStatusModalProps {
  onClose: () => void;
  onStatusCreated: (status: StatusView) => void;
}

const CreateStatusModal: React.FC<CreateStatusModalProps> = ({ onClose, onStatusCreated }) => {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'gallery'>('camera');
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorderType | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check camera and microphone access
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();
        
        setHasCameraAccess(videoTracks.length > 0);
        setHasMicrophoneAccess(audioTracks.length > 0);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        const error = err as MediaError;
        console.error('Error checking permissions:', error);
        setHasCameraAccess(false);
        setHasMicrophoneAccess(false);
        
        if (error.name === 'NotAllowedError') {
          setError('Please allow camera and microphone access to create status updates');
        } else if (error.name === 'NotFoundError') {
          setError('No camera/microphone found. Please check your device settings.');
        }
      }
    };

    checkPermissions();
  }, []);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Please select an image or video file');
      return;
    }
    
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Handle recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], 'recorded-video.webm', { type: 'video/webm' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Start recording timer
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            if (recordingIntervalRef.current) {
              clearInterval(recordingIntervalRef.current);
            }
            handleStopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera/microphone. Please check permissions.');
    }
  };
  
  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Stop all tracks
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
    }
  }, [mediaStream]);

  const handleSubmit = async () => {
    if (!caption.trim() && !selectedFile) {
      setError('Please add a caption or select a file');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      let status: StatusView | null = null;
      
      if (selectedFile) {
        // Handle media status
        const statusType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
        status = await statusViewService.createStatusWithMedia(
          caption,
          statusType,
          selectedFile
        );
      } else {
        // Handle text-only status
        status = await statusViewService.createStatusWithText(caption);
      }
      
      if (status) {
        onStatusCreated(status);
        onClose();
      } else {
        throw new Error('Failed to create status');
      }
    } catch (error) {
      console.error('Error creating status:', error);
      setError('Failed to create status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
      
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [mediaStream, previewUrl]);

  // Memoize the preview element to avoid unnecessary re-renders
  const previewElement = useMemo(() => {
    if (!previewUrl) return null;
    
    return selectedFile?.type.startsWith('video/') ? (
      <video
        src={previewUrl}
        controls
        className="w-full h-64 object-cover rounded"
        aria-label="Recorded video preview"
      />
    ) : (
      <img
        src={previewUrl}
        alt="Preview"
        className="w-full h-64 object-cover rounded"
      />
    );
  }, [previewUrl, selectedFile]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
    >
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading || isRecording}
          >
            <X className="w-5 h-5" />
          </button>
          <h2 id="status-modal-title" className="text-lg font-semibold">Create Status</h2>
          <button
            onClick={handleSubmit}
            disabled={isLoading || isRecording || (!caption.trim() && !selectedFile)}
            className={`font-medium ${(isLoading || isRecording) ? 'text-gray-400' : 'text-blue-600'}`}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isLoading || isRecording}
            />
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden mb-4">
            <div className="flex border-b">
              <button
                className={`flex-1 py-2 text-center ${activeTab === 'camera' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('camera')}
                disabled={isRecording}
              >
                Camera
              </button>
              <button
                className={`flex-1 py-2 text-center ${activeTab === 'gallery' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('gallery')}
                disabled={isRecording}
              >
                Gallery
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'camera' ? (
                <div className="flex flex-col items-center">
                  {previewElement ? (
                    <div className="relative w-full">
                      {previewElement}
                      <button
                        onClick={() => {
                          setPreviewUrl(null);
                          setSelectedFile(null);
                        }}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                        aria-label="Remove media"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
                      {isRecording ? (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-red-500 flex items-center justify-center text-white">
                            <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-gray-600">Recording... {30 - recordingTime}s</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <button
                            onClick={handleStartRecording}
                            className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto mb-2"
                            disabled={!hasCameraAccess || !hasMicrophoneAccess}
                          >
                            <Video className="w-6 h-6" />
                          </button>
                          <p className="text-gray-600">Record a video status</p>
                        </div>
                      )}
                    </div>
                  )}

                  {isRecording && (
                    <button
                      onClick={handleStopRecording}
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full flex items-center"
                    >
                      <span className="mr-2">Stop Recording</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,video/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
                  >
                    <Image className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-600">Click to select an image or video</p>
                    <p className="text-sm text-gray-500 mt-1">Max 50MB</p>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStatusModal;