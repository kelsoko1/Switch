import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Search, UserPlus, MessageSquare, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userDirectory, type AppUser } from '../../lib/userDirectory';
import { contactManager } from '../../lib/contacts';

interface UserDirectoryProps {
  onClose: () => void;
  onContactAdded?: () => void;
}

export const UserDirectory: FC<UserDirectoryProps> = ({
  onClose,
  onContactAdded,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingContact, setAddingContact] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Refresh users when search query changes
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');

      // Get verified users
      const verifiedUsers = await userDirectory.getVerifiedUsers();
      const contacts = await contactManager.getContacts(user.$id);
      
      // Mark existing contacts and filter out current user
      const usersWithContactStatus = verifiedUsers
        .filter(u => u.id !== user.$id) // Exclude current user
        .map(u => ({
          ...u,
          isContact: contacts.some(c => c.userId === u.id)
        }));
      
      setUsers(usersWithContactStatus);
      setFilteredUsers(usersWithContactStatus);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startDirectMessage = (contactUser: AppUser) => {
    // Navigate to direct chat with the selected user
    navigate(`/chat/direct/${contactUser.id}`);
    onClose();
  };

  const handleAddContact = async (contactUser: AppUser) => {
    if (!user) return;
    
    try {
      setAddingContact(contactUser.id);
      await contactManager.addContact(user.$id, contactUser.email);
      
      // Update the user in the list to show as a contact
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === contactUser.id ? { ...u, isContact: true } : u
        )
      );
      
      onContactAdded?.();
    } catch (err) {
      console.error('Error adding contact:', err);
      alert('Failed to add contact. Please try again.');
    } finally {
      setAddingContact(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">User Directory</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
          >
            &times;
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-center">
            {error}
            <button
              onClick={loadUsers}
              className="ml-2 underline text-red-700 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'No users match your search' : 'No users found'}
            </div>
          ) : (
            <ul className="divide-y">
              {filteredUsers.map((appUser) => (
                <li 
                  key={appUser.id} 
                  className="p-4 flex items-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => startDirectMessage(appUser)}
                >
                  <div className="flex-shrink-0">
                    {appUser.avatar ? (
                      <img
                        src={appUser.avatar}
                        alt={appUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-purple-700">
                          {appUser.name[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-gray-900">{appUser.name}</h3>
                    <p className="text-sm text-gray-500">{appUser.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startDirectMessage(appUser)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Message"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    {appUser.isContact ? (
                      <div className="flex items-center text-green-600">
                        <Check className="w-5 h-5" />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddContact(appUser);
                        }}
                        disabled={addingContact === appUser.id}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-full disabled:opacity-50"
                        title="Add contact"
                      >
                        {addingContact === appUser.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <UserPlus className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
