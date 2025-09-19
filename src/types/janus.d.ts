// Type declarations for Janus WebRTC Gateway
declare interface JanusInitOptions {
  debug?: boolean | string;
  callback?: () => void;
}

declare interface JanusOptions {
  server: string | string[];
  iceServers?: RTCIceServer[];
  ipv6?: boolean;
  withCredentials?: boolean;
  max_poll_events?: number;
  destroyOnUnload?: boolean;
  token?: string;
  apisecret?: string;
  success?: () => void;
  error?: (error: any) => void;
  destroyed?: () => void;
}

declare interface JanusPluginOptions {
  plugin: string;
  opaqueId?: string;
  success?: (handle: any) => void;
  error?: (error: any) => void;
  consentDialog?: (on: boolean) => void;
  webrtcState?: (isConnected: boolean) => void;
  iceState?: (state: string) => void;
  mediaState?: (medium: string, receiving: boolean, mid?: number) => void;
  slowLink?: (uplink: boolean, lost: number, mid?: number) => void;
  onmessage?: (msg: any, jsep?: any) => void;
  onlocaltrack?: (track: MediaStreamTrack, on: boolean) => void;
  onremotetrack?: (track: MediaStreamTrack, mid: string, on: boolean) => void;
  oncleanup?: () => void;
  detached?: () => void;
}

declare interface JanusCreateOfferOptions {
  media?: {
    audioSend?: boolean;
    audioRecv?: boolean;
    videoSend?: boolean;
    videoRecv?: boolean;
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
    data?: boolean;
    failIfNoAudio?: boolean;
    failIfNoVideo?: boolean;
    screenshareFrameRate?: number;
  };
  trickle?: boolean;
  iceRestart?: boolean;
  success: (jsep: RTCSessionDescription) => void;
  error: (error: any) => void;
}

declare interface JanusCreateAnswerOptions {
  media?: {
    audioSend?: boolean;
    audioRecv?: boolean;
    videoSend?: boolean;
    videoRecv?: boolean;
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
    data?: boolean;
    failIfNoAudio?: boolean;
    failIfNoVideo?: boolean;
    screenshareFrameRate?: number;
  };
  trickle?: boolean;
  success: (jsep: RTCSessionDescription) => void;
  error: (error: any) => void;
}

declare class Janus {
  constructor(options: JanusOptions);
  
  static init(options: JanusInitOptions): void;
  static isWebrtcSupported(): boolean;
  static debug(...args: any[]): void;
  static log(...args: any[]): void;
  static warn(...args: any[]): void;
  static error(...args: any[]): void;
  static randomString(length: number): string;
  
  getServer(): string;
  isConnected(): boolean;
  getSessionId(): string;
  attach(options: JanusPluginOptions): void;
  destroy(callbacks?: { success?: () => void; error?: (error: any) => void }): void;
}

declare interface JanusPluginHandle {
  getId(): string;
  getPlugin(): string;
  send(message: any): void;
  createOffer(options: JanusCreateOfferOptions): void;
  createAnswer(options: JanusCreateAnswerOptions): void;
  handleRemoteJsep(options: { jsep: RTCSessionDescription }): void;
  dtmf(options: any): void;
  data(options: any): void;
  isVideoMuted(): boolean;
  muteVideo(): void;
  unmuteVideo(): void;
  isAudioMuted(): boolean;
  muteAudio(): void;
  unmuteAudio(): void;
  getBitrate(): number;
  hangup(sendRequest?: boolean): void;
  detach(callbacks?: { success?: () => void; error?: (error: any) => void }): void;
}

declare global {
  interface Window {
    Janus: typeof Janus;
  }
}
