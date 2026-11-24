import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Workflow, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { label: 'Platform Features', path: '/features' },
    { label: 'Pricing Plans', path: '/pricing' },
    { label: 'Manifesto', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-xs select-none">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
            <Workflow className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900">
            Async<span className="text-blue-600">Flow</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs font-medium transition-colors hover:text-zinc-900 ${
                location.pathname === link.path ? 'text-zinc-900 font-semibold' : 'text-zinc-500'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <Link to="/app">
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Go to Workspace
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Start Free Trial
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
