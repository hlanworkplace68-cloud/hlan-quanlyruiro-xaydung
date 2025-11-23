'use client';

import React, { useState, useEffect } from 'react';
import { AppNotification } from '@/types';
import { Bell, X, Check } from 'lucide-react';
import { NotificationService } from '@/services/NotificationService';
import { useAuth } from '@/context/AuthContext';

interface NotificationCenterProps {
  onNotificationsLoad?: (count: number) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNotificationsLoad }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications
  useEffect(() => {
    if (!user) return;
    
    const loadNotifications = () => {
      const allNotifications = NotificationService.getUserNotifications(user.id);
      setNotifications(allNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
      
      const unread = NotificationService.getUnreadCount(user.id);
      setUnreadCount(unread);
      onNotificationsLoad?.(unread);
    };

    loadNotifications();

    // Refresh every 3 seconds
    const interval = setInterval(loadNotifications, 3000);
    return () => clearInterval(interval);
  }, [user, onNotificationsLoad]);

  const handleMarkAsRead = (id: string): void => {
    NotificationService.markAsRead(id);
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleMarkAllAsRead = (): void => {
    NotificationService.markAllAsRead(user?.id || '');
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDelete = (id: string): void => {
    NotificationService.deleteNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'alert': return 'bg-orange-50 border-orange-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'alert': return '🔔';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
        title="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-2xl z-50 border border-slate-200">
          {/* Header */}
          <div className="border-b border-slate-200 p-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h3 className="font-bold text-slate-800">Thông báo</h3>
              <p className="text-sm text-slate-600">{unreadCount} chưa đọc</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Đánh dấu tất cả
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>Không có thông báo</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getTypeColor(notification.type)} ${
                      !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                    } transition hover:bg-opacity-100 cursor-pointer`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getTypeIcon(notification.type)}</span>
                          <h4 className="font-semibold text-slate-800 text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="Đánh dấu đã đọc"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                          title="Xóa"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
