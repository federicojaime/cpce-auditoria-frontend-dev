import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationsContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar notificaciones del localStorage al iniciar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('cpce_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (e) {
        console.error('Error parsing notifications:', e);
      }
    }
  }, []);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('cpce_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('cpce_notifications');
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
