import { AppwriteService } from './appwriteService';
import { COLLECTIONS } from '@/lib/constants';
import client from '@/lib/appwrite';

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export class RealtimeService extends AppwriteService {
  constructor() {
    super();
  }

  /**
   * Subscribe to wallet changes for a specific user
   * @param userId The user ID to subscribe to wallet changes for
   * @param callback Function to call when wallet changes
   * @returns Subscription object with unsubscribe method
   */
  subscribeToWallet(userId: string, callback: (wallet: any) => void): RealtimeSubscription {
    console.log(`Subscribing to wallet changes for user ${userId}`);
    
    // Create the channel string for this specific user's wallet
    const channel = `databases.${this.databaseId}.collections.${COLLECTIONS.WALLETS}.documents`;
    
    // Subscribe to the channel
    const unsubscribe = client.subscribe(channel, (response: { payload: Record<string, any>; events: string[] }) => {
      // Check if this event is for the user we're interested in
      if (response.payload && response.payload.user_id === userId) {
        console.log('Wallet update received:', response.payload);
        callback(response.payload);
      }
    });
    
    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from wallet changes for user ${userId}`);
        unsubscribe();
      }
    };
  }

  /**
   * Subscribe to transaction changes for a specific user
   * @param userId The user ID to subscribe to transaction changes for
   * @param callback Function to call when transactions change
   * @returns Subscription object with unsubscribe method
   */
  subscribeToTransactions(userId: string, callback: (transaction: any) => void): RealtimeSubscription {
    console.log(`Subscribing to transaction changes for user ${userId}`);
    
    // Create the channel string for transactions
    const channel = `databases.${this.databaseId}.collections.${COLLECTIONS.WALLET_TRANSACTIONS}.documents`;
    
    // Subscribe to the channel
    const unsubscribe = client.subscribe(channel, (response: { payload: Record<string, any>; events: string[] }) => {
      // Check if this event is for the user we're interested in
      if (response.payload && response.payload.user_id === userId) {
        console.log('Transaction update received:', response.payload);
        callback(response.payload);
      }
    });
    
    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from transaction changes for user ${userId}`);
        unsubscribe();
      }
    };
  }

  /**
   * Subscribe to group changes
   * @param groupId The group ID to subscribe to changes for
   * @param callback Function to call when group changes
   * @returns Subscription object with unsubscribe method
   */
  subscribeToGroup(groupId: string, callback: (group: any) => void): RealtimeSubscription {
    console.log(`Subscribing to group changes for group ${groupId}`);
    
    // Create the channel string for this specific group
    const channel = `databases.${this.databaseId}.collections.${COLLECTIONS.GROUPS}.documents.${groupId}`;
    
    // Subscribe to the channel
    const unsubscribe = client.subscribe(channel, (response: { payload: Record<string, any>; events: string[] }) => {
      console.log('Group update received:', response.payload);
      callback(response.payload);
    });
    
    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from group changes for group ${groupId}`);
        unsubscribe();
      }
    };
  }

  /**
   * Subscribe to group contributions
   * @param groupId The group ID to subscribe to contribution changes for
   * @param callback Function to call when contributions change
   * @returns Subscription object with unsubscribe method
   */
  subscribeToContributions(groupId: string, callback: (contribution: any) => void): RealtimeSubscription {
    console.log(`Subscribing to contribution changes for group ${groupId}`);
    
    // Create the channel string for contributions
    const channel = `databases.${this.databaseId}.collections.${COLLECTIONS.CONTRIBUTIONS}.documents`;
    
    // Subscribe to the channel
    const unsubscribe = client.subscribe(channel, (response: { payload: Record<string, any>; events: string[] }) => {
      // Check if this event is for the group we're interested in
      if (response.payload && response.payload.group_id === groupId) {
        console.log('Contribution update received:', response.payload);
        callback(response.payload);
      }
    });
    
    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from contribution changes for group ${groupId}`);
        unsubscribe();
      }
    };
  }

  /**
   * Subscribe to status updates
   * @param callback Function to call when new status updates are created
   * @returns Subscription object with unsubscribe method
   */
  subscribeToStatusUpdates(callback: (status: any) => void): RealtimeSubscription {
    console.log('Subscribing to status updates');
    
    // Create the channel string for status updates
    const channel = `databases.${this.databaseId}.collections.${COLLECTIONS.STATUS_UPDATES}.documents`;
    
    // Subscribe to the channel
    const unsubscribe = client.subscribe(channel, (response: { payload: Record<string, any>; events: string[] }) => {
      // Only trigger on new status updates
      if (response.events.includes('databases.*.collections.*.documents.create')) {
        console.log('New status update received:', response.payload);
        callback(response.payload);
      }
    });
    
    return {
      unsubscribe: () => {
        console.log('Unsubscribing from status updates');
        unsubscribe();
      }
    };
  }

  /**
   * Subscribe to stream room messages
   * @param roomId The room ID to subscribe to messages for
   * @param callback Function to call when new messages arrive
   * @returns Subscription object with unsubscribe method
   */
  subscribeToStreamMessages(roomId: string, callback: (message: any) => void): RealtimeSubscription {
    console.log(`Subscribing to stream messages for room ${roomId}`);
    
    // Create the channel string for stream messages
    const channel = `databases.${this.databaseId}.collections.${COLLECTIONS.STREAM_MESSAGES}.documents`;
    
    // Subscribe to the channel
    const unsubscribe = client.subscribe(channel, (response: { payload: Record<string, any>; events: string[] }) => {
      // Check if this event is for the room we're interested in
      if (response.payload && response.payload.room_id === roomId) {
        console.log('Stream message received:', response.payload);
        callback(response.payload);
      }
    });
    
    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from stream messages for room ${roomId}`);
        unsubscribe();
      }
    };
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
