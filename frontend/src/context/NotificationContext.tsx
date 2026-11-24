import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { NotificationItem } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, organization } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const list: any = await api.get('/notifications?limit=15');
      setNotifications(Array.isArray(list) ? list : []);

      const countRes: any = await api.get('/notifications/unread-count');
      setUnreadCount(countRes?.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time socket initialization
  useEffect(() => {
    if (!user) return;

    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      s.emit('join_user', user.id);
      if (organization?.id) {
        s.emit('join_org', organization.id);
      }
    });

    s.on('notification', (newNotif: any) => {
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          organizationId: organization?.id || '',
          userId: user.id,
          type: 'GENERAL',
          title: newNotif.title,
          message: newNotif.message,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setUnreadCount((c) => c + 1);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user, organization?.id]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
