import React from 'react';
// src/components/chat/TypingIndicator.tsx
import { Icons } from '@/components/icons';

interface TypingIndicatorProps {
  users?: string[];
  className?: string;
}

export function TypingIndicator({ users = [], className = '' }: TypingIndicatorProps) {
  if (!users?.length) return null;
  
  return (
    <div className={`flex items-center text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center mr-1">
        <div className="flex space-x-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      <span>
        {users.length === 1 
          ? `${users[0]} is typing...`
          : users.length === 2
            ? `${users[0]} and ${users[1]} are typing...`
            : `${users[0]} and ${users.length - 1} others are typing...`
        }
      </span>
    </div>
  );
}