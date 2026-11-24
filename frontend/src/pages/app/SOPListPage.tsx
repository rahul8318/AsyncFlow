import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Shield,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { SOP, SOPCategory } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const SOPListPage: React.FC = () => {
  const { currentMembership } = useAuth();
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [assignedToMe, setAssignedToMe] = useState(false);

  const fetchSOPs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (assignedToMe) params.append('assignedToMe', 'true');

      const res: any = await api.get(`/sops?${params.toString()}`);
      setSops(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load SOPs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOPs();
  }, [category, assignedToMe]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSOPs();
  };

  const categories = [
    { label: 'All Protocols', value: '' },
    { label: 'Policy', value: 'POLICY' },
    { label: 'Communication', value: 'COMMUNICATION' },
    { label: 'Meeting', value: 'MEETING' },
    { label: 'Escalation', value: 'ESCALATION' },
  ];

  const canCreate =
    currentMembership?.role === 'ORG_ADMIN' ||
    currentMembership?.role === 'TEAM_MANAGER' ||
    currentMembership?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            Standard Operating Procedures
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Enterprise operating policies, communication protocols, and decision-making frameworks.
          </p>
        </div>

        {canCreate && (
          <Link to="/app/sops/new">
            <Button size="sm" variant="primary" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Author New SOP
            </Button>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-zinc-200/80 shadow-subtle">
        {/* Categories Tab Pill */}
        <div className="flex flex-wrap gap-1 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                category === cat.value
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Assigned to me toggle */}
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={assignedToMe}
              onChange={(e) => setAssignedToMe(e.target.checked)}
              className="rounded text-zinc-900 focus:ring-zinc-900 h-3.5 w-3.5"
            />
            <span>Assigned to me</span>
          </label>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search protocols..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 pl-8 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
          </form>
        </div>
      </div>

      {/* SOPs Data Table (Clean, Pro SaaS Style) */}
      <div className="rounded-xl border border-zinc-200/80 bg-white overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : sops.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-zinc-400" />}
            title="No SOPs found"
            description="Adjust your search filters or author an operating procedure for your team."
            actionLabel={canCreate ? 'Author SOP' : undefined}
            onAction={canCreate ? () => window.location.assign('/app/sops/new') : undefined}
          />
        ) : (
          <div className="divide-y divide-zinc-100 text-xs">
            {sops.map((sop) => (
              <Link
                key={sop.id}
                to={`/app/sops/${sop.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-50/70 transition-colors gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                      {sop.title}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      v{sop.currentVersionNumber}.0
                    </span>
                    <Badge variant="neutral" className="text-[10px]">
                      {sop.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 leading-relaxed">
                    {sop.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs">
                  {sop.isAcknowledgedByMe ? (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 text-[11px]">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Acknowledged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 text-[11px]">
                      <AlertCircle className="h-3 w-3 text-amber-600" /> Signoff Pending
                    </span>
                  )}

                  <span className="text-[11px] text-zinc-400 font-mono hidden md:inline">
                    Updated {formatDate(sop.updatedAt)}
                  </span>

                  <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
