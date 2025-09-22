import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, Check, UserPlus, Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../contexts/AuthContext';
import InviteMemberModal from './InviteMemberModal';
import ContributeModal from './ContributeModal';

// Define the KijumbeGroup interface for this component
interface KijumbeGroup {
  $id: string;
  name: string;
  description: string;
  kiongozi_id: string;
  max_members: number;
  rotation_duration: number;
  contribution_amount: number;
  status: 'active' | 'inactive' | 'completed';
  current_rotation: number;
  created_at: string;
  members: number;
  totalAmount: number;
  myContribution: number;
  myLoans: number;
  nextMeeting: string;
  _originalMembers?: any[];
  _originalContributions?: any[];
  _originalPayments?: any[];
}

interface GroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: KijumbeGroup | null;
  onContribute: (amount: number, description: string) => Promise<void>;
  onInviteMember: (email: string, phone: string, message: string) => Promise<void>;
  onDeleteGroup: () => Promise<void>;
  onEditGroup: () => void;
  balance: number;
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  group,
  onContribute,
  onInviteMember,
  onDeleteGroup,
  onEditGroup,
  balance
}) => {
  const { user } = useAuth();
  // State for modals and notifications
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isKiongozi = group?.kiongozi_id === user?.$id;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sw-TZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeleteGroup = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }
    
    // Show loading state via error/success messages
    setError('');
    setSuccess('Inafuta kikundi...');
    
    try {
      await onDeleteGroup();
      setSuccess('Kikundi kimefutwa');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Imeshindwa kufuta kikundi');
      setSuccess('');
    }
  };

  const handleContribute = async (amount: number, description: string) => {
    await onContribute(amount, description);
    setShowContributeModal(false);
  };

  const handleInvite = async (email: string, phone: string, message: string) => {
    await onInviteMember(email, phone, message);
    setShowInviteModal(false);
  };

  if (!isOpen || !group) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Group Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kiongozi</p>
                  <p className="font-medium">
                    {group._originalMembers?.find((m: any) => m.user_id === group.kiongozi_id)?.user?.name || 'Kiongozi'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tarehe ya Kuundwa</p>
                  <p className="font-medium">{formatDate(group.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mchango</p>
                  <p className="font-medium">{formatCurrency(group.contribution_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mzunguko wa Sasa</p>
                  <p className="font-medium">{group.current_rotation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Wanachama</p>
                  <p className="font-medium">{group.members} / {group.max_members}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hali</p>
                  <p className={`font-medium ${
                    group.status === 'active' ? 'text-green-600' : 
                    group.status === 'completed' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {group.status === 'active' ? 'Inaendelea' : 
                     group.status === 'completed' ? 'Imekamilika' : 'Imesimamishwa'}
                  </p>
                </div>
              </div>
              {group.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Maelezo</p>
                  <p className="text-gray-700">{group.description}</p>
                </div>
              )}
            </div>

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Wanachama</h3>
                {isKiongozi && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center text-sm text-red-600 hover:text-red-700"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Alika Mwanachama
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                {group._originalMembers && group._originalMembers.length > 0 ? (
                  group._originalMembers.map((member: any) => (
                    <div key={member.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3">
                          {member.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.user?.name || 'Mwanachama'}</p>
                          <p className="text-xs text-gray-500">
                            {member.role === 'kiongozi' ? 'Kiongozi' : `Nafasi ya ${member.rotation_position}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Alijiunga</p>
                        <p className="text-sm">{formatDate(member.joined_at)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Hakuna wanachama bado</p>
                )}
              </div>
            </div>

            {/* Contributions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Michango</h3>
                <button
                  onClick={() => setShowContributeModal(true)}
                  className="flex items-center text-sm text-green-600 hover:text-green-700"
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Weka Mchango
                </button>
              </div>
              
              <div className="space-y-2">
                {group._originalContributions && group._originalContributions.length > 0 ? (
                  group._originalContributions
                    .filter((contrib: any) => contrib.user_id === user?.$id)
                    .slice(0, 5)
                    .map((contrib: any) => (
                      <div key={contrib.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Mchango wa Mzunguko {contrib.rotation}</p>
                          <p className="text-xs text-gray-500">{formatDate(contrib.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${contrib.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                            {formatCurrency(contrib.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {contrib.status === 'completed' ? 'Imekamilika' : 'Inasubiri'}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Hakuna michango bado</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowContributeModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Weka Mchango
              </button>
              
              {isKiongozi && (
                <>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Alika Mwanachama
                  </button>
                  
                  <button
                    onClick={onEditGroup}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Hariri Kikundi
                  </button>
                  
                  <button
                    onClick={handleDeleteGroup}
                    className={`px-4 py-2 ${showConfirmDelete ? 'bg-red-600' : 'bg-red-500'} text-white rounded-lg hover:bg-red-600 transition-colors flex items-center`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {showConfirmDelete ? 'Thibitisha Kufuta' : 'Futa Kikundi'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nested Modals */}
      {showInviteModal && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          groupName={group.name}
        />
      )}
      
      {showContributeModal && (
        <ContributeModal
          isOpen={showContributeModal}
          onClose={() => setShowContributeModal(false)}
          onContribute={handleContribute}
          groupName={group.name}
          contributionAmount={group.contribution_amount}
          balance={balance}
        />
      )}
    </>
  );
};

export default GroupDetailsModal;
