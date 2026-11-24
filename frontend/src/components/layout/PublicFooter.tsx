import React from 'react';
import { Link } from 'react-router-dom';
import { Workflow, ShieldCheck, Globe, Clock } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Workflow className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Async<span className="text-blue-600">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              The enterprise operating system for remote organizations. Eliminate meeting sprawl, establish structured asynchronous SOPs, and maintain 24-hour high velocity.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SOC2 Type II Certified</span>
              <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-blue-500" /> Multi-region</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> 99.99% Uptime</span>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li><Link to="/features" className="hover:text-blue-600 transition-colors">Async SOP Builder</Link></li>
              <li><Link to="/features" className="hover:text-blue-600 transition-colors">Workflow Kanban</Link></li>
              <li><Link to="/features" className="hover:text-blue-600 transition-colors">Training Engine</Link></li>
              <li><Link to="/features" className="hover:text-blue-600 transition-colors">Assessment Quizzes</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-600 transition-colors">Enterprise Pricing</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li><Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link to="/about" className="hover:text-blue-600 transition-colors">Our Async Manifesto</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Sales</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Security & Trust</Link></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Legal</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">GDPR & Compliance</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} AsyncFlow Technologies Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Engineered for distributed teams operating across global time zones.</p>
        </div>
      </div>
    </footer>
  );
};
