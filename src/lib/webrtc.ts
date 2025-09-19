import SimplePeer from 'simple-peer';

export class StreamManager {
  private peer: SimplePeer.Instance | null = null;
  private stream: MediaStream | null = null;
  private streamId: string;
  private isStreamer: boolean;
  private signalHandlers: ((signal: any) => void)[] = [];

  constructor(streamId: string, isStreamer: boolean) {
    this.streamId = streamId;
    this.isStreamer = isStreamer;
  }

  // Method to handle incoming signals (for non-streamer peers)
  handleSignal(signal: any) {
    if (this.peer && !this.isStreamer) {
      this.peer.signal(signal);
    }
  }

  // Method to get the current signal (for streamer to send to viewers)
  getCurrentSignal(): any {
    return this.peer ? this.peer.signal : null;
  }

  // Method to register signal handler
  onSignal(handler: (signal: any) => void) {
    this.signalHandlers.push(handler);
  }

  // Method to emit signal to handlers
  private emitSignal(signal: any) {
    this.signalHandlers.forEach(handler => handler(signal));
  }

  async startStream(): Promise<MediaStream> {
    if (this.isStreamer) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        this.peer = new SimplePeer({
          initiator: true,
          stream: this.stream,
          trickle: false,
        });

        this.setupPeerEvents();
        return this.stream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
      }
    } else {
      this.peer = new SimplePeer({
        initiator: false,
        trickle: false,
      });

      this.setupPeerEvents();
      return new Promise((resolve) => {
        this.peer!.on('stream', (stream) => {
          this.stream = stream;
          resolve(stream);
        });
      });
    }
  }

  private setupPeerEvents() {
    if (!this.peer) return;

    this.peer.on('signal', (signal) => {
      // Emit signal to registered handlers
      this.emitSignal(signal);
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    this.peer.on('connect', () => {
      console.log('WebRTC connection established');
    });

    this.peer.on('close', () => {
      console.log('WebRTC connection closed');
    });
  }

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }

  // Method to check if peer is connected
  isConnected(): boolean {
    return this.peer ? this.peer.connected : false;
  }

  // Method to get connection state
  getConnectionState(): string {
    if (!this.peer) return 'disconnected';
    return this.peer.connected ? 'connected' : 'connecting';
  }
}