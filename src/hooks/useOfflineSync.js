// hooks/useOfflineSync.js
import { useEffect, useCallback, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncService } from '../services/syncService';
import { updateTask, deleteTask, createTask } from '../services/taskService';
import toast from 'react-hot-toast';

export const useOfflineSync = () => {
  const isOnline = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Check pending changes on mount and when online status changes
  useEffect(() => {
    checkPendingChanges();
  }, []);

  const checkPendingChanges = async () => {
    try {
      const pending = await syncService.getPendingChanges();
      setPendingCount(pending.length);
    } catch (error) {
      console.error('Error checking pending changes:', error);
    }
  };

  const registerSync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-tasks');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }, []);

  const syncPendingChanges = useCallback(async () => {
    if (isSyncing) return;
    
    try {
      const pendingChanges = await syncService.getPendingChanges();
      
      if (pendingChanges.length === 0) {
        setPendingCount(0);
        return;
      }

      console.log(`Syncing ${pendingChanges.length} pending changes...`);
      setIsSyncing(true);
      
      let successCount = 0;
      let failCount = 0;

      for (const change of pendingChanges) {
        try {
          switch (change.type) {
            case 'CREATE':
              await createTask(change.data);
              break;
            case 'UPDATE':
              await updateTask(change.taskId, change.data);
              break;
            case 'DELETE':
              await deleteTask(change.taskId);
              break;
          }
          
          await syncService.removePendingChange(change.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync change ${change.id}:`, error);
          
          // Increment retry count
          change.retryCount = (change.retryCount || 0) + 1;
          
          // If failed too many times (5), remove it to prevent infinite retries
          if (change.retryCount >= 5) {
            await syncService.removePendingChange(change.id);
            failCount++;
          } else {
            // Update the change with new retry count
            await syncService.addPendingChange(change);
          }
        }
      }

      // Update pending count
      const remaining = await syncService.getPendingChanges();
      setPendingCount(remaining.length);

      // Show appropriate messages
      if (successCount > 0) {
        toast.success(`Synced ${successCount} ${successCount === 1 ? 'change' : 'changes'}!`, {
          style: {
            background: '#12121A',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px'
          }
        });
      }
      
      if (failCount > 0) {
        toast.error(`Failed to sync ${failCount} ${failCount === 1 ? 'change' : 'changes'}. They will be retried later.`, {
          style: {
            background: '#12121A',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px'
          }
        });
      }

    } catch (error) {
      console.error('Error during sync:', error);
      toast.error('Sync failed. Will retry automatically.', {
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline) {
      syncPendingChanges();
    } else {
      // Check pending count when going offline
      checkPendingChanges();
    }
  }, [isOnline, syncPendingChanges]);

  // Register background sync
  useEffect(() => {
    if (isOnline) {
      registerSync();
    }
  }, [isOnline, registerSync]);

  const addToSyncQueue = useCallback(async (type, taskId, data) => {
    try {
      await syncService.addPendingChange({ type, taskId, data, timestamp: Date.now() });
      await checkPendingChanges();
      
      if (!isOnline) {
        toast.success('Change saved offline. Will sync when online.', {
          icon: '📱',
          style: {
            background: '#12121A',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px'
          }
        });
      } else {
        // Try to sync immediately if online
        await syncPendingChanges();
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      toast.error('Failed to save change offline', {
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });
    }
  }, [isOnline, syncPendingChanges]);

  // Manual sync function
  const manualSync = useCallback(async () => {
    if (!isOnline) {
      toast.error('You are offline. Cannot sync.', {
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });
      return;
    }
    
    await syncPendingChanges();
  }, [isOnline, syncPendingChanges]);

  return { 
    addToSyncQueue, 
    syncPendingChanges: manualSync,
    pendingCount,
    isSyncing,
    isOnline
  };
};