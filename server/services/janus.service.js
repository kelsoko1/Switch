const Janus = require('janus-gateway');
const EventEmitter = require('events');
const logger = require('../utils/logger');

class JanusService extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map();
    this.plugins = new Map();
    this.initialize();
  }

  initialize() {
    // Configure Janus with environment variables
    this.config = {
      server: process.env.JANUS_URL,
      apisecret: process.env.JANUS_ADMIN_SECRET,
      admin_secret: process.env.JANUS_ADMIN_SECRET,
      withCredentials: true,
      max_poll_events: 50,
      keepalive: '30s',
      keepalive_timeout: '5s',
    };

    // Initialize Janus library
    Janus.init({
      debug: process.env.NODE_ENV === 'development' ? 'all' : false,
      callback: () => {
        logger.info('Janus library initialized');
      },
    });
  }

  async createSession(userId) {
    try {
      if (this.sessions.has(userId)) {
        return this.sessions.get(userId);
      }

      const session = new Janus.Session(this.config);

      return new Promise((resolve, reject) => {
        session.create({
          success: () => {
            logger.info(`Janus session created for user ${userId}`);
            this.sessions.set(userId, session);
            resolve(session);
          },
          error: (error) => {
            logger.error('Error creating Janus session:', error);
            reject(error);
          },
        });
      });
    } catch (error) {
      logger.error('Error in createSession:', error);
      throw error;
    }
  }

  async attachPlugin(session, pluginName, options = {}) {
    try {
      if (!session) {
        throw new Error('No active session');
      }

      const plugin = await new Promise((resolve, reject) => {
        session.attach({
          plugin: pluginName,
          success: (pluginHandle) => {
            logger.info(`Attached ${pluginName} plugin to session`);
            resolve(pluginHandle);
          },
          error: (error) => {
            logger.error(`Error attaching ${pluginName} plugin:`, error);
            reject(error);
          },
          ...options,
        });
      });

      return plugin;
    } catch (error) {
      logger.error('Error in attachPlugin:', error);
      throw error;
    }
  }

  async createRoom(session, roomId, options = {}) {
    try {
      const videoroom = await this.attachPlugin(session, 'janus.plugin.videoroom');
      
      const createRoomRequest = {
        request: 'create',
        room: roomId,
        publishers: options.publishers || 10,
        bitrate: options.bitrate || 256000,
        fir_freq: 10,
        audiocodec: 'opus',
        videocodec: 'vp8',
        record: options.record || false,
        ...options,
      };

      const response = await new Promise((resolve, reject) => {
        videoroom.send({ message: createRoomRequest, success: resolve, error: reject });
      });

      if (response.videoroom === 'created' || response.videoroom === 'exists') {
        return { success: true, roomId: response.room, data: response };
      } else {
        throw new Error('Failed to create room: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      logger.error('Error creating room:', error);
      throw error;
    }
  }

  async joinRoom(session, roomId, userId, options = {}) {
    try {
      const videoroom = await this.attachPlugin(session, 'janus.plugin.videoroom');
      
      const joinRequest = {
        request: 'join',
        room: roomId,
        ptype: options.publisher ? 'publisher' : 'subscriber',
        display: options.displayName || `user-${userId}`,
        id: userId,
        ...options,
      };

      const response = await new Promise((resolve, reject) => {
        videoroom.send({ message: joinRequest, success: resolve, error: reject });
      });

      return { success: true, data: response };
    } catch (error) {
      logger.error('Error joining room:', error);
      throw error;
    }
  }

  async publish(session, roomId, userId, jsep, options = {}) {
    try {
      const videoroom = await this.attachPlugin(session, 'janus.plugin.videoroom');
      
      const publishRequest = {
        request: 'publish',
        room: roomId,
        display: options.displayName || `user-${userId}`,
        audio: options.audio !== false,
        video: options.video !== false,
        data: options.data !== false,
        ...options,
      };

      const response = await new Promise((resolve, reject) => {
        videoroom.send({
          message: publishRequest,
          jsep: jsep,
          success: resolve,
          error: reject,
        });
      });

      return { success: true, data: response };
    } catch (error) {
      logger.error('Error publishing stream:', error);
      throw error;
    }
  }

  async destroySession(userId) {
    try {
      const session = this.sessions.get(userId);
      if (session) {
        await new Promise((resolve) => {
          session.destroy({
            success: () => {
              this.sessions.delete(userId);
              logger.info(`Destroyed Janus session for user ${userId}`);
              resolve();
            },
            error: (error) => {
              logger.error(`Error destroying Janus session for user ${userId}:`, error);
              resolve(); // Still resolve to clean up
            },
          });
        });
      }
    } catch (error) {
      logger.error('Error in destroySession:', error);
      throw error;
    }
  }
}

module.exports = new JanusService();
