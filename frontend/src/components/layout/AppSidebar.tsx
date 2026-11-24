import React, { useState } from 'react';
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
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { CommandPalette } from '../ui/CommandPalette';

export const AppSidebar: React.FC = () => {
  const { user, organization, currentMembership, memberships, switchOrganization, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const navSections = [
    {
      title: 'Workspace',
      items: [
        { label: 'Overview', path: '/app', icon: LayoutDashboard },
        { label: 'Notifications', path: '/app/notifications', icon: Bell, badge: unreadCount },
        { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'SOP Library', path: '/app/sops', icon: FileText },
        { label: 'Workflows', path: '/app/workflows', icon: Kanban },
      ],
    },
    {
      title: 'Enablement',
      items: [
        { label: 'Training & LMS', path: '/app/training', icon: GraduationCap },
        { label: 'Workshops', path: '/app/workshops', icon: CalendarDays },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Team & Members', path: '/app/teams', icon: Users },
        { label: 'Settings', path: '/app/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-zinc-200/80 bg-white select-none">
        {/* Brand header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-100">
          <Link to="/app" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <Workflow className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              Async<span className="text-blue-600">Flow</span>
            </span>
          </Link>
          <span className="rounded border border-zinc-200/80 bg-zinc-50 px-1.5 py-0.5 font-mono text-[9px] font-medium text-zinc-500">
            PRO
          </span>
        </div>

        {/* Organization Switcher */}
        <div className="relative px-3 pt-3 pb-2">
          <button
            onClick={() => setShowOrgMenu(!showOrgMenu)}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-200/70 bg-zinc-50/70 px-2.5 py-1.5 text-left transition hover:bg-zinc-100/70 hover:border-zinc-300"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-800 text-[10px] font-bold text-white">
                {organization?.name?.[0] || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-900 truncate leading-tight">
                  {organization?.name || 'Acme Global'}
                </p>
                <p className="text-[10px] text-zinc-400 capitalize leading-tight">
                  {currentMembership?.role.replace('_', ' ').toLowerCase() || 'Member'}
                </p>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          </button>

          {/* Org switcher dropdown */}
          {showOrgMenu && (
            <div className="absolute left-3 right-3 top-12 z-20 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-modal animate-in fade-in zoom-in-95">
              <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                Organizations
              </p>
              {memberships.map((mem) => (
                <button
                  key={mem.organizationId}
                  onClick={() => {
                    switchOrganization(mem.organizationId);
                    setShowOrgMenu(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition',
                    mem.organizationId === organization?.id
                      ? 'bg-zinc-100 font-semibold text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  )}
                >
                  <span className="truncate">{mem.organization?.name}</span>
                  <span className="text-[10px] text-zinc-400 capitalize">{mem.role.toLowerCase()}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Search Shortcut button */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-200/70 bg-zinc-50/50 px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-100/70 hover:text-zinc-600 transition"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span className="text-[11px]">Quick search...</span>
            </div>
            <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Nav list with categorized sections */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-1">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-0.5">
              <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {sec.title}
              </p>
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/app'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                        isActive
                          ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-xs'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* System Health / Status row */}
        <div className="px-4 py-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-zinc-500">Async Engine Active</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">v2.4.0</span>
        </div>

        {/* User profile footer */}
        <div className="border-t border-zinc-100 p-3">
          <div className="flex items-center justify-between">
            <Link
              to="/app/profile"
              className="flex items-center gap-2 truncate hover:opacity-80 transition group"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                {user?.firstName?.[0] || 'U'}
                {user?.lastName?.[0] || ''}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-900 truncate leading-tight group-hover:text-blue-600">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-zinc-400 truncate leading-tight">{user?.email}</p>
              </div>
            </Link>
            <button
              onClick={() => logout()}
              title="Log out"
              className="p-1 text-zinc-400 hover:text-rose-600 rounded-md hover:bg-zinc-100 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
