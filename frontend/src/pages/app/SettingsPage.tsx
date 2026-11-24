import React, { useEffect, useState } from 'react';
import { Building, Plus, Layers, ShieldCheck, CheckCircle2, Save, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { Department, Team } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
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
        name: deptName.trim(),
        description: deptDesc.trim(),
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
        name: teamName.trim(),
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          Organization Settings & Tenancy Architecture
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Manage operational structure, departmental taxonomy, squads, and enterprise compliance.
        </p>
      </div>

      {/* Organization Info Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white font-mono text-xs font-bold">
              {organization?.name?.[0] || 'A'}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">{organization?.name}</h3>
              <p className="text-[11px] font-mono text-zinc-500">
                Tenant Slug: {organization?.slug || 'acme-global'} • Domain: {organization?.domain || 'acme.com'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {organization?.plan || 'ENTERPRISE'} TIER
          </Badge>
        </div>
      </div>

      {/* Department & Team Structure Management */}
      {isOrgAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Create Department */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Create Department
            </h3>
            <form onSubmit={handleCreateDepartment} className="space-y-3">
              <Input
                label="Department Name"
                placeholder="e.g. Infrastructure Engineering"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
              />
              <Input
                label="Functional Scope"
                placeholder="Core platform infrastructure & site reliability"
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
              />
              <div className="pt-1">
                <Button type="submit" size="sm" isLoading={savingDept} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Add Department
                </Button>
              </div>
            </form>
          </div>

          {/* Create Team Squad */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Create Squad / Team
            </h3>
            <form onSubmit={handleCreateTeam} className="space-y-3">
              <Input
                label="Squad Name"
                placeholder="e.g. Cloud Operations"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Parent Department
                </label>
                <select
                  value={teamDeptId}
                  onChange={(e) => setTeamDeptId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
                >
                  <option value="">Independent Squad</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-1">
                <Button type="submit" size="sm" isLoading={savingTeam} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Add Squad
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Current Departments and Squads Directory */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
            Active Organizational Hierarchy
          </h3>
          <span className="text-[11px] font-mono text-zinc-400">
            {departments.length} Departments • {teams.length} Squads
          </span>
        </div>

        <div className="divide-y divide-zinc-100">
          {departments.map((dept) => (
            <div key={dept.id} className="py-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900">{dept.name}</h4>
                  <p className="text-[11px] text-zinc-500">{dept.description || 'General operational unit'}</p>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {dept._count?.members || 0} members
                </Badge>
              </div>

              {/* Teams in department */}
              <div className="flex flex-wrap gap-1.5 pl-3 border-l border-zinc-100">
                {teams
                  .filter((t) => t.departmentId === dept.id)
                  .map((t) => (
                    <span
                      key={t.id}
                      className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-mono text-zinc-700"
                    >
                      {t.name}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
