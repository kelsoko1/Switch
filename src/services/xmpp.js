import { client, xml } from '@xmpp/client';
import { v4 as uuidv4 } from 'uuid';
import api from '../lib/api';

class XMPPService {
  constructor() {
    this.xmpp = null;
    this.connectionState = 'disconnected';
    this.messageHandlers = new Set();
    this.presenceHandlers = new Set();
  }

  // Initialize XMPP connection
  async connect(jid, password) {
    if (this.connectionState === 'connected') return;
    
    this.connectionState = 'connecting';
    
    try {
      // Get XMPP credentials from the server
      const { data } = await api.post('/auth/xmpp-credentials');
      
      this.xmpp = client({
        service: import.meta.env.VITE_XMPP_SERVICE,
        domain: import.meta.env.VITE_XMPP_DOMAIN,
        username: data.username,
        password: data.password,
      });

      // Event handlers
      this.xmpp.on('stanza', (stanza) => {
        if (stanza.is('message')) {
          this.handleMessage(stanza);
        } else if (stanza.is('presence')) {
          this.handlePresence(stanza);
        }
      });

      this.xmpp.on('online', async (address) => {
        this.connectionState = 'connected';
        console.log('XMPP connected as', address.toString());
        
        // Set initial presence
        await this.xmpp.send(xml('presence'));
      });

      this.xmpp.on('offline', () => {
        this.connectionState = 'disconnected';
        console.log('XMPP disconnected');
      });

      this.xmpp.on('error', (err) => {
        console.error('XMPP error:', err);
        this.connectionState = 'error';
      });

      await this.xmpp.start();
    } catch (error) {
      console.error('Failed to connect to XMPP:', error);
      this.connectionState = 'error';
      throw error;
    }
  }

  // Disconnect from XMPP server
  async disconnect() {
    if (!this.xmpp || this.connectionState !== 'connected') return;
    
    try {
      await this.xmpp.stop();
      this.connectionState = 'disconnected';
    } catch (error) {
      console.error('Error disconnecting from XMPP:', error);
      throw error;
    }
  }

  // Send a chat message
  async sendMessage(to, body, type = 'chat') {
    if (this.connectionState !== 'connected') {
      throw new Error('Not connected to XMPP server');
    }

    const id = uuidv4();
    const message = xml(
      'message',
      { to, type, id },
      xml('body', {}, body)
    );

    await this.xmpp.send(message);
    return id;
  }

  // Join a group chat
  async joinRoom(roomJid, nickname) {
    if (this.connectionState !== 'connected') {
      throw new Error('Not connected to XMPP server');
    }

    const presence = xml(
      'presence',
      { to: `${roomJid}/${nickname}` },
      xml('x', { xmlns: 'http://jabber.org/protocol/muc' })
    );

    await this.xmpp.send(presence);
  }

  // Handle incoming messages
  handleMessage(stanza) {
    const from = stanza.attrs.from;
    const body = stanza.getChild('body');
    const delay = stanza.getChild('delay');
    
    // Skip delayed messages or messages without body
    if (delay || !body) return;

    const message = {
      id: stanza.attrs.id,
      from: from.split('/')[0], // Remove resource part
      body: body.text(),
      timestamp: new Date(),
      isGroup: from.includes('@conference.')
    };

    // Notify all message handlers
    this.messageHandlers.forEach(handler => handler(message));
  }

  // Handle presence updates
  handlePresence(stanza) {
    const from = stanza.attrs.from;
    const type = stanza.attrs.type;
    const status = stanza.getChild('status');
    const show = stanza.getChild('show');
    
    const presence = {
      from: from.split('/')[0],
      type,
      status: status ? status.text() : '',
      show: show ? show.text() : 'available',
      timestamp: new Date()
    };

    // Notify all presence handlers
    this.presenceHandlers.forEach(handler => handler(presence));
  }

  // Register message handler
  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  // Register presence handler
  onPresence(handler) {
    this.presenceHandlers.add(handler);
    return () => this.presenceHandlers.delete(handler);
  }
}

// Export a singleton instance
export default new XMPPService();
