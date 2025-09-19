// Janus WebRTC Configuration
export const JANUS_CONFIG = {
  // Default Janus server URL (you can use a public test server or your own)
  serverUrl: 'wss://janus.conf.meetecho.com/ws',
  
  // Alternative servers you can use:
  // serverUrl: 'wss://janus.webrtc.events/ws', // Another public test server
  // serverUrl: 'ws://localhost:8188', // Local Janus server
  
  // VideoRoom plugin settings
  videoRoom: {
    // Default room settings
    defaultRoom: 1234,
    
    // Video settings
    video: {
      width: 1280,
      height: 720,
      frameRate: 30,
      bitrate: 2000000, // 2 Mbps
    },
    
    // Audio settings
    audio: {
      bitrate: 128000, // 128 kbps
      sampleRate: 48000,
      channels: 2,
    },
    
    // Codec preferences
    codecs: {
      video: 'vp8', // or 'h264', 'vp9'
      audio: 'opus', // or 'g722', 'pcmu', 'pcma'
    },
  },
  
  // ICE servers for WebRTC
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  
  // Debug settings
  debug: {
    level: 'all', // 'all', 'info', 'warn', 'error', 'none'
    console: true,
  },
  
  // Connection settings
  connection: {
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
};

// Environment-specific configurations
export const getJanusConfig = () => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'development':
      return {
        ...JANUS_CONFIG,
        serverUrl: 'ws://localhost:8188', // Local development server
        debug: {
          ...JANUS_CONFIG.debug,
          level: 'all',
        },
      };
    
    case 'production':
      return {
        ...JANUS_CONFIG,
        serverUrl: process.env.REACT_APP_JANUS_URL || JANUS_CONFIG.serverUrl,
        debug: {
          ...JANUS_CONFIG.debug,
          level: 'error',
        },
      };
    
    default:
      return JANUS_CONFIG;
  }
};

// Utility functions
export const createRoomConfig = (overrides: Partial<any> = {}) => ({
  room: Math.floor(Math.random() * 1000000),
  description: 'Rafiki Messenger Stream',
  is_private: false,
  require_pvtid: false,
  bitrate: JANUS_CONFIG.videoRoom.video.bitrate,
  fir_freq: 10,
  publishers: 10,
  videocodec: JANUS_CONFIG.videoRoom.codecs.video,
  audiocodec: JANUS_CONFIG.videoRoom.codecs.audio,
  record: false,
  ...overrides,
});

export const createPublisherConfig = (displayName: string, overrides: Partial<any> = {}) => ({
  request: 'join',
  ptype: 'publisher',
  id: Math.floor(Math.random() * 1000000),
  display: displayName,
  ...overrides,
});

export const createSubscriberConfig = (displayName: string, overrides: Partial<any> = {}) => ({
  request: 'join',
  ptype: 'subscriber',
  id: Math.floor(Math.random() * 1000000),
  display: displayName,
  ...overrides,
});
