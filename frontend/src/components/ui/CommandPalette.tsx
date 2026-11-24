import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Kanban,
  GraduationCap,
  Calendar,
  Users,
  BarChart2,
  Plus,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'SOP: Async Communication Policy', category: 'SOPs', path: '/app/sops', icon: FileText },
    { title: 'SOP: Remote Meeting Guidelines (Silent Reading)', category: 'SOPs', path: '/app/sops', icon: FileText },
    { title: 'SOP: Decision-Making Framework (DACI)', category: 'SOPs', path: '/app/sops', icon: FileText },
    { title: 'Workflow: Engineering Onboarding (30 Days)', category: 'Workflows', path: '/app/workflows', icon: Kanban },
    { title: 'Workflow: Weekly Async Retrospective', category: 'Workflows', path: '/app/workflows', icon: Kanban },
    { title: 'Training: Asynchronous Work Mastery', category: 'Training', path: '/app/training', icon: GraduationCap },
    { title: 'Live Workshops & Silent Meeting Labs', category: 'Workshops', path: '/app/workshops', icon: Calendar },
    { title: 'Organizational Member Roster', category: 'Team', path: '/app/teams', icon: Users },
    { title: 'Adoption & Velocity Analytics', category: 'Analytics', path: '/app/analytics', icon: BarChart2 },
  ];

  const actions = [
    { title: 'Author New Standard Operating Procedure', action: () => navigate('/app/sops/new'), icon: Plus },
    { title: 'Create New Kanban Operational Workflow', action: () => navigate('/app/workflows'), icon: Plus },
  ];

  const filteredLinks = query.trim()
    ? quickLinks.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Palette box */}
      <div className="relative w-full max-w-xl rounded-xl border border-zinc-200/90 bg-white shadow-modal overflow-hidden z-10 animate-in fade-in-0 zoom-in-95">
        {/* Search header */}
        <div className="flex items-center px-4 border-b border-zinc-100 bg-white">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, policy, or jump to workflow..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-3.5 text-xs text-zinc-900 placeholder:text-zinc-400 bg-transparent focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {actions.length > 0 && !query && (
            <div>
              <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Actions
              </p>
              <div className="space-y-0.5">
                {actions.map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        act.action();
                        onClose();
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-zinc-800 hover:bg-zinc-100/80 transition text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-50 text-blue-600">
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="font-medium">{act.title}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">Return ↵</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              {query ? 'Matching Results' : 'Quick Navigation'}
            </p>
            <div className="space-y-0.5">
              {filteredLinks.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  No matching policies or workflows found
                </div>
              ) : (
                filteredLinks.map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        navigate(link.path);
                        onClose();
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-zinc-800 hover:bg-zinc-100/80 transition text-left"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{link.title}</span>
                      </div>
                      <span className="text-[10px] font-medium text-zinc-400 shrink-0">
                        {link.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 bg-zinc-50/70 px-4 py-2 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-2">
            <span>AsyncFlow Global Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};
