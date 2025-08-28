import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Calendar, DollarSign, User, Phone, Mail, MapPin, ArrowLeft } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import api from '../services/api';

const GroupDetails = () => {
  const { groupId } = useParams();
  const { user } = useAuthStore();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const [groupResponse, membersResponse] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/members/group/${groupId}`)
      ]);
      
      setGroup(groupResponse.data.group);
      setMembers(membersResponse.data.members || []);
    } catch (error) {
      setError('Failed to fetch group details');
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'kiongozi': return 'bg-purple-100 text-purple-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Group not found'}</p>
          <Link
            to="/groups"
            className="mt-2 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/groups"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Groups
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600 mt-2">Group ID: {group.$id}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(group.status)}`}>
            {group.status}
          </span>
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">{members.length} / {group.max_members}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Rotation</p>
              <p className="text-2xl font-bold text-gray-900">{group.rotation_duration} months</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Contribution</p>
              <p className="text-2xl font-bold text-gray-900">TZS {group.contribution_amount?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Details */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Group Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
              <p className="text-gray-900">{new Date(group.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Current Rotation</h3>
              <p className="text-gray-900">{group.current_rotation || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Group Members</h2>
        </div>
        <div className="p-6">
          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No members yet</p>
          ) : (
            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={member.$id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {member.phone}
                        </span>
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">#{member.member_number}</p>
                    <p className="text-xs text-gray-500">Rotation: {member.rotation_order}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
