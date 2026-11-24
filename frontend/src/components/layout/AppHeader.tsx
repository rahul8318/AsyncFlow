import React, { useState } from 'react';
import { Bell, Search, Shield, Check, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export const AppHeader: React.FC = () => {
  const { user, currentMembership } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur-sm">
      {/* Global quick search bar */}
      <div className="flex w-96 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 transition-colors focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search SOPs, workflows, lessons, or team members..."
          className="ml-2.5 w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Role tag */}
        <Badge variant="primary" className="hidden sm:inline-flex gap-1 py-1 px-2.5">
          <Shield className="h-3 w-3" />
          <span>{currentMembership?.role.replace('_', ' ') || 'EMPLOYEE'}</span>
        </Badge>

        {/* Real-time Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-12 z-30 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className={`p-3.5 transition-colors cursor-pointer ${
                        !n.isRead ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(n.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 p-2.5 text-center bg-slate-50/50">
                <Link
                  to="/app/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <Link to="/app/profile" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm">
            {user?.firstName?.[0] || 'U'}
            {user?.lastName?.[0] || ''}
          </div>
        </Link>
      </div>
    </header>
  );
};
