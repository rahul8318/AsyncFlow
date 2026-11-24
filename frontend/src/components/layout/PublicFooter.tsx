import React from 'react';
import { Link } from 'react-router-dom';
import { Workflow, ShieldCheck, Globe, Clock } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-zinc-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white">
                <Workflow className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-900">
                Async<span className="text-blue-600">Flow</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              The operational architecture for remote companies. Replace meeting sprawl with verified SOPs, stage-gated pipelines, and live team accountability.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Multi-Tenant Scoped</span>
              <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-blue-600" /> Follow-the-Sun</span>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Architecture</h4>
            <ul className="mt-3 space-y-2 text-xs text-zinc-600">
              <li><Link to="/features" className="hover:text-zinc-900 transition">SOP Living Protocols</Link></li>
              <li><Link to="/features" className="hover:text-zinc-900 transition">Stage-Gated Kanban</Link></li>
              <li><Link to="/features" className="hover:text-zinc-900 transition">Continuous LMS & Quizzes</Link></li>
              <li><Link to="/features" className="hover:text-zinc-900 transition">Adoption Analytics</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Company</h4>
            <ul className="mt-3 space-y-2 text-xs text-zinc-600">
              <li><Link to="/about" className="hover:text-zinc-900 transition">The Async Manifesto</Link></li>
              <li><Link to="/pricing" className="hover:text-zinc-900 transition">Enterprise Pricing</Link></li>
              <li><Link to="/contact" className="hover:text-zinc-900 transition">Contact Solutions</Link></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Security & Legal</h4>
            <ul className="mt-3 space-y-2 text-xs text-zinc-600">
              <li><Link to="/privacy" className="hover:text-zinc-900 transition">Privacy & Data Scope</Link></li>
              <li><Link to="/terms" className="hover:text-zinc-900 transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-zinc-900 transition">GDPR / CCPA</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400">
          <p>© {new Date().getFullYear()} AsyncFlow Technologies Inc. All rights reserved.</p>
          <p className="mt-1 sm:mt-0 font-mono text-[10px]">Production Enterprise Release 2.4.0</p>
        </div>
      </div>
    </footer>
  );
};
