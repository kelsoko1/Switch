import { db, COLLECTIONS, auth } from './appwrite';
import { createSimpleXMPPManager, SimpleXMPPManager, SimpleXMPPMessage, xml } from './xmpp-simple';

export interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  } | null;
}

export class ChatManager {
  private streamId: string;
  private messageHandler: (message: ChatMessage) => void;
  private xmppManager: SimpleXMPPManager | null = null;
  private isConnected: boolean = false;
  private messageCache: Map<string, ChatMessage> = new Map();
  private pollingInterval: number | null = null;
  private lastMessageTimestamp: string = '';
  private useXMPP: boolean = false;
  private roomJid: string = '';
  private userNickname: string = '';
  
  constructor(streamId: string, onMessage: (message: ChatMessage) => void) {
    this.streamId = streamId;
    this.messageHandler = onMessage;
    this.roomJid = `stream_${streamId}@conference.${import.meta.env.VITE_XMPP_DOMAIN || 'localhost'}`;
    
    // Check if XMPP is configured
    const xmppServer = import.meta.env.VITE_XMPP_SERVER;
    const xmppDomain = import.meta.env.VITE_XMPP_DOMAIN;
    this.useXMPP = !!(xmppServer && xmppDomain);
    
    // Initialize XMPP if available
    this.initializeXMPP();
  }
  
