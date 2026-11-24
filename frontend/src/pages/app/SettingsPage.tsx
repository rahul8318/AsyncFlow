import React, { useEffect, useState } from 'react';
import { Building, Plus, Layers, ShieldCheck, CheckCircle2, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { Department, Team } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { organization, currentMembership } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Department creation
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [savingDept, setSavingDept] = useState(false);

  // Team creation
  const [teamName, setTeamName] = useState('');
  const [teamDeptId, setTeamDeptId] = useState('');
  const [savingTeam, setSavingTeam] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, tRes]: [any, any] = await Promise.all([
        api.get('/organizations/departments'),
        api.get('/organizations/teams'),
      ]);
      setDepartments(Array.isArray(dRes) ? dRes : []);
      setTeams(Array.isArray(tRes) ? tRes : []);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    setSavingDept(true);
    try {
      await api.post('/organizations/departments', {
        name: deptName,
        description: deptDesc,
      });
      setDeptName('');
      setDeptDesc('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create department');
    } finally {
      setSavingDept(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setSavingTeam(true);
    try {
      await api.post('/organizations/teams', {
        name: teamName,
        departmentId: teamDeptId || undefined,
      });
      setTeamName('');
      setTeamDeptId('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create team');
    } finally {
      setSavingTeam(false);
    }
  };

  const isOrgAdmin =
    currentMembership?.role === 'ORG_ADMIN' || currentMembership?.role === 'SUPER_ADMIN';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Organization Settings & Structure
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Configure departments, squads, subscription tiers, and multi-tenant security policies.
        </p>
      </div>

      {/* Organization Info Card */}
      <Card className="rounded-2xl border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{organization?.name}</h3>
              <p className="text-xs text-slate-500">Domain: {organization?.domain || 'acme.com'}</p>
            </div>
          </div>
          <Badge variant="primary" className="text-xs py-1 px-3">
            {organization?.plan || 'ENTERPRISE'} PLAN
          </Badge>
        </div>
      </Card>

      {/* Department & Team Structure Management */}
      {isOrgAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Department */}
          <Card className="rounded-2xl border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add New Department</h3>
            <form onSubmit={handleCreateDepartment} className="space-y-3">
              <Input
                label="Department Name"
                placeholder="e.g. Engineering"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
              />
              <Input
                label="Description"
                placeholder="Core platform and software systems"
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
              />
              <Button type="submit" size="sm" isLoading={savingDept} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                Create Department
              </Button>
            </form>
          </Card>

          {/* Create Team Squad */}
          <Card className="rounded-2xl border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add New Team / Squad</h3>
            <form onSubmit={handleCreateTeam} className="space-y-3">
              <Input
                label="Team Name"
                placeholder="e.g. Platform Infrastructure"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Parent Department
                </label>
                <select
                  value={teamDeptId}
                  onChange={(e) => setTeamDeptId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="">No Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="sm" isLoading={savingTeam} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                Create Squad
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Current Departments and Squads Directory */}
      <Card className="rounded-2xl border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Active Department & Squad Directory</h3>
        <div className="divide-y divide-slate-100">
          {departments.map((dept) => (
            <div key={dept.id} className="py-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{dept.name}</h4>
                  <p className="text-[11px] text-slate-500">{dept.description || 'No description'}</p>
                </div>
                <Badge variant="secondary">{dept._count?.members || 0} members</Badge>
              </div>

              {/* Teams in department */}
              <div className="flex flex-wrap gap-1.5 pl-3">
                {teams
                  .filter((t) => t.departmentId === dept.id)
                  .map((t) => (
                    <span
                      key={t.id}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                    >
                      {t.name}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
