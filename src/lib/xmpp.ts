// Mock XMPP implementation that doesn't actually connect to a server

export interface XMPPMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
}

export class XMPPClient {
  private messageHandlers: ((message: XMPPMessage) => void)[] = [];
  private presenceHandlers: ((presence: any) => void)[] = [];
  private isConnected = false;

  constructor() {
    // No actual connection setup
  }

  async connect(username: string, password: string) {
    // Do nothing - we're not connecting to XMPP for now
    console.log('XMPP connection disabled');
    return;
  }

  async disconnect() {
    // No actual disconnection needed
    return;
  }

  async sendMessage(to: string, body: string) {
    // Mock sending a message
    console.log('XMPP message sending disabled', { to, body });
    return;
  }

  onMessage(handler: (message: XMPPMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onPresence(handler: (presence: any) => void) {
    this.presenceHandlers.push(handler);
    return () => {
      this.presenceHandlers = this.presenceHandlers.filter(h => h !== handler);
    };
  }
}

// Create a singleton instance
export const xmppClient = new XMPPClient();

// Helper function to get XMPP credentials for a user
export async function getXMPPCredentials() {
  // Return dummy credentials since we're not connecting
  return {
    username: 'dummy-user',
    password: 'dummy-password',
  };
}