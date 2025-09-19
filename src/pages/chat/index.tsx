
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
    return (
        <div className="container mx-auto p-4 h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                {/* Chat list */}
                <div className="hidden lg:block bg-card rounded-lg shadow p-4">
                    <h2 className="text-lg font-semibold mb-4">Chats</h2>
                    {/* Add chat list here */}
                </div>

                {/* Chat interface */}
                <div className="lg:col-span-2 bg-card rounded-lg shadow">
                    <ChatInterface
                        // For testing, you can use any user ID or group ID
                        receiverId="test-user-id"
                        // groupId="test-group-id"
                        className="h-full"
                    />
                </div>
            </div>
        </div>
    );
}
