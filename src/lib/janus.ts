import Janus from 'janus-gateway-js';
import { getJanusConfig, createRoomConfig, createPublisherConfig, createSubscriberConfig } from './janus-config';

export interface JanusStreamConfig {
  streamId: string;
  isStreamer: boolean;
  janusUrl?: string;
  roomId?: number;
  pin?: string;
}

export class JanusStreamManager {
  private janus: any = null;
  private videoroom: any = null;
  private stream: MediaStream | null = null;
  private config: JanusStreamConfig;
  private isConnected = false;

  constructor(config: JanusStreamConfig) {
    const janusConfig = getJanusConfig();
    this.config = {
      ...config,
      janusUrl: config.janusUrl || janusConfig.serverUrl,
      roomId: config.roomId || janusConfig.videoRoom.defaultRoom,
    };
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      Janus.init({
        debug: "all",
        callback: () => {
          console.log('Janus initialized');
          this.connectToJanus().then(resolve).catch(reject);
        },
        error: (error: any) => {
          console.error('Janus init error:', error);
          reject(error);
        },
        destroyed: () => {
          console.log('Janus destroyed');
        }
      });
    });
  }

  private async connectToJanus(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.janus = new Janus({
        server: this.config.janusUrl,
        success: () => {
          console.log('Connected to Janus server');
          this.attachVideoRoom().then(resolve).catch(reject);
        },
        error: (error: any) => {
          console.error('Janus connection error:', error);
          reject(error);
        },
        destroyed: () => {
          console.log('Janus connection destroyed');
        }
      });
    });
  }

  private async attachVideoRoom(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.janus.attach({
        plugin: "janus.plugin.videoroom",
        success: (pluginHandle: any) => {
          console.log('VideoRoom plugin attached');
          this.videoroom = pluginHandle;
          this.setupVideoRoomEvents();
          resolve();
        },
        error: (error: any) => {
          console.error('VideoRoom plugin error:', error);
          reject(error);
        },
        consentDialog: (on: boolean) => {
          console.log('Consent dialog:', on);
        },
        iceState: (state: string) => {
          console.log('ICE state:', state);
        },
        mediaState: (medium: string, on: boolean) => {
          console.log('Media state:', medium, on);
        },
        webrtcState: (on: boolean) => {
          console.log('WebRTC state:', on);
        },
        onmessage: (msg: any, jsep: any) => {
          this.handleVideoRoomMessage(msg, jsep);
        },
        onlocalstream: (stream: MediaStream) => {
          console.log('Local stream received');
          this.stream = stream;
        },
        onremotestream: (stream: MediaStream) => {
          console.log('Remote stream received');
          this.stream = stream;
        },
        oncleanup: () => {
          console.log('VideoRoom cleanup');
        }
      });
    });
  }

  private setupVideoRoomEvents(): void {
    // VideoRoom specific event handlers
  }

  private handleVideoRoomMessage(msg: any, jsep: any): void {
    const event = msg.videoroom;
    
    if (event) {
      switch (event) {
        case 'joined':
          console.log('Joined room:', msg.room);
          this.isConnected = true;
          break;
        case 'event':
          console.log('Room event:', msg);
          break;
        case 'error':
          console.error('Room error:', msg.error);
          break;
        default:
          console.log('Unknown room event:', event);
      }
    }

    if (jsep) {
      this.videoroom.handleRemoteJsep({ jsep: jsep });
    }
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
      const janusConfig = getJanusConfig();
      
      // Get user media with configured settings
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: janusConfig.videoRoom.video.width },
          height: { ideal: janusConfig.videoRoom.video.height },
          frameRate: { ideal: janusConfig.videoRoom.video.frameRate }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: janusConfig.videoRoom.audio.sampleRate,
          channelCount: janusConfig.videoRoom.audio.channels
        }
      });

      // Create or join room
      const register = createPublisherConfig('Streamer', {
        room: this.config.roomId || parseInt(this.config.streamId)
      });

      this.videoroom.send({ message: register });

      return this.stream;
    } catch (error) {
      console.error('Error starting stream:', error);
      throw error;
    }
  }

  private async startWatching(): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      const register = createSubscriberConfig('Viewer', {
        room: this.config.roomId || parseInt(this.config.streamId)
      });

      this.videoroom.send({ message: register });

      // Store resolve/reject for when stream is received
      this.onStreamReceived = (stream: MediaStream) => {
        this.stream = stream;
        resolve(stream);
      };
    });
  }

  private onStreamReceived?: (stream: MediaStream) => void;

  async stopStream(): Promise<void> {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoroom) {
      const leave = { request: 'leave' };
      this.videoroom.send({ message: leave });
    }

    if (this.janus) {
      this.janus.destroy();
      this.janus = null;
    }

    this.isConnected = false;
  }

  isStreamActive(): boolean {
    return this.isConnected && this.stream !== null;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  // Method to create a new room
  async createRoom(roomConfig: {
    room: number;
    description: string;
    secret?: string;
    pin?: string;
    is_private?: boolean;
    require_pvtid?: boolean;
    bitrate?: number;
    fir_freq?: number;
    publishers?: number;
    videocodec?: string;
    audiocodec?: string;
    record?: boolean;
    rec_dir?: string;
  }): Promise<void> {
    const create = {
      request: 'create',
      ...roomConfig
    };

    this.videoroom.send({ message: create });
  }

  // Method to list available rooms
  async listRooms(): Promise<any[]> {
    return new Promise((resolve) => {
      const list = { request: 'list' };
      
      const originalOnMessage = this.videoroom.onmessage;
      this.videoroom.onmessage = (msg: any, jsep: any) => {
        if (msg.videoroom === 'success' && msg.list) {
          resolve(msg.list);
        }
        if (originalOnMessage) {
          originalOnMessage(msg, jsep);
        }
      };

      this.videoroom.send({ message: list });
    });
  }
}

// Utility function to create a Janus stream manager
export function createJanusStreamManager(
  streamId: string, 
  isStreamer: boolean,
  customConfig?: Partial<JanusStreamConfig>
): JanusStreamManager {
  const config: JanusStreamConfig = {
    streamId,
    isStreamer,
    ...customConfig
  };

  return new JanusStreamManager(config);
}
