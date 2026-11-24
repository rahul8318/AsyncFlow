import React from 'react';
import { Link } from 'react-router-dom';
import {
  Workflow,
  FileCheck2,
  GraduationCap,
  Users2,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Tag pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AsyncFlow 2.0 Enterprise Release</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-4xl mx-auto leading-tight sm:leading-none">
            Kill Meeting Sprawl. <br className="hidden sm:inline" />
            <span className="text-blue-600">Operate High-Velocity Asynchronously.</span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The all-in-one asynchronous operations platform for remote companies. Replace calendar congestion with verified SOPs, visual approval workflows, employee assessments, and live adoption analytics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3.5" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Enterprise Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                Explore Demo Environment
              </Button>
            </Link>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="mt-8 mx-auto max-w-md rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-4 text-xs text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-900 mb-1">Instant Demo Accounts (Seeded & Ready):</p>
            <p><span className="font-medium text-blue-700">Org Admin:</span> admin@acme.com / Password123!</p>
            <p><span className="font-medium text-emerald-700">Team Manager:</span> manager@acme.com / Password123!</p>
            <p><span className="font-medium text-slate-700">Employee:</span> employee@acme.com / Password123!</p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {[
              {
                icon: FileCheck2,
                title: 'Living SOP Builder',
                desc: '10 Pre-loaded enterprise SOP templates, versioning & digital acknowledgements.',
              },
              {
                icon: Layers,
                title: 'Approval Workflows',
                desc: 'Kanban boards with stage-gated signoffs for onboarding, incidents & handovers.',
              },
              {
                icon: GraduationCap,
                title: 'LMS & Assessment',
                desc: 'Self-paced video & reading modules, server-side graded exams & certifications.',
              },
              {
                icon: BarChart3,
                title: 'Adoption Analytics',
                desc: 'Real calculated KPIs from your database: SOP coverage & communication velocity.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Async Advantage Section */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why Synchronous-First Companies Fail at Scale
            </h2>
            <p className="mt-4 text-base text-slate-600">
              When remote teams try to operate like office teams via 8 hours of daily Zoom calls, burnout accelerates, knowledge remains trapped in private Slack DMs, and velocity grinds to a halt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Broken Way */}
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8">
              <h3 className="text-lg font-bold text-red-900 mb-4">The Chaotic "Always-On" Way</h3>
              <ul className="space-y-3.5 text-sm text-red-800">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Constant Slack pings interrupting deep engineering and design focus.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Endless 30-minute status meetings that could have been a 2-paragraph memo.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Critical architecture decisions lost in ephemeral chat history.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Team members in Asia or Europe excluded due to timezone mismatches.</span>
                </li>
              </ul>
            </div>

            {/* The AsyncFlow Way */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-8">
              <h3 className="text-lg font-bold text-blue-900 mb-4">The AsyncFlow Enterprise System</h3>
              <ul className="space-y-3.5 text-sm text-blue-900">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>Centralized, version-controlled SOPs with verifiable digital acknowledgements.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>Silent reading protocols (Amazon-style) ensuring high context before debate.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>Standardized follow-the-sun handoffs allowing 24-hour continuous delivery.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>Clear DACI decision-making frameworks that eliminate consensus bottlenecks.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
            Ready to Build a High-Performing Remote Culture?
          </h2>
          <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto">
            Join forward-thinking enterprise companies that operate across 14+ time zones without missing a beat.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white border-none">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
