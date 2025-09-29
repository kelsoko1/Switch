// ejabberd Configuration for XMPP Messaging
export const EJABBERD_CONFIG = {
  // Default ejabberd server settings
  server: {
    host: 'localhost',
    port: 2026,
    wsPort: 2026,
    domain: 'localhost',
    adminUser: 'admin',
    adminPassword: 'admin123',
  },
  
  // XMPP client settings
  client: {
    resource: 'rafiki-messenger',
    debug: true,
    reconnect: true,
    reconnectInterval: 5000,
  },
  
  // Room settings for group chats
  rooms: {
    defaultDomain: 'conference.localhost',
    maxOccupants: 100,
    persistent: true,
    moderated: false,
  },
  
  // Message settings
  messages: {
    maxLength: 10000,
    historyLength: 50,
    deliveryReceipts: true,
    readReceipts: true,
  },
  
  // Security settings
  security: {
    requireTLS: false, // Set to true in production
    allowPlaintext: true, // Set to false in production
    saslMechanisms: ['PLAIN', 'DIGEST-MD5', 'SCRAM-SHA-1'],
  },
  
  // Database settings (if using external DB)
  database: {
    type: 'sqlite', // 'sqlite', 'mysql', 'postgresql'
    host: 'localhost',
    port: 5432,
    name: 'ejabberd',
    user: 'ejabberd',
    password: 'ejabberd123',
  },
};

// Environment-specific configurations
export const getEjabberdConfig = () => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'development':
      return {
        ...EJABBERD_CONFIG,
        server: {
          ...EJABBERD_CONFIG.server,
          host: 'localhost',
          port: 2026,
        },
        client: {
          ...EJABBERD_CONFIG.client,
          debug: true,
        },
        security: {
          ...EJABBERD_CONFIG.security,
          requireTLS: false,
          allowPlaintext: true,
        },
      };
    
    case 'production':
      return {
        ...EJABBERD_CONFIG,
        server: {
          ...EJABBERD_CONFIG.server,
          host: process.env.REACT_APP_EJABBERD_HOST || 'your-domain.com',
          port: parseInt(process.env.REACT_APP_EJABBERD_PORT || '2026'),
        },
        client: {
          ...EJABBERD_CONFIG.client,
          debug: false,
        },
        security: {
          ...EJABBERD_CONFIG.security,
          requireTLS: true,
          allowPlaintext: false,
        },
      };
    
    default:
      return EJABBERD_CONFIG;
  }
};

// Utility functions for XMPP operations
export const createJid = (username: string, domain: string, resource?: string): string => {
  return resource ? `${username}@${domain}/${resource}` : `${username}@${domain}`;
};

export const parseJid = (jid: string): { username: string; domain: string; resource?: string } => {
  const [userPart, domainPart] = jid.split('@');
  const [domain, resource] = domainPart?.split('/') || [domainPart];
  
  return {
    username: userPart,
    domain: domain || '',
    resource: resource || undefined,
  };
};

export const createRoomJid = (roomName: string, domain?: string): string => {
  const roomDomain = domain || EJABBERD_CONFIG.rooms.defaultDomain;
  return `${roomName}@${roomDomain}`;
};

export const isValidJid = (jid: string): boolean => {
  const jidRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+(\/[^@\s]+)?$/;
  return jidRegex.test(jid);
};

// Message formatting utilities
export const formatMessage = (message: any): string => {
  if (typeof message === 'string') return message;
  if (message.body) return message.body;
  if (message.text) return message.text;
  return JSON.stringify(message);
};

export const createMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Presence utilities
export const createPresence = (show?: 'away' | 'chat' | 'dnd' | 'xa', status?: string) => {
  return {
    show,
    status,
    timestamp: new Date(),
  };
};

// Room utilities
export const createRoomConfig = (roomName: string, options: any = {}) => {
  return {
    room: roomName,
    host: EJABBERD_CONFIG.rooms.defaultDomain,
    maxOccupants: options.maxOccupants || EJABBERD_CONFIG.rooms.maxOccupants,
    persistent: options.persistent !== false,
    moderated: options.moderated || false,
    public: options.public !== false,
    ...options,
  };
};
