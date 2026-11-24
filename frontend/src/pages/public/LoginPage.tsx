import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Workflow, Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123!');
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
          Sign in to your organization
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
            register a new enterprise workspace
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-xl sm:px-8 border border-zinc-200/80 space-y-5">
          {/* One-click demo roles segmented bar */}
          <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/70 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-700">Pre-seeded Demo Roles:</span>
              <span className="text-zinc-400 font-mono text-[10px]">Click to fill</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@acme.com')}
                className="rounded border border-zinc-200 bg-white py-1 font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition text-[11px]"
              >
                Org Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@acme.com')}
                className="rounded border border-zinc-200 bg-white py-1 font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition text-[11px]"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('employee@acme.com')}
                className="rounded border border-zinc-200 bg-white py-1 font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition text-[11px]"
              >
                Employee
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              leftIcon={<Mail className="h-3.5 w-3.5" />}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium tracking-tight text-zinc-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-3.5 w-3.5" />}
                required
              />
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
