import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, Message, ChatRoom } from '@/services/appwrite/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';

interface UseChatOptions {
  roomId?: string;
  userId?: string;
  limit?: number;
}

export function useChat({ roomId, userId, limit = 50 }: UseChatOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const pageRef = useRef(0);
  const unsubscribeRef = useRef<() => void>();

  // Fetch messages
  const {
    data: messagesData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', roomId || userId],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * limit;
      const result = await chatService.getMessages({
        groupId: roomId,
        userId: userId,
        limit,
        offset,
      });
      
      // If no messages or less than limit, no more pages
      if (!result.messages.length || result.messages.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      return {
        messages: result.messages,
        nextPage: pageParam + 1,
        total: result.total,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.messages.length === limit ? lastPage.nextPage : undefined;
    },
    enabled: !!user && (!!roomId || !!userId),
  });

  // Update messages when data changes
  useEffect(() => {
    if (messagesData?.pages) {
      const allMessages = messagesData.pages.flatMap(page => page.messages);
      setMessages(allMessages);
    }
  }, [messagesData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const subscribeToMessages = async () => {
      const collection = roomId 
        ? `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_CHAT_MESSAGES_COLLECTION_ID}.documents`
        : `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_CHAT_MESSAGES_COLLECTION_ID}.documents`;

      const queries = [
        roomId 
          ? Query.equal('group_id', roomId)
          : Query.or([
              Query.and([
                Query.equal('sender_id', user.$id),
                Query.equal('receiver_id', userId || '')
              ]),
              Query.and([
                Query.equal('receiver_id', user.$id),
                Query.equal('sender_id', userId || '')
              ])
            ])
      ];

      unsubscribeRef.current = database.client.subscribe(collection, response => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const message = response.payload as Message;
          
          // Update the messages list
          setMessages(prev => [message, ...prev]);
          
          // Update the last message in the chat room
          if (message.group_id) {
            queryClient.setQueryData<ChatRoom[]>(['chatRooms', user.$id], (old = []) => {
              return old.map(room => {
                if (room.$id === message.group_id) {
                  return {
                    ...room,
                    last_message: {
                      content: message.content,
                      created_at: message.$createdAt,
                      sender_id: message.sender_id
                    },
                    $updatedAt: new Date().toISOString()
                  };
                }
                return room;
              });
            });
          }
        }
      });
    };

    // Subscribe to typing indicators
    const subscribeToTyping = () => {
      const unsubscribe = database.client.subscribe(
        `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.typing_indicators.documents`,
        response => {
          if (response.events.includes('databases.*.collections.*.documents.*.create') ||
              response.events.includes('databases.*.collections.*.documents.*.update')) {
            const typingData = response.payload as {
              $id: string;
              room_id: string;
              user_id: string;
              is_typing: boolean;
              last_updated: string;
            };
            
            if ((roomId && typingData.room_id === roomId) || 
                (userId && typingData.user_id === userId)) {
              
              setTypingUsers(prev => ({
                ...prev,
                [typingData.user_id]: typingData.is_typing ? 'typing...' : ''
              }));
              
              // Clear typing indicator after delay
              if (typingData.is_typing) {
                setTimeout(() => {
                  setTypingUsers(prev => {
                    const updated = { ...prev };
                    if (updated[typingData.user_id] === 'typing...') {
                      delete updated[typingData.user_id];
                    }
                    return updated;
                  });
                }, 3000);
              }
            }
          } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
            const typingData = response.payload as { user_id: string };
            setTypingUsers(prev => {
              const updated = { ...prev };
              delete updated[typingData.user_id];
              return updated;
            });
          }
        }
      );
      
      return unsubscribe;
    };

    subscribeToMessages();
    const typingUnsubscribe = subscribeToTyping();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      typingUnsubscribe();
    };
  }, [user, roomId, userId, queryClient]);

  // Send message mutation
  const sendMessage = useMutation(
    async (content: string) => {
      if (!user) throw new Error('Not authenticated');
      
      return chatService.sendMessage({
        content,
        sender_id: user.$id,
        ...(roomId ? { group_id: roomId } : { receiver_id: userId }),
        type: 'text',
        status: 'sent'
      });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(['messages', roomId || userId]);
      },
    }
  );

  // Typing indicator handler
  const handleTyping = useCallback((isUserTyping: boolean) => {
    if (!user || !(roomId || userId)) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing status
    if (isUserTyping) {
      chatService.setTypingStatus(roomId || `user_${userId}`, user.$id, true);
      
      // Set timeout to clear typing status
      typingTimeoutRef.current = setTimeout(() => {
        chatService.setTypingStatus(roomId || `user_${userId}`, user.$id, false);
      }, 3000);
    } else {
      chatService.setTypingStatus(roomId || `user_${userId}`, user.$id, false);
    }
  }, [user, roomId, userId]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!user) return;
    
    try {
      await Promise.all(
        messageIds.map(id => 
          chatService.updateMessageStatus(id, 'read')
        )
      );
      
      // Update local state
      setMessages(prev =>
        prev.map(msg =>
          messageIds.includes(msg.$id) && msg.status !== 'read'
            ? { ...msg, status: 'read' as const }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  // Load more messages
  const loadMore = useCallback(() => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasMore, isFetchingNextPage, fetchNextPage]);

  return {
    messages,
    isLoading,
    isError,
    error,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isLoading,
    loadMore,
    hasMore,
    isFetchingMore: isFetchingNextPage,
    isTyping,
    typingUsers: Object.values(typingUsers).filter(Boolean).join(', '),
    handleTyping,
    markAsRead,
  };
}

// Helper hook for chat rooms list
export function useChatRooms() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const {
    data: chatRooms = [],
    isLoading,
    isError,
    error,
  } = useQuery<ChatRoom[]>({
    queryKey: ['chatRooms', user?.$id],
    queryFn: async () => {
      if (!user) return [];
      return chatService.getChatRooms(user.$id);
    },
    enabled: !!user,
  });
  
  // Subscribe to chat room updates
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = database.client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_CHAT_ROOMS_COLLECTION_ID}.documents`,
      response => {
        if (response.events.includes('databases.*.collections.*.documents.*.update') ||
            response.events.includes('databases.*.collections.*.documents.*.create') ||
            response.events.includes('databases.*.collections.*.documents.*.delete')) {
          
          queryClient.invalidateQueries(['chatRooms', user.$id]);
        }
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [user, queryClient]);
  
  return {
    chatRooms,
    isLoading,
    isError,
    error,
  };
}

// Helper hook for message reactions
export function useMessageReactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const addReaction = useMutation(
    async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error('Not authenticated');
      return chatService.addReaction(messageId, user.$id, emoji);
    },
    {
      onSuccess: (_, { messageId }) => {
        queryClient.invalidateQueries(['messages', messageId]);
      },
    }
  );
  
  const removeReaction = useMutation(
    async (messageId: string) => {
      if (!user) throw new Error('Not authenticated');
      return chatService.removeReaction(messageId, user.$id);
    },
    {
      onSuccess: (_, messageId) => {
        queryClient.invalidateQueries(['messages', messageId]);
      },
    }
  );
  
  return {
    addReaction: addReaction.mutate,
    removeReaction: removeReaction.mutate,
    isAddingReaction: addReaction.isLoading,
    isRemovingReaction: removeReaction.isLoading,
  };
}
