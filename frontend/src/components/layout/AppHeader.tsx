import React, { useState, useEffect } from 'react';
import { Bell, Search, Shield, Clock, Globe, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLocation, Link } from 'react-router-dom';
import { formatDateTime } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { CommandPalette } from '../ui/CommandPalette';

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const { user, currentMembership } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Compute readable breadcrumb title
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/app') return { section: 'Workspace', page: 'Executive Overview' };
    if (path.startsWith('/app/sops')) return { section: 'Operations', page: 'SOP Library & Versioning' };
    if (path.startsWith('/app/workflows')) return { section: 'Operations', page: 'Kanban & Approval Pipelines' };
    if (path.startsWith('/app/training')) return { section: 'Enablement', page: 'Continuous Learning LMS' };
    if (path.startsWith('/app/workshops')) return { section: 'Enablement', page: 'Live Workshops & Labs' };
    if (path.startsWith('/app/teams')) return { section: 'Organization', page: 'Team & Squad Roster' };
    if (path.startsWith('/app/analytics')) return { section: 'Workspace', page: 'Adoption & Velocity Analytics' };
    if (path.startsWith('/app/notifications')) return { section: 'Workspace', page: 'Notification Feed' };
    if (path.startsWith('/app/settings')) return { section: 'Settings', page: 'Organization Settings' };
    if (path.startsWith('/app/profile')) return { section: 'Account', page: 'Personal Profile' };
    return { section: 'Workspace', page: 'Dashboard' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <>
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

      <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-zinc-200/80 bg-white/95 px-6 backdrop-blur-xs select-none">
        {/* Breadcrumb section */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-zinc-400">{breadcrumb.section}</span>
          <span className="text-zinc-300">/</span>
          <span className="font-semibold text-zinc-900">{breadcrumb.page}</span>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          {/* Global timezone indicator for async coordination */}
          <div className="hidden md:flex items-center gap-1.5 rounded-md border border-zinc-200/80 bg-zinc-50/70 px-2.5 py-1 text-[11px] font-mono text-zinc-500">
            <Globe className="h-3 w-3 text-zinc-400" />
            <span>UTC {currentTime.toISOString().slice(11, 16)}</span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-700 font-semibold">{user?.timezone || 'Local'}</span>
          </div>

          {/* Role badge */}
          <Badge variant="neutral" dot className="hidden sm:inline-flex py-1 px-2 text-[10px] uppercase font-mono">
            {currentMembership?.role.replace('_', ' ') || 'EMPLOYEE'}
          </Badge>

          {/* Quick command launcher */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 transition"
          >
            <Search className="h-3.5 w-3.5" />
            <kbd className="hidden sm:inline text-[10px] text-zinc-400 font-mono">⌘K</kbd>
          </button>

          {/* Real-time Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-blue-600" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-10 z-30 w-80 sm:w-96 rounded-xl border border-zinc-200/90 bg-white shadow-modal animate-in fade-in zoom-in-95 overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-100 p-3 bg-zinc-50/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.2 text-[10px] font-bold text-blue-700 border border-blue-200/60">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[11px] font-medium text-blue-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.isRead && markAsRead(n.id)}
                        className={`p-3 transition-colors cursor-pointer text-xs ${
                          !n.isRead ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs ${!n.isRead ? 'font-semibold text-zinc-900' : 'text-zinc-700'}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                          {formatDateTime(n.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-zinc-100 p-2 text-center bg-zinc-50/60">
                  <Link
                    to="/app/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <Link to="/app/profile">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white shadow-xs hover:ring-2 hover:ring-zinc-900/10 transition">
              {user?.firstName?.[0] || 'U'}
              {user?.lastName?.[0] || ''}
            </div>
          </Link>
        </div>
      </header>
    </>
  );
};
