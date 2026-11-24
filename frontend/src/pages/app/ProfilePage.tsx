import React, { useState } from 'react';
import { User, Clock, Lock, Shield, CheckCircle2, Building, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';

export const ProfilePage: React.FC = () => {
  const { user, currentMembership } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          User Account & Security Profile
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Manage identity parameters, cryptographic session tokens, and operational timezone.
        </p>
      </div>

      {/* User Information Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 font-mono text-sm font-bold text-white shadow-sm">
            {user?.firstName?.[0] || 'U'}
            {user?.lastName?.[0] || ''}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-xs font-mono text-zinc-500">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">
                {currentMembership?.role.replace('_', ' ')}
              </Badge>
              <span className="text-[11px] font-mono text-zinc-400">
                Member since {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 text-xs">
          <div>
            <label className="text-zinc-400 font-medium text-[11px] uppercase tracking-wider block font-mono">Job Title</label>
            <p className="font-medium text-zinc-900 mt-1">{user?.jobTitle || 'Team Member'}</p>
          </div>
          <div>
            <label className="text-zinc-400 font-medium text-[11px] uppercase tracking-wider block font-mono">Configured Timezone</label>
            <p className="font-medium text-zinc-900 mt-1 flex items-center gap-1.5 font-mono">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              {user?.timezone || 'UTC'}
            </p>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-zinc-600" /> Session & Authentication Security
          </h3>
          <Badge variant="success" className="text-[10px] font-mono">JWT Rotating Active</Badge>
        </div>

        <div className="space-y-3 text-xs text-zinc-600">
          <div className="flex justify-between py-1 border-b border-zinc-100">
            <span className="text-zinc-500">Authentication Mechanism</span>
            <span className="font-mono font-medium text-zinc-900">JWT (15m Access + 7d Rotating Refresh)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-100">
            <span className="text-zinc-500">Multi-Factor Status</span>
            <span className="font-medium text-zinc-900">Enforced by Organization Policy</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-zinc-500">Password Encryption</span>
            <span className="font-mono font-medium text-zinc-900">Argon2 / BCrypt (Salt Rounds: 12)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
