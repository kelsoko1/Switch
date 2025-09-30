const { client, xml } = require('@xmpp/client');
const debug = require('@xmpp/debug');
const { JID } = require('@xmpp/jid');
const { EventEmitter } = require('events');
const logger = require('../utils/logger');

class XMPPService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map();
    this.isConnected = false;
    this.initialize();
  }

  initialize() {
    if (process.env.NODE_ENV === 'development') {
      debug.enable('xmpp:*');
    }
  }

  async connect(userId, token) {
    try {
      if (this.clients.has(userId)) {
        return this.clients.get(userId);
      }

      const xmpp = client({
        service: process.env.XMPP_WS_URL,
        domain: process.env.XMPP_DOMAIN,
        username: userId,
        password: token,
      });

      // Enable debugging in development
      if (process.env.NODE_ENV === 'development') {
        debug(xmpp, true);
      }

      // Handle connection
      xmpp.on('stanza', (stanza) => {
        if (stanza.is('message')) {
          this.emit('message', {
            from: stanza.attrs.from,
            to: stanza.attrs.to,
            body: stanza.getChildText('body'),
            timestamp: new Date().toISOString(),
          });
        }
      });

      xmpp.on('error', (err) => {
        logger.error('XMPP Error:', err);
        this.emit('error', err);
      });

      xmpp.on('offline', () => {
        logger.info('XMPP client is offline');
        this.isConnected = false;
        this.emit('disconnected');
      });

      xmpp.on('online', async (address) => {
        logger.info(`XMPP client connected as ${address.toString()}`);
        this.isConnected = true;
        this.emit('connected', address.toString());
        
        // Set presence
        await xmpp.send(xml('presence'));
      });

      await xmpp.start();
      this.clients.set(userId, xmpp);

      return xmpp;
    } catch (error) {
      logger.error('XMPP Connection Error:', error);
      throw error;
    }
  }

  async sendMessage(from, to, body) {
    try {
      const xmpp = this.clients.get(from);
      if (!xmpp) {
        throw new Error('XMPP client not connected');
      }

      const message = xml(
        'message',
        { type: 'chat', to, from },
        xml('body', {}, body)
      );

      await xmpp.send(message);
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      logger.error('Error sending XMPP message:', error);
      throw error;
    }
  }

  async createRoom(roomId, creatorId, roomName) {
    try {
      const xmpp = this.clients.get(creatorId);
      if (!xmpp) {
        throw new Error('XMPP client not connected');
      }

      const roomJid = `${roomId}@conference.${process.env.XMPP_DOMAIN}`;
      const presence = xml(
        'presence',
        { to: `${roomJid}/${creatorId}` },
        xml('x', { xmlns: 'http://jabber.org/protocol/muc' })
      );

      await xmpp.send(presence);
      return { success: true, roomJid };
    } catch (error) {
      logger.error('Error creating XMPP room:', error);
      throw error;
    }
  }

  async disconnect(userId) {
    try {
      const xmpp = this.clients.get(userId);
      if (xmpp) {
        await xmpp.stop();
        this.clients.delete(userId);
      }
    } catch (error) {
      logger.error('Error disconnecting XMPP client:', error);
      throw error;
    }
  }
}

module.exports = new XMPPService();
