import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, DollarSign, UserPlus, UserSearch } from 'lucide-react';
import { CreateGroupModal } from '../../components/CreateGroupModal';
import { AddContactModal } from '../../components/chat/AddContactModal';
import { EmptyContactsState } from '../../components/chat/EmptyContactsState';
import { UserDirectory } from '../../components/chat/UserDirectory';
import { ChatListSkeleton } from '../../components/ui/skeleton';
import { contactManager } from '../../lib/contacts';
import { useAuth } from '../../contexts/AuthContext';
import { database, COLLECTIONS } from '../../lib/appwrite';
import { Query, Models } from 'appwrite';

interface AppwriteGroup extends Models.Document {
  type: string;
  name: string;
  description: string;
  created_by: string;
  avatar_url?: string;
  members: string[];
  messages: any[];
  fund_collections: any[];
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

interface FundContribution {
  id: string;
  collection_id: string;
  user_id: string;
  amount: number;
  transaction_id: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface FundCollection {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  contributions: FundContribution[];
}

interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  members: GroupMember[];
  messages: GroupMessage[];
  fund_collections?: FundCollection[];
}

interface DirectChat {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
}

const ChatList = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your chats</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  const [viewFilter, setViewFilter] = useState<'all' | 'direct' | 'groups'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [directChats, setDirectChats] = useState<DirectChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const loadGroups = useCallback(async (forceRefresh: boolean = false) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load groups where user is a member
      // Note: Query.search() requires full-text search index on 'members' field
      // If the field doesn't exist or isn't indexed, this will fail
      // For now, we'll get all groups and filter client-side
      const response = await database.listDocuments(COLLECTIONS.GROUPS, [
        Query.limit(100)
      ]);

      // Map the response to match our ChatGroup type
      const groupsData = (response.documents as AppwriteGroup[])
        .filter(doc => {
          // Filter out direct chats and groups where user is not a member
          if (doc.type === 'direct') return false;
          // Check if user is a member (if members field exists)
          if (doc.members && Array.isArray(doc.members)) {
            return doc.members.includes(user.$id);
          }
          // If no members field, include the group (for backwards compatibility)
          return true;
        })
        .map(doc => ({
          id: doc.$id,
          name: doc.name,
          description: doc.description,
          created_by: doc.created_by,
          created_at: doc.$createdAt,
          updated_at: doc.$updatedAt,
          avatar_url: doc.avatar_url,
          members: doc.members || [],
          messages: doc.messages || [],
          fund_collections: doc.fund_collections || []
        }));

      setGroups(groupsData.map(group => ({
        ...group,
        members: group.members.map(id => ({
          id,
          user_id: id,
          group_id: group.id,
          email: '',
          role: 'member',
          joined_at: group.created_at
        }))
      })));
      
      // Load direct chats (contacts)
      try {
        const contacts = await contactManager.getContacts(user.$id, forceRefresh);
        
        const directChatsData = contacts.map(contact => {
          return {
            id: contact.chatGroupId || contact.id,
            name: contact.name,
            email: contact.email,
            avatar: contact.avatar,
            lastMessage: undefined, // We'll implement this later
            timestamp: contact.createdAt,
            unread: 0 // We'll implement unread count later
          };
        });
        
        setDirectChats(directChatsData);
      } catch (error) {
        console.error('Error loading contacts:', error);
        setDirectChats([]);
      }
    } catch (err) {
      console.error('Error loading chats:', err);
      // Don't set error message, just set empty arrays
      setGroups([]);
      setDirectChats([]);
      
      // Schedule a retry after a short delay, but limit retries
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        setTimeout(() => {
          loadGroups(false);
        }, 3000 * retryCountRef.current); // Exponential backoff
      } else {
        console.warn('Max retries reached for loading chats');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadGroups(false);
    }
  }, [user, loadGroups]);
  
  const handleRefresh = useCallback(() => {
    loadGroups(true);
  }, [loadGroups]);

  // Combine all chats into a single list
  const allChats = [
    ...directChats.map(chat => ({
      ...chat,
      type: 'direct' as const,
      displayName: chat.name,
      displayAvatar: chat.avatar,
      memberCount: undefined,
      lastMessageText: chat.lastMessage,
      lastMessageTime: chat.timestamp,
    })),
    ...groups.map(group => ({
      ...group,
      type: 'group' as const,
      displayName: group.name,
      displayAvatar: group.avatar_url,
      memberCount: group.members?.length || 0,
      lastMessageText: group.messages && group.messages.length > 0 
        ? group.messages[group.messages.length - 1].content 
        : undefined,
      lastMessageTime: group.updated_at,
      unread: undefined,
    }))
  ];

  // Filter chats based on search and view filter
  const filteredChats = allChats
    .filter(chat => {
      // Apply view filter
      if (viewFilter !== 'all' && chat.type !== viewFilter) return false;
      
      // Apply search filter
      const query = searchQuery.toLowerCase();
      if (!query) return true;
      
      return (
        chat.displayName?.toLowerCase().includes(query) ||
        (chat.type === 'direct' && chat.email?.toLowerCase().includes(query)) ||
        (chat.type === 'group' && chat.description?.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      // Sort by last message time (most recent first)
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });

  return (
    <div className="h-full flex flex-col">
      {/* Header with Title and Filter Chips */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chats</h1>
        
        {/* Filter Chips */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              viewFilter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setViewFilter('direct')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              viewFilter === 'direct'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setViewFilter('groups')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              viewFilter === 'groups'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Groups
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Unified Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatListSkeleton />
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            {searchQuery ? (
              <>
                <Search className="w-16 h-16 mb-4 text-gray-400" />
                <p className="text-lg font-medium">No chats found</p>
                <p className="text-sm text-center">Try searching with different keywords</p>
              </>
            ) : viewFilter === 'direct' ? (
              <EmptyContactsState onAddContact={() => setShowAddContactModal(true)} />
            ) : viewFilter === 'groups' ? (
              <>
                <Users className="w-16 h-16 mb-4 text-gray-400" />
                <p className="text-lg font-medium">No groups yet</p>
                <p className="text-sm text-center mb-4">Create a group to start chatting with multiple people</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  Create Group
                </button>
              </>
            ) : (
              <>
                <Users className="w-16 h-16 mb-4 text-gray-400" />
                <p className="text-lg font-medium">No conversations yet</p>
                <p className="text-sm text-center mb-4">Start a conversation or create a group</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddContactModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Add Contact
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                  >
                    Create Group
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredChats.map((chat) => {
              const isGroup = chat.type === 'group';
              const chatLink = isGroup ? `/chat/group/${chat.id}` : `/chat/${chat.id}`;
              
              return (
                <Link
                  key={`${chat.type}-${chat.id}`}
                  to={chatLink}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {chat.displayAvatar ? (
                      <img
                        src={chat.displayAvatar}
                        alt={chat.displayName}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                        isGroup ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {isGroup ? (
                          <Users className="w-7 h-7 text-purple-600" />
                        ) : (
                          <span className="text-xl font-semibold text-blue-600">
                            {chat.displayName?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                    )}
                    {chat.unread && chat.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {chat.unread > 9 ? '9+' : chat.unread}
                      </span>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {chat.displayName}
                        </h3>
                        {isGroup && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            {chat.memberCount}
                          </span>
                        )}
                      </div>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {new Date(chat.lastMessageTime).toLocaleDateString() === new Date().toLocaleDateString()
                            ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : new Date(chat.lastMessageTime).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                        </span>
                      )}
                    </div>
                    
                    {/* Last Message or Description */}
                    {chat.lastMessageText ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chat.lastMessageText}
                      </p>
                    ) : isGroup && chat.description ? (
                      <p className="text-sm text-gray-500 dark:text-gray-500 truncate italic">
                        {chat.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-600 italic">
                        No messages yet
                      </p>
                    )}
                    
                    {/* Fund Collections Badge */}
                    {isGroup && chat.fund_collections && chat.fund_collections.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-purple-600">
                        <DollarSign className="w-3 h-3" />
                        <span>
                          {chat.fund_collections.length} active collection{chat.fund_collections.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col space-y-3">
        {/* Browse Users */}
        <button
          onClick={() => setShowUserDirectory(true)}
          className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
          title="Browse users"
        >
          <UserSearch className="w-6 h-6" />
        </button>
        
        {/* Add Contact */}
        <button
          onClick={() => setShowAddContactModal(true)}
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors"
          title="Add contact"
        >
          <UserPlus className="w-6 h-6" />
        </button>
        
        {/* Create Group */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-600 transition-colors"
          title="Create group"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={() => loadGroups(false)}
        />
      )}
      
      {/* Add Contact Modal */}
      {showAddContactModal && (
        <AddContactModal
          onClose={() => setShowAddContactModal(false)}
          onContactAdded={handleRefresh}
        />
      )}
      
      {/* User Directory */}
      {showUserDirectory && (
        <UserDirectory
          onClose={() => setShowUserDirectory(false)}
          onContactAdded={handleRefresh}
        />
      )}
    </div>
  );
};

export default ChatList;
