// services/notificationService.js (keep as .js)
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { db } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { showNotificationToast } from '../components/NotificationToast';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.token = null;
    this.userId = null;
    this.permissionStatus = 'default'; // 'default', 'granted', 'denied'
  }

  async initialize() {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
      }

      // Check current permission status
      this.permissionStatus = Notification.permission;
      
      if (this.permissionStatus === 'granted') {
        console.log('Notification permission already granted');
        await this.initializeMessaging();
        return true;
      } else if (this.permissionStatus === 'denied') {
        console.log('Notification permission denied by user');
        return false;
      } else {
        console.log('Notification permission not requested yet');
        return false;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async initializeMessaging() {
    try {
      const { getMessaging } = await import('firebase/messaging');
      this.messaging = getMessaging();
      await this.getFCMToken();
      this.setupMessageListener();
      return true;
    } catch (error) {
      console.error('Error initializing messaging:', error);
      return false;
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus = permission;
      
      if (permission === 'granted') {
        await this.initializeMessaging();
        toast.success('Notifications enabled!', {
          style: {
            background: '#12121A',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px'
          }
        });
        return true;
      } else {
        toast.error('Notifications disabled. You can enable them later in browser settings.', {
          style: {
            background: '#12121A',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px'
          }
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  async getFCMToken() {
    try {
      if (!this.messaging) return null;

      this.token = await getToken(this.messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BMr68bTijDLQsJ0ZxTLObH-Krq5tAhqN8t_bNbyh84R5JhAMAd7JbPzzTnN13UGERzhO_hCk5rGm4-uJeyZ_9aI'
      });
      
      console.log('FCM Token:', this.token);
      
      // Store token in Firestore if user is logged in
      if (this.token && this.userId) {
        await setDoc(doc(db, 'fcmTokens', this.userId), {
          token: this.token,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }, { merge: true });
      }
      
      return this.token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  setupMessageListener() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Received foreground message:', payload);
      
      // Use the imported toast component
      showNotificationToast(payload);

      // Show system notification if app is in background
      if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'TaskFlow', {
          body: payload.notification?.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data: payload.data,
        });
      }
    });
  }

  setUserId(userId) {
    this.userId = userId;
    if (this.token && userId) {
      this.getFCMToken(); // Refresh token with user ID
    }
  }

  async sendTestNotification() {
    if (Notification.permission !== 'granted') {
      toast.error('Please enable notifications first', {
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });
      return;
    }

    // Show local notification for testing
    new Notification('TaskFlow Test', {
      body: 'This is a test notification! Your notifications are working.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'test-notification'
    });

    toast.success('Test notification sent!', {
      duration: 3000,
      style: {
        background: '#12121A',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px'
      }
    });
  }

  getPermissionStatus() {
    return this.permissionStatus;
  }
}

export const notificationService = new NotificationService();