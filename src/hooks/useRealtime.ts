import { useState, useEffect } from 'react';
import { realtimeService, RealtimeSubscription } from '@/services/appwrite';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook for subscribing to real-time wallet updates
 * @param initialWallet Initial wallet data
 * @returns Updated wallet data
 */
export const useWalletRealtime = (initialWallet: any) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(initialWallet);

  useEffect(() => {
    if (!user || !user.$id) return;

    let subscription: RealtimeSubscription | null = null;

    // Subscribe to wallet updates
    subscription = realtimeService.subscribeToWallet(user.$id, (updatedWallet) => {
      console.log('Wallet updated in real-time:', updatedWallet);
      setWallet(updatedWallet);
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user]);

  return wallet;
};

/**
 * Hook for subscribing to real-time transaction updates
 * @param initialTransactions Initial transactions data
 * @returns Updated transactions data and a function to add a new transaction
 */
export const useTransactionsRealtime = (initialTransactions: any[] = []) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(initialTransactions);

  useEffect(() => {
    if (!user || !user.$id) return;

    let subscription: RealtimeSubscription | null = null;

    // Subscribe to transaction updates
    subscription = realtimeService.subscribeToTransactions(user.$id, (newTransaction) => {
      console.log('New transaction received in real-time:', newTransaction);
      
      // Check if this transaction is already in our list
      const exists = transactions.some(tx => tx.$id === newTransaction.$id);
      
      if (!exists) {
        // Add the new transaction to the list
        setTransactions(prev => [newTransaction, ...prev]);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user, transactions]);

  // Function to add a new transaction manually (e.g., after creating one)
  const addTransaction = (transaction: any) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  return { transactions, addTransaction };
};

/**
 * Hook for subscribing to real-time group updates
 * @param groupId Group ID to subscribe to
 * @param initialGroup Initial group data
 * @returns Updated group data
 */
export const useGroupRealtime = (groupId: string, initialGroup: any) => {
  const [group, setGroup] = useState(initialGroup);

  useEffect(() => {
    if (!groupId) return;

    let subscription: RealtimeSubscription | null = null;

    // Subscribe to group updates
    subscription = realtimeService.subscribeToGroup(groupId, (updatedGroup) => {
      console.log('Group updated in real-time:', updatedGroup);
      setGroup(updatedGroup);
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [groupId]);

  return group;
};

/**
 * Hook for subscribing to real-time group contribution updates
 * @param groupId Group ID to subscribe to contributions for
 * @param initialContributions Initial contributions data
 * @returns Updated contributions data
 */
export const useContributionsRealtime = (groupId: string, initialContributions: any[] = []) => {
  const [contributions, setContributions] = useState(initialContributions);

  useEffect(() => {
    if (!groupId) return;

    let subscription: RealtimeSubscription | null = null;

    // Subscribe to contribution updates
    subscription = realtimeService.subscribeToContributions(groupId, (newContribution) => {
      console.log('New contribution received in real-time:', newContribution);
      
      // Check if this contribution is already in our list
      const exists = contributions.some(c => c.$id === newContribution.$id);
      
      if (!exists) {
        // Add the new contribution to the list
        setContributions(prev => [newContribution, ...prev]);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [groupId, contributions]);

  return contributions;
};

/**
 * Hook for subscribing to real-time status updates
 * @param initialStatuses Initial statuses data
 * @returns Updated statuses data
 */
export const useStatusUpdatesRealtime = (initialStatuses: any[] = []) => {
  const [statuses, setStatuses] = useState(initialStatuses);

  useEffect(() => {
    let subscription: RealtimeSubscription | null = null;

    // Subscribe to status updates
    subscription = realtimeService.subscribeToStatusUpdates((newStatus) => {
      console.log('New status update received in real-time:', newStatus);
      
      // Check if this status is already in our list
      const exists = statuses.some(s => s.$id === newStatus.$id);
      
      if (!exists) {
        // Add the new status to the list
        setStatuses(prev => [newStatus, ...prev]);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [statuses]);

  return statuses;
};

/**
 * Hook for subscribing to real-time stream messages
 * @param roomId Room ID to subscribe to messages for
 * @param initialMessages Initial messages data
 * @returns Updated messages data and a function to add a new message
 */
export const useStreamMessagesRealtime = (roomId: string, initialMessages: any[] = []) => {
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    if (!roomId) return;

    let subscription: RealtimeSubscription | null = null;

    // Subscribe to stream messages
    subscription = realtimeService.subscribeToStreamMessages(roomId, (newMessage) => {
      console.log('New stream message received in real-time:', newMessage);
      
      // Check if this message is already in our list
      const exists = messages.some(m => m.$id === newMessage.$id);
      
      if (!exists) {
        // Add the new message to the list
        setMessages(prev => [...prev, newMessage]);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [roomId, messages]);

  // Function to add a new message manually (e.g., after sending one)
  const addMessage = (message: any) => {
    setMessages(prev => [...prev, message]);
  };

  return { messages, addMessage };
};
