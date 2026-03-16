// components/SyncStatus.jsx
import { FiRefreshCw, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useOfflineSync } from '../hooks/useOfflineSync';

const SyncStatus = () => {
  const { pendingCount, isSyncing, isOnline, syncPendingChanges } = useOfflineSync();

  if (pendingCount === 0 && isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-[#12121A] border border-white/8 rounded-lg shadow-lg p-3 flex items-center gap-3">
        {!isOnline ? (
          <>
            <FiWifiOff className="text-red-500" />
            <span className="text-sm text-gray-300">Offline</span>
          </>
        ) : (
          <>
            {isSyncing ? (
              <FiRefreshCw className="text-purple-400 animate-spin" />
            ) : (
              <FiWifi className="text-green-500" />
            )}
            <span className="text-sm text-gray-300">
              {pendingCount} {pendingCount === 1 ? 'change' : 'changes'} pending
            </span>
            {pendingCount > 0 && !isSyncing && (
              <button
                onClick={syncPendingChanges}
                className="ml-2 text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
              >
                Sync now
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SyncStatus;