  private async initializeXMPP(): Promise<void> {
    if (!this.useXMPP) {
      console.log('XMPP not configured, falling back to Appwrite');
      return;
    }
    
    try {
      // Get current user
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        console.warn('User not authenticated, cannot initialize XMPP');
        return;
      }
      
      // Create a sanitized username for XMPP
      const username = currentUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      this.userNickname = username;
      
      // Check if user exists in ejabberd, create if not
      const ejabberdCredentials = await this.checkEjabberdUser(username, currentUser.$id);
      
      // Create XMPP manager with ejabberd configuration
      this.xmppManager = createSimpleXMPPManager(
        ejabberdCredentials.username,
        ejabberdCredentials.password,
        {
          resource: `stream_${this.streamId}`,
          // Explicitly set ejabberd server and domain
          server: import.meta.env.VITE_EJABBERD_WS_URL || 'ws://localhost:5280/ws',
          domain: import.meta.env.VITE_EJABBERD_DOMAIN || 'localhost'
        }
      );
      
      // Set up message handler
      this.xmppManager.onMessage(async (xmppMessage) => {
        // Only process group messages from the correct room
        if (xmppMessage.type === 'groupchat' && xmppMessage.from.startsWith(this.roomJid)) {
          const senderNickname = xmppMessage.from.split('/')[1];
          if (senderNickname !== this.userNickname) { // Don't process own messages twice
            try {
              // Try to get the actual user ID from the database
              const userQuery = await db.listDocuments(COLLECTIONS.USERS, [
                `xmpp_username=${senderNickname}`
              ]);
              
              let userId = senderNickname;
              let userEmail = `${senderNickname}@${import.meta.env.VITE_EJABBERD_DOMAIN || 'localhost'}`;
              let userName = senderNickname;
              let userAvatar = '';
              
              // If we found the user in our database, use their actual info
              if (userQuery.documents.length > 0) {
                const userDoc = userQuery.documents[0];
                userId = userDoc.$id;
                userEmail = userDoc.email;
                userName = userDoc.name || senderNickname;
                userAvatar = userDoc.avatar || '';
              }
              
              const chatMessage: ChatMessage = {
                id: xmppMessage.id,
                stream_id: this.streamId,
                user_id: userId,
                message: xmppMessage.body,
                created_at: xmppMessage.timestamp.toISOString(),
                user: {
                  id: userId,
                  email: userEmail,
                  name: userName,
                  avatar: userAvatar
                }
              };
              
              // Store message in Appwrite for persistence
              this.saveMessageToAppwrite(chatMessage).catch(console.error);
              
              // Store in cache and notify handler
              this.messageCache.set(chatMessage.id, chatMessage);
              this.messageHandler(chatMessage);
            } catch (err) {
              console.error('Error processing XMPP message:', err);
              // Still create a basic message even if there's an error
              const chatMessage: ChatMessage = {
                id: xmppMessage.id,
                stream_id: this.streamId,
                user_id: senderNickname,
                message: xmppMessage.body,
                created_at: xmppMessage.timestamp.toISOString(),
                user: {
                  id: senderNickname,
                  email: `${senderNickname}@${import.meta.env.VITE_EJABBERD_DOMAIN || 'localhost'}`,
                  name: senderNickname
                }
              };
              
              // Store in cache and notify handler
              this.messageCache.set(chatMessage.id, chatMessage);
              this.messageHandler(chatMessage);
            }
          }
        }
      });
      
      // Connect to XMPP server
      await this.xmppManager.connect();
      
      // Join the room for this stream
      await this.xmppManager.joinRoom(this.roomJid, this.userNickname);
      
      // Fetch message history from the room
      await this.fetchRoomHistory();
      
      this.isConnected = true;
      console.log(`Connected to ejabberd XMPP chat room: ${this.roomJid}`);
    } catch (error) {
      console.error('Failed to initialize XMPP with ejabberd:', error);
      this.useXMPP = false;
      console.log('Falling back to Appwrite for chat');
    }
  }
  
  // Check if user exists in ejabberd, create if not
  private async checkEjabberdUser(username: string, userId: string): Promise<{username: string, password: string}> {
    try {
      // Check if we have ejabberd credentials stored in Appwrite
      const userQuery = await db.listDocuments(COLLECTIONS.USERS, [
        `$id=${userId}`
      ]);
      
      if (userQuery.documents.length > 0) {
        const userDoc = userQuery.documents[0];
        
        // If user already has XMPP credentials, return them
        if (userDoc.xmpp_username && userDoc.xmpp_password) {
          return {
            username: userDoc.xmpp_username,
            password: userDoc.xmpp_password
          };
        }
        
        // Otherwise, generate new credentials
        const xmppUsername = username;
        const xmppPassword = `switch_${userId}_${Math.random().toString(36).substring(2, 10)}`;
        
        // Update user document with XMPP credentials
        await db.updateDocument(
          COLLECTIONS.USERS,
          userId,
          {
            xmpp_username: xmppUsername,
            xmpp_password: xmppPassword
          }
        );
        
        // In a production environment, you would make an API call to ejabberd to create the user
        // For example:
        // await fetch(`${import.meta.env.VITE_EJABBERD_API_URL}/api/register`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ user: xmppUsername, host: import.meta.env.VITE_EJABBERD_DOMAIN, password: xmppPassword })
        // });
        
        return {
          username: xmppUsername,
          password: xmppPassword
        };
      }
      
      // Fallback to default credentials if user not found
      return {
        username,
        password: `switch_${userId}`
      };
    } catch (error) {
      console.error('Error checking ejabberd user:', error);
      // Fallback to default credentials
      return {
        username,
        password: `switch_${userId}`
      };
    }
  }
  
  // Fetch message history from the room
  private async fetchRoomHistory(): Promise<void> {
    if (!this.xmppManager || !this.isConnected) return;
    
    try {
      // Use XEP-0313: Message Archive Management to fetch history
      // This is a simplified implementation - in a real app you'd parse the response
      const id = `history_${Date.now()}`;
      const historyQuery = xml(
        'iq',
        { type: 'set', id },
        xml('query', { xmlns: 'urn:xmpp:mam:2', queryid: id },
          xml('x', { xmlns: 'jabber:x:data', type: 'submit' },
            xml('field', { var: 'FORM_TYPE', type: 'hidden' },
              xml('value', {}, 'urn:xmpp:mam:2')
            ),
            xml('field', { var: 'with' },
              xml('value', {}, this.roomJid)
            )
          ),
          xml('set', { xmlns: 'http://jabber.org/protocol/rsm' },
            xml('max', {}, '20'),
            xml('before', {})
          )
        )
      );
      
      // Send the query - in a real implementation you would handle the response
      await this.xmppManager.sendIq(historyQuery);
      
      // For now, we'll still rely on Appwrite for message history
      const messages = await this.getMessages();
      messages.forEach(msg => {
        this.messageCache.set(msg.id, msg);
      });
    } catch (error) {
      console.error('Error fetching room history:', error);
    }
  }

  async sendMessage(message: string): Promise<ChatMessage> {
    try {
      // Get current user
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const messageId = `msg_${this.streamId}_${currentUser.$id}_${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      // Try to send via XMPP if connected
      if (this.useXMPP && this.xmppManager && this.isConnected) {
        try {
          await this.xmppManager.sendGroupMessage(this.roomJid, message);
          
          // Create a local message object
          const chatMessage: ChatMessage = {
            id: messageId,
            stream_id: this.streamId,
            user_id: currentUser.$id,
            message,
            created_at: timestamp,
            user: { 
              id: currentUser.$id, 
              email: currentUser.email,
              name: currentUser.name,
              avatar: currentUser.avatar
            }
          };
          
          // Store in cache
          this.messageCache.set(chatMessage.id, chatMessage);
          
          // Also save to Appwrite for persistence
          this.saveMessageToAppwrite(chatMessage).catch(console.error);
          
          return chatMessage;
        } catch (xmppError) {
          console.error('XMPP message send failed, falling back to Appwrite:', xmppError);
          // Fall through to Appwrite method
        }
      }
      
      // Appwrite fallback
      return this.sendMessageViaAppwrite(message, messageId, timestamp, currentUser);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  private async sendMessageViaAppwrite(message: string, messageId: string, timestamp: string, currentUser: any): Promise<ChatMessage> {
    const messageData = {
      stream_id: this.streamId,
      user_id: currentUser.$id,
      message,
      created_at: timestamp,
    };

    const result = await db.createDocument(
      COLLECTIONS.STREAM_MESSAGES,
      messageId,
      messageData,
      [`read("user:${currentUser.$id}")`, `write("user:${currentUser.$id}")`]
    );

    // Create chat message object with proper structure
    const chatMessage: ChatMessage = {
      id: result.$id,
      stream_id: this.streamId,
      user_id: currentUser.$id,
      message,
      created_at: timestamp,
      user: { 
        id: currentUser.$id, 
        email: currentUser.email,
        name: currentUser.name,
        avatar: currentUser.avatar
      }
    };
    
    // Store in cache
    this.messageCache.set(chatMessage.id, chatMessage);
    
    // Notify handler
    this.messageHandler(chatMessage);
    
    return chatMessage;
  }
  
  private async saveMessageToAppwrite(chatMessage: ChatMessage): Promise<void> {
    try {
      await db.createDocument(
        COLLECTIONS.STREAM_MESSAGES,
        chatMessage.id,
        {
          stream_id: chatMessage.stream_id,
          user_id: chatMessage.user_id,
          message: chatMessage.message,
          created_at: chatMessage.created_at,
        },
        [`read("user:${chatMessage.user_id}")`, `write("user:${chatMessage.user_id}")`]
      );
    } catch (error) {
      console.error('Failed to save message to Appwrite:', error);
      // Non-critical error, we can continue without persistence
    }
  }

  async getMessages(): Promise<ChatMessage[]> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        console.warn('Appwrite not configured, returning cached messages');
        return Array.from(this.messageCache.values());
      }

      const result = await db.listDocuments(COLLECTIONS.STREAM_MESSAGES, [
        `stream_id=${this.streamId}`,
        'orderAsc(created_at)',
        'limit(100)'
      ]);

      // For each message, fetch the user separately
      const messagesWithUsers = await Promise.all(
        result.documents.map(async (message: any) => {
          try {
            const userResult = await db.getDocument(COLLECTIONS.USERS, message.user_id);
            // Convert Appwrite document to ChatMessage format
            const chatMessage: ChatMessage = {
              id: message.$id,
              stream_id: message.stream_id,
              user_id: message.user_id,
              message: message.message,
              created_at: message.created_at || message.$createdAt,
              user: { 
                id: userResult.$id, 
                email: userResult.email,
                name: userResult.name,
                avatar: userResult.avatar
              } 
            };
            return chatMessage;
          } catch (userError) {
            console.warn('Could not fetch user for message:', userError);
            // Convert Appwrite document to ChatMessage format even without user
            const chatMessage: ChatMessage = {
              id: message.$id,
              stream_id: message.stream_id,
              user_id: message.user_id,
              message: message.message,
              created_at: message.created_at || message.$createdAt,
              user: null
            };
            return chatMessage;
          }
        })
      );
      
      // Update cache with these messages
      messagesWithUsers.forEach(msg => {
        this.messageCache.set(msg.id, msg);
      });
      
      // Update last message timestamp
      if (messagesWithUsers.length > 0) {
        this.lastMessageTimestamp = messagesWithUsers[messagesWithUsers.length - 1].created_at;
      }

      return messagesWithUsers;
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Return cached messages as fallback
      return Array.from(this.messageCache.values());
    }
  }

  // Method to refresh messages (for polling-based real-time)
  async refreshMessages(): Promise<ChatMessage[]> {
    try {
      // Only get messages newer than the last one we have
      if (this.lastMessageTimestamp) {
        const result = await db.listDocuments(COLLECTIONS.STREAM_MESSAGES, [
          `stream_id=${this.streamId}`,
          `created_at>${this.lastMessageTimestamp}`,
          'orderAsc(created_at)',
          'limit(100)'
        ]);
        
        // Process new messages
        const newMessages = await Promise.all(
          result.documents.map(async (message: any) => {
            try {
              const userResult = await db.getDocument(COLLECTIONS.USERS, message.user_id);
              // Convert Appwrite document to ChatMessage format
              const chatMessage: ChatMessage = {
                id: message.$id,
                stream_id: message.stream_id,
                user_id: message.user_id,
                message: message.message,
                created_at: message.created_at || message.$createdAt,
                user: { 
                  id: userResult.$id, 
                  email: userResult.email,
                  name: userResult.name,
                  avatar: userResult.avatar
                } 
              };
              return chatMessage;
            } catch (userError) {
              console.warn('Could not fetch user for message:', userError);
              // Convert Appwrite document to ChatMessage format even without user
              const chatMessage: ChatMessage = {
                id: message.$id,
                stream_id: message.stream_id,
                user_id: message.user_id,
                message: message.message,
                created_at: message.created_at || message.$createdAt,
                user: null
              };
              return chatMessage;
            }
          })
        );
        
        // Update cache and notify handler for each new message
        newMessages.forEach(msg => {
          this.messageCache.set(msg.id, msg);
          this.messageHandler(msg);
        });
        
        // Update last message timestamp
        if (newMessages.length > 0) {
          this.lastMessageTimestamp = newMessages[newMessages.length - 1].created_at;
        }
        
        return newMessages;
      } else {
        // If no last timestamp, just get all messages
        return this.getMessages();
      }
    } catch (error) {
      console.error('Error refreshing messages:', error);
      return [];
    }
  }

  // Method to start polling for new messages (only used if XMPP is not available)
  startPolling(intervalMs: number = 2000): void {
    // Don't start polling if XMPP is active
    if (this.useXMPP && this.isConnected) {
      return;
    }
    
    // Clear any existing interval
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
    }
    
    // Start new polling interval
    this.pollingInterval = window.setInterval(async () => {
      try {
        await this.refreshMessages();
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, intervalMs);
  }

  // Method to stop polling
  stopPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  // Clean up resources
  async disconnect(): Promise<void> {
    // Stop polling if active
    this.stopPolling();
    
    // Leave XMPP room and disconnect if connected
    if (this.useXMPP && this.xmppManager && this.isConnected) {
      try {
        await this.xmppManager.leaveRoom(this.roomJid, this.userNickname);
        await this.xmppManager.disconnect();
      } catch (error) {
        console.error('Error disconnecting from XMPP:', error);
      }
    }
    
    this.isConnected = false;
  }
}