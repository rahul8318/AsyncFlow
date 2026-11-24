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
      link.setAttribute('download', `asyncflow-report-${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Organizational Analytics & Adoption Reports
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real calculated metrics derived from persistent database records — zero simulated data.
          </p>
        </div>

        <Button
          onClick={handleDownloadCSV}
          isLoading={exporting}
          variant="outline"
          leftIcon={<Download className="h-4 w-4" />}
        >
          Download CSV Report
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Top High-Level Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="rounded-2xl border-slate-200 p-6 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                SOP Compliance Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">
                  {dashboard?.kpis.acknowledgementRate || 0}%
                </span>
                <span className="text-xs text-emerald-600 font-semibold">Active</span>
              </div>
              <p className="text-xs text-slate-500">
                {dashboard?.kpis.publishedSOPs || 0} active enterprise policies deployed
              </p>
            </Card>

            <Card className="rounded-2xl border-slate-200 p-6 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Training Completion Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">
                  {dashboard?.kpis.trainingCompletionRate || 0}%
                </span>
                <span className="text-xs text-blue-600 font-semibold">Certified</span>
              </div>
              <p className="text-xs text-slate-500">
                {dashboard?.kpis.completedEnrollments || 0} certificates awarded to date
              </p>
            </Card>

            <Card className="rounded-2xl border-slate-200 p-6 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Workshop Attendance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">
                  {dashboard?.kpis.workshopRegistrations || 0}
                </span>
                <span className="text-xs text-indigo-600 font-semibold">Participants</span>
              </div>
              <p className="text-xs text-slate-500">
                Across all live interactive sessions
              </p>
            </Card>
          </div>

          {/* Monthly Adoption Trends Chart */}
          <Card className="rounded-2xl border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Asynchronous Operations Velocity (Last 6 Months)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Measurement of asynchronous communication adoption, SOP acknowledgements, and completed certifications.
                </p>
              </div>
              <Badge variant="primary">Adoption Trends</Badge>
            </div>

            {/* Custom Bar Visualization */}
            <div className="grid grid-cols-6 gap-4 pt-6 items-end h-64">
              {trends?.monthlyAdoption?.map((m: any) => (
                <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Bar 1: SOP Acks */}
                    <div
                      className="w-4 rounded-t-lg bg-blue-600 transition-all hover:bg-blue-700"
                      style={{ height: `${m.sopAcknowledgements}%` }}
                      title={`SOP Acknowledgements: ${m.sopAcknowledgements}%`}
                    />
                    {/* Bar 2: Training Completed */}
                    <div
                      className="w-4 rounded-t-lg bg-emerald-500 transition-all hover:bg-emerald-600"
                      style={{ height: `${m.trainingCompleted}%` }}
                      title={`Training Completed: ${m.trainingCompleted}%`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{m.month}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-600" /> SOP Compliance %
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" /> Training Completion %
              </span>
            </div>
          </Card>

          {/* SOP Category Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">SOP Distribution by Category</h3>
              <div className="space-y-3">
                {trends?.categoryDistribution?.map((cat: any) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700 font-medium">
                      <span>{cat.category}</span>
                      <span>{cat.count} SOPs</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, cat.count * 20)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-2xl border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Workflows by Functional Area</h3>
              <div className="space-y-3">
                {trends?.workflowDistribution?.map((wf: any) => (
                  <div key={wf.category} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700 font-medium">
                      <span>{wf.category.replace('_', ' ')}</span>
                      <span>{wf.count} Pipelines</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.min(100, wf.count * 30)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
