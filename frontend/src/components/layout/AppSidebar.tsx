import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Kanban,
  GraduationCap,
  CalendarDays,
  Users,
  BarChart3,
  Bell,
  Settings,
  Workflow,
  ChevronDown,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export const AppSidebar: React.FC = () => {
  const { user, organization, currentMembership, memberships, switchOrganization, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showOrgMenu, setShowOrgMenu] = React.useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { label: 'SOP Library', path: '/app/sops', icon: FileText },
    { label: 'Workflows', path: '/app/workflows', icon: Kanban },
    { label: 'Training & LMS', path: '/app/training', icon: GraduationCap },
    { label: 'Workshops', path: '/app/workshops', icon: CalendarDays },
    { label: 'Team & Members', path: '/app/teams', icon: Users },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/app/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
        <Link to="/app" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Workflow className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Async<span className="text-blue-600">Flow</span>
          </span>
        </Link>
      </div>

      {/* Organization Switcher */}
      <div className="relative p-4 border-b border-slate-100">
        <button
          onClick={() => setShowOrgMenu(!showOrgMenu)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-left transition hover:bg-slate-100"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {organization?.name || 'Default Organization'}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">
                {currentMembership?.role.replace('_', ' ').toLowerCase() || 'Member'}
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        </button>

        {/* Dropdown Menu */}
        {showOrgMenu && (
          <div className="absolute left-4 right-4 top-16 z-20 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Switch Organization
            </p>
            {memberships.map((mem) => (
              <button
                key={mem.organizationId}
                onClick={() => {
                  switchOrganization(mem.organizationId);
                  setShowOrgMenu(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition',
                  mem.organizationId === organization?.id
                    ? 'bg-blue-50 font-semibold text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <span className="truncate">{mem.organization?.name}</span>
                <span className="text-[10px] text-slate-400 capitalize">{mem.role.toLowerCase()}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <Badge variant="primary" className="h-5 px-1.5 text-[10px]">
                  {item.badge}
                </Badge>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <Link to="/app/profile" className="flex items-center gap-2.5 truncate hover:opacity-80 transition">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {user?.firstName?.[0] || 'U'}
              {user?.lastName?.[0] || ''}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </Link>
          <button
            onClick={() => logout()}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
