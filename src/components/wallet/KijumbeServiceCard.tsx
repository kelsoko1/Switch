import React, { useState, useEffect } from 'react';
import { appwrite, COLLECTIONS } from '../../lib/appwrite';
import { Query } from 'appwrite';
import {
  Users,
  Target,
  Plus,
  Crown,
  TrendingUp,
  ArrowRight,
  Eye,
  EyeOff,
  Settings,
  History
} from 'lucide-react';

interface Wallet {
  $id: string;
  userId: string;
  balance: number;
  pin_set: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  createdAt: string;
  updatedAt: string;
}

interface SavingsGoal {
  $id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string;
  status: 'active' | 'completed';
  createdAt: string;
}

interface Group {
  $id: string;
  kiongoziId: string;
  name: string;
  description: string;
  contributionAmount: number;
  cycleDuration: number;
  maxMembers: number;
  currentMembers: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

interface KijumbeServiceCardProps {
  wallet: Wallet | null;
  onTransaction: () => void;
}

const KijumbeServiceCard: React.FC<KijumbeServiceCardProps> = ({ wallet, onTransaction }) => {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wallet) {
      fetchKijumbeData();
    }
  }, [wallet]);

  const fetchKijumbeData = async () => {
    if (!wallet) return;
    
    setError(null);
    setLoading(true);
    
    try {
      // Fetch savings goals
      const goalsResponse = await appwrite.listDocuments(COLLECTIONS.SAVINGS_GOALS, [
        Query.equal('userId', wallet.userId),
        Query.orderDesc('createdAt')
      ]);
      setSavingsGoals(goalsResponse.documents as SavingsGoal[]);

      // Fetch groups (both as member and kiongozi)
      const groupsResponse = await appwrite.listDocuments(COLLECTIONS.GROUPS, [
        Query.equal('kiongoziId', wallet.userId),
        Query.orderDesc('createdAt')
      ]);
      setGroups(groupsResponse.documents as Group[]);

    } catch (err: any) {
      console.error('Failed to fetch Kijumbe data:', err);
      setError(err.message || 'Failed to load Kijumbe data.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateGoal = () => {
    // TODO: Implement create savings goal modal
    console.log('Create savings goal');
  };

  const handleJoinGroup = () => {
    // TODO: Implement join group modal
    console.log('Join group');
  };

  const handleCreateGroup = () => {
    // TODO: Implement create group modal
    console.log('Create group');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Kijumbe Savings</h3>
              <p className="text-sm opacity-90">Rotational savings & group contributions</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Kijumbe Savings</h3>
            <p className="text-sm opacity-90">Rotational savings & group contributions</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-300 rounded-full"></div>
            <span className="text-sm">Active</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{savingsGoals.length}</p>
            <p className="text-sm text-gray-500">Savings Goals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{groups.length}</p>
            <p className="text-sm text-gray-500">Groups Managed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
            </p>
            <p className="text-sm text-gray-500">Total Saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {groups.reduce((sum, group) => sum + group.currentMembers, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Members</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <button 
            onClick={handleCreateGoal}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Target className="h-5 w-5" />
            <span>Create Goal</span>
          </button>
          <button 
            onClick={handleJoinGroup}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span>Join Group</span>
          </button>
          <button 
            onClick={handleCreateGroup}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Crown className="h-5 w-5" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Active Savings Goals */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Active Savings Goals</h4>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All
            </button>
          </div>
          {savingsGoals.length > 0 ? (
            <div className="space-y-3">
              {savingsGoals.slice(0, 3).map((goal) => (
                <div key={goal.$id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-800">{goal.name}</p>
                    <p className="text-sm text-green-600 font-semibold">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">Due: {formatDate(goal.dueDate)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No savings goals yet</p>
            </div>
          )}
        </div>

        {/* Managed Groups */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Managed Groups</h4>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All
            </button>
          </div>
          {groups.length > 0 ? (
            <div className="space-y-3">
              {groups.slice(0, 2).map((group) => (
                <div key={group.$id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900">{group.name}</h5>
                      <p className="text-sm text-gray-600">{group.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      group.status === 'active' ? 'bg-green-100 text-green-800' : 
                      group.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {group.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {group.currentMembers}/{group.maxMembers} members
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(group.contributionAmount)}/cycle
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No groups managed yet</p>
            </div>
          )}
        </div>

        {/* Service Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Money to Kijumbe</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Settings className="h-4 w-4" />
            </button>
            <button className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <History className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KijumbeServiceCard;
