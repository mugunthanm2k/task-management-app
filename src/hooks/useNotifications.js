// hooks/useNotifications.js
import { useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && 'Notification' in window) {
      notificationService.setUserId(user.uid);
      
      // Only initialize if permission is already granted
      if (Notification.permission === 'granted') {
        notificationService.initialize();
      }
    }
  }, [user]);

  const sendTestNotification = () => {
    if (Notification.permission !== 'granted') {
      toast.error('Notifications are not enabled', {
        style: {
          background: '#12121A',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px'
        }
      });
      return;
    }
    notificationService.sendTestNotification();
  };

  const requestPermission = async () => {
    if (Notification.permission === 'denied') {
      toast.error(
        'Notifications are blocked. Please unblock them in your browser settings.',
        {
          duration: 6000,
          style: {
            background: '#12121A',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px'
          },
          icon: '🔒'
        }
      );
      return false;
    }
    
    return notificationService.requestPermission();
  };

  const getPermissionStatus = () => {
    return notificationService.getPermissionStatus();
  };

  return { 
    sendTestNotification, 
    requestPermission,
    getPermissionStatus,
    isSupported: 'Notification' in window,
    permission: Notification.permission
  };
};