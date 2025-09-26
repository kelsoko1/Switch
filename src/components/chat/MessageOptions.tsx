import React, { useState } from 'react';
// Remove the duplicate import
import { Message } from '@/services/appwrite/chatService';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmojiPicker } from '@/components/emoji-picker';

interface MessageOptionsProps {
  message: Message;
  isOwnMessage: boolean;
  onReply: () => void;
  onReaction: (emoji: string) => void;
  className?: string;
}

export function MessageOptions({
  message,
  isOwnMessage,
  onReply,
  onReaction,
  className,
}: MessageOptionsProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  const handleReaction = (emoji: string) => {
    onReaction(emoji);
    setShowReactions(false);
  };
  
  return (
    <div 
      className={cn(
        'absolute -top-2 right-0 opacity-0 group-hover/message:opacity-100 transition-opacity',
        isOwnMessage ? 'left-0 right-auto' : 'right-0',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-1 bg-background/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setShowReactions(!showReactions);
              }}
            >
              <Icons.smilePlus className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-1">
            <div className="grid grid-cols-4 gap-1">
              {['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'].map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReaction(emoji);
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onReply();
          }}
        >
          <Icons.reply className="h-3.5 w-3.5" />
        </Button>
        
        {isOwnMessage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
              >
                <Icons.moreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  // Implement edit message
                }}
              >
                <Icons.edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  // Implement delete message
                }}
              >
                <Icons.trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {showReactions && !isHovered && (
        <div 
          className="absolute bottom-full right-0 mb-1 flex space-x-1 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-sm"
          onMouseEnter={() => setIsHovered(true)}
        >
          {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-lg"
              onClick={(e) => {
                e.stopPropagation();
                handleReaction(emoji);
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
