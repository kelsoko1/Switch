import { useState, useEffect, useCallback } from 'react';
import { Plus, Camera, X } from 'lucide-react';
import { statusViewService, StatusView } from '../../services/statusService';
import StatusViewer from './StatusViewer';
import CreateStatusModalNew from './CreateStatusModalNew';
import { useAuth } from '../../contexts/AuthContext';

const StatusArea: React.FC = () => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<StatusView[]>([]);
  const [myStatuses, setMyStatuses] = useState<StatusView[]>([]);
  const [selectedStatusIndex, setSelectedStatusIndex] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStatusVisible, setIsStatusVisible] = useState(true);

  const loadStatuses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const updates = await statusViewService.getRecentUpdates();
      
      // Separate my statuses from others
      if (user) {
        const mine = updates.filter(s => s.user.id === user.$id);
        const others = updates.filter(s => s.user.id !== user.$id);
        setMyStatuses(mine);
        setStatuses(others);
      } else {
        setStatuses(updates);
      }
    } catch (err) {
      console.error('Error loading statuses:', err);
      setError('Failed to load statuses');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const handleStatusCreated = (status: StatusView) => {
    setStatuses(prev => [status, ...prev]);
    setShowCreateModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Don't render if status is hidden
  if (!isStatusVisible) {
    return null;
  }

  return (
    <>
      {/* YouTube-Style Horizontal Scrolling Status Bar */}
      <div className="border-b border-gray-200 bg-white">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Status Updates</h2>
              <button
                onClick={() => setIsStatusVisible(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close status section"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Horizontal scrolling container */}
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* My Status - Always first */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex-shrink-0 group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      {myStatuses.length > 0 ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-teal-500 p-1 bg-white">
                          <div className="w-full h-full rounded-full overflow-hidden">
                            {myStatuses[0].type === 'image' && myStatuses[0].url && (
                              <img src={myStatuses[0].url} alt="My status" className="w-full h-full object-cover" />
                            )}
                            {myStatuses[0].type === 'text' && (
                              <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{myStatuses[0].content.slice(0, 2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-gray-300">
                          <Camera className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-7 h-7 bg-teal-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900 max-w-[80px] truncate">Your Status</p>
                      <p className="text-xs text-gray-500">
                        {myStatuses.length > 0 ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''}` : 'Add'}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Other Users' Statuses */}
                {statuses.map((status, index) => (
                  <button
                    key={status.id}
                    onClick={() => setSelectedStatusIndex(index)}
                    className="flex-shrink-0 group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-teal-500 p-1 bg-white transition-transform group-hover:scale-105">
                          <div className="w-full h-full rounded-full overflow-hidden">
                            {status.type === 'image' && status.url && (
                              <img src={status.url} alt={status.content} className="w-full h-full object-cover" />
                            )}
                            {status.type === 'video' && status.url && (
                              <video src={status.url} className="w-full h-full object-cover" />
                            )}
                            {status.type === 'text' && (
                              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{status.content.slice(0, 2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-900 max-w-[80px] truncate">{status.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(status.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Status viewer modal */}
      {selectedStatusIndex !== null && (
        <StatusViewer
          statuses={statuses}
          initialIndex={selectedStatusIndex}
          onClose={() => setSelectedStatusIndex(null)}
        />
      )}

      {/* Create status modal */}
      {showCreateModal && (
        <CreateStatusModalNew
          onClose={() => setShowCreateModal(false)}
          onStatusCreated={handleStatusCreated}
        />
      )}
    </>
  );
};

export default StatusArea;
