import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { 
  Users, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  ArrowLeft,
  Settings,
  Bell,
  Search,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { groupService, walletService } from '../../services/appwrite';
import { KijumbeGroup as AppwriteKijumbeGroup } from '../../services/appwrite/groupService';
import CreateGroupModal from '../../components/kijumbe/CreateGroupModal';
import GroupDetailsModal from '../../components/kijumbe/GroupDetailsModal';
import KijumbeGroupCard from '../../components/kijumbe/KijumbeGroupCard';

interface KijumbeGroup {
  $id: string;
  name: string;
  description: string;
  members: number;
  totalAmount: number;
  contribution_amount: number;
  contributionAmount?: number; // For backward compatibility
  nextMeeting: string;
  status: 'active' | 'inactive' | 'completed';
  kiongozi_id: string;
  createdBy?: string; // For backward compatibility
  created_at: string;
  createdAt?: string; // For backward compatibility
  current_rotation: number;
  rotation_duration: number;
  max_members: number;
  myContribution: number;
  myLoans: number;
  // Original data from Appwrite for use in modals
  _originalMembers?: any[];
  _originalContributions?: any[];
  _originalPayments?: any[];
}

interface KijumbeTransaction {
  $id: string;
  group_id: string;
  user_id: string;
  amount: number;
  rotation: number;
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  created_at: string;
  type: 'kijumbe_contribution' | 'kijumbe_payout';
  description?: string; // For backward compatibility
  createdAt?: string; // For backward compatibility
}

const KijumbeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<KijumbeGroup[]>([]);
  const [transactions, setTransactions] = useState<KijumbeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<KijumbeGroup | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.$id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch wallet balance
        const wallet = await walletService.getUserWallet(user.$id);
        if (wallet) {
          setWalletBalance(wallet.balance);
        }
        
        // Fetch groups where user is a member
        const userGroups = await groupService.getUserGroups(user.$id);
        
        // For each group, get contribution status
        const groupsWithDetails = await Promise.all(
          userGroups.map(async (group) => {
            // Get group details with members
            const groupDetails = await groupService.getGroupDetails(group.$id);
            const memberCount = groupDetails?.members?.length || 0;
            
            // Get user's contribution status
            const contributionStatus = await groupService.getUserContributionStatus(group.$id, user.$id);
            
            // Calculate next meeting date (simple estimation)
            const createdDate = new Date(group.created_at);
            const rotationDays = group.rotation_duration || 30;
            const nextMeetingDate = new Date(createdDate);
            nextMeetingDate.setDate(createdDate.getDate() + (rotationDays * group.current_rotation));
            
            return {
              ...group,
              members: memberCount,
              totalAmount: (group.contribution_amount * memberCount) || 0,
              contributionAmount: group.contribution_amount,
              createdBy: group.kiongozi_id,
              createdAt: group.created_at,
              myContribution: contributionStatus.totalContributed,
              myLoans: 0, // Not implemented yet
              nextMeeting: nextMeetingDate.toISOString().split('T')[0],
              description: group.description !== null ? group.description : ''
            } as KijumbeGroup;
          })
        );
        
        setGroups(groupsWithDetails);
        
        // Fetch all contributions for this user
        const allTransactions: KijumbeTransaction[] = [];
        
        for (const group of userGroups) {
          const groupDetails = await groupService.getGroupDetails(group.$id);
          const userContributions = groupDetails?.contributions?.filter(c => c.user_id === user.$id) || [];
          
          // Convert to our transaction format
          const transactions = userContributions.map(contribution => ({
            $id: contribution.$id,
            group_id: contribution.group_id,
            user_id: contribution.user_id,
            amount: contribution.amount,
            rotation: contribution.rotation,
            status: contribution.status,
            transaction_id: contribution.transaction_id,
            created_at: contribution.created_at,
            createdAt: contribution.created_at, // For backward compatibility
            description: `Mchango wa rotation ${contribution.rotation}`, // For backward compatibility
            type: 'kijumbe_contribution' as const
          }));
          
          allTransactions.push(...transactions);
        }
        
        setTransactions(allTransactions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching Kijumbe data:', error);
        setIsLoading(false);
        addNotification('Kuna tatizo la kupata data za Kijumbe');
      }
    };
    
    fetchUserData();
  }, [user]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sw-TZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'kijumbe_contribution': return { label: 'Mchango', icon: '💰', color: 'text-green-600' };
      case 'kijumbe_payout': return { label: 'Malipo', icon: '💸', color: 'text-purple-600' };
      case 'deposit': return { label: 'Deposit', icon: '⬆️', color: 'text-green-600' };
      case 'withdrawal': return { label: 'Withdrawal', icon: '⬇️', color: 'text-red-600' };
      case 'transfer': return { label: 'Transfer', icon: '↔️', color: 'text-blue-600' };
      default: return { label: type, icon: '📄', color: 'text-gray-600' };
    }
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const handleSettings = () => {
    addNotification('Mipangilio ya Kijumbe itajengwa hivi karibuni');
  };

  const handleNotifications = () => {
    addNotification('Mfumo wa arifa utajengwa hivi karibuni');
  };
  
  const handleCreateGroup = async (groupData: {
    name: string;
    description: string;
    contributionAmount: number;
    rotationDuration: number;
    maxMembers: number;
  }) => {
    if (!user?.$id) {
      addNotification('Tafadhali ingia kwanza');
      return;
    }
    
    try {
      const newGroup = await groupService.createGroup(user.$id, {
        name: groupData.name,
        description: groupData.description,
        contribution_amount: groupData.contributionAmount,
        rotation_duration: groupData.rotationDuration,
        max_members: groupData.maxMembers
      });
      
      if (newGroup) {
        // Add the new group to the list with calculated fields
        const createdDate = new Date(newGroup.created_at);
        const rotationDays = newGroup.rotation_duration || 30;
        const nextMeetingDate = new Date(createdDate);
        nextMeetingDate.setDate(createdDate.getDate() + (rotationDays * newGroup.current_rotation));
        
        const groupWithDetails = {
          ...newGroup,
          members: 1, // Creator is the first member
          totalAmount: newGroup.contribution_amount,
          contributionAmount: newGroup.contribution_amount,
          createdBy: newGroup.kiongozi_id,
          createdAt: newGroup.created_at,
          myContribution: 0,
          myLoans: 0,
          nextMeeting: nextMeetingDate.toISOString().split('T')[0],
        } as KijumbeGroup;
        
        setGroups(prev => [groupWithDetails, ...prev]);
        addNotification(`Kikundi ${groupData.name} kimeundwa kwa mafanikio!`);
        setShowCreateGroupModal(false);
      }
    } catch (error: any) {
      console.error('Error creating group:', error);
      addNotification(error.message || 'Imeshindwa kuunda kikundi');
    }
  };
  
  const handleViewGroup = async (groupId: string) => {
    try {
      const groupDetails = await groupService.getGroupDetails(groupId);
      if (groupDetails) {
        // Convert Appwrite KijumbeGroup to our local KijumbeGroup interface
        const memberCount = groupDetails.members?.length || 0;
        
        // Calculate next meeting date
        const createdDate = new Date(groupDetails.created_at);
        const rotationDays = groupDetails.rotation_duration || 30;
        const nextMeetingDate = new Date(createdDate);
        nextMeetingDate.setDate(createdDate.getDate() + (rotationDays * groupDetails.current_rotation));
        
        // Get user's contribution status if user is available
        let userContribution = 0;
        if (user?.$id) {
          const contributionStatus = await groupService.getUserContributionStatus(groupId, user.$id);
          userContribution = contributionStatus.totalContributed;
        }
        
        // Create a new object that matches our local KijumbeGroup interface
        const enhancedGroup: KijumbeGroup = {
          $id: groupDetails.$id,
          name: groupDetails.name,
          description: groupDetails.description || '',
          kiongozi_id: groupDetails.kiongozi_id,
          max_members: groupDetails.max_members,
          rotation_duration: groupDetails.rotation_duration,
          contribution_amount: groupDetails.contribution_amount,
          contributionAmount: groupDetails.contribution_amount,
          status: groupDetails.status,
          current_rotation: groupDetails.current_rotation,
          created_at: groupDetails.created_at,
          createdAt: groupDetails.created_at,
          members: memberCount,
          totalAmount: (groupDetails.contribution_amount * memberCount) || 0,
          myContribution: userContribution,
          myLoans: 0,
          nextMeeting: nextMeetingDate.toISOString().split('T')[0],
          // Pass through the original members, contributions, and payments
          // These will be available in the GroupDetailsModal
          _originalMembers: groupDetails.members,
          _originalContributions: groupDetails.contributions,
          _originalPayments: groupDetails.payments
        };
        
        setSelectedGroup(enhancedGroup);
        setShowGroupDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      addNotification('Imeshindwa kupata maelezo ya kikundi');
    }
  };
  
  const handleContribute = async (amount: number, description: string) => {
    if (!selectedGroup || !user?.$id) return;
    
    try {
      const success = await groupService.makeContribution(selectedGroup.$id, user.$id, amount);
      if (success) {
        // Update wallet balance
        setWalletBalance(prev => prev - amount);
        
        // Update group contribution status
        const updatedGroups = groups.map(group => {
          if (group.$id === selectedGroup.$id) {
            return {
              ...group,
              myContribution: group.myContribution + amount
            };
          }
          return group;
        });
        
        setGroups(updatedGroups);
        addNotification(`Mchango wa ${formatCurrency(amount)} umefanikiwa!`);
        
        // Add to transactions
        const newTransaction: KijumbeTransaction = {
          $id: `temp_${Date.now()}`,
          group_id: selectedGroup.$id,
          user_id: user.$id,
          amount: amount,
          rotation: selectedGroup.current_rotation,
          status: 'completed',
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          description: description || `Mchango wa rotation ${selectedGroup.current_rotation}`,
          type: 'kijumbe_contribution'
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
      }
    } catch (error: any) {
      console.error('Error making contribution:', error);
      addNotification(error.message || 'Imeshindwa kuweka mchango');
    }
  };
  
  const handleInviteMember = async (email: string, phone: string, message: string) => {
    if (!selectedGroup || !user?.$id) return;
    
    try {
      // For now, just show a notification since we don't have the full invite flow
      addNotification(`Mwaliko umetumwa kwa ${email || phone}`);
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      addNotification(error.message || 'Imeshindwa kutuma mwaliko');
      throw error;
    }
  };
  
  const handleDeleteGroup = async () => {
    if (!selectedGroup || !user?.$id) return;
    
    try {
      // In a real implementation, we would call groupService.deleteGroup
      // For now, just remove from the local state
      setGroups(prev => prev.filter(group => group.$id !== selectedGroup.$id));
      addNotification(`Kikundi ${selectedGroup.name} kimefutwa!`);
      setShowGroupDetailsModal(false);
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      addNotification(error.message || 'Imeshindwa kufuta kikundi');
      throw error;
    }
  };
  
  const handleEditGroup = () => {
    // For now, just show a notification
    addNotification('Kazi ya kuhariri kikundi itajengwa hivi karibuni');
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (group.description ? group.description.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesFilter = filterStatus === 'all' || group.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">Inapakia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="p-2 mr-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-white text-xl font-bold">Kijumbe</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNotifications}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors relative"
            >
              <Bell className="w-6 h-6 text-white" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={handleSettings}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tafuta vikundi..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-sm rounded-lg ${filterStatus === 'all' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Zote
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 text-sm rounded-lg ${filterStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Zinaendelea
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 text-sm rounded-lg ${filterStatus === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Zimekamilika
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1 text-sm rounded-lg ${filterStatus === 'inactive' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Zimesimamishwa
            </button>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white flex items-center gap-1 ml-auto"
            >
              <UserPlus className="w-4 h-4" />
              Unda Kikundi
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm opacity-90">Jumla ya Michango</p>
                <p className="text-white text-2xl font-bold">
                  {formatCurrency(groups.reduce((sum, group) => sum + group.myContribution, 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-white opacity-80" />
            </div>
          </div>
          <div className="bg-green-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm opacity-90">Mikopo ya Sasa</p>
                <p className="text-white text-2xl font-bold">
                  {formatCurrency(groups.reduce((sum, group) => sum + group.myLoans, 0))}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-white opacity-80" />
            </div>
          </div>
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Vikundi Vangu</h2>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Unda Kikundi
            </button>
          </div>

          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <KijumbeGroupCard 
                  key={group.$id} 
                  group={group} 
                  onClick={() => handleViewGroup(group.$id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Hakuna Vikundi</h3>
              <p className="text-gray-400 mb-4">Haujajiunga na kikundi chochote bado</p>
              <button 
                onClick={() => setShowCreateGroupModal(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Unda Kikundi
              </button>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h2 className="text-white text-lg font-semibold mb-4">Miamala ya Hivi Karibuni</h2>
          <div className="bg-gray-800 rounded-lg p-4">
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => {
                  const typeDisplay = getTransactionTypeDisplay(tx.type);
                  return (
                    <div key={tx.$id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{typeDisplay.icon}</span>
                        <div>
                          <p className="text-white font-medium">{typeDisplay.label}</p>
                          <p className="text-gray-400 text-sm">{tx.description || ''}</p>
                          <p className="text-gray-500 text-xs">{formatDate(tx.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${typeDisplay.color}`}>
                          {tx.type === 'kijumbe_contribution' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {tx.status === 'completed' ? 'Imekamilika' : 
                           tx.status === 'pending' ? 'Inasubiri' : 'Imeshindwa'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Hakuna miamala ya hivi karibuni</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-40">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in"
            >
              {notification}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateGroupModal && (
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {showGroupDetailsModal && selectedGroup && (
        <GroupDetailsModal
          isOpen={showGroupDetailsModal}
          onClose={() => setShowGroupDetailsModal(false)}
          group={selectedGroup}
          onContribute={handleContribute}
          onInviteMember={handleInviteMember}
          onDeleteGroup={handleDeleteGroup}
          onEditGroup={handleEditGroup}
          balance={walletBalance}
        />
      )}
    </div>
  );
};

export default KijumbeDashboard;