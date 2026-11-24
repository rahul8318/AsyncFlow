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
  Sparkles,
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {organization?.name} • Asynchronous Operations Command Center
          </p>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
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
            <Button size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>
              Create SOP
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">Total Employees</p>
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {data?.kpis.totalEmployees || 0}
              </h3>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                {data?.kpis.activeTeams || 0} active squads
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">Published SOPs</p>
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {data?.kpis.publishedSOPs || 0}
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                {data?.kpis.acknowledgementRate || 0}% acknowledged
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">Training Completion</p>
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <GraduationCap className="h-4 w-4" />
                </div>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {data?.kpis.trainingCompletionRate || 0}%
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                {data?.kpis.completedEnrollments || 0} certificates awarded
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">Pending Actions</p>
                <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {data?.kpis.pendingAcknowledgements || 0}
              </h3>
              <p className="mt-1 text-[11px] text-amber-700 font-medium">
                Pending SOP sign-offs
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Operations Effectiveness Index & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gauge card */}
        <Card className="md:col-span-1 rounded-2xl border-slate-200/80 p-6 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Async Maturity Index
              </span>
              <Sparkles className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-white">
                {data?.kpis.communicationScore || 85}
              </span>
              <span className="text-slate-400 text-sm">/ 100</span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Calculated from active SOP compliance, verified training passing rates, and timely async handover updates.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
            <span>Status: <strong className="text-emerald-400">High Velocity</strong></span>
            <Link to="/app/analytics" className="text-blue-400 hover:text-blue-300 hover:underline">
              View breakdown →
            </Link>
          </div>
        </Card>

        {/* Quick Launchpad */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/app/sops"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Review SOP Library</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Read, comment, and sign off on core async communication protocols.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-blue-600 flex items-center gap-1">
              Explore library <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            to="/app/workflows"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition">
                <FolderKanban className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Manage Workflows</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Track onboarding, incident escalations, and cross-team approval tickets.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-indigo-600 flex items-center gap-1">
              Open boards <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            to="/app/training"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">LMS & Quizzing</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Complete self-guided remote modules and earn certified badges.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              Start learning <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Activity Timeline & Department Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <Card className="md:col-span-2 rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900">
              Recent Organization Activity Log
            </CardTitle>
            <Badge variant="secondary">Live Database Audit</Badge>
          </CardHeader>
          <CardContent className="p-5">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {data.recentActivities.map((act) => (
                  <div key={act.id} className="py-3 flex items-start gap-3 text-xs">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[10px]">
                      {act.user?.firstName?.[0] || 'A'}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800">
                        <strong className="font-semibold text-slate-900">
                          {act.user ? `${act.user.firstName} ${act.user.lastName}` : 'System'}
                        </strong>{' '}
                        performed action{' '}
                        <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-blue-700">
                          {act.action}
                        </code>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(act.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent activity recorded yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Roster Breakdown */}
        <Card className="md:col-span-1 rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="p-5 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Department Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {data?.departments && data.departments.length > 0 ? (
              data.departments.map((dept) => (
                <div
                  key={dept.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{dept.name}</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {dept._count?.teams || 0} functional squads
                    </p>
                  </div>
                  <Badge variant="primary" className="text-xs font-semibold">
                    {dept._count?.members || 0} members
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No departments found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
