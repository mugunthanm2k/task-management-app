// services/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBEn7uCu7S1kxpO7lj-_nF9xSg-LXMKWUU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "task-58ab0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "task-58ab0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "task-58ab0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "126868244399",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:126868244399:web:cdac1e660b314b2f94915a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize messaging only if supported (to avoid errors in non-supported browsers)
let messaging = null;
export const getMessagingInstance = async () => {
  if (!messaging && await isSupported()) {
    messaging = getMessaging(app);
  }
  return messaging;
};

// Enable offline persistence with better error handling
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.log('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence
    console.log('Persistence not supported in this browser');
  } else {
    console.log('Persistence error:', err);
  }
});

// Export app instance for use in service worker
export default app;