// public/service-worker.js (extend your existing service worker)
// Add this to your service worker for background sync

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  try {
    // Get pending changes from IndexedDB
    const pendingChanges = await getPendingChanges();
    
    for (const change of pendingChanges) {
      await processChange(change);
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getPendingChanges() {
  // This will be implemented to read from IndexedDB
  return new Promise((resolve) => {
    const request = indexedDB.open('taskflow-sync', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['pendingChanges'], 'readonly');
      const store = transaction.objectStore('pendingChanges');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => resolve([]);
    };
    
    request.onerror = () => resolve([]);
  });
}

async function processChange(change) {
  // Implement API calls here
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(change)
  });
  
  if (response.ok) {
    // Remove from queue
    await removePendingChange(change.id);
  }
}

async function removePendingChange(id) {
  // Implement removing from IndexedDB
}