import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChat, useMessageReactions } from '@/hooks/useChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { EmojiPicker } from '@/components/emoji-picker';
import { MessageOptions } from './MessageOptions';
import { MessageReply } from './MessageReply';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/services/appwrite/chatService';
import { Icons } from '@/components/icons';

interface EnhancedChatInterfaceProps {
  roomId?: string;
  userId?: string;
  className?: string;
  onBack?: () => void;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export function EnhancedChatInterface({
  roomId,
  userId,
  className,
  onBack,
}: EnhancedChatInterfaceProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isNearTop, setIsNearTop] = useState(false);
  
  const {
    messages,
    isLoading,
    isError,
    error,
    sendMessage,
    isSending,
    loadMore,
    hasMore,
    isFetchingMore,
    typingUsers,
    handleTyping,
    markAsRead,
  } = useChat({
    roomId,
    userId,
  });
  
  const { addReaction, removeReaction } = useMessageReactions();
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !replyTo) return;
    
    try {
      const content = replyTo 
        ? `Replying to ${replyTo.sender_name || 'user'}: ${replyTo.content}\n\n${message}`
        : message;
      
      await sendMessage(content);
      setMessage('');
      setReplyTo(null);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle scrolling and infinite loading
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // Check if scrolled to top
    setIsNearTop(scrollTop < 100);
    
    // Check if scrolled up
    setIsScrolledUp(scrollTop < scrollHeight - clientHeight - 100);
    
    // Load more messages when near top
    if (scrollTop < 100 && hasMore && !isFetchingMore) {
      loadMore();
    }
  }, [hasMore, isFetchingMore, loadMore]);
  
  // Mark messages as read when they become visible
  useEffect(() => {
    if (!isScrolledUp) {
      const unreadMessages = messages
        .filter(msg => 
          msg.status !== 'read' && 
          msg.sender_id !== user?.$id
        )
        .map(msg => msg.$id);
      
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages);
      }
    }
  }, [isScrolledUp, messages, user?.$id, markAsRead]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (!isScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledUp]);
  
  // Handle typing indicator
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleTyping(true);
  };
  
  // Handle key down for sending on Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };
  
  // Handle adding a reaction
  const handleReaction = (messageId: string, emoji: string) => {
    const message = messages.find(m => m.$id === messageId);
    if (!message) return;
    
    if (message.reactions?.[user?.$id || ''] === emoji) {
      removeReaction(messageId);
    } else {
      addReaction({ messageId, emoji });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Icons.spinner className="h-8 w-8 animate-spin" />
        <p className="mt-2">Loading messages...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <Icons.alertCircle className="h-8 w-8" />
        <p className="mt-2">Error loading messages</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 md:hidden"
            onClick={onBack}
          >
            <Icons.chevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex-1">
          <h2 className="font-semibold">
            {roomId ? 'Group Chat' : 'Direct Message'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {typingUsers && (
              <TypingIndicator users={typingUsers} />
            )}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Icons.phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Icons.video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Icons.moreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea 
        ref={scrollContainerRef}
        className="flex-1 p-4 overflow-y-auto"
        onScroll={handleScroll}
      >
        {isFetchingMore && (
          <div className="flex justify-center py-2">
            <Icons.loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((msg) => {
            const isOwnMessage = msg.sender_id === user?.$id;
            const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;
            
            return (
              <div 
                key={msg.$id}
                className={cn(
                  'flex flex-col group',
                  isOwnMessage ? 'items-end' : 'items-start'
                )}
              >
                <div className="flex items-start space-x-2 max-w-[80%]">
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={msg.sender_avatar} alt={msg.sender_name} />
                      <AvatarFallback>
                        {msg.sender_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="flex-1">
                    {!isOwnMessage && (
                      <p className="text-xs font-medium mb-1">
                        {msg.sender_name || 'Unknown User'}
                      </p>
                    )}
                    
                    <div className={cn(
                      'rounded-lg px-4 py-2 relative group/message',
                      isOwnMessage 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    )}>
                      {msg.reply_to && (
                        <MessageReply 
                          message={msg}
                          messages={messages}
                          isOwnMessage={isOwnMessage}
                        />
                      )}
                      
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs opacity-70">
                          {formatDistanceToNow(new Date(msg.$createdAt), { addSuffix: true })}
                        </span>
                        {isOwnMessage && (
                          <span className="text-xs">
                            {msg.status === 'sent' && <Icons.check className="h-3 w-3 inline" />}
                            {msg.status === 'delivered' && <Icons.checkCheck className="h-3 w-3 inline" />}
                            {msg.status === 'read' && <Icons.checkCheck className="h-3 w-3 inline text-blue-500" />}
                          </span>
                        )}
                      </div>
                      
                      <MessageOptions 
                        message={msg}
                        isOwnMessage={isOwnMessage}
                        onReply={() => setReplyTo(msg)}
                        onReaction={(emoji) => handleReaction(msg.$id, emoji)}
                      />
                    </div>
                    
                    {hasReactions && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(msg.reactions || {}).map(([userId, emoji]) => (
                          <span 
                            key={`${msg.$id}-${userId}`}
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded-full',
                              userId === user?.$id 
                                ? 'bg-primary/20 text-primary-foreground' 
                                : 'bg-muted-foreground/10'
                            )}
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Reply preview */}
      {replyTo && (
        <div className="border-t border-muted bg-muted/50 p-2">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Replying to {replyTo.sender_id === user?.$id ? 'yourself' : replyTo.sender_name}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setReplyTo(null)}
            >
              <Icons.x className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm truncate max-w-[90%]">
            {replyTo.content.length > 50 
              ? `${replyTo.content.substring(0, 50)}...` 
              : replyTo.content}
          </div>
        </div>
      )}
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t p-2">
        <div className="relative">
          <div className="absolute left-2 top-2 flex space-x-1">
            <EmojiPicker 
              onSelect={(emoji) => setMessage(prev => prev + emoji)}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                // Handle file upload
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*,video/*,.pdf,.doc,.docx';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    // Handle file upload
                    console.log('File selected:', file);
                  }
                };
                input.click();
              }}
            >
              <Icons.paperclip className="h-4 w-4" />
            </Button>
          </div>
          
          <Input
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => handleTyping(true)}
            onBlur={() => handleTyping(false)}
            placeholder="Type a message..."
            className="pl-12 pr-20 py-6 resize-none"
            rows={1}
          />
          
          <div className="absolute right-2 top-1.5">
            <Button 
              type="submit" 
              size="sm" 
              disabled={!message.trim() && !replyTo}
              className="h-8"
            >
              {isSending ? (
                <Icons.loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
