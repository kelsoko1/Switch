// Real XMPP implementation using @xmpp/client with ejabberd server
import { client, xml as xmppXml, jid } from '@xmpp/client';
import debug from 'debug';
import { db, COLLECTIONS } from './appwrite';

// Export xml for use in other modules
export const xml = xmppXml;

export interface SimpleXMPPConfig {
  server: string;
  domain: string;
  username: string;
  password: string;
  debug?: boolean;
  resource?: string;
}

export interface SimpleXMPPMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  type?: 'chat' | 'groupchat' | 'normal';
}

export interface SimpleXMPPPresence {
  from: string;
  show?: 'away' | 'chat' | 'dnd' | 'xa';
  status?: string;
  priority?: number;
}

export interface SimpleXMPPContact {
  jid: string;
  name?: string;
  subscription: 'both' | 'from' | 'to' | 'none';
  groups: string[];
}

export class SimpleXMPPManager {
  private config: SimpleXMPPConfig;
  private xmpp: any;
  private isConnected = false;
  private messageHandlers: ((message: SimpleXMPPMessage) => void)[] = [];
  private presenceHandlers: ((presence: SimpleXMPPPresence) => void)[] = [];
  private rosterHandlers: ((contacts: SimpleXMPPContact[]) => void)[] = [];
  private messages: SimpleXMPPMessage[] = [];
  private contacts: SimpleXMPPContact[] = [];
  private debugLog: any;

  constructor(config: SimpleXMPPConfig) {
    this.config = {
      ...config,
      resource: config.resource || `switch_${Math.floor(Math.random() * 1000000)}`
    };
    
    if (this.config.debug) {
      this.debugLog = debug('xmpp');
      debug.enable('xmpp');
    } else {
      this.debugLog = () => {};
    }
    
    // Initialize XMPP client
    this.xmpp = client({
      service: this.config.server,
      domain: this.config.domain,
      resource: this.config.resource,
      username: this.config.username,
      password: this.config.password
    });
    
    // Set up event handlers
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    // Log all events when debug is enabled
    if (this.config.debug) {
      this.xmpp.on('status', (status: string) => {
        this.debugLog('Status:', status);
      });
      
      this.xmpp.on('input', (input: any) => {
        this.debugLog('Input:', input);
      });
      
      this.xmpp.on('output', (output: any) => {
        this.debugLog('Output:', output);
      });
    }
    
    // Handle errors
    this.xmpp.on('error', (err: any) => {
      console.error('XMPP error:', err);
    });
    
    // Handle online status
    this.xmpp.on('online', async (address: any) => {
      this.isConnected = true;
      this.debugLog('Connected as', address.toString());
      
      // Send initial presence
      await this.sendPresence();
      
      // Request roster
      await this.requestRoster();
    });
    
    // Handle offline status
    this.xmpp.on('offline', () => {
      this.isConnected = false;
      this.debugLog('Disconnected');
    });
    
    // Handle stanza (XML message)
    this.xmpp.on('stanza', (stanza: any) => {
      if (stanza.is('message')) {
        this.handleMessage(stanza);
      } else if (stanza.is('presence')) {
        this.handlePresence(stanza);
      } else if (stanza.is('iq') && stanza.getChild('query', 'jabber:iq:roster')) {
        this.handleRoster(stanza);
      }
    });
  }
  
  private handleMessage(stanza: any) {
    const type = stanza.attrs.type;
    const body = stanza.getChildText('body');
    
    if (!body) return; // Ignore messages without body
    
    const message: SimpleXMPPMessage = {
      id: stanza.attrs.id || Date.now().toString(),
      from: stanza.attrs.from,
      to: stanza.attrs.to,
      body,
      timestamp: new Date(),
      type: type as 'chat' | 'groupchat' | 'normal'
    };
    
    // Add to local messages
    this.messages.push(message);
    
    // Notify handlers
    this.messageHandlers.forEach(handler => handler(message));
  }
  
  private handlePresence(stanza: any) {
    const presence: SimpleXMPPPresence = {
      from: stanza.attrs.from,
      show: stanza.getChildText('show') as 'away' | 'chat' | 'dnd' | 'xa',
      status: stanza.getChildText('status'),
      priority: stanza.getChildText('priority') ? parseInt(stanza.getChildText('priority')) : undefined
    };
    
    // Notify handlers
    this.presenceHandlers.forEach(handler => handler(presence));
  }
  
