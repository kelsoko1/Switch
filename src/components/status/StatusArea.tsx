import { useState, useEffect, useCallback } from 'react';
import { Plus, Camera } from 'lucide-react';
import { statusViewService, StatusView } from '../../services/statusService';
import StatusViewer from './StatusViewer';
import CreateStatusModal from './CreateStatusModal';

const StatusArea: React.FC = () => {
  const [statuses, setStatuses] = useState<StatusView[]>([]);
  const [selectedStatusIndex, setSelectedStatusIndex] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatuses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const updates = await statusViewService.getRecentUpdates();
      setStatuses(updates);
    } catch (err) {
      console.error('Error loading statuses:', err);
      setError('Failed to load statuses');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return (
    <div className="p-4">
      {/* Create status button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <Camera className="w-5 h-5 text-purple-600" />
        <span className="text-gray-600">Create Status</span>
        <Plus className="w-5 h-5 text-purple-600" />
      </button>

      {/* Status grid */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {statuses.map((status, index) => (
          <button
            key={status.id}
            onClick={() => setSelectedStatusIndex(index)}
            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            {status.type === 'image' && status.url && (
              <img
                src={status.url}
                alt={status.content}
                className="w-full h-full object-cover"
              />
            )}
            {status.type === 'video' && status.url && (
              <video
                src={status.url}
                className="w-full h-full object-cover"
              />
            )}
            {status.type === 'text' && (
              <div className="w-full h-full bg-purple-100 flex items-center justify-center p-4">
                <p className="text-purple-900 line-clamp-3">{status.content}</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2">
              <div className="text-white text-sm font-medium truncate">
                {status.user.name}
              </div>
            </div>
          </button>
        ))}
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
        <CreateStatusModal
          onClose={() => setShowCreateModal(false)}
          onStatusCreated={handleStatusCreated}
        />
      )}
    </div>
  );
};

export default StatusArea;
