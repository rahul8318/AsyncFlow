import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Workflow, Lock, Mail, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organizationName: '',
    jobTitle: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-zinc-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
            <Workflow className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            Async<span className="text-blue-600">Flow</span>
          </span>
        </Link>
        <h2 className="mt-5 text-xl font-bold tracking-tight text-zinc-900">
          Create your enterprise workspace
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-xl sm:px-8 border border-zinc-200/80 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Sarah"
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Chen"
                required
              />
            </div>

            <Input
              label="Work Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sarah@yourcompany.com"
              leftIcon={<Mail className="h-3.5 w-3.5" />}
              required
            />

            <Input
              label="Organization Name"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              placeholder="Acme Global Inc."
              leftIcon={<Building className="h-3.5 w-3.5" />}
              required
            />

            <Input
              label="Job Title"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              placeholder="VP Operations / Head of Eng"
            />

            <Input
              label="Password (min 8 chars, 1 uppercase, 1 number)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              leftIcon={<Lock className="h-3.5 w-3.5" />}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Create Workspace
              </Button>
            </div>

            <p className="text-[11px] text-center text-zinc-400 pt-1">
              Protected by multi-tenant PostgreSQL logical isolation.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