  private handleRoster(stanza: any) {
    const query = stanza.getChild('query', 'jabber:iq:roster');
    if (!query) return;
    
    const items = query.getChildren('item');
    const contacts: SimpleXMPPContact[] = items.map((item: any) => {
      const groups = item.getChildren('group').map((group: any) => group.getText());
      
      return {
        jid: item.attrs.jid,
        name: item.attrs.name,
        subscription: item.attrs.subscription as 'both' | 'from' | 'to' | 'none',
        groups
      };
    });
    
    // Update local contacts
    this.contacts = contacts;
    
    // Notify handlers
    this.rosterHandlers.forEach(handler => handler(contacts));
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await this.xmpp.start();
    } catch (error) {
      console.error('XMPP connection error:', error);
      throw error;
    }
  }

  async authenticate(username: string, password: string): Promise<void> {
    // Authentication is handled during connection
    // This method is kept for API compatibility
    if (username !== this.config.username || password !== this.config.password) {
      this.config.username = username;
      this.config.password = password;
      
      // Reconnect with new credentials if already connected
      if (this.isConnected) {
        await this.disconnect();
        await this.connect();
      }
    }
  }

  async sendMessage(to: string, body: string, type: 'chat' | 'groupchat' | 'normal' = 'chat'): Promise<void> {
    if (!this.isConnected) {
      throw new Error('XMPP not connected');
    }
    
    const id = `msg_${Date.now()}`;
    const message = xml(
      'message',
      { type, to, id },
      xml('body', {}, body)
    );
    
    await this.xmpp.send(message);
    
    // Add to local messages
    const sentMessage: SimpleXMPPMessage = {
      id,
      from: this.getJid(),
      to,
      body,
      timestamp: new Date(),
      type
    };
    
    this.messages.push(sentMessage);
  }

  async sendGroupMessage(roomJid: string, body: string): Promise<void> {
    return this.sendMessage(roomJid, body, 'groupchat');
  }

  async sendPresence(show?: 'away' | 'chat' | 'dnd' | 'xa', status?: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('XMPP not connected');
    }
    
    const children = [];
    
    if (show) {
      children.push(xml('show', {}, show));
    }
    
    if (status) {
      children.push(xml('status', {}, status));
    }
    
    const presence = xml('presence', {}, ...children);
    await this.xmpp.send(presence);
  }
  
  // Send IQ stanza and wait for response
  async sendIq(iqStanza: any): Promise<any> {
    if (!this.isConnected) {
      throw new Error('XMPP not connected');
    }
    
    try {
      // Send the IQ stanza and wait for response
      const response = await this.xmpp.iqCaller.request(iqStanza);
      return response;
    } catch (error) {
      console.error('Error sending IQ stanza:', error);
      throw error;
    }
  }

  async requestRoster(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('XMPP not connected');
    }
    
    const id = `roster_${Date.now()}`;
    const roster = xml(
      'iq',
      { type: 'get', id },
      xml('query', { xmlns: 'jabber:iq:roster' })
    );
    
    await this.xmpp.send(roster);
  }

  async joinRoom(roomJid: string, nickname: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('XMPP not connected');
    }
    
    const presence = xml(
      'presence',
      { to: `${roomJid}/${nickname}` },
      xml('x', { xmlns: 'http://jabber.org/protocol/muc' })
    );
    
    await this.xmpp.send(presence);
    this.debugLog(`Joined room ${roomJid} as ${nickname}`);
  }

  async leaveRoom(roomJid: string, nickname: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('XMPP not connected');
    }
    
    const presence = xml(
      'presence',
      { to: `${roomJid}/${nickname}`, type: 'unavailable' }
    );
    
    await this.xmpp.send(presence);
    this.debugLog(`Left room ${roomJid}`);
  }

  onMessage(handler: (message: SimpleXMPPMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onPresence(handler: (presence: SimpleXMPPPresence) => void): () => void {
    this.presenceHandlers.push(handler);
    return () => {
      this.presenceHandlers = this.presenceHandlers.filter(h => h !== handler);
    };
  }

  onRoster(handler: (contacts: SimpleXMPPContact[]) => void): () => void {
    this.rosterHandlers.push(handler);
    return () => {
      this.rosterHandlers = this.rosterHandlers.filter(h => h !== handler);
    };
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.xmpp.stop();
      this.isConnected = false;
    } catch (error) {
      console.error('XMPP disconnection error:', error);
      throw error;
    }
  }

  getConnectionState(): boolean {
    return this.isConnected;
  }

  getJid(): string {
    return `${this.config.username}@${this.config.domain}/${this.config.resource}`;
  }

  getMessages(): SimpleXMPPMessage[] {
    return [...this.messages];
  }

  getContacts(): SimpleXMPPContact[] {
    return [...this.contacts];
  }
}

// Utility function to create a simple XMPP manager
export function createSimpleXMPPManager(
  username: string,
  password: string,
  customConfig?: Partial<SimpleXMPPConfig>
): SimpleXMPPManager {
  const server = import.meta.env.VITE_XMPP_SERVER || 'ws://localhost:2026/ws';
  const domain = import.meta.env.VITE_XMPP_DOMAIN || 'localhost';
  
  const config: SimpleXMPPConfig = {
    username,
    password,
    domain,
    server,
    debug: import.meta.env.DEV,
    ...customConfig
  };

  return new SimpleXMPPManager(config);
}
