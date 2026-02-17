import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  orderId?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  toasts: Toast[];
  pushPermission: NotificationPermission | 'default';
  setNotificationForOrder: (orderId: string, title: string, message: string) => void;
  removeNotificationForOrder: (orderId: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  requestPushPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'default'>('default');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('flashpizza_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: Notification) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
    
    // Check push permission
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('flashpizza_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // THE ONLY WAY TO SET A NOTIFICATION FOR AN ORDER
  // This REPLACES any existing notification for the same orderId
  const setNotificationForOrder = useCallback((orderId: string, title: string, message: string) => {
    setNotifications(prev => {
      // Remove any existing notification for this order
      const filtered = prev.filter(n => n.orderId !== orderId);
      
      // Add the new notification
      const newNotification: Notification = {
        id: `notif_${orderId}_${Date.now()}`,
        type: 'order',
        title,
        message,
        timestamp: new Date(),
        read: false,
        orderId,
      };
      
      return [newNotification, ...filtered];
    });
  }, []);

  // Remove notification for an order (when completed)
  const removeNotificationForOrder = useCallback((orderId: string) => {
    setNotifications(prev => prev.filter(n => n.orderId !== orderId));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const requestPushPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toasts,
      pushPermission,
      setNotificationForOrder,
      removeNotificationForOrder,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications,
      showToast,
      removeToast,
      requestPushPermission,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
