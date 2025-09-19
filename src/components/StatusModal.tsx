import React, { useState, useRef } from 'react';
import { Camera, Video, MessageSquare, X, Plus } from 'lucide-react';
import { StatusManager, type StatusUpdate } from '../lib/status';
import { cn } from '../lib/utils';

interface StatusModalProps {
  onClose: () => void;
  onStatusCreated?: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ onClose, onStatusCreated }) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'video' | 'text'>('photo');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: activeTab === 'video',
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaStreamRef.current = stream;
    } catch (error) {
      console.error('Failed to access camera:', error);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const statusManager = new StatusManager();
      await statusManager.createStatus(activeTab, content);
      onStatusCreated?.();
      onClose();
    } catch (error) {
      console.error('Failed to create status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Status</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b">
          {[
            { id: 'photo', icon: Camera, label: 'Photo' },
            { id: 'video', icon: Video, label: 'Video' },
            { id: 'text', icon: MessageSquare, label: 'Text' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id as typeof activeTab);
                if (id === 'photo' || id === 'video') {
                  startCamera();
                } else {
                  stopCamera();
                }
              }}
              className={cn(
                'flex-1 py-3 flex items-center justify-center gap-2',
                activeTab === id
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="p-4">
          {(activeTab === 'photo' || activeTab === 'video') && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {activeTab === 'text' && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || (!content && activeTab === 'text')}
            className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Share Status'}
          </button>
        </div>
      </div>
    </div>
  );
};