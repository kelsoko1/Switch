import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { statusService, Status } from '../../services/statusService';

interface StatusViewerProps {
  statuses: Status[];
  initialIndex: number;
  onClose: () => void;
}

const StatusViewer: React.FC<StatusViewerProps> = ({ statuses, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusDuration = 5000; // 5 seconds per status
  const currentStatus = statuses[currentIndex];

  // Mark status as viewed when it's opened
  useEffect(() => {
    if (currentStatus && !currentStatus.isMine) {
      statusService.viewStatus(currentStatus.id);
    }
  }, [currentStatus]);

  // Handle progress bar
  useEffect(() => {
    setProgress(0);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          const newProgress = prev + (100 / (statusDuration / 100));
          
          if (newProgress >= 100) {
            // Move to next status when progress reaches 100%
            if (currentIndex < statuses.length - 1) {
              setCurrentIndex(prev => prev + 1);
              return 0;
            } else {
              // Close viewer when we've gone through all statuses
              onClose();
              return 100;
            }
          }
          
          return newProgress;
        });
      }
    }, 100);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, isPaused, onClose, statuses.length]);

  const handlePrevStatus = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleNextStatus = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleMouseDown = () => {
    setIsPaused(true);
  };

  const handleMouseUp = () => {
    setIsPaused(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevStatus();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNextStatus();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!currentStatus) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white z-10"
      >
        <X size={24} />
      </button>
      
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1">
        {statuses.map((_, index) => (
          <div 
            key={index} 
            className="h-1 bg-gray-500/50 flex-1 rounded-full overflow-hidden"
          >
            <div 
              className={`h-full bg-white ${index === currentIndex ? 'transition-all duration-100 ease-linear' : index < currentIndex ? 'w-full' : 'w-0'}`}
              style={{ width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>
      
      {/* User info */}
      <div className="absolute top-8 left-4 flex items-center gap-3 text-white">
        <img 
          src={currentStatus.avatar || `https://ui-avatars.com/api/?name=${currentStatus.username}&background=random`}
          alt={currentStatus.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{currentStatus.username}</p>
          <p className="text-xs opacity-75">
            {new Date(currentStatus.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <button 
        onClick={handlePrevStatus}
        disabled={currentIndex === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/75 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={36} />
      </button>
      
      <button 
        onClick={handleNextStatus}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/75 hover:text-white"
      >
        <ChevronRight size={36} />
      </button>
      
      {/* Status content */}
      <div className="max-w-md w-full max-h-[80vh] flex flex-col items-center justify-center">
        {currentStatus.type === 'photo' ? (
          <img 
            src={currentStatus.mediaUrl} 
            alt="Status"
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        ) : currentStatus.type === 'video' ? (
          <video 
            src={currentStatus.mediaUrl}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-8 rounded-lg w-full max-w-sm">
            <p className="text-white text-xl font-medium">{currentStatus.mediaUrl}</p>
          </div>
        )}
        
        {currentStatus.caption && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg w-full">
            <p className="text-white">{currentStatus.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusViewer;
