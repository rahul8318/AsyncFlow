import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Workflow,
  FileText,
  Kanban,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Check,
  Clock,
  Layers,
  ChevronRight,
  CheckCircle2,
  Code2,
  Building,
  Terminal,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const LandingPage: React.FC = () => {
  const [activeHeroTab, setActiveHeroTab] = useState<'sop' | 'workflow' | 'lms'>('sop');

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-zinc-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Micro Status Chip */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-700 mb-6 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Built for Distributed Engineering & Operations</span>
            <span className="text-zinc-300">•</span>
            <span className="text-blue-600 font-semibold">v2.4 Released</span>
          </div>

          {/* Core Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl max-w-4xl mx-auto leading-[1.08]">
            The operating system for teams that hate meetings.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Replace calendar clutter with living standard operating procedures, stage-gated approval pipelines, and server-graded employee certifications.
          </p>

          {/* CTA Buttons & Demo Quick Pill */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Enterprise Workspace
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Launch Live Demo Environment
              </Button>
            </Link>
          </div>

          {/* Instant Seed Accounts Pill */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-4 py-2 text-[11px] text-zinc-600">
            <span className="font-semibold text-zinc-900">Pre-seeded demo accounts:</span>
            <span>Admin: <code className="bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-blue-700 font-mono">admin@acme.com</code></span>
            <span>Password: <code className="bg-white px-1.5 py-0.5 rounded border border-zinc-200 font-mono">Password123!</code></span>
          </div>

          {/* Interactive Live Product Preview Tabbed Mockup */}
          <div className="mt-14 mx-auto max-w-5xl rounded-xl border border-zinc-200/90 bg-[#fafafa] p-2 sm:p-3 shadow-modal text-left">
            {/* Window Topbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200/70 bg-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] text-zinc-400">app.asyncflow.io/acme-global</span>
              </div>

              {/* Interactive Tabs */}
              <div className="flex rounded-md bg-zinc-100 p-0.5 text-xs font-medium">
                <button
                  onClick={() => setActiveHeroTab('sop')}
                  className={`rounded px-3 py-1 transition ${
                    activeHeroTab === 'sop' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  SOP Reader & Signoff
                </button>
                <button
                  onClick={() => setActiveHeroTab('workflow')}
                  className={`rounded px-3 py-1 transition ${
                    activeHeroTab === 'workflow' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Kanban Pipeline
                </button>
                <button
                  onClick={() => setActiveHeroTab('lms')}
                  className={`rounded px-3 py-1 transition ${
                    activeHeroTab === 'lms' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Assessment & LMS
                </button>
              </div>
            </div>

            {/* Mockup Canvas */}
            <div className="bg-white p-6 sm:p-8 rounded-b-lg border border-zinc-200/60 min-h-[380px] flex flex-col justify-between">
              {activeHeroTab === 'sop' && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-700">
                        POLICY v1.0
                      </span>
                      <span className="text-xs font-mono text-zinc-400">ID: sop_async_01</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> Acknowledged by 84% of Squad
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900">
                    1. Async Communication Policy & Response SLAs
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
                    Standard messages in Slack/Teams expect responses within 4 to 8 working hours in recipient's local business day. Non-urgent issues are never paged. Writing context precedes asking questions.
                  </p>

                  <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                      Mandatory Checkpoints
                    </span>
                    <div className="space-y-1.5 text-xs text-zinc-700">
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Default to written memo before requesting a synchronous meeting.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>No @here or @channel tags permitted except for verified SEV-1 outages.</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 text-[11px]">Audit Timestamp: 2026-11-24 09:41 UTC</span>
                    <Button size="xs" variant="primary">
                      Digital Signoff Complete
                    </Button>
                  </div>
                </div>
              )}

              {activeHeroTab === 'workflow' && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-bold text-zinc-900">
                      Engineering Remote Onboarding Protocol (First 30 Days)
                    </span>
                    <span className="text-[11px] text-zinc-400">4 Stages • 4 Active Tasks</span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-left">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-2.5 space-y-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">To Do (1)</span>
                      <div className="rounded-md border border-zinc-200 bg-white p-2 text-xs shadow-xs">
                        <p className="font-semibold text-zinc-900 text-[11px]">Record Loom intro video</p>
                        <span className="text-[9px] text-zinc-400 font-mono">P3 Low</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-2.5 space-y-2">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">In Progress (1)</span>
                      <div className="rounded-md border border-zinc-200 bg-white p-2 text-xs shadow-xs">
                        <p className="font-semibold text-zinc-900 text-[11px]">Sign Core SOPs #1-#5</p>
                        <span className="text-[9px] text-amber-600 font-mono font-semibold">P1 High</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-2.5 space-y-2">
                      <span className="text-[10px] font-bold text-amber-600 uppercase">In Review (1)</span>
                      <div className="rounded-md border border-amber-200 bg-amber-50/40 p-2 text-xs shadow-xs space-y-1">
                        <p className="font-semibold text-zinc-900 text-[11px]">First Production PR</p>
                        <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">Approval Required</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-2.5 space-y-2">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Completed (1)</span>
                      <div className="rounded-md border border-zinc-200 bg-white p-2 text-xs shadow-xs">
                        <p className="font-semibold text-zinc-900 text-[11px]">Dev Environment Setup</p>
                        <span className="text-[9px] text-emerald-600 font-mono">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeHeroTab === 'lms' && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-bold text-zinc-900">
                      Asynchronous Operations Certification Exam
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">Score: 100% (Passed)</span>
                  </div>

                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          ✓
                        </div>
                        <span className="text-xs font-bold text-emerald-950">
                          Digital Certificate Issued: ASYNC-CERT-2026-ALEX
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800">Verified by Server</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Completed curriculum: Attention Economics, Silent Meetings, and DACI Decision Framework.
                    </p>
                  </div>

                  <div className="border-t border-zinc-100 pt-3 flex justify-between items-center text-xs text-zinc-500">
                    <span>Server-side graded with tamper-proof answers</span>
                    <Link to="/app/training" className="text-blue-600 font-semibold hover:underline">
                      Explore full curriculum →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Meeting Sprawl vs AsyncFlow */}
      <section className="py-20 border-b border-zinc-200/80 bg-zinc-50/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              The Architecture of High Velocity
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500">
              How distributed organizations scale without burning out their best talent.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden shadow-card">
            <div className="grid grid-cols-2 divide-x divide-zinc-200 text-xs">
              <div className="p-4 sm:p-6 bg-zinc-50/60 font-semibold text-zinc-500 uppercase tracking-wider text-[11px]">
                Legacy Synchronous Culture
              </div>
              <div className="p-4 sm:p-6 bg-blue-50/40 font-semibold text-blue-900 uppercase tracking-wider text-[11px]">
                AsyncFlow Operating Model
              </div>
            </div>

            <div className="divide-y divide-zinc-100 text-xs text-zinc-700">
              <div className="grid grid-cols-2 divide-x divide-zinc-200 p-4 sm:p-5">
                <div className="pr-4 space-y-1">
                  <p className="font-semibold text-zinc-900">Constant Slack Notifications</p>
                  <p className="text-zinc-500 leading-relaxed">Engineers context-switch every 12 minutes. Zero deep work.</p>
                </div>
                <div className="pl-4 space-y-1">
                  <p className="font-semibold text-blue-950">4-8 Hour SLA Response Protocol</p>
                  <p className="text-zinc-600 leading-relaxed">Protected morning focus blocks; responses batched cleanly.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-zinc-200 p-4 sm:p-5">
                <div className="pr-4 space-y-1">
                  <p className="font-semibold text-zinc-900">Verbal Status Meetings</p>
                  <p className="text-zinc-500 leading-relaxed">One person speaks, 8 people listen passively. No notes.</p>
                </div>
                <div className="pl-4 space-y-1">
                  <p className="font-semibold text-blue-950">Silent Reading & Written RFCs</p>
                  <p className="text-zinc-600 leading-relaxed">5 minutes of silent document commenting. Fast consensus.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-zinc-200 p-4 sm:p-5">
                <div className="pr-4 space-y-1">
                  <p className="font-semibold text-zinc-900">Timezone Exclusion</p>
                  <p className="text-zinc-500 leading-relaxed">Asia/Europe engineers forced into 11 PM or 6 AM calls.</p>
                </div>
                <div className="pl-4 space-y-1">
                  <p className="font-semibold text-blue-950">Follow-The-Sun Handoff Memos</p>
                  <p className="text-zinc-600 leading-relaxed">End-of-day branch handoffs allow continuous 24h progress.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security & Trust Row */}
      <section className="py-14 bg-white border-b border-zinc-200/80">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-zinc-100 p-2 text-zinc-800 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Multi-Tenant Logical Isolation</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Strict database row scoping prevents cross-org data leaks.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-zinc-100 p-2 text-zinc-800 shrink-0">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Server-Side Verified Logic</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Real PostgreSQL transactions and tamper-proof quiz grading.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-zinc-100 p-2 text-zinc-800 shrink-0">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Role-Based Access Control</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Super Admin, Org Admin, Team Manager, and Employee tiers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
