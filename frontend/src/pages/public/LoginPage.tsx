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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Workflow className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Async<span className="text-blue-600">Flow</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your enterprise workspace
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
            start a new 14-day organization trial
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
          {/* Quick Demo Role Fillers */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span>Click to auto-fill pre-seeded demo accounts:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@acme.com')}
                className="rounded-lg border border-blue-200 bg-white py-1.5 font-medium text-blue-700 hover:bg-blue-100/50 transition-colors"
              >
                Org Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@acme.com')}
                className="rounded-lg border border-blue-200 bg-white py-1.5 font-medium text-blue-700 hover:bg-blue-100/50 transition-colors"
              >
                Team Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('employee@acme.com')}
                className="rounded-lg border border-blue-200 bg-white py-1.5 font-medium text-blue-700 hover:bg-blue-100/50 transition-colors"
              >
                Employee
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In to Workspace
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
