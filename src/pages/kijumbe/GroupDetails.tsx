import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContributeModal from '../../components/kijumbe/ContributeModal';
import LoanModal from '../../components/kijumbe/LoanModal';
import InviteMemberModal from '../../components/kijumbe/InviteMemberModal';
import { formatCurrency } from '../../utils/currency';
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  Calendar, 
  Plus, 
  Minus, 
  TrendingUp,
  Settings,
  MessageCircle,
  UserPlus,
  AlertCircle
} from 'lucide-react';

interface GroupMember {
  $id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  contribution: number;
  loans: number;
  joinedAt: string;
  avatar?: string;
}

interface GroupTransaction {
  $id: string;
  userId: string;
  type: 'contribution' | 'loan' | 'repayment' | 'payout';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  user?: GroupMember;
}

interface GroupDetails {
  $id: string;
  name: string;
  description: string;
  members: GroupMember[];
  totalAmount: number;
  contributionAmount: number;
  nextMeeting: string;
  status: 'active' | 'inactive' | 'completed';
  createdBy: string;
  createdAt: string;
  myRole: 'admin' | 'member';
  myContribution: number;
  myLoans: number;
}

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [transactions, setTransactions] = useState<GroupTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'transactions'>('overview');
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Simulate loading group data
    setTimeout(() => {
      setGroup({
        $id: groupId || '',
        name: 'Vikundi vya Kijumbe',
        description: 'Mikopo ya Kikundi cha Kijumbe',
        members: [
          {
            $id: 'member_1',
            name: 'John Mwalimu',
            email: 'john@example.com',
            role: 'admin',
            contribution: 75000,
            loans: 0,
            joinedAt: '2024-01-01',
          },
          {
            $id: 'member_2',
            name: 'Mary Mwamba',
            email: 'mary@example.com',
            role: 'member',
            contribution: 50000,
            loans: 25000,
            joinedAt: '2024-01-05',
          },
          {
            $id: 'member_3',
            name: 'Peter Kipande',
            email: 'peter@example.com',
            role: 'member',
            contribution: 60000,
            loans: 0,
            joinedAt: '2024-01-10',
          },
        ],
        totalAmount: 450000,
        contributionAmount: 25000,
        nextMeeting: '2024-01-15',
        status: 'active',
        createdBy: 'member_1',
        createdAt: '2024-01-01',
        myRole: 'admin',
        myContribution: 75000,
        myLoans: 0,
      });

      setTransactions([
        {
          $id: 'tx_1',
          userId: 'member_1',
          type: 'contribution',
          amount: 25000,
          description: 'Mchango wa mwezi wa Januari',
          status: 'completed',
          createdAt: '2024-01-01',
          user: {
            $id: 'member_1',
            name: 'John Mwalimu',
            email: 'john@example.com',
            role: 'admin',
            contribution: 75000,
            loans: 0,
            joinedAt: '2024-01-01',
          },
        },
        {
          $id: 'tx_2',
          userId: 'member_2',
          type: 'loan',
          amount: 50000,
          description: 'Mikopo ya haraka',
          status: 'completed',
          createdAt: '2024-01-05',
          user: {
            $id: 'member_2',
            name: 'Mary Mwamba',
            email: 'mary@example.com',
            role: 'member',
            contribution: 50000,
            loans: 25000,
            joinedAt: '2024-01-05',
          },
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, [groupId]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sw-TZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
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

  const handleContribute = async (amount: number, description: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (group) {
      setGroup({
        ...group,
        totalAmount: group.totalAmount + amount,
        myContribution: group.myContribution + amount,
      });
    }

    const newTransaction: GroupTransaction = {
      $id: `tx_${Date.now()}`,
      groupId: group?.$id || '',
      userId: 'current_user',
      type: 'contribution',
      amount,
      description,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    addNotification(`Umeongeza mchango wa ${formatCurrency(amount)}`);
  };

  const handleRequestLoan = async (amount: number, purpose: string, repaymentPeriod: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (group) {
      setGroup({
        ...group,
        myLoans: group.myLoans + amount,
      });
    }

    const newTransaction: GroupTransaction = {
      $id: `tx_${Date.now()}`,
      groupId: group?.$id || '',
      userId: 'current_user',
      type: 'loan',
      amount,
      description: `Mikopo: ${purpose}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    addNotification(`Umeomba mikopo ya ${formatCurrency(amount)} - Inasubiri idhini`);
  };

  const handleInviteMember = async (email: string, phone: string, message: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    addNotification(`Mwaliko umetumwa kwa ${email || phone}`);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Kikundi Hakijapatikana</h2>
          <p className="text-gray-400 mb-4">Kikundi hiki hakijapatikana au huna ruhusa ya kuukiona.</p>
          <button
            onClick={() => navigate('/kijumbe')}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Rudi Nyuma
          </button>
        </div>
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
              onClick={() => navigate('/kijumbe')}
              className="p-2 hover:bg-gray-700 rounded-lg mr-3"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-white text-xl font-bold">{group.name}</h1>
              <p className="text-gray-300 text-sm">{group.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
              <MessageCircle className="w-5 h-5 text-gray-300" />
            </button>
            <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Muhtasari', icon: TrendingUp },
            { id: 'members', label: 'Wanachama', icon: Users },
            { id: 'transactions', label: 'Miamala', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm opacity-90">Jumla ya Pesa</p>
                    <p className="text-white text-2xl font-bold">{formatCurrency(group.totalAmount)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
              <div className="bg-green-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm opacity-90">Wanachama</p>
                    <p className="text-white text-2xl font-bold">{group.members.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* My Status */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">Hali Yangu</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Mchango Wangu</p>
                  <p className="text-white font-semibold">{formatCurrency(group.myContribution)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Mikopo Yangu</p>
                  <p className="text-white font-semibold">{formatCurrency(group.myLoans)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Kiasi cha Mchango</p>
                  <p className="text-white font-semibold">{formatCurrency(group.contributionAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Mkutano Ujao</p>
                  <p className="text-white font-semibold">{formatDate(group.nextMeeting)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowContributeModal(true)}
                className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Weka Mchango
              </button>
              <button
                onClick={() => setShowLoanModal(true)}
                className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Omba Mikopo
              </button>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Wanachama ({group.members.length})</h3>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Alika Mwanachama
              </button>
            </div>

            <div className="space-y-3">
              {group.members.map((member) => (
                <div key={member.$id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{member.name}</p>
                        <p className="text-gray-400 text-sm">{member.email}</p>
                        <p className="text-gray-500 text-xs">
                          {member.role === 'admin' ? 'Mkuu wa Kikundi' : 'Mwanachama'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatCurrency(member.contribution)}</p>
                      <p className="text-gray-400 text-sm">Mchango</p>
                      {member.loans > 0 && (
                        <p className="text-blue-400 text-sm">Mikopo: {formatCurrency(member.loans)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Miamala ya Kikundi</h3>

            <div className="space-y-3">
              {transactions.map((tx) => {
                const typeDisplay = getTransactionTypeDisplay(tx.type);
                return (
                  <div key={tx.$id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{typeDisplay.icon}</span>
                        <div>
                          <p className="text-white font-semibold">{typeDisplay.label}</p>
                          <p className="text-gray-400 text-sm">{tx.description}</p>
                          <p className="text-gray-500 text-xs">
                            {tx.user?.name} • {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${typeDisplay.color}`}>
                          {tx.type === 'contribution' ? '+' : '-'}
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
      <ContributeModal
        isOpen={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        onContribute={handleContribute}
        groupName={group?.name || ''}
        contributionAmount={group?.contributionAmount || 0}
        balance={125000} // Demo balance
      />

      <LoanModal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        onRequestLoan={handleRequestLoan}
        groupName={group?.name || ''}
        maxLoanAmount={group?.totalAmount || 0}
        myContribution={group?.myContribution || 0}
      />

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
        groupName={group?.name || ''}
      />
    </div>
  );
};

export default GroupDetails;
