import { Janus } from 'janus-gateway';
import api from '../lib/api';

class WebRTCService {
  constructor() {
    this.janus = null;
    this.pluginHandle = null;
    this.connectionState = 'disconnected';
    this.eventHandlers = new Map();
    this.localStream = null;
    this.remoteStreams = new Map();
    this.iceServers = [];
  }

  // Initialize Janus connection
  async initialize() {
    if (this.connectionState !== 'disconnected') return;
    
    this.connectionState = 'connecting';
    
    try {
      // Get Janus configuration from the server
      const { data } = await api.get('/janus/configuration');
      this.iceServers = data.iceServers;
      
      // Initialize Janus
      Janus.init({
        debug: import.meta.env.DEV ? 'all' : false,
        callback: () => {
          this.janus = new Janus({
            server: import.meta.env.VITE_JANUS_URL,
            apisecret: import.meta.env.VITE_JANUS_API_SECRET,
            success: () => this.onJanusConnected(),
            error: (error) => this.onJanusError(error),
            destroyed: () => this.onJanusDisconnected()
          });
        }
      });
      
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      this.connectionState = 'error';
      throw error;
    }
  }

  // Handle successful Janus connection
  onJanusConnected() {
    this.connectionState = 'connected';
    console.log('Janus connected');
    this.emit('connected');
  }

  // Handle Janus errors
  onJanusError(error) {
    console.error('Janus error:', error);
    this.connectionState = 'error';
    this.emit('error', error);
  }

  // Handle Janus disconnection
  onJanusDisconnected() {
    this.connectionState = 'disconnected';
    this.pluginHandle = null;
    this.emit('disconnected');
  }

  // Connect to a video room
  async connectToRoom(roomId, displayName) {
    if (this.connectionState !== 'connected') {
      throw new Error('Not connected to Janus');
    }

    try {
      // Attach to VideoRoom plugin
      this.janus.attach({
        plugin: 'janus.plugin.videoroom',
        opaqueId: `participant-${Date.now()}`,
        success: (pluginHandle) => {
          this.pluginHandle = pluginHandle;
          this.setupMessageHandlers();
          this.joinRoom(roomId, displayName);
        },
        error: (error) => {
          console.error('Error attaching plugin:', error);
          this.emit('error', error);
        },
        onmessage: (msg, jsep) => this.handleJanusMessage(msg, jsep),
        onlocaltrack: (track, on) => this.handleLocalTrack(track, on),
        onremotetrack: (track, mid, on) => this.handleRemoteTrack(track, mid, on),
        oncleanup: () => this.handleCleanup()
      });
    } catch (error) {
      console.error('Error connecting to room:', error);
      this.emit('error', error);
      throw error;
    }
  }

  // Join a specific room
  async joinRoom(roomId, displayName) {
    const joinMsg = {
      request: 'join',
      room: roomId,
      ptype: 'publisher',
      display: displayName
    };

    this.pluginHandle.send({ message: joinMsg });
  }

  // Publish local media stream
  async publish(stream) {
    if (!this.pluginHandle) {
      throw new Error('Not connected to a room');
    }

    this.localStream = stream;
    const tracks = stream.getTracks();
    
    // Configure WebRTC offer
    this.pluginHandle.createOffer({
      tracks: tracks,
      success: (jsep) => {
        const publishMsg = { request: 'configure', audio: true, video: true };
        this.pluginHandle.send({ message: publishMsg, jsep: jsep });
      },
      error: (error) => {
        console.error('Error creating offer:', error);
        this.emit('error', error);
      }
    });
  }

  // Handle incoming Janus messages
  handleJanusMessage(msg, jsep) {
    if (msg.videoroom === 'event') {
      if (msg.error) {
        console.error('Janus error:', msg.error);
        this.emit('error', new Error(msg.error));
      } else if (msg.configured === 'ok') {
        this.emit('published');
      } else if (msg.publishers) {
        // New publishers available
        this.emit('publishers', msg.publishers);
      } else if (msg.leaving) {
        // A publisher left
        this.emit('publisherLeft', msg.leaving);
      }
    }

    // Handle WebRTC SDP answers
    if (jsep) {
      this.pluginHandle.handleRemoteJsep({ jsep: jsep });
    }
  }

  // Handle local tracks
  handleLocalTrack(track, on) {
    console.log('Local track:', track.kind, on ? 'added' : 'removed');
    this.emit('localTrack', { track, on });
  }

  // Handle remote tracks
  handleRemoteTrack(track, mid, on) {
    console.log('Remote track:', track.kind, mid, on ? 'added' : 'removed');
    
    if (on) {
      this.remoteStreams.set(mid, track);
    } else {
      this.remoteStreams.delete(mid);
    }
    
    this.emit('remoteTrack', { track, mid, on });
  }

  // Clean up resources
  handleCleanup() {
    console.log('Cleaning up WebRTC resources');
    this.remoteStreams.clear();
    this.emit('cleanup');
  }

  // Disconnect from Janus
  async disconnect() {
    if (this.pluginHandle) {
      this.pluginHandle.hangup();
      this.pluginHandle.detach();
      this.pluginHandle = null;
    }
    
    if (this.janus) {
      this.janus.destroy();
      this.janus = null;
    }
    
    this.connectionState = 'disconnected';
    this.emit('disconnected');
  }

  // Event handling
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  emit(event, ...args) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }
}

// Export a singleton instance
export default new WebRTCService();
