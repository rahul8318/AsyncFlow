import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FolderKanban,
  FileText,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
  Check,
  Award,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DashboardMetrics } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/EmptyState';
import { formatDateTime } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user, organization } = useAuth();
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('');

  const fetchDashboard = async (deptId?: string) => {
    setLoading(true);
    try {
      const url = deptId ? `/analytics/dashboard?departmentId=${deptId}` : '/analytics/dashboard';
      const res: any = await api.get(url);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedDept);
  }, [selectedDept]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar: Operational Welcome & Department Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            Operations Cockpit
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            {organization?.name} • Real-time database telemetry & asynchronous adoption metrics
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-xs shadow-xs">
            <Filter className="h-3 w-3 text-zinc-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent font-medium text-zinc-700 focus:outline-none text-xs"
            >
              <option value="">All Departments</option>
              {data?.departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <Link to="/app/sops/new">
            <Button size="sm" variant="primary" leftIcon={<FileText className="h-3.5 w-3.5" />}>
              Author SOP
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards: High-Density Linear Style */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: Total Employees */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-subtle hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500">Active Roster</span>
              <Users className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-zinc-950 tabular-nums">
                {data?.kpis.totalEmployees || 0}
              </span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                100% active
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Distributed across {data?.kpis.activeTeams || 0} teams
            </p>
          </div>

          {/* Card 2: SOP Compliance Rate */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-subtle hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500">SOP Compliance</span>
              <FileText className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-zinc-950 tabular-nums">
                {data?.kpis.acknowledgementRate || 0}%
              </span>
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
                {data?.kpis.publishedSOPs || 0} SOPs
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              {data?.kpis.pendingAcknowledgements || 0} acknowledgements pending
            </p>
          </div>

          {/* Card 3: Training Completion */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-subtle hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500">LMS Certified Rate</span>
              <GraduationCap className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-zinc-950 tabular-nums">
                {data?.kpis.trainingCompletionRate || 0}%
              </span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                +18% mo/mo
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              {data?.kpis.completedEnrollments || 0} certifications issued
            </p>
          </div>

          {/* Card 4: Async Score */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-subtle hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500">Async Maturity Index</span>
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-blue-600 tabular-nums">
                {data?.kpis.communicationScore || 85}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">/ 100</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              High velocity tier (&gt;80)
            </p>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Main): Operational Pipelines & Department Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Launch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/app/sops"
              className="group rounded-xl border border-zinc-200/80 bg-white p-4 shadow-subtle hover:border-zinc-300 hover:shadow-card transition flex flex-col justify-between"
            >
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 mb-2.5 group-hover:bg-zinc-900 group-hover:text-white transition">
                  <FileText className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-zinc-900">SOP Library</h4>
                <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                  10 core templates, versions & digital signoffs.
                </p>
              </div>
              <span className="mt-3 text-[11px] font-semibold text-zinc-700 flex items-center gap-1 group-hover:text-blue-600">
                Open library <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              to="/app/workflows"
              className="group rounded-xl border border-zinc-200/80 bg-white p-4 shadow-subtle hover:border-zinc-300 hover:shadow-card transition flex flex-col justify-between"
            >
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 mb-2.5 group-hover:bg-zinc-900 group-hover:text-white transition">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-zinc-900">Workflows Kanban</h4>
                <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                  Stage-gated pipelines & approval handoffs.
                </p>
              </div>
              <span className="mt-3 text-[11px] font-semibold text-zinc-700 flex items-center gap-1 group-hover:text-blue-600">
                View boards <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              to="/app/training"
              className="group rounded-xl border border-zinc-200/80 bg-white p-4 shadow-subtle hover:border-zinc-300 hover:shadow-card transition flex flex-col justify-between"
            >
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800 mb-2.5 group-hover:bg-zinc-900 group-hover:text-white transition">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-zinc-900">Continuous LMS</h4>
                <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                  Curriculum, graded quizzes & certificates.
                </p>
              </div>
              <span className="mt-3 text-[11px] font-semibold text-zinc-700 flex items-center gap-1 group-hover:text-blue-600">
                Resume learning <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          {/* Department Breakdown Table */}
          <Card className="rounded-xl border-zinc-200/80 shadow-subtle">
            <CardHeader className="p-4 border-b border-zinc-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-zinc-900">Department Adoption Status</CardTitle>
                <p className="text-[11px] text-zinc-500">Active squads, headcount, and adherence</p>
              </div>
              <Badge variant="neutral">Postgres Aggregation</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100 text-xs">
                {data?.departments?.map((dept) => (
                  <div key={dept.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-50/60 transition">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-zinc-900">{dept.name}</p>
                      <p className="text-[11px] text-zinc-400">{dept.description || 'Functional unit'}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-zinc-500 font-mono text-[11px]">
                        {dept._count?.teams || 0} squads
                      </span>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-700">
                        {dept._count?.members || 0} members
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Organization Activity Log */}
        <div className="space-y-6">
          <Card className="rounded-xl border-zinc-200/80 shadow-subtle">
            <CardHeader className="p-4 border-b border-zinc-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-zinc-900">Audit & Activity Log</CardTitle>
                <p className="text-[11px] text-zinc-500">Immutable event timeline</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100 max-h-[460px] overflow-y-auto">
                {data?.recentActivities && data.recentActivities.length > 0 ? (
                  data.recentActivities.map((act) => (
                    <div key={act.id} className="p-3 flex items-start gap-2.5 text-xs">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white font-bold text-[10px]">
                        {act.user?.firstName?.[0] || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-800 text-[11px] leading-tight">
                          <strong className="font-semibold text-zinc-900">
                            {act.user ? `${act.user.firstName} ${act.user.lastName}` : 'System'}
                          </strong>{' '}
                          performed{' '}
                          <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-1 py-0.2 rounded">
                            {act.action}
                          </span>
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">
                          {formatDateTime(act.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-400">
                    No activity recorded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
