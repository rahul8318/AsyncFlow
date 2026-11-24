import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  FileText,
  GraduationCap,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/EmptyState';

export const AnalyticsPage: React.FC = () => {
  const [trends, setTrends] = useState<any | null>(null);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trendsRes, dashRes]: [any, any] = await Promise.all([
        api.get('/analytics/trends'),
        api.get('/analytics/dashboard'),
      ]);
      setTrends(trendsRes);
      setDashboard(dashRes);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadCSV = async () => {
    setExporting(true);
    try {
      const csvData: any = await api.get('/analytics/export-csv');
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `asyncflow-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message || 'Failed to download report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Operations Analytics & Adoption Metrics
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Calculated aggregates queried directly from organization database records — zero mock or simulated data.
          </p>
        </div>

        <Button
          onClick={handleDownloadCSV}
          isLoading={exporting}
          variant="outline"
          size="sm"
          leftIcon={<Download className="h-3.5 w-3.5" />}
        >
          Export CSV Report
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Top High-Level Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2 shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                SOP Compliance Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight text-zinc-900 font-mono">
                  {dashboard?.kpis.acknowledgementRate || 0}%
                </span>
                <Badge variant="success" className="text-[10px] font-mono">Verified</Badge>
              </div>
              <p className="text-xs text-zinc-500 font-normal">
                {dashboard?.kpis.publishedSOPs || 0} active operating procedures published
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2 shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Training Completion Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight text-zinc-900 font-mono">
                  {dashboard?.kpis.trainingCompletionRate || 0}%
                </span>
                <Badge variant="secondary" className="text-[10px] font-mono">Certified</Badge>
              </div>
              <p className="text-xs text-zinc-500 font-normal">
                {dashboard?.kpis.completedEnrollments || 0} competency certificates awarded
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2 shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Workshop Participation
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight text-zinc-900 font-mono">
                  {dashboard?.kpis.workshopRegistrations || 0}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">Registrations</Badge>
              </div>
              <p className="text-xs text-zinc-500 font-normal">
                Across live asynchronous and interactive sessions
              </p>
            </div>
          </div>

          {/* Monthly Adoption Trends Chart */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Asynchronous Operations Velocity (Trailing 6 Months)
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Comparison between policy signoff rate and completed competency certifications.
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                Rolling 180 Days
              </Badge>
            </div>

            {/* Custom Bar Visualization */}
            <div className="grid grid-cols-6 gap-3 sm:gap-6 pt-6 items-end h-56">
              {trends?.monthlyAdoption?.map((m: any) => (
                <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Bar 1: SOP Acks */}
                    <div
                      className="w-4 rounded-t bg-zinc-900 transition-all hover:bg-zinc-700"
                      style={{ height: `${Math.max(8, m.sopAcknowledgements)}%` }}
                      title={`SOP Compliance: ${m.sopAcknowledgements}%`}
                    />
                    {/* Bar 2: Training Completed */}
                    <div
                      className="w-4 rounded-t bg-zinc-400 transition-all hover:bg-zinc-500"
                      style={{ height: `${Math.max(8, m.trainingCompleted)}%` }}
                      title={`Training Certified: ${m.trainingCompleted}%`}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-zinc-600">{m.month}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-zinc-100 text-xs font-mono text-zinc-600">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-zinc-900" /> SOP Compliance %
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-zinc-400" /> Training Completion %
              </span>
            </div>
          </div>

          {/* Distribution Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  SOP Distribution by Category
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">Total Policies</span>
              </div>

              <div className="space-y-3">
                {trends?.categoryDistribution?.map((cat: any) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-700 font-medium">
                      <span>{cat.category}</span>
                      <span className="font-mono text-zinc-500">{cat.count} SOPs</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 rounded-full"
                        style={{ width: `${Math.min(100, cat.count * 20)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Pipelines by Operational Domain
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">Active Boards</span>
              </div>

              <div className="space-y-3">
                {trends?.workflowDistribution?.map((wf: any) => (
                  <div key={wf.category} className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-700 font-medium">
                      <span>{wf.category.replace('_', ' ')}</span>
                      <span className="font-mono text-zinc-500">{wf.count} Pipelines</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full bg-zinc-700 rounded-full"
                        style={{ width: `${Math.min(100, wf.count * 30)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
