import { useState, useEffect, useCallback } from 'react';
import { Plus, Camera } from 'lucide-react';
import { statusService, Status } from '../../services/statusService';
import StatusViewer from './StatusViewer';
import CreateStatusModal from './CreateStatusModal';
import { useAuth } from '../../contexts/AuthContext';

interface StatusWithUser extends Status {
  isViewed?: boolean;
  isMine?: boolean;
}

const StatusArea: React.FC = () => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<StatusWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatusIndex, setSelectedStatusIndex] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  // Fetch statuses from the API
  const fetchStatuses = useCallback(async () => {
    if (!user?.$id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch statuses from followed users and current user's statuses in parallel
      const [followedStatuses, myStatuses] = await Promise.all([
        statusService.getStatuses(),
        statusService.getMyStatuses(),
      ]);

      // Mark current user's statuses as viewed and add isMine flag
      const myStatusesWithFlag = Array.isArray(myStatuses) ? myStatuses.map(status => ({
        ...status,
        isViewed: true,
        isMine: true,
      })) : [];

      // Mark other users' statuses as viewed or not
      const otherStatuses = Array.isArray(followedStatuses) ? followedStatuses.map(status => ({
        ...status,
        isViewed: status.views?.includes(user?.$id) || false,
        isMine: false,
      })) : [];

      // Combine and sort statuses (my statuses first, then others by most recent)
      const allStatuses = [...myStatusesWithFlag, ...otherStatuses].sort((a, b) => {
        // My statuses first
        if (a.isMine !== b.isMine) return a.isMine ? -1 : 1;
        // Then sort by most recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setStatuses(allStatuses);
    } catch (err: any) {
      console.error('Error fetching statuses:', err);
      setError(err.message || 'Failed to load statuses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const handleStatusClick = (index: number) => {
    setSelectedStatusIndex(index);
  };

  const handleCloseViewer = () => {
    setSelectedStatusIndex(null);
  };

  const handleStatusCreated = useCallback((newStatus: Status) => {
    setStatuses(prev => {
      // Remove any existing status with the same ID to avoid duplicates
      const filtered = prev.filter(s => s.id !== newStatus.id);
      // Add the new status at the beginning
      return [
        { ...newStatus, isMine: true, isViewed: true },
        ...filtered
      ];
    });
    setShowCreateModal(false);
  }, []);

  // Group statuses by user
  const statusesByUser = statuses.reduce<Record<string, StatusWithUser[]>>((acc, status) => {
    if (!acc[status.userId]) {
      acc[status.userId] = [];
    }
    acc[status.userId].push(status);
    return acc;
  }, {});

  // Get the most recent status for each user
  const latestStatuses = Object.values(statusesByUser)
    .map(userStatuses => ({
      ...userStatuses[0], // Most recent status
      unviewedCount: userStatuses.filter(s => !s.isViewed).length,
      totalCount: userStatuses.length,
    }))
    .sort((a, b) => {
      // Sort by unviewed first, then by most recent
      if (a.unviewedCount > 0 && b.unviewedCount === 0) return -1;
      if (b.unviewedCount > 0 && a.unviewedCount === 0) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (isLoading && statuses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 p-4">
        <div className="animate-pulse flex space-x-4 overflow-x-auto py-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mt-2 w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 p-4 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchStatuses}
          className="mt-2 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
        >
          Add to your status
        </button>
      </div>
      
      <div className="flex space-x-4 p-3 overflow-x-auto no-scrollbar">
        {/* My status */}
        <div 
          className="flex flex-col items-center cursor-pointer"
          onClick={() => setShowCreateModal(true)}
        >
          <div className="relative">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {user && (
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              )}
              <div className="absolute -right-1 -bottom-1 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white">
                <Plus className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-center mt-1 text-gray-700 dark:text-gray-300 max-w-[64px] truncate">
              My Status
            </p>
          </div>
        </div>

        {/* Other statuses */}
        {latestStatuses.filter(status => !status.isMine).map((status, index) => (
          <div 
            key={status.id} 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleStatusClick(index)}
          >
            <div className="relative">
              <div className={`w-16 h-16 rounded-full ${status.unviewedCount > 0 ? 'ring-2 ring-purple-500' : ''}`}>
                <img 
                  src={status.avatar || `https://ui-avatars.com/api/?name=${status.username}&background=random`} 
                  alt={status.username} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <p className="text-xs text-center mt-1 text-gray-700 dark:text-gray-300 max-w-[64px] truncate">
                {status.username}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Status Viewer Modal */}
      {selectedStatusIndex !== null && (
        <StatusViewer
          statuses={statuses}
          initialIndex={selectedStatusIndex}
          onClose={handleCloseViewer}
        />
      )}

      {/* Create Status Modal */}
      {showCreateModal && (
        <CreateStatusModal
          onClose={() => setShowCreateModal(false)}
          onStatusCreated={handleStatusCreated}
        />
      )}
    </div>
  );
};

export default StatusArea;
