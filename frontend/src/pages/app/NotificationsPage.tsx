import React from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDateTime } from '../../lib/utils';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Notification Center
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Real-time notifications for SOP assignments, workflow approvals, and event reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => markAllAsRead()}
            leftIcon={<CheckCheck className="h-3.5 w-3.5 text-zinc-600" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center text-xs font-mono text-zinc-400">
            All notifications read. No pending alerts.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
              className={`rounded-xl border p-4 transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                !notif.isRead
                  ? 'border-zinc-900 bg-zinc-50/60 shadow-sm'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50/50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs ${!notif.isRead ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'}`}>
                    {notif.title}
                  </h4>
                  {!notif.isRead && (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                  {notif.message}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-zinc-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatDateTime(notif.createdAt)}</span>
                </div>
              </div>

              {notif.linkUrl && (
                <Link
                  to={notif.linkUrl}
                  className="rounded-md border border-zinc-200 bg-white p-1.5 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition-colors shrink-0"
                  title="Open notification link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
