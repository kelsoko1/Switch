// Real WebRTC implementation with signaling server support
import { io, Socket } from 'socket.io-client';

export interface WebRTCStreamConfig {
  streamId: string;
  isStreamer: boolean;
  signalingServer?: string;
  iceServers?: RTCIceServer[];
  mediaConstraints?: MediaStreamConstraints;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void;
  onSignalingStateChange?: (state: RTCSignalingState) => void;
  onDataChannelMessage?: (data: any) => void;
}

interface SignalingMessage {
  type: string;
  streamId: string;
  from: string;
  to?: string;
  candidate?: RTCIceCandidate;
  sdp?: string;
  data?: any;
}

export class SimpleWebRTCManager {
  // Remove unused peerConnection and dataChannel variables
  private stream: MediaStream | null = null;
  private config: WebRTCStreamConfig;
  private isConnected = false;
  private signalingSocket: Socket | null = null;
  private clientId: string;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private onTrackHandlers: ((stream: MediaStream) => void)[] = [];
  private onDataHandlers: ((data: any, peerId: string) => void)[] = [];
  private onPeerConnectedHandlers: ((peerId: string) => void)[] = [];
  private onPeerDisconnectedHandlers: ((peerId: string) => void)[] = [];
  
  constructor(config: WebRTCStreamConfig) {
    this.config = {
      ...config,
      signalingServer: config.signalingServer || 'https://signaling.switch.app',
      mediaConstraints: config.mediaConstraints || {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      },
      iceServers: config.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    };
    
    // Generate a unique client ID
    this.clientId = `client_${Math.floor(Math.random() * 1000000)}`;
  }

  async initialize(): Promise<void> {
    try {
      // Connect to signaling server
      await this.connectToSignalingServer();
      
      console.log(`WebRTC initialized for stream ${this.config.streamId}`);
      console.log(`Client ID: ${this.clientId}`);
      console.log(`Role: ${this.config.isStreamer ? 'Streamer' : 'Viewer'}`);
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      throw error;
    }
  }
  
  private async connectToSignalingServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // In a real implementation, connect to an actual signaling server
        // For now, we'll use Socket.IO for signaling
        this.signalingSocket = io(this.config.signalingServer!, {
          query: {
            streamId: this.config.streamId,
            clientId: this.clientId,
            role: this.config.isStreamer ? 'streamer' : 'viewer'
          },
          transports: ['websocket', 'polling']
        });
        
        this.setupSignalingEvents();
        
        this.signalingSocket.on('connect', () => {
          console.log('Connected to signaling server');
          resolve();
        });
        
