import React, { useState } from 'react';
import { User, Clock, Lock, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';

export const ProfilePage: React.FC = () => {
  const { user, currentMembership } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          User Profile & Preferences
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your personal details, global timezone, and authentication security.
        </p>
      </div>

      {/* User Information Card */}
      <Card className="rounded-2xl border-slate-200 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white shadow-md">
            {user?.firstName?.[0] || 'U'}
            {user?.lastName?.[0] || ''}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="primary">{currentMembership?.role.replace('_', ' ')}</Badge>
              <span className="text-[11px] text-slate-400">
                Joined {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <label className="text-slate-500 font-medium">Job Title</label>
            <p className="font-semibold text-slate-900 mt-0.5">{user?.jobTitle || 'Team Member'}</p>
          </div>
          <div>
            <label className="text-slate-500 font-medium">Configured Timezone</label>
            <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {user?.timezone || 'UTC'}
            </p>
          </div>
        </div>
      </Card>

      {/* Security Information */}
      <Card className="rounded-2xl border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Security & Credentials</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your account is secured with Argon2/bcrypt-hashed credentials and rotating refresh tokens. Session states are monitored on every API invocation.
        </p>
        <div className="pt-2">
          <Button variant="outline" size="sm">
            Change Password
          </Button>
        </div>
      </Card>
    </div>
  );
};
