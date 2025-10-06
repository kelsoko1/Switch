import { useState } from 'react';
import { X, Search, Users, TrendingUp, Shield } from 'lucide-react';

interface JoinGroupModalProps {
  onClose: () => void;
  onGroupJoined: (groupId: string) => void;
}

interface GroupListing {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  contributionAmount: number;
  frequency: string;
  isPrivate: boolean;
}

export function JoinGroupModal({ onClose, onGroupJoined }: JoinGroupModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API call
  const availableGroups: GroupListing[] = [
    {
      id: 'group_1',
      name: 'Tech Professionals Savings',
      description: 'Monthly savings group for tech professionals',
      memberCount: 24,
      category: 'Professional',
      contributionAmount: 50000,
      frequency: 'Monthly',
      isPrivate: false,
    },
    {
      id: 'group_2',
      name: 'Small Business Owners',
      description: 'Support network for entrepreneurs',
      memberCount: 18,
      category: 'Business',
      contributionAmount: 100000,
      frequency: 'Monthly',
      isPrivate: false,
    },
    {
      id: 'group_3',
      name: 'Family Emergency Fund',
      description: 'Building emergency funds together',
      memberCount: 12,
      category: 'Family',
      contributionAmount: 30000,
      frequency: 'Weekly',
      isPrivate: true,
    },
  ];

  const categories = ['all', 'Professional', 'Business', 'Family', 'Education', 'Community'];

  const filteredGroups = availableGroups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinGroup = async (groupId: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement actual join group logic
      // await groupService.joinGroup(groupId);
      
      onGroupJoined(groupId);
      onClose();
    } catch (error) {
      console.error('Error joining group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Join a Savings Group
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b dark:border-gray-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No groups found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="border dark:border-gray-700 rounded-lg p-4 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {group.name}
                        </h3>
                        {group.isPrivate && (
                          <Shield className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{group.frequency}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                      {group.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Contribution Amount
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        TZS {group.contributionAmount.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={isLoading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Joining...' : 'Join Group'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
