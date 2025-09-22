import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, DollarSign, UserPlus, UserSearch } from 'lucide-react';
import { CreateGroupModal } from '../../components/CreateGroupModal';
import { AddContactModal } from '../../components/chat/AddContactModal';
import { EmptyContactsState } from '../../components/chat/EmptyContactsState';
import { UserDirectory } from '../../components/chat/UserDirectory';
import { contactManager } from '../../lib/contacts';
import { useAuth } from '../../contexts/AuthContext';
import { appwrite } from '../../lib/appwrite';
import { Query } from 'appwrite';

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
  
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [directChats, setDirectChats] = useState<DirectChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGroups = useCallback(async (forceRefresh: boolean = false) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load groups where user is a member
      const response = await appwrite.listDocuments('groups', [
        Query.search('members', user.$id),
      ]);

      // Map the response to match our ChatGroup type
      const groupsData = response.documents
        .filter(doc => doc.type !== 'direct')
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

      setGroups(groupsData);
      
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
      
      // Schedule a retry after a short delay
      setTimeout(() => {
        loadGroups(false);
      }, 3000);
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

  const filteredDirectChats = directChats.filter((chat) => {
    const query = searchQuery.toLowerCase();
    return (
      chat.name?.toLowerCase().includes(query) ||
      chat.email?.toLowerCase().includes(query)
    );
  });

  const filteredGroups = groups.filter((group) => {
    const query = searchQuery.toLowerCase();
    return (
      group.name?.toLowerCase().includes(query) ||
      (group.description || '').toLowerCase().includes(query)
    );
  });

  const handleTabChange = (tab: 'direct' | 'groups') => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => handleTabChange('direct')}
          className={`flex-1 py-4 text-sm font-medium ${
            activeTab === 'direct'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600'
          }`}
        >
          Direct Messages
        </button>
        <button
          onClick={() => handleTabChange('groups')}
          className={`flex-1 py-4 text-sm font-medium ${
            activeTab === 'groups'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600'
          }`}
        >
          Groups
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'direct' ? 'chats' : 'groups'}...`}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === 'direct' ? (
          filteredDirectChats.length === 0 ? (
            <EmptyContactsState onAddContact={() => setShowAddContactModal(true)} />
          ) : (
            <div className="space-y-2">
              {filteredDirectChats.map((chat) => (
                <Link
                  key={chat.id}
                  to={`/chat/${chat.id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={chat.avatar || '/default-avatar.png'}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.unread && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {chat.name}
                      </h3>
                      {chat.timestamp && (
                        <span className="text-xs text-gray-500">
                          {new Date(chat.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Users className="w-12 h-12 mb-2" />
              <p className="text-lg font-medium">No groups found</p>
              <p className="text-sm">Create a new group to get started</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <Link
                key={group.id}
                to={`/chat/group/${group.id}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                {group.avatar_url ? (
                  <img
                    src={group.avatar_url}
                    alt={group.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-purple-700">
                      {group.name[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {group.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {group.members?.length || 0} members
                    </span>
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-500 truncate">
                      {group.description}
                    </p>
                  )}
                  {group.messages && group.messages.length > 0 && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {group.messages[group.messages.length - 1].content}
                    </p>
                  )}
                  {group.fund_collections && group.fund_collections.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-purple-600">
                      <DollarSign className="w-3 h-3" />
                      <span>
                        {group.fund_collections.length} active collection
                        {group.fund_collections.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col space-y-3">
        {activeTab === 'direct' && (
          <button
            onClick={() => setShowUserDirectory(true)}
            className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
            title="Browse users"
          >
            <UserSearch className="w-6 h-6" />
          </button>
        )}
        
        <button
          onClick={() => {
            if (activeTab === 'groups') {
              setShowCreateModal(true);
            } else {
              setShowAddContactModal(true);
            }
          }}
          className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-600 transition-colors"
          title={activeTab === 'groups' ? 'Create group' : 'Add contact'}
        >
          {activeTab === 'groups' ? <Plus className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
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
