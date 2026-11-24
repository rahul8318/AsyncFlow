import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Building,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit,
} from 'lucide-react';
import { api } from '../../lib/api';
import { OrganizationMember, Department, Team, Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const TeamManagementPage: React.FC = () => {
  const { currentMembership } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

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
        email: inviteForm.email,
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

  const isOrgAdmin =
    currentMembership?.role === 'ORG_ADMIN' || currentMembership?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Team & Organizational Member Roster
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage global team members, departmental squads, and role-based access permissions.
          </p>
        </div>

        {isOrgAdmin && (
          <Button onClick={() => setShowInviteModal(true)} leftIcon={<UserPlus className="h-4 w-4" />}>
            Invite Member
          </Button>
        )}
      </div>

      {/* Members Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-700">
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Department & Squad</th>
                <th className="py-3.5 px-4">Timezone</th>
                <th className="py-3.5 px-4">Joined</th>
                {isOrgAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-6">
                      <Skeleton className="h-8 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No members found.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shrink-0">
                          {member.user.firstName?.[0] || 'U'}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-900">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{member.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          member.role === 'ORG_ADMIN'
                            ? 'primary'
                            : member.role === 'TEAM_MANAGER'
                            ? 'success'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {member.role.replace('_', ' ')}
                      </Badge>
                    </td>

                    {/* Department / Team */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">
                        {member.department?.name || 'General Org'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {member.team?.name || 'No squad'}
                      </p>
                    </td>

                    {/* Timezone */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {member.user.timezone || 'UTC'}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(member.joinedAt)}
                    </td>

                    {/* Actions */}
                    {isOrgAdmin && (
                      <td className="py-3.5 px-6 text-right">
                        {member.userId !== currentMembership?.userId && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            title="Remove member"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite New Colleague"
        description="Send an invitation link to join this AsyncFlow organization."
      >
        <form onSubmit={handleInvite} className="space-y-4 pt-2">
          {inviteSuccessMsg && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{inviteSuccessMsg}</span>
            </div>
          )}

          <Input
            label="Colleague Email Address"
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            placeholder="colleague@acme.com"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Role
            </label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as Role })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
            >
              <option value="EMPLOYEE">Employee (Read & Acknowledge SOPs, LMS)</option>
              <option value="TEAM_MANAGER">Team Manager (Assign SOPs, Workflows)</option>
              <option value="ORG_ADMIN">Organization Admin (Full Administrative Control)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={inviteForm.departmentId}
                onChange={(e) => setInviteForm({ ...inviteForm, departmentId: e.target.value })}
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Squad / Team
              </label>
              <select
                value={inviteForm.teamId}
                onChange={(e) => setInviteForm({ ...inviteForm, teamId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="">No Squad</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={inviting}>
              Send Invitation Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
