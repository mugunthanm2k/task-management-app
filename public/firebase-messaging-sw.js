// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyBEn7uCu7S1kxpO7lj-_nF9xSg-LXMKWUU",
  authDomain: "task-58ab0.firebaseapp.com",
  projectId: "task-58ab0",
  storageBucket: "task-58ab0.firebasestorage.app",
  messagingSenderId: "126868244399",
  appId: "1:126868244399:web:cdac1e660b314b2f94915a"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'TaskFlow';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ],
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // If already open, focus
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        return clients.openWindow('/dashboard');
      })
    );
  }
});

// Handle push events directly (fallback)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.notification?.body || 'New notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.data,
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'close', title: 'Close' }
      ]
    };
    event.waitUntil(
      self.registration.showNotification(data.notification?.title || 'TaskFlow', options)
    );
  }
});