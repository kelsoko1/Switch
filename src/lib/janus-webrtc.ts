// Janus WebRTC implementation for video streaming
import { db, COLLECTIONS } from './appwrite';

// Define extended collections type that includes STREAM_ROOMS
type ExtendedCollections = typeof COLLECTIONS & { STREAM_ROOMS: string };

// Cast COLLECTIONS to the extended type
const ExtendedCollections = COLLECTIONS as ExtendedCollections;

// Define interfaces for Janus stream options
// This is the main configuration interface for the JanusStreamManager

interface JanusStreamOptions {
  streamId: string;
  isPublisher: boolean;
  room?: number;
  pin?: string;
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onMessage?: (msg: any) => void;
  onError?: (error: any) => void;
}

// Define the Janus class
export class JanusStreamManager {
  private janus: any = null;
  private videoPlugin: any = null;
  private opaqueId: string;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private options: JanusStreamOptions;
  private isConnected = false;
  private roomId: number;
  private userId: string;
  private displayName: string;
  private isInitialized = false;
  
  constructor(options: JanusStreamOptions) {
    this.options = {
      ...options,
      room: options.room || this.generateRoomId(options.streamId)
    };
    this.opaqueId = `videoroom-${Math.round(Math.random() * 1000000)}`;
    this.roomId = this.options.room!;
    this.userId = Math.floor(Math.random() * 10000000).toString();
    this.displayName = `user-${this.userId}`;
  }
  
