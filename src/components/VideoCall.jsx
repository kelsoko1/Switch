import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react';
import { useRealtime } from '../hooks/useRealtime';

const VideoCall = ({ roomId, displayName, onEndCall, isInitiator = false }) => {
  const { webrtcService } = useRealtime();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);

  // Handle local stream
  const setupLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setLocalStream(stream);
      
      // Publish stream if we're the initiator
      if (isInitiator) {
        await webrtcService.publish(stream);
        setStatus('calling');
      } else {
        setStatus('connected');
      }
      
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Failed to access camera or microphone');
      setStatus('error');
      throw err;
    }
  }, [isInitiator, webrtcService]);

  // Handle remote tracks
  const handleRemoteTrack = useCallback(({ track, mid, on }) => {
    setRemoteStreams(prev => {
      const newStreams = new Map(prev);
      if (on) {
        newStreams.set(mid, track);
      } else {
        newStreams.delete(mid);
      }
      return newStreams;
    });
  }, []);

  // Initialize call
  useEffect(() => {
    if (!webrtcService || !roomId) return;

    const initCall = async () => {
      try {
        // Connect to the room
        await webrtcService.connectToRoom(roomId, displayName);
        
        // Set up event listeners
        webrtcService.on('published', () => {
          setStatus('connected');
        });
        
        webrtcService.on('remoteTrack', handleRemoteTrack);
        webrtcService.on('error', (err) => {
          console.error('WebRTC error:', err);
          setError('Connection error');
          setStatus('error');
        });
        
        // Set up local stream
        await setupLocalStream();
        
      } catch (err) {
        console.error('Call initialization failed:', err);
        setError('Failed to start call');
        setStatus('error');
      }
    };
    
    initCall();
    
    // Cleanup on unmount
    return () => {
      webrtcService.off('remoteTrack', handleRemoteTrack);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      webrtcService.disconnect();
    };
  }, [webrtcService, roomId, displayName, setupLocalStream, handleRemoteTrack, localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  // End call
  const endCallHandler = useCallback(() => {
    if (onEndCall) {
      onEndCall();
    }
  }, [onEndCall]);

  // Update remote video element when remote streams change
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreams.size > 0) {
      const remoteStream = new MediaStream();
      remoteStreams.forEach(track => remoteStream.addTrack(track));
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStreams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-lg text-white">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={endCallHandler} className="bg-red-600 hover:bg-red-700">
          <PhoneOff className="w-4 h-4 mr-2" />
          End Call
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Remote video */}
      <div className="flex-1 relative bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Status overlay */}
        {status !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
            <div className="text-center">
              <div className="animate-pulse">
                {status === 'connecting' && 'Connecting...'}
                {status === 'calling' && 'Calling...'}
              </div>
            </div>
          </div>
        )}
        
        {/* Local video preview */}
        {localStream && (
          <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      {/* Call controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          className={`rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-white text-gray-800'}`}
          onClick={toggleAudio}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className={`rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white text-gray-800'}`}
          onClick={toggleVideo}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full"
          onClick={endCallHandler}
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;
