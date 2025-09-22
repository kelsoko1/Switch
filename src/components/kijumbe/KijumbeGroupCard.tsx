import React from 'react';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { KijumbeGroup } from '../../services/appwrite/groupService';

interface KijumbeGroupCardProps {
  group: KijumbeGroup;
  onClick: () => void;
}

const KijumbeGroupCard: React.FC<KijumbeGroupCardProps> = ({ group, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sw-TZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate next meeting date based on rotation duration
  const getNextMeetingDate = () => {
    const createdDate = new Date(group.created_at);
    const rotationDays = group.rotation_duration || 30;
    const nextMeetingDate = new Date(createdDate);
    nextMeetingDate.setDate(createdDate.getDate() + (rotationDays * group.current_rotation));
    return formatDate(nextMeetingDate.toISOString());
  };

  // Get status color
  const getStatusColor = () => {
    switch (group.status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate total amount in the group
  const getTotalAmount = () => {
    const memberCount = group.members?.length || 0;
    return group.contribution_amount * memberCount;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {group.status === 'active' ? 'Inaendelea' : 
             group.status === 'completed' ? 'Imekamilika' : 'Imesimamishwa'}
          </span>
        </div>
        
        {group.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Wanachama</p>
              <p className="font-medium">{group.members?.length || 0} / {group.max_members}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Mkutano Ujao</p>
              <p className="font-medium text-sm">{getNextMeetingDate()}</p>
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-green-500 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Mchango</p>
              <p className="font-medium">{formatCurrency(group.contribution_amount)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Jumla</p>
              <p className="font-medium">{formatCurrency(getTotalAmount())}</p>
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">Mzunguko wa {group.current_rotation}</p>
            <p className="text-xs font-medium text-gray-700">
              Imeundwa: {formatDate(group.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KijumbeGroupCard;
