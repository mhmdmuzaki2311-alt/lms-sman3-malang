import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socketService';
import { MOCK_NOTIFICATIONS } from '../services/mockData';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNotification = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      addToast(notif);
    };

    socketService.on('notification', handleNotification);
    return () => socketService.off('notification', handleNotification);
  }, []);

  const addToast = (notif) => {
    const toastId = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...notif, toastId }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      removeToast(toastId);
    }, 5000);
  };

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      toasts,
      unreadCount,
      addToast,
      removeToast,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
