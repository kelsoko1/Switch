import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { 
  Users, 
  Plus, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ArrowLeft,
  Settings,
  Bell,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/appwrite';

interface KijumbeGroup {
  $id: string;
  name: string;
  description: string | null;
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

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user?.$id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch groups where user is a member
        const userGroups = await groupService.getUserGroups(user.$id);
        
        // For each group, get contribution status
        const groupsWithDetails = await Promise.all(
          userGroups.map(async (group) => {
            // Get group members count
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
    
    fetchUserGroups();
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
      // Legacy types for backward compatibility
      case 'contribution': return { label: 'Mchango', icon: '💰', color: 'text-green-600' };
      case 'loan': return { label: 'Mikopo', icon: '📈', color: 'text-blue-600' };
      case 'repayment': return { label: 'Malipo', icon: '🔄', color: 'text-orange-600' };
      case 'payout': return { label: 'Malipo', icon: '💸', color: 'text-purple-600' };
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

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (group.description ? group.description.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesFilter = filterStatus === 'all' || group.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/wallet')}
              className="p-2 hover:bg-gray-700 rounded-lg mr-3"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-white text-xl font-bold">Kijumbe</h1>
              <p className="text-gray-300 text-sm">Mikopo ya Kikundi na Ushirika</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleNotifications}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <Bell className="w-5 h-5 text-gray-300" />
            </button>
            <button 
              onClick={handleSettings}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
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
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterStatus === 'all' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Zote
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterStatus === 'active' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Hai
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterStatus === 'completed' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Imekamilika
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
              onClick={() => navigate('/kijumbe/create')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Unganisha Kikundi
            </button>
          </div>

          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div key={group.$id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-red-500 mr-3" />
                    <div>
                      <h3 className="text-white font-semibold">{group.name}</h3>
                      <p className="text-gray-400 text-sm">{group.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                    {group.status === 'active' ? 'Hai' : group.status === 'completed' ? 'Imekamilika' : 'Haijaamilika'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-gray-400 text-sm">Wanachama</p>
                    <p className="text-white font-semibold">{group.members}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Jumla ya Pesa</p>
                    <p className="text-white font-semibold">{formatCurrency(group.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Mchango Wangu</p>
                    <p className="text-white font-semibold">{formatCurrency(group.myContribution)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Mikopo Yangu</p>
                    <p className="text-white font-semibold">{formatCurrency(group.myLoans)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Mkutano ujao: {formatDate(group.nextMeeting)}
                  </div>
                  <button
                    onClick={() => navigate(`/kijumbe/group/${group.$id}`)}
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                  >
                    Angalia Zaidi
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Hakuna vikundi vilivyopatikana</p>
              <p className="text-gray-500 text-sm mt-2">Unganisha kikundi kipya au tafuta vikundi vingine</p>
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
                          {(tx.type === 'kijumbe_contribution' || tx.type === 'contribution') ? '+' : '-'}
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
    </div>
  );
};

export default KijumbeDashboard;
