import { client, xml, jid } from '@xmpp/client';
import { debug } from '@xmpp/debug';
import { websocket } from '@xmpp/websocket';

export interface XMPPConfig {
  server: string;
  domain: string;
  username: string;
  password: string;
  resource?: string;
  debug?: boolean;
}

export interface XMPPMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  type?: 'chat' | 'groupchat' | 'normal';
  thread?: string;
}

export interface XMPPPresence {
  from: string;
  show?: 'away' | 'chat' | 'dnd' | 'xa';
  status?: string;
  priority?: number;
}

export interface XMPPContact {
  jid: string;
  name?: string;
  subscription: 'both' | 'from' | 'to' | 'none';
  groups: string[];
  ask?: 'subscribe';
}

export class XMPPManager {
  private xmpp: any = null;
  private config: XMPPConfig;
  private isConnected = false;
  private messageHandlers: ((message: XMPPMessage) => void)[] = [];
  private presenceHandlers: ((presence: XMPPPresence) => void)[] = [];
  private rosterHandlers: ((contacts: XMPPContact[]) => void)[] = [];

  constructor(config: XMPPConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create XMPP client
        this.xmpp = client({
          service: this.config.server,
          domain: this.config.domain,
          resource: this.config.resource || 'rafiki-messenger',
        });

        // Add WebSocket transport
        this.xmpp.use(websocket);

        // Add debug logging if enabled
        if (this.config.debug) {
          this.xmpp.use(debug);
        }

        // Set up event handlers
        this.setupEventHandlers();

        // Connect
        this.xmpp.start().then(() => {
          this.isConnected = true;
          resolve();
        }).catch((error: any) => {
          console.error('XMPP connection failed:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.xmpp) return;

    // Handle connection
    this.xmpp.on('online', async () => {
      console.log('XMPP connected');
      this.isConnected = true;
      
      // Send initial presence
      await this.sendPresence();
      
      // Request roster
      await this.requestRoster();
    });

    // Handle offline
    this.xmpp.on('offline', () => {
      console.log('XMPP disconnected');
      this.isConnected = false;
    });

    // Handle errors
    this.xmpp.on('error', (error: any) => {
      console.error('XMPP error:', error);
    });

    // Handle messages
    this.xmpp.on('stanza', (stanza: any) => {
      if (stanza.is('message')) {
        this.handleMessage(stanza);
      } else if (stanza.is('presence')) {
        this.handlePresence(stanza);
      } else if (stanza.is('iq') && stanza.attrs.type === 'result') {
        this.handleIQ(stanza);
      }
    });
  }

  private handleMessage(stanza: any): void {
    const body = stanza.getChild('body');
    if (!body) return;

    const message: XMPPMessage = {
      id: stanza.attrs.id || Date.now().toString(),
      from: stanza.attrs.from,
      to: stanza.attrs.to,
      body: body.getText(),
      timestamp: new Date(),
      type: stanza.attrs.type || 'chat',
      thread: stanza.getChild('thread')?.getText(),
    };

    // Notify handlers
    this.messageHandlers.forEach(handler => handler(message));
  }

  private handlePresence(stanza: any): void {
    const show = stanza.getChild('show')?.getText();
    const status = stanza.getChild('status')?.getText();
    const priority = stanza.getChild('priority')?.getText();

    const presence: XMPPPresence = {
      from: stanza.attrs.from,
      show: show as any,
      status,
      priority: priority ? parseInt(priority) : undefined,
    };

    // Notify handlers
    this.presenceHandlers.forEach(handler => handler(presence));
  }

  private handleIQ(stanza: any): void {
    const query = stanza.getChild('query');
    if (query && query.attrs.xmlns === 'jabber:iq:roster') {
      this.handleRoster(query);
    }
  }

  private handleRoster(query: any): void {
    const contacts: XMPPContact[] = [];
    const items = query.getChildren('item');

    items.forEach((item: any) => {
      contacts.push({
        jid: item.attrs.jid,
        name: item.attrs.name,
        subscription: item.attrs.subscription,
        groups: item.getChildren('group').map((group: any) => group.getText()),
        ask: item.attrs.ask,
      });
    });

    // Notify handlers
    this.rosterHandlers.forEach(handler => handler(contacts));
  }

  async authenticate(username: string, password: string): Promise<void> {
    if (!this.xmpp) {
      throw new Error('XMPP client not initialized');
    }

    try {
      await this.xmpp.start(username, password);
    } catch (error) {
      console.error('XMPP authentication failed:', error);
      throw error;
    }
  }

  async sendMessage(to: string, body: string, type: 'chat' | 'groupchat' | 'normal' = 'chat'): Promise<void> {
    if (!this.xmpp || !this.isConnected) {
      throw new Error('XMPP not connected');
    }

    try {
      const message = xml('message', { to, type }, xml('body', {}, body));
      await this.xmpp.send(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async sendGroupMessage(roomJid: string, body: string): Promise<void> {
    if (!this.xmpp || !this.isConnected) {
      throw new Error('XMPP not connected');
    }

    try {
      const message = xml('message', { to: roomJid, type: 'groupchat' }, xml('body', {}, body));
      await this.xmpp.send(message);
    } catch (error) {
      console.error('Failed to send group message:', error);
      throw error;
    }
  }

  async sendPresence(show?: 'away' | 'chat' | 'dnd' | 'xa', status?: string): Promise<void> {
    if (!this.xmpp || !this.isConnected) {
      throw new Error('XMPP not connected');
    }

    try {
      const presence = xml('presence');
      if (show) {
        presence.append(xml('show', {}, show));
      }
      if (status) {
        presence.append(xml('status', {}, status));
      }
      await this.xmpp.send(presence);
    } catch (error) {
      console.error('Failed to send presence:', error);
      throw error;
    }
  }

  async requestRoster(): Promise<void> {
    if (!this.xmpp || !this.isConnected) {
      throw new Error('XMPP not connected');
    }

    try {
      const iq = xml('iq', { type: 'get' }, xml('query', { xmlns: 'jabber:iq:roster' }));
      await this.xmpp.send(iq);
    } catch (error) {
      console.error('Failed to request roster:', error);
      throw error;
    }
  }

  async joinRoom(roomJid: string, nickname: string): Promise<void> {
    if (!this.xmpp || !this.isConnected) {
      throw new Error('XMPP not connected');
    }

    try {
      // Send presence to join room
      const presence = xml('presence', { to: `${roomJid}/${nickname}` });
      await this.xmpp.send(presence);
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  async leaveRoom(roomJid: string, nickname: string): Promise<void> {
    if (!this.xmpp || !this.isConnected) {
      throw new Error('XMPP not connected');
    }

    try {
      // Send unavailable presence to leave room
      const presence = xml('presence', { to: `${roomJid}/${nickname}`, type: 'unavailable' });
      await this.xmpp.send(presence);
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }

  onMessage(handler: (message: XMPPMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onPresence(handler: (presence: XMPPPresence) => void): () => void {
    this.presenceHandlers.push(handler);
    return () => {
      this.presenceHandlers = this.presenceHandlers.filter(h => h !== handler);
    };
  }

  onRoster(handler: (contacts: XMPPContact[]) => void): () => void {
    this.rosterHandlers.push(handler);
    return () => {
      this.rosterHandlers = this.rosterHandlers.filter(h => h !== handler);
    };
  }

  async disconnect(): Promise<void> {
    if (this.xmpp) {
      try {
        await this.xmpp.stop();
      } catch (error) {
        console.error('Error disconnecting XMPP:', error);
      }
      this.xmpp = null;
    }
    this.isConnected = false;
  }

  getConnectionState(): boolean {
    return this.isConnected;
  }

  getJid(): string | null {
    if (!this.xmpp) return null;
    return this.xmpp.jid?.toString();
  }
}

// Default XMPP configuration
export const DEFAULT_XMPP_CONFIG = {
  server: 'ws://localhost:5280/ws',
  domain: 'localhost',
  debug: true,
};

// Utility function to create an XMPP manager
export function createXMPPManager(
  username: string,
  password: string,
  customConfig?: Partial<XMPPConfig>
): XMPPManager {
  const config: XMPPConfig = {
    ...DEFAULT_XMPP_CONFIG,
    username,
    password,
    ...customConfig,
  };

  return new XMPPManager(config);
}