  private generateRoomId(streamId: string): number {
    // Generate a deterministic room ID from the stream ID
    let hash = 0;
    for (let i = 0; i < streamId.length; i++) {
      const char = streamId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 1000000 + 1000; // Ensure positive and reasonable size
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    return new Promise<void>((resolve, reject) => {
      // Check if Janus library is loaded
      if (typeof window.Janus === 'undefined') {
        this.loadJanusLibrary()
          .then(() => this.initializeJanus(resolve, reject))
          .catch(reject);
      } else {
        this.initializeJanus(resolve, reject);
      }
    });
  }
  
  private async loadJanusLibrary(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = import.meta.env.VITE_JANUS_JS_URL || 'https://janus.conf.meetecho.com/janus.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Janus library'));
      document.head.appendChild(script);
    });
  }
  
  private initializeJanus(resolve: () => void, reject: (error: any) => void): void {
    // Initialize Janus
    const janusServer = import.meta.env.VITE_JANUS_URL || 'wss://janus.conf.meetecho.com/ws';
    
    window.Janus.init({
      debug: import.meta.env.DEV ? 'all' : false,
      callback: () => {
        // Create Janus session
        this.janus = new window.Janus({
          server: janusServer,
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ],
          success: () => {
            console.log('Janus session created successfully');
            this.attachVideoPlugin(resolve, reject);
          },
          error: (error: any) => {
            console.error('Janus session creation error:', error);
            reject(error);
          },
          destroyed: () => {
            console.log('Janus session destroyed');
            this.isConnected = false;
          }
        });
      }
    });
  }
  
  private attachVideoPlugin(resolve: () => void, reject: (error: any) => void): void {
    this.janus.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: this.opaqueId,
      success: (pluginHandle: any) => {
        this.videoPlugin = pluginHandle;
        console.log(`Plugin attached! (${pluginHandle.getPlugin()}, id=${pluginHandle.getId()})`);
        
        // Check if the room exists, create if not (for publishers)
        if (this.options.isPublisher) {
          this.createRoomIfNeeded()
            .then(() => {
              this.isInitialized = true;
              resolve();
            })
            .catch(reject);
        } else {
          this.isInitialized = true;
          resolve();
        }
      },
      error: (error: any) => {
        console.error('Error attaching plugin:', error);
        reject(error);
      },
      consentDialog: (on: boolean) => {
        console.log(`Consent dialog: ${on ? 'on' : 'off'}`);
      },
      iceState: (state: string) => {
        console.log(`ICE state changed to ${state}`);
      },
      mediaState: (medium: string, receiving: boolean) => {
        console.log(`Janus ${receiving ? 'started' : 'stopped'} receiving our ${medium}`);
      },
      webrtcState: (isConnected: boolean) => {
        console.log(`Janus says our WebRTC PeerConnection is ${isConnected ? 'up' : 'down'}`);
        this.isConnected = isConnected;
      },
      onmessage: (msg: any, jsep: any) => {
        this.onMessage(msg, jsep);
      },
      onlocaltrack: (track: MediaStreamTrack, on: boolean) => {
        console.log(`Local track ${on ? 'added' : 'removed'}: ${track.kind}`);
        if (!on) return;
        
        if (!this.localStream) {
          this.localStream = new MediaStream();
        }
        this.localStream.addTrack(track);
        
        if (this.options.onLocalStream && this.localStream.getTracks().length > 0) {
          this.options.onLocalStream(this.localStream);
        }
      },
      onremotetrack: (track: MediaStreamTrack, mid: string, on: boolean) => {
        console.log(`Remote track ${on ? 'added' : 'removed'}: ${track.kind} (mid: ${mid})`);
        if (!on) {
          // Remove track if it exists in the remote stream
          if (this.remoteStream) {
            const tracks = this.remoteStream.getTracks();
            const trackToRemove = tracks.find(t => t.id === track.id);
            if (trackToRemove) {
              this.remoteStream.removeTrack(trackToRemove);
              console.log(`Removed track with mid ${mid} from remote stream`);
            }
          }
          return;
        }
        
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        this.remoteStream.addTrack(track);
        console.log(`Added track with mid ${mid} to remote stream`);
        
        if (this.options.onRemoteStream && this.remoteStream.getTracks().length > 0) {
          this.options.onRemoteStream(this.remoteStream);
        }
      },
      oncleanup: () => {
        console.log('WebRTC resources have been cleaned up');
        this.localStream = null;
        this.remoteStream = null;
      }
    });
  }
  
  private async createRoomIfNeeded(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // First check if room exists
      const checkRoomMessage = {
        request: 'exists',
        room: this.roomId
      };
      
      this.videoPlugin.send({
        message: checkRoomMessage,
        success: (response: any) => {
          if (response.exists) {
            console.log(`Room ${this.roomId} already exists`);
            resolve();
            return;
          }
          
          // Room doesn't exist, create it
          const createRoomMessage = {
            request: 'create',
            room: this.roomId,
            permanent: false,
            description: `Stream room for ${this.options.streamId}`,
            publishers: 1,
            is_private: false,
            bitrate: 1000000,
            fir_freq: 10,
            videocodec: 'vp8,h264',
            audiocodec: 'opus,pcma,pcmu'
          };
          
          this.videoPlugin.send({
            message: createRoomMessage,
            success: () => {
              console.log(`Room ${this.roomId} created successfully`);
              
              // Store room info in database for persistence
              this.storeRoomInfo()
                .then(resolve)
                .catch(console.error); // Still resolve even if DB storage fails
            },
            error: (error: any) => {
              console.error(`Error creating room ${this.roomId}:`, error);
              reject(error);
            }
          });
        },
        error: (error: any) => {
          console.error('Error checking if room exists:', error);
          reject(error);
        }
      });
    });
  }
  
  private async storeRoomInfo(): Promise<void> {
    try {
      // Store room info in Appwrite for persistence
      await db.createDocument(
        ExtendedCollections.STREAM_ROOMS,
        `room_${this.roomId}`,
        {
          room_id: this.roomId,
          stream_id: this.options.streamId,
          created_at: new Date().toISOString(),
          is_active: true
        },
        ['read("*")', 'write("*")']
      );
    } catch (error) {
      console.error('Error storing room info:', error);
      // Non-critical error, continue
    }
  }
  
  private onMessage(msg: any, jsep: any): void {
    console.log('Got a message:', msg);
    
    if (this.options.onMessage) {
      this.options.onMessage(msg);
    }
    
    const event = msg['videoroom'];
    if (event) {
      if (event === 'joined') {
        // Successfully joined the room
        console.log(`Successfully joined room ${msg['room']}`);
        
        // If we're a publisher, publish our stream
        if (this.options.isPublisher) {
          this.publishStream();
        }
        
        // If there are existing publishers, subscribe to them
        if (msg['publishers'] && msg['publishers'].length > 0) {
          this.subscribeToPublishers(msg['publishers']);
        }
      } else if (event === 'event') {
        // Handle events like new publishers, leaving, etc.
        if (msg['publishers'] && msg['publishers'].length > 0) {
          this.subscribeToPublishers(msg['publishers']);
        }
      }
    }
    
    // Handle WebRTC offer/answer
    if (jsep) {
      console.log('Handling SDP:', jsep);
      this.videoPlugin.handleRemoteJsep({ jsep });
      
      // If this is an offer and we're a viewer, create an answer
      if (jsep.type === 'offer' && !this.options.isPublisher) {
        this.createAnswer();
      }
    }
  }
  
  private subscribeToPublishers(publishers: any[]): void {
    if (!this.options.isPublisher) {
      // We're a viewer, subscribe to the first publisher
      const publisher = publishers[0]; // Just take the first one for simplicity
      
      const subscribeMessage = {
        request: 'join',
        room: this.roomId,
        ptype: 'subscriber',
        feed: publisher.id,
        private_id: this.userId
      };
      
      this.videoPlugin.send({ message: subscribeMessage });
    }
  }
  
  async startStream(): Promise<MediaStream> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (this.options.isPublisher) {
      return this.startPublishing();
    } else {
      return this.startWatching();
    }
  }
  
  private async startPublishing(): Promise<MediaStream> {
    return new Promise<MediaStream>((resolve, reject) => {
      // Join the room as a publisher
      const joinMessage = {
        request: 'join',
        room: this.roomId,
        ptype: 'publisher',
        display: this.displayName
      };
      
      this.videoPlugin.send({
        message: joinMessage,
        success: () => {
          console.log(`Successfully joined room ${this.roomId} as publisher`);
          
          // If we already have a local stream, resolve with it
          if (this.localStream) {
            resolve(this.localStream);
          } else {
            // Wait for the local stream to be created
            const checkInterval = setInterval(() => {
              if (this.localStream) {
                clearInterval(checkInterval);
                resolve(this.localStream);
              }
            }, 100);
            
            // Set a timeout in case the stream never comes
            setTimeout(() => {
              clearInterval(checkInterval);
              if (!this.localStream) {
                reject(new Error('Timeout waiting for local stream'));
              }
            }, 10000);
          }
        },
        error: (error: any) => {
          console.error('Error joining room as publisher:', error);
          reject(error);
        }
      });
    });
  }
  
  private publishStream(): void {
    // Create a WebRTC offer to publish
    this.videoPlugin.createOffer({
      media: {
        audioRecv: false,
        videoRecv: false,
        audioSend: true,
        videoSend: true
      },
      success: (jsep: any) => {
        console.log('Got publisher SDP:', jsep);
        const publishMessage = {
          request: 'publish',
          audio: true,
          video: true
        };
        this.videoPlugin.send({
          message: publishMessage,
          jsep
        });
      },
      error: (error: any) => {
        console.error('Error creating offer:', error);
        if (this.options.onError) {
          this.options.onError(error);
        }
      }
    });
  }
  
  private async startWatching(): Promise<MediaStream> {
    return new Promise<MediaStream>((resolve, reject) => {
      // Join the room as a viewer
      const joinMessage = {
        request: 'join',
        room: this.roomId,
        ptype: 'subscriber',
        display: this.displayName
      };
      
      this.videoPlugin.send({
        message: joinMessage,
        success: () => {
          console.log(`Successfully joined room ${this.roomId} as viewer`);
          
          // If we already have a remote stream, resolve with it
          if (this.remoteStream) {
            resolve(this.remoteStream);
          } else {
            // Wait for the remote stream to be created
            const checkInterval = setInterval(() => {
              if (this.remoteStream) {
                clearInterval(checkInterval);
                resolve(this.remoteStream);
              }
            }, 100);
            
            // Set a timeout in case the stream never comes
            setTimeout(() => {
              clearInterval(checkInterval);
              if (!this.remoteStream) {
                reject(new Error('Timeout waiting for remote stream'));
              }
            }, 10000);
          }
        },
        error: (error: any) => {
          console.error('Error joining room as viewer:', error);
          reject(error);
        }
      });
    });
  }
  
  private createAnswer(): void {
    this.videoPlugin.createAnswer({
      media: {
        audioSend: false,
        videoSend: false,
        audioRecv: true,
        videoRecv: true
      },
      success: (jsep: any) => {
        console.log('Got viewer SDP:', jsep);
        const startMessage = { request: 'start', room: this.roomId };
        this.videoPlugin.send({
          message: startMessage,
          jsep
        });
      },
      error: (error: any) => {
        console.error('Error creating answer:', error);
        if (this.options.onError) {
          this.options.onError(error);
        }
      }
    });
  }
  
  async stopStream(): Promise<void> {
    if (this.videoPlugin) {
      // Send leave message
      const leaveMessage = {
        request: 'leave'
      };
      
      this.videoPlugin.send({ message: leaveMessage });
      
      // Clean up WebRTC resources
      this.videoPlugin.hangup();
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.remoteStream = null;
    this.isConnected = false;
  }
  
  isStreamActive(): boolean {
    return this.isConnected && (this.localStream !== null || this.remoteStream !== null);
  }
  
  getStream(): MediaStream | null {
    return this.options.isPublisher ? this.localStream : this.remoteStream;
  }
  
  sendData(data: any): void {
    if (!this.videoPlugin) return;
    
    // Send data message through the data channel
    const dataMessage = {
      request: 'data',
      data: JSON.stringify(data)
    };
    
    this.videoPlugin.send({ message: dataMessage });
  }
}

// Add Janus types to global window object
declare global {
  interface Window {
    Janus: any;
  }
}

// Utility function to create a Janus stream manager
export function createJanusStreamManager(
  streamId: string,
  isPublisher: boolean,
  options?: Partial<JanusStreamOptions>
): JanusStreamManager {
  const streamOptions: JanusStreamOptions = {
    streamId,
    isPublisher,
    ...options
  };
  
  return new JanusStreamManager(streamOptions);
}
