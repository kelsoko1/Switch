import React, { useState, useEffect } from 'react';
import { X, Upload, UserPlus, XCircle, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { GroupManager } from '../lib/groups';
import { userDirectory } from '../lib/userDirectory';
import { storage } from '../lib/appwrite';
import { useAuth } from '../contexts/AuthContext';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isSelected?: boolean;
}

interface CreateGroupModalProps {
  onClose: () => void;
  onGroupCreated?: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  onClose,
  onGroupCreated,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const userList = await userDirectory.getVerifiedUsers();
        // Filter out current user and already selected users
        const filteredUsers = userList.filter(
          u => u.id !== user?.$id && !selectedUsers.some(su => su.id === u.id)
        );
        setUsers(filteredUsers);
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [selectedUsers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (): Promise<string | undefined> => {
    if (!avatarFile) return undefined;
    
    try {
      setIsUploading(true);
      const bucketId = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || 'group_avatars';
      const file = await storage.uploadFile(
        bucketId,
        avatarFile,
        user?.$id ? [`read(\"user:${user.$id}\")`, `write(\"user:${user.$id}\")`] : []
      );
      
      return storage.getFileView(bucketId, file.$id);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar. Please try again.');
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Upload avatar if provided
      const avatarUrl = avatarFile ? await uploadAvatar() : undefined;
      
      const groupManager = new GroupManager();
      const group = await groupManager.createGroup(
        name.trim(),
        description.trim() || undefined,
        avatarUrl
      );

      // Add selected members to the group
      await Promise.all(
        selectedUsers.map(user => 
          groupManager.addGroupMember(group.id, user.id, 'member')
        )
      );
      
      onGroupCreated?.();
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
      setError('Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (user: AppUser) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">New Group</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || selectedUsers.length === 0}
            className="text-blue-600 font-medium disabled:text-gray-400"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Group Avatar */}
          <div className="flex flex-col items-center">
            <label className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Group avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <ImageIcon className="w-10 h-10 mx-auto" />
                    <span className="text-xs">Add Photo</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Group Name and Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter group name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Enter group description"
              />
            </div>
          </div>

          {/* Selected Members */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedUsers.map(user => (
                  <div 
                    key={user.id}
                    className="flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm"
                  >
                    <span>{user.name.split(' ')[0]}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelectedUser(user.id);
                      }}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Search */}
          <div>
            <div className="relative mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search members"
              />
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* User List */}
            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery ? 'No users found' : 'Loading users...'}
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleUserSelection(user)}
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-gray-500">{user.name[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="ml-2">
                      {selectedUsers.some(u => u.id === user.id) ? (
                        <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 pb-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};