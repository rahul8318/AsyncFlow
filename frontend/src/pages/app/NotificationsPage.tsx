import React from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { formatDateTime } from '../../lib/utils';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notification Center
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time notifications for SOP assignments, workflow approvals, and workshop reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => markAllAsRead()}
            leftIcon={<CheckCheck className="h-4 w-4 text-blue-600" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-400">
            You are all caught up! No notifications.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
              className={`rounded-2xl border p-4 sm:p-5 transition flex items-start justify-between gap-4 cursor-pointer ${
                !notif.isRead
                  ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50/60 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {notif.title}
                  </h4>
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  {notif.message}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(notif.createdAt)}
                </p>
              </div>

              {notif.linkUrl && (
                <Link
                  to={notif.linkUrl}
                  className="rounded-lg p-2 text-slate-400 hover:text-blue-600 hover:bg-white transition"
                  title="Go to resource"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
