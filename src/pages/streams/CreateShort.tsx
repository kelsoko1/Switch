import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera, RotateCcw, Check, Loader, Play, Pause } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { videoService } from '../../services/videoService';

const CreateShort: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_DURATION = 60; // 60 seconds max

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [cameraFacing]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        stopCamera();
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= MAX_DURATION) {
              stopRecording();
              return MAX_DURATION;
            }
            return prev + 1;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const retake = () => {
    setVideoUrl(null);
    setRecordedChunks([]);
    setRecordingTime(0);
    startCamera();
  };

  const flipCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handlePost = async () => {
    if (!videoUrl || !user) {
      setError('Please record a video first');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Convert video URL to blob
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const file = new File([blob], `short-${Date.now()}.webm`, { type: 'video/webm' });

      // Upload video
      const videoUpload = await videoService.uploadVideoFile(file);

      // Create short document
      await videoService.createShort({
        caption,
        videoUrl: videoUpload.url,
        duration: recordingTime,
        userId: user.$id,
        userName: user.name,
        userAvatar: (user.prefs as any)?.avatar
      });

      navigate('/streams');
    } catch (err) {
      console.error('Error posting short:', err);
      setError('Failed to post short. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/streams')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-white font-semibold">Create Short</div>
          <div className="w-10" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-10 p-4 bg-red-500 text-white rounded-lg">
          {error}
        </div>
      )}

      {/* Video Preview/Recording */}
      <div className="w-full h-full flex items-center justify-center">
        {!videoUrl ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Recording Timer */}
      {isRecording && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            {formatTime(recordingTime)} / {formatTime(MAX_DURATION)}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/70 to-transparent">
        {!videoUrl ? (
          <div className="flex items-center justify-center gap-8">
            {/* Flip Camera */}
            {!isRecording && (
              <button
                onClick={flipCamera}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            )}

            {/* Record/Stop Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-white hover:scale-110'
              }`}
            >
              {isRecording ? (
                <div className="w-8 h-8 bg-white rounded" />
              ) : (
                <Camera className="w-10 h-10 text-red-600" />
              )}
            </button>

            {/* Pause Button */}
            {isRecording && (
              <button
                onClick={pauseRecording}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                {isPaused ? (
                  <Play className="w-6 h-6" />
                ) : (
                  <Pause className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Caption Input */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                maxLength={150}
                rows={2}
                className="w-full bg-transparent text-white placeholder-white/60 outline-none resize-none"
              />
              <p className="text-white/60 text-xs mt-2">{caption.length}/150</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={retake}
                disabled={isUploading}
                className="flex-1 px-6 py-4 bg-white/20 backdrop-blur-sm rounded-xl font-semibold text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Retake
              </button>
              <button
                onClick={handlePost}
                disabled={isUploading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Post Short
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Duration Indicator */}
      {!videoUrl && !isRecording && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-white/80 text-sm">
          Max duration: {MAX_DURATION}s
        </div>
      )}
    </div>
  );
};

export default CreateShort;
