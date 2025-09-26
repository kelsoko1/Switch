import React from 'react';
// src/components/chat/MessageReply.tsx
import { Icons } from '@/components/icons';
import { Message } from '@/services/appwrite/chatService';
import { cn } from '@/lib/utils';

interface MessageReplyProps {
  message: Message;
  messages: Message[];
  isOwnMessage: boolean;
  className?: string;
}

export function MessageReply({ 
  message, 
  messages, 
  isOwnMessage,
  className 
}: MessageReplyProps) {
  if (!message?.reply_to) return null;
  
  const originalMessage = messages.find(m => m.$id === message.reply_to);
  
  if (!originalMessage) {
    return (
      <div className={cn(
        'text-xs text-muted-foreground italic mb-1 line-clamp-2',
        className
      )}>
        Original message not found
      </div>
    );
  }
  
  const isOriginalFromSelf = originalMessage.sender_id === message.sender_id;
  
  return (
    <div className={cn(
      'border-l-2 pl-2 my-1 text-sm',
      isOwnMessage 
        ? 'border-primary/50 text-primary-foreground/80' 
        : 'border-muted-foreground/50',
      className
    )}>
      <div className="flex items-center text-xs font-medium mb-0.5">
        <Icons.reply className="h-3 w-3 mr-1" />
        {isOriginalFromSelf ? 'Replying to yourself' : `Replying to ${originalMessage.sender_name || 'user'}`}
      </div>
      <div className="text-xs line-clamp-2">
        {originalMessage.content.length > 100
          ? `${originalMessage.content.substring(0, 100)}...`
          : originalMessage.content}
      </div>
    </div>
  );
}