        this.signalingSocket.on('connect_error', (error) => {
          console.error('Signaling server connection error:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Error connecting to signaling server:', error);
        reject(error);
      }
    });
  }
  
  private setupSignalingEvents(): void {
    if (!this.signalingSocket) return;
    
    // Handle incoming offers (for viewers)
    this.signalingSocket.on('offer', async (message: SignalingMessage) => {
      if (!this.config.isStreamer) {
        await this.handleOffer(message);
      }
    });
    
    // Handle incoming answers (for streamers)
    this.signalingSocket.on('answer', async (message: SignalingMessage) => {
      if (this.config.isStreamer) {
        await this.handleAnswer(message);
      }
    });
    
    // Handle ICE candidates
    this.signalingSocket.on('ice-candidate', async (message: SignalingMessage) => {
      await this.handleIceCandidate(message);
    });
    
    // Handle peer disconnections
    this.signalingSocket.on('peer-disconnected', (message: { peerId: string }) => {
      this.handlePeerDisconnected(message.peerId);
    });
    
    // Handle new viewer connections (for streamers)
    this.signalingSocket.on('viewer-connected', async (message: { peerId: string }) => {
      if (this.config.isStreamer) {
        await this.createOfferForViewer(message.peerId);
      }
    });
    
    // Handle stream ended (for viewers)
    this.signalingSocket.on('stream-ended', () => {
      if (!this.config.isStreamer) {
        this.handleStreamEnded();
      }
    });
  }

  async startStream(): Promise<MediaStream> {
    if (this.config.isStreamer) {
      return this.startPublishing();
    } else {
      return this.startWatching();
    }
  }

  private async startPublishing(): Promise<MediaStream> {
    try {
      // Get user media
      this.stream = await navigator.mediaDevices.getUserMedia(this.config.mediaConstraints!);
      
      // Notify signaling server that stream is starting
      this.signalingSocket?.emit('start-stream', {
        streamId: this.config.streamId,
        clientId: this.clientId
      });
      
      this.isConnected = true;
      return this.stream;
    } catch (error) {
      console.error('Error starting stream:', error);
      throw error;
    }
  }

  private async startWatching(): Promise<MediaStream> {
    return new Promise<MediaStream>((resolve, reject) => {
      try {
        // Request to join the stream
        this.signalingSocket?.emit('join-stream', {
          streamId: this.config.streamId,
          clientId: this.clientId
        });
        
        // Set up handler for when we receive the stream
        this.onTrack((stream) => {
          this.stream = stream;
          this.isConnected = true;
          resolve(stream);
        });
        
        // Set a timeout in case we don't receive the stream
        setTimeout(() => {
          if (!this.stream) {
            reject(new Error('Timeout waiting for stream'));
          }
        }, 15000); // 15 second timeout
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    // Create a new peer connection
    const pc = new RTCPeerConnection({
      iceServers: this.config.iceServers
    });
    
    // Store the peer connection
    this.peers.set(peerId, pc);
    
    // Set up event handlers
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIceCandidate(peerId, event.candidate);
      }
    };
    
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for peer ${peerId}:`, pc.connectionState);
      if (this.config.onConnectionStateChange) {
        this.config.onConnectionStateChange(pc.connectionState);
      }
      
      if (pc.connectionState === 'connected') {
        this.onPeerConnectedHandlers.forEach(handler => handler(peerId));
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.handlePeerDisconnected(peerId);
      }
    };
    
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for peer ${peerId}:`, pc.iceConnectionState);
      if (this.config.onIceConnectionStateChange) {
        this.config.onIceConnectionStateChange(pc.iceConnectionState);
      }
    };
    
    pc.onsignalingstatechange = () => {
      console.log(`Signaling state for peer ${peerId}:`, pc.signalingState);
      if (this.config.onSignalingStateChange) {
        this.config.onSignalingStateChange(pc.signalingState);
      }
    };
    
    // If we're the streamer, add our media tracks to the connection
    if (this.config.isStreamer && this.stream) {
      this.stream.getTracks().forEach(track => {
        pc.addTrack(track, this.stream!);
      });
    }
    
    // Set up data channel
    if (this.config.isStreamer) {
      const dataChannel = pc.createDataChannel('data');
      this.setupDataChannel(dataChannel, peerId);
    } else {
      pc.ondatachannel = (event) => {
        this.setupDataChannel(event.channel, peerId);
      };
    }
    
    // For viewers, set up track handling
    if (!this.config.isStreamer) {
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        this.onTrackHandlers.forEach(handler => handler(remoteStream));
      };
    }
    
    return pc;
  }
  
  private setupDataChannel(channel: RTCDataChannel, peerId: string): void {
    this.dataChannels.set(peerId, channel);
    
    channel.onopen = () => {
      console.log(`Data channel for peer ${peerId} opened`);
    };
    
    channel.onclose = () => {
      console.log(`Data channel for peer ${peerId} closed`);
    };
    
    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onDataHandlers.forEach(handler => handler(data, peerId));
        
        if (this.config.onDataChannelMessage) {
          this.config.onDataChannelMessage(data);
        }
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };
  }
  
  private async createOfferForViewer(peerId: string): Promise<void> {
    try {
      const pc = await this.createPeerConnection(peerId);
      
      // Create offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      // Set local description
      await pc.setLocalDescription(offer);
      
      // Send offer to viewer
      this.signalingSocket?.emit('offer', {
        type: 'offer',
        streamId: this.config.streamId,
        from: this.clientId,
        to: peerId,
        sdp: pc.localDescription?.sdp
      });
    } catch (error) {
      console.error(`Error creating offer for viewer ${peerId}:`, error);
    }
  }
  
  private async handleOffer(message: SignalingMessage): Promise<void> {
    try {
      const pc = await this.createPeerConnection(message.from);
      
      // Set remote description
      await pc.setRemoteDescription({
        type: 'offer',
        sdp: message.sdp
      } as RTCSessionDescriptionInit);
      
      // Create answer
      const answer = await pc.createAnswer();
      
      // Set local description
      await pc.setLocalDescription(answer);
      
      // Send answer to streamer
      this.signalingSocket?.emit('answer', {
        type: 'answer',
        streamId: this.config.streamId,
        from: this.clientId,
        to: message.from,
        sdp: pc.localDescription?.sdp
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }
  
  private async handleAnswer(message: SignalingMessage): Promise<void> {
    try {
      const pc = this.peers.get(message.from);
      
      if (pc) {
        await pc.setRemoteDescription({
          type: 'answer',
          sdp: message.sdp
        } as RTCSessionDescriptionInit);
      } else {
        console.warn(`No peer connection found for ${message.from}`);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }
  
  private async handleIceCandidate(message: SignalingMessage): Promise<void> {
    try {
      const pc = this.peers.get(message.from);
      
      if (pc && message.candidate) {
        await pc.addIceCandidate(message.candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }
  
  private sendIceCandidate(peerId: string, candidate: RTCIceCandidate): void {
    this.signalingSocket?.emit('ice-candidate', {
      type: 'ice-candidate',
      streamId: this.config.streamId,
      from: this.clientId,
      to: peerId,
      candidate
    });
  }
  
  private handlePeerDisconnected(peerId: string): void {
    // Close and remove peer connection
    const pc = this.peers.get(peerId);
    if (pc) {
      pc.close();
      this.peers.delete(peerId);
    }
    
    // Close and remove data channel
    const dc = this.dataChannels.get(peerId);
    if (dc) {
      dc.close();
      this.dataChannels.delete(peerId);
    }
    
    // Notify handlers
    this.onPeerDisconnectedHandlers.forEach(handler => handler(peerId));
  }
  
  private handleStreamEnded(): void {
    this.stopStream();
  }

  async stopStream(): Promise<void> {
    // Stop all media tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Close all peer connections
    this.peers.forEach((pc) => {
      pc.close();
    });
    this.peers.clear();
    
    // Close all data channels
    this.dataChannels.forEach((dc) => {
      dc.close();
    });
    this.dataChannels.clear();
    
    // If we're the streamer, notify that the stream has ended
    if (this.config.isStreamer) {
      this.signalingSocket?.emit('end-stream', {
        streamId: this.config.streamId,
        clientId: this.clientId
      });
    }
    
    // Disconnect from signaling server
    this.signalingSocket?.disconnect();
    this.signalingSocket = null;

    this.isConnected = false;
  }

  isStreamActive(): boolean {
    return this.isConnected && this.stream !== null;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  // Send data to all connected peers
  sendData(data: any): void {
    const dataString = JSON.stringify(data);
    
    this.dataChannels.forEach((channel) => {
      if (channel.readyState === 'open') {
        channel.send(dataString);
      }
    });
  }
  
  // Send data to a specific peer
  sendDataToPeer(peerId: string, data: any): void {
    const channel = this.dataChannels.get(peerId);
    
    if (channel && channel.readyState === 'open') {
      channel.send(JSON.stringify(data));
    }
  }
  
  // Event handlers
  onTrack(handler: (stream: MediaStream) => void): () => void {
    this.onTrackHandlers.push(handler);
    return () => {
      this.onTrackHandlers = this.onTrackHandlers.filter(h => h !== handler);
    };
  }
  
  onData(handler: (data: any, peerId: string) => void): () => void {
    this.onDataHandlers.push(handler);
    return () => {
      this.onDataHandlers = this.onDataHandlers.filter(h => h !== handler);
    };
  }
  
  onPeerConnected(handler: (peerId: string) => void): () => void {
    this.onPeerConnectedHandlers.push(handler);
    return () => {
      this.onPeerConnectedHandlers = this.onPeerConnectedHandlers.filter(h => h !== handler);
    };
  }
  
  onPeerDisconnected(handler: (peerId: string) => void): () => void {
    this.onPeerDisconnectedHandlers.push(handler);
    return () => {
      this.onPeerDisconnectedHandlers = this.onPeerDisconnectedHandlers.filter(h => h !== handler);
    };
  }
}

// Utility function to create a WebRTC stream manager
export function createSimpleWebRTCManager(
  streamId: string, 
  isStreamer: boolean,
  customConfig?: Partial<WebRTCStreamConfig>
): SimpleWebRTCManager {
  const config: WebRTCStreamConfig = {
    streamId,
    isStreamer,
    signalingServer: import.meta.env.VITE_WEBRTC_SIGNALING_SERVER || 'https://signaling.switch.app',
    ...customConfig
  };

  return new SimpleWebRTCManager(config);
}
