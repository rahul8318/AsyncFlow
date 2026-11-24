import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Target, Users2, Shield, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 flex-1 space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Our Mission: Empower Remote Work Without Meeting Burnout
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            We believe that the future of work is distributed, but only when teams master asynchronous operations.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900">The AsyncFlow Manifesto</h2>
          <p>
            When organizations made the transition to remote work, they brought with them the legacy habits of physical offices: tapping colleagues on the shoulder, demanding instant answers, and organizing endless meetings to share updates that could have been communicated in a concise written memo.
          </p>
          <p>
            The result was predictable: calendar fragmentation, zoom fatigue, and decision making biased exclusively toward employees residing in the headquarters' primary timezone.
          </p>
          <p>
            AsyncFlow was founded on a fundamental realization: <strong>writing is the operating system of distributed leverage</strong>. By providing organizations with structured SOP authoring, verified checklists, stage-gated workflows, and live adoption analytics, we give companies the tools to coordinate thousands of people across dozens of countries with surgical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <Target className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-slate-900 mb-1">Focus Over Fragmentation</h3>
            <p className="text-xs text-slate-500">We design software that protects 4-hour deep work blocks rather than spamming users with constant pings.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <Users2 className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="font-bold text-slate-900 mb-1">Geographic Inclusivity</h3>
            <p className="text-xs text-slate-500">A contributor in Tokyo or Mumbai should have equal influence on product decisions as one in San Francisco or London.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <Shield className="h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="font-bold text-slate-900 mb-1">Verifiable Accountability</h3>
            <p className="text-xs text-slate-500">Policies only matter if people know they exist. Digital acknowledgements and certifications ensure alignment.</p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
