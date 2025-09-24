import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { statusViewService, StatusView } from '../../services/statusService';

interface StatusViewerProps {
  statuses: StatusView[];
  initialIndex: number;
  onClose: () => void;
}

const StatusViewer: React.FC<StatusViewerProps> = ({
  statuses,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentStatus, setCurrentStatus] = useState<StatusView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadStatus = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const statusId = statuses[currentIndex].id;
        const status = await statusViewService.getStatusById(statusId);
        if (!status) {
          throw new Error('Status not found');
        }
        setCurrentStatus(status);
      } catch (err) {
        console.error('Error loading status:', err);
        setError('Failed to load status');
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [currentIndex, statuses]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        onClose();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]);

  if (!currentStatus || isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white">{error}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black flex items-center justify-center"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation buttons */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 text-white z-10"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {currentIndex < statuses.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 text-white z-10"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Status content */}
      <div className="w-full max-w-lg">
        {/* User info */}
        <div className="flex items-center mb-4 text-white">
          {currentStatus.user.avatar ? (
            <img
              src={currentStatus.user.avatar}
              alt={currentStatus.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-lg">
                {currentStatus.user.name[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="ml-3">
            <div className="font-semibold">{currentStatus.user.name}</div>
            <div className="text-sm text-gray-300">{currentStatus.user.email}</div>
          </div>
        </div>

        {/* Media content */}
        {currentStatus.type === 'image' && currentStatus.url && (
          <img
            src={currentStatus.url}
            alt={currentStatus.content}
            className="w-full h-auto rounded-lg"
          />
        )}
        {currentStatus.type === 'video' && currentStatus.url && (
          <video
            src={currentStatus.url}
            controls
            className="w-full h-auto rounded-lg"
          />
        )}

        {/* Text content */}
        <div className="mt-4 text-white">{currentStatus.content}</div>

        {/* Status info */}
        <div className="mt-4 text-sm text-gray-400">
          <span>{new Date(currentStatus.created_at).toLocaleString()}</span>
          <span className="mx-2">•</span>
          <span>{currentStatus.likes} likes</span>
          <span className="mx-2">•</span>
          <span>{currentStatus.comments} comments</span>
        </div>
      </div>
    </div>
  );
};

export default StatusViewer;
