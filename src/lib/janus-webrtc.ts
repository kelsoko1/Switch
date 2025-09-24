// Janus WebRTC implementation for video streaming
import { database, COLLECTIONS } from './appwrite';
import { Models } from 'appwrite';

// Define extended collections type that includes STREAM_ROOMS
interface StreamRoom extends Models.Document {
  room_id: string;
  name: string;
  description?: string;
  owner_id: string;
  participants: string[];
  created_at: string;
  updated_at: string;
}

export class JanusWebRTC {
  private roomId: string;
  private userId: string;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  /**
   * Initialize WebRTC connection
   */
  async initialize(): Promise<void> {
    try {
      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Set up event handlers
      this.setupEventHandlers();

      // Get local media stream
      await this.getLocalStream();

      // Create data channel
      this.createDataChannel();

      // Store room info in Appwrite
      await this.storeRoomInfo();
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      throw error;
    }
  }

  /**
   * Set up event handlers for peer connection
   */
  private setupEventHandlers(): void {
    if (!this.peerConnection) return;

    // ICE candidate event
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to signaling server
        this.sendSignalingMessage({
          type: 'candidate',
          candidate: event.candidate
        });
      }
    };

    // Stream event
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      // Notify application about new remote stream
      this.onRemoteStream(this.remoteStream);
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
    };

    // Data channel event
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  /**
   * Get local media stream
   */
  private async getLocalStream(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Add tracks to peer connection
      if (this.peerConnection && this.localStream) {
        this.localStream.getTracks().forEach(track => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw error;
    }
  }

  /**
   * Create and set up data channel
   */
  private createDataChannel(): void {
    if (!this.peerConnection) return;

    this.dataChannel = this.peerConnection.createDataChannel('chat');
    this.setupDataChannel();
  }

  /**
   * Set up data channel event handlers
   */
  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('Data channel open');
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
    };

    this.dataChannel.onmessage = (event) => {
      // Handle incoming messages
      this.onDataChannelMessage(event.data);
    };
  }

  /**
   * Send message through data channel
   */
  sendMessage(message: string): void {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(message);
    }
  }

  /**
   * Create offer
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  /**
   * Handle answer from remote peer
   */
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(answer);
  }

  /**
   * Handle ICE candidate from remote peer
   */
  async handleCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.addIceCandidate(candidate);
  }

  /**
   * Store room info in Appwrite
   */
  private async storeRoomInfo(): Promise<void> {
    try {
      // Store room info in Appwrite for persistence
      await database.createDocument(
        'stream_rooms',
        {
          room_id: this.roomId,
          name: `Room ${this.roomId}`,
          owner_id: this.userId,
          participants: [this.userId],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error storing room info:', error);
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Stop local stream
    this.localStream?.getTracks().forEach(track => track.stop());

    // Close data channel
    this.dataChannel?.close();

    // Close peer connection
    this.peerConnection?.close();

    // Reset properties
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    this.peerConnection = null;
  }

  // Event handlers that should be overridden by the application
  protected onRemoteStream(stream: MediaStream): void {
    // Handle new remote stream
  }

  protected onDataChannelMessage(message: string): void {
    // Handle data channel message
  }

  protected sendSignalingMessage(message: any): void {
    // Send signaling message to remote peer
  }
}

export const createJanusWebRTC = (roomId: string, userId: string): JanusWebRTC => {
  return new JanusWebRTC(roomId, userId);
};
