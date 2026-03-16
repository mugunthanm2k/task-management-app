// hooks/useOfflineSync.js
import { useEffect, useCallback, useState, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncService } from '../services/syncService';
import { createTask, updateTask, deleteTask } from '../services/taskService';
import toast from 'react-hot-toast';

// ✅ Define the hook
export const useOfflineSync = () => {
  const isOnline = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const syncInProgress = useRef(false);
  const mounted = useRef(true);

  // Check pending changes on mount
  useEffect(() => {
    mounted.current = true;
    checkPendingChanges();
    
    return () => {
      mounted.current = false;
    };
  }, []);

  const checkPendingChanges = async () => {
    try {
      const pending = await syncService.getPendingChanges();
      if (mounted.current) {
        setPendingCount(pending.length);
      }
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

  // Map temp IDs to real Firestore IDs
  const mapTempIdToRealId = async (change, realId) => {
    try {
      const pendingChanges = await syncService.getPendingChanges();
      
      const relatedChanges = pendingChanges.filter(c => 
        c.taskId === change.taskId || 
        (c.data && c.data._tempId === change.taskId)
      );
      
      for (const relatedChange of relatedChanges) {
        if (relatedChange.taskId === change.taskId) {
          relatedChange.taskId = realId;
        }
        if (relatedChange.data && relatedChange.data._tempId) {
          relatedChange.data._tempId = realId;
        }
        await syncService.removePendingChange(relatedChange.id);
        if (relatedChange.id !== change.id) {
          await syncService.addPendingChange(relatedChange);
        }
      }
      
      console.log(`Mapped temp ID ${change.taskId} to real ID ${realId}`);
    } catch (error) {
      console.error('Error mapping temp IDs:', error);
    }
  };

  const syncPendingChanges = useCallback(async () => {
    if (syncInProgress.current || isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    if (!isOnline) {
      console.log('Offline, skipping sync');
      return;
    }

    try {
      syncInProgress.current = true;
      setIsSyncing(true);

      const pendingChanges = await syncService.getPendingChanges();
      
      if (pendingChanges.length === 0) {
        setPendingCount(0);
        return;
      }

      console.log(`Syncing ${pendingChanges.length} pending changes...`);

      const sortedChanges = [...pendingChanges].sort((a, b) => {
        if (a.type === 'CREATE' && b.type !== 'CREATE') return -1;
        if (a.type !== 'CREATE' && b.type === 'CREATE') return 1;
        return (a.timestamp || 0) - (b.timestamp || 0);
      });

      let successCount = 0;
      let failCount = 0;
      const processedIds = new Set();

      for (const change of sortedChanges) {
        if (processedIds.has(change.id)) {
          console.log(`Skipping already processed change ${change.id}`);
          continue;
        }

        if (change.type === 'CREATE' && change.taskId && !change.taskId.startsWith('temp-')) {
          console.log(`CREATE already has real ID ${change.taskId}, skipping`);
          processedIds.add(change.id);
          await syncService.removePendingChange(change.id);
          successCount++;
          continue;
        }

        try {
          console.log(`Processing change:`, change);
          let result;

          switch (change.type) {
            case 'CREATE': {
              const { _tempId, ...taskData } = change.data || {};
              result = await createTask(taskData);
              
              if (result && result.id) {
                await mapTempIdToRealId(change, result.id);
              }
              break;
            }

            case 'UPDATE': {
              if (change.taskId && change.taskId.startsWith('temp-')) {
                console.log(`Skipping update for temp ID ${change.taskId}`);
                continue;
              }
              
              const { _tempId, ...updateData } = change.data || {};
              await updateTask(change.taskId, updateData);
              break;
            }

            case 'DELETE': {
              if (change.taskId && change.taskId.startsWith('temp-')) {
                console.log(`Removing delete for temp ID ${change.taskId}`);
                await syncService.removePendingChange(change.id);
                processedIds.add(change.id);
                successCount++;
                continue;
              }
              
              await deleteTask(change.taskId);
              break;
            }

            default:
              console.warn(`Unknown change type: ${change.type}`);
          }

          processedIds.add(change.id);
          await syncService.removePendingChange(change.id);
          successCount++;

        } catch (error) {
          console.error(`Failed to sync change ${change.id}:`, error);

          if (error.code === 'not-found' || error.message?.includes('No document to update')) {
            console.log(`Document not found for change ${change.id}, removing from queue`);
            await syncService.removePendingChange(change.id);
            processedIds.add(change.id);
            successCount++;
            continue;
          }

          if (error.name === 'ConstraintError' || error.message?.includes('Key already exists')) {
            console.log(`Constraint error for change ${change.id}, removing`);
            await syncService.removePendingChange(change.id);
            processedIds.add(change.id);
            successCount++;
            continue;
          }

          const updatedChange = {
            ...change,
            retryCount: (change.retryCount || 0) + 1,
            lastError: error.message,
            lastAttempt: Date.now()
          };

          if (updatedChange.retryCount >= 3) {
            console.log(`Change ${change.id} failed ${updatedChange.retryCount} times, removing`);
            await syncService.removePendingChange(change.id);
            failCount++;
          } else {
            await syncService.addPendingChange(updatedChange);
            processedIds.add(change.id);
          }
        }
      }

      const remaining = await syncService.getPendingChanges();
      if (mounted.current) {
        setPendingCount(remaining.length);
      }

      if (successCount > 0 && mounted.current) {
        toast.success(`Synced ${successCount} ${successCount === 1 ? 'change' : 'changes'}!`);
      }

      if (failCount > 0 && mounted.current) {
        toast.error(`Failed to sync ${failCount} ${failCount === 1 ? 'change' : 'changes'}.`);
      }

    } catch (error) {
      console.error('Error during sync:', error);
      if (mounted.current) {
        toast.error('Sync failed. Will retry automatically.');
      }
    } finally {
      syncInProgress.current = false;
      if (mounted.current) {
        setIsSyncing(false);
      }
    }
  }, [isOnline, isSyncing]);

  useEffect(() => {
    if (isOnline) {
      const timeoutId = setTimeout(() => {
        syncPendingChanges();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    } else {
      checkPendingChanges();
    }
  }, [isOnline, syncPendingChanges]);

  useEffect(() => {
    if (isOnline) {
      registerSync();
    }
  }, [isOnline, registerSync]);

  const addToSyncQueue = useCallback(async (type, taskId, data) => {
    try {
      const changeId = `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const change = {
        id: changeId,
        type,
        taskId,
        data: data ? { ...data } : null,
        timestamp: Date.now(),
        retryCount: 0
      };

      if (type === 'CREATE' && taskId?.startsWith('temp-')) {
        change.data = {
          ...change.data,
          _tempId: taskId
        };
      }

      await syncService.addPendingChange(change);
      await checkPendingChanges();

      if (!isOnline) {
        toast.success('Change saved offline. Will sync when online.', {
          icon: '📱',
          duration: 3000
        });
      } else {
        setTimeout(() => {
          syncPendingChanges();
        }, 500);
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      toast.error('Failed to save change offline');
    }
  }, [isOnline, syncPendingChanges]);

  const manualSync = useCallback(async () => {
    if (!isOnline) {
      toast.error('You are offline. Cannot sync.');
      return;
    }
    await syncPendingChanges();
  }, [isOnline, syncPendingChanges]);

  // ✅ Return the hook's API
  return {
    addToSyncQueue,
    syncPendingChanges: manualSync,
    pendingCount,
    isSyncing,
    isOnline
  };
};

// ✅ Also provide a default export for flexibility
export default useOfflineSync;
