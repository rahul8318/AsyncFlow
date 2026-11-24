import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Building,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../../lib/api';
import { OrganizationMember, Department, Team, Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Skeleton, EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const TeamManagementPage: React.FC = () => {
  const { currentMembership } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'EMPLOYEE' as Role,
    departmentId: '',
    teamId: '',
  });
  const [inviting, setInviting] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [memsRes, deptsRes, teamsRes]: [any, any, any] = await Promise.all([
        api.get('/organizations/members'),
        api.get('/organizations/departments'),
        api.get('/organizations/teams'),
      ]);
      setMembers(Array.isArray(memsRes) ? memsRes : []);
      setDepartments(Array.isArray(deptsRes) ? deptsRes : []);
      setTeams(Array.isArray(teamsRes) ? teamsRes : []);
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteSuccessMsg('');

    try {
      await api.post('/organizations/members/invite', {
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        departmentId: inviteForm.departmentId || undefined,
        teamId: inviteForm.teamId || undefined,
      });

      setInviteSuccessMsg(`Invitation dispatched to ${inviteForm.email}`);
      setInviteForm({ email: '', role: 'EMPLOYEE', departmentId: '', teamId: '' });
      await fetchData();
      setTimeout(() => setShowInviteModal(false), 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the organization?')) return;
    try {
      await api.delete(`/organizations/members/${memberId}`);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const fullName = `${m.user.firstName} ${m.user.lastName}`.toLowerCase();
      const email = m.user.email.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = fullName.includes(query) || email.includes(query);
      const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  const isOrgAdmin =
    currentMembership?.role === 'ORG_ADMIN' || currentMembership?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Personnel Directory & Access Control
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Manage organization members, role-based authorization, departments, and squads.
          </p>
        </div>

        {isOrgAdmin && (
          <Button onClick={() => setShowInviteModal(true)} size="sm" leftIcon={<UserPlus className="h-3.5 w-3.5" />}>
            Invite Member
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search personnel by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ORG_ADMIN', 'TEAM_MANAGER', 'EMPLOYEE'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Personnel Table */}
      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-zinc-400" />}
          title="No personnel found"
          description={
            searchQuery
              ? 'No team members match your filter criteria.'
              : 'Invite colleagues to collaborate in your asynchronous workspace.'
          }
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Access Role</th>
                  <th className="py-3 px-4">Department / Team</th>
                  <th className="py-3 px-4">Joined Date</th>
                  {isOrgAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredMembers.map((m) => {
                  const initials = `${m.user.firstName?.[0] || ''}${m.user.lastName?.[0] || ''}`.toUpperCase();
                  const roleBadgeVariant =
                    m.role === 'ORG_ADMIN' || m.role === 'SUPER_ADMIN'
                      ? 'primary'
                      : m.role === 'TEAM_MANAGER'
                      ? 'secondary'
                      : 'outline';

                  return (
                    <tr key={m.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white font-mono text-[10px] font-bold">
                            {initials || 'U'}
                          </div>
                          <div>
                            <span className="font-medium text-zinc-900 block">
                              {m.user.firstName} {m.user.lastName}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              UID-{m.userId.slice(0, 6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-600">
                        {m.user.email}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={roleBadgeVariant} className="font-mono text-[10px]">
                          {m.role.replace('_', ' ')}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-zinc-600">
                        {m.department?.name || 'General Operations'}
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400">
                        {formatDate(m.joinedAt)}
                      </td>

                      {isOrgAdmin && (
                        <td className="py-3 px-4 text-right">
                          {m.role !== 'ORG_ADMIN' && m.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="p-1 text-zinc-400 hover:text-rose-600 transition-colors rounded"
                              title="Revoke member access"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Organization Personnel"
        description="Send an invitation link and grant role-based workspace permissions."
      >
        <form onSubmit={handleInvite} className="space-y-4 pt-1">
          {inviteSuccessMsg && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{inviteSuccessMsg}</span>
            </div>
          )}

          <Input
            label="Corporate Email Address"
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            placeholder="colleague@acme.com"
            required
          />

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Assigned Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
            >
              <option value="EMPLOYEE">Employee (Access training, sign SOPs, view tasks)</option>
              <option value="TEAM_MANAGER">Team Manager (Assign SOPs, review approvals, manage team)</option>
              <option value="ORG_ADMIN">Organization Admin (Full administrative and tenant control)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Department</label>
              <select
                value={inviteForm.departmentId}
                onChange={(e) => setInviteForm({ ...inviteForm, departmentId: e.target.value })}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
              >
                <option value="">General</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Team / Squad</label>
              <select
                value={inviteForm.teamId}
                onChange={(e) => setInviteForm({ ...inviteForm, teamId: e.target.value })}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
              >
                <option value="">Unassigned</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={inviting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
