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
    { label: 'All SOPs', value: '' },
    { label: 'Policies', value: 'POLICY' },
    { label: 'Communication', value: 'COMMUNICATION' },
    { label: 'Meetings', value: 'MEETING' },
    { label: 'Escalation', value: 'ESCALATION' },
  ];

  const canCreate =
    currentMembership?.role === 'ORG_ADMIN' ||
    currentMembership?.role === 'TEAM_MANAGER' ||
    currentMembership?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Standard Operating Procedures (SOPs)
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enterprise asynchronous policies, meeting protocols, and decision frameworks.
          </p>
        </div>

        {canCreate && (
          <Link to="/app/sops/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Author New SOP</Button>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Categories Tab Pill */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                category === cat.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Assigned to me toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={assignedToMe}
              onChange={(e) => setAssignedToMe(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Assigned to me</span>
          </label>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 pl-8 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </form>
        </div>
      </div>

      {/* SOPs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : sops.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-10 w-10 text-slate-400" />}
          title="No SOPs found"
          description="Try adjusting your filter criteria or author a new operating policy for your team."
          actionLabel={canCreate ? 'Create First SOP' : undefined}
          onAction={canCreate ? () => window.location.assign('/app/sops/new') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sops.map((sop) => (
            <Link
              key={sop.id}
              to={`/app/sops/${sop.id}`}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {sop.category.toLowerCase()}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400">
                      v{sop.currentVersionNumber}
                    </span>
                    {sop.isAcknowledgedByMe ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertCircle className="h-3.5 w-3.5" /> Pending Signoff
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {sop.title}
                </h3>

                <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {sop.summary}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {sop.createdBy?.firstName} {sop.createdBy?.lastName}</span>
                <span className="flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  Read SOP <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
