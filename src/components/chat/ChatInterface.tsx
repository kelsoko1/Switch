import React, { useEffect, useRef, useState } from 'react';
import { Message, messageService } from '@/services/appwrite/messageService';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Icons } from '../icons';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useToast } from '../ui/use-toast';

interface ChatInterfaceProps {
    receiverId?: string;
    groupId?: string;
    className?: string;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export function ChatInterface({
    receiverId,
    groupId,
    className,
}: ChatInterfaceProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaType, setMediaType] = useState<Message['type']>('text');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load initial messages
    useEffect(() => {
        const loadMessages = async () => {
            try {
                setIsLoading(true);
                let loadedMessages: Message[];
                if (groupId) {
                    loadedMessages = await messageService.getGroupMessages(groupId);
                } else if (receiverId && user) {
                    loadedMessages = await messageService.getChatHistory(
                        user.$id,
                        receiverId
                    );
                } else {
                    return;
                }
                setMessages(loadedMessages);
                scrollToBottom();
            } catch (error) {
                console.error('Error loading messages:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load messages',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();
    }, [groupId, receiverId, user]);

    // Subscribe to new messages
    useEffect(() => {
        if (!user) return;

        const unsubscribe = messageService.subscribeToMessages((message: Message) => {
            // Add new message if it's relevant to this chat
            if (
                (groupId && message.group_id === groupId) ||
                (receiverId &&
                    ((message.sender_id === user.$id &&
                        message.receiver_id === receiverId) ||
                        (message.sender_id === receiverId &&
                            message.receiver_id === user.$id)))
            ) {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();

                // Mark message as delivered if we're the receiver
                if (
                    message.sender_id !== user.$id &&
                    message.status === 'sent'
                ) {
                    messageService.markAsDelivered(message.$id);
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, [groupId, receiverId, user]);

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Determine media type
        const fileType = file.type.split('/')[0];
        let messageType: Message['type'] = 'file';
        if (fileType === 'image') messageType = 'image';
        if (fileType === 'video') messageType = 'video';
        if (fileType === 'audio') messageType = 'audio';

        setMediaFile(file);
        setMediaType(messageType);
    };

    // Handle send message
    const handleSendMessage = async () => {
        if (!user || (!newMessage && !mediaFile)) return;

        try {
            let message: Message;
            if (groupId) {
                message = await messageService.sendGroupMessage(
                    user.$id,
                    groupId,
                    newMessage,
                    mediaFile ? mediaType : 'text',
                    replyTo?.$id,
                    mediaFile
                );
            } else if (receiverId) {
                message = await messageService.sendMessage(
                    user.$id,
                    receiverId,
                    newMessage,
                    mediaFile ? mediaType : 'text',
                    replyTo?.$id,
                    mediaFile
                );
            } else {
                return;
            }

            setMessages((prev) => [...prev, message]);
            setNewMessage('');
            setMediaFile(null);
            setMediaType('text');
            setReplyTo(null);
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: 'Error',
                description: 'Failed to send message',
                variant: 'destructive',
            });
        }
    };

    // Handle add reaction
    const handleAddReaction = async (messageId: string, reaction: string) => {
        if (!user) return;

        try {
            const updatedMessage = await messageService.addReaction(
                messageId,
                user.$id,
                reaction
            );
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.$id === messageId ? updatedMessage : msg
                )
            );
        } catch (error) {
            console.error('Error adding reaction:', error);
            toast({
                title: 'Error',
                description: 'Failed to add reaction',
                variant: 'destructive',
            });
        }
    };

    // Handle remove reaction
    const handleRemoveReaction = async (messageId: string) => {
        if (!user) return;

        try {
            const updatedMessage = await messageService.removeReaction(
                messageId,
                user.$id
            );
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.$id === messageId ? updatedMessage : msg
                )
            );
        } catch (error) {
            console.error('Error removing reaction:', error);
            toast({
                title: 'Error',
                description: 'Failed to remove reaction',
                variant: 'destructive',
            });
        }
    };

    // Handle delete message
    const handleDeleteMessage = async (messageId: string) => {
        try {
            await messageService.deleteMessage(messageId);
            setMessages((prev) =>
                prev.filter((msg) => msg.$id !== messageId)
            );
        } catch (error) {
            console.error('Error deleting message:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete message',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Icons.spinner className="animate-spin" />
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.$id}
                            className={cn(
                                'flex flex-col max-w-[70%] space-y-1',
                                message.sender_id === user?.$id
                                    ? 'ml-auto'
                                    : 'mr-auto'
                            )}
                        >
                            {/* Reply reference */}
                            {message.reply_to && (
                                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                    Replying to message
                                </div>
                            )}

                            {/* Message content */}
                            <div
                                className={cn(
                                    'flex items-start space-x-2',
                                    message.sender_id === user?.$id &&
                                        'flex-row-reverse space-x-reverse'
                                )}
                            >
                                <Avatar className="w-8 h-8" />
                                <div className="space-y-1">
                                    <div
                                        className={cn(
                                            'rounded-lg p-3',
                                            message.sender_id === user?.$id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        )}
                                    >
                                        {/* Media content */}
                                        {message.media_url && (
                                            <div className="mb-2">
                                                {message.type === 'image' && (
                                                    <img
                                                        src={messageService.getMediaUrl(
                                                            message.media_url
                                                        )}
                                                        alt="Message attachment"
                                                        className="max-w-full rounded"
                                                    />
                                                )}
                                                {message.type === 'video' && (
                                                    <video
                                                        src={messageService.getMediaUrl(
                                                            message.media_url
                                                        )}
                                                        controls
                                                        className="max-w-full rounded"
                                                    />
                                                )}
                                                {message.type === 'audio' && (
                                                    <audio
                                                        src={messageService.getMediaUrl(
                                                            message.media_url
                                                        )}
                                                        controls
                                                        className="max-w-full"
                                                    />
                                                )}
                                                {message.type === 'file' && (
                                                    <a
                                                        href={messageService.getMediaUrl(
                                                            message.media_url
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center space-x-2 text-blue-500 hover:underline"
                                                    >
                                                        <Icons.file />
                                                        <span>
                                                            Download attachment
                                                        </span>
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Text content */}
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>

                                    {/* Message metadata */}
                                    <div
                                        className={cn(
                                            'flex items-center space-x-2 text-xs text-muted-foreground',
                                            message.sender_id === user?.$id &&
                                                'justify-end'
                                        )}
                                    >
                                        <span>
                                            {new Date(
                                                message.sent_at
                                            ).toLocaleTimeString()}
                                        </span>
                                        {message.status === 'delivered' && (
                                            <Icons.check className="w-4 h-4" />
                                        )}
                                        {message.status === 'read' && (
                                            <Icons.checkCheck className="w-4 h-4" />
                                        )}
                                    </div>

                                    {/* Reactions */}
                                    {Object.keys(message.reactions || {})
                                        .length > 0 && (
                                        <div
                                            className={cn(
                                                'flex flex-wrap gap-1',
                                                message.sender_id === user?.$id &&
                                                    'justify-end'
                                            )}
                                        >
                                            {Object.entries(
                                                message.reactions || {}
                                            ).map(([userId, reaction]) => (
                                                <span
                                                    key={userId}
                                                    className="text-sm bg-muted rounded px-1"
                                                >
                                                    {reaction}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Message actions */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <Icons.moreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => setReplyTo(message)}
                                        >
                                            Reply
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <div className="flex gap-1">
                                                {REACTIONS.map((reaction) => (
                                                    <button
                                                        key={reaction}
                                                        onClick={() =>
                                                            handleAddReaction(
                                                                message.$id,
                                                                reaction
                                                            )
                                                        }
                                                        className="hover:bg-muted p-1 rounded"
                                                    >
                                                        {reaction}
                                                    </button>
                                                ))}
                                            </div>
                                        </DropdownMenuItem>
                                        {message.sender_id === user?.$id && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDeleteMessage(
                                                        message.$id
                                                    )
                                                }
                                                className="text-destructive"
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply preview */}
            {replyTo && (
                <div className="flex items-center justify-between bg-muted p-2">
                    <div className="flex items-center space-x-2">
                        <Icons.reply className="w-4 h-4" />
                        <span className="text-sm">
                            Replying to message
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(null)}
                    >
                        <Icons.x className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Icons.paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    <Button onClick={handleSendMessage}>
                        <Icons.send className="w-4 h-4" />
                    </Button>
                </div>
                {mediaFile && (
                    <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                            {mediaFile.name}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setMediaFile(null);
                                setMediaType('text');
                            }}
                        >
                            <Icons.x className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
