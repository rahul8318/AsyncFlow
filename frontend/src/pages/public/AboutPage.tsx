import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Target, Users2, Shield, HeartHandshake, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <PublicNavbar />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 flex-1 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="font-mono text-[10px] tracking-wide uppercase">
            Our Purpose & Manifesto
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-900 leading-tight">
            Empower Remote Teams Without Calendar Burnout
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal max-w-2xl mx-auto">
            We believe that the future of work is globally distributed, but only when organizations master structured asynchronous operations.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-8 md:p-12 shadow-sm space-y-6 text-xs sm:text-sm text-zinc-700 leading-relaxed font-normal">
          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">
            The Asynchronous Imperative
          </h2>
          <p>
            When companies shifted to distributed work, they brought with them the legacy habits of physical offices: tapping colleagues on the shoulder via instant message, demanding instantaneous replies, and organizing endless video meetings to share status updates that could have been communicated in a concise written memo.
          </p>
          <p>
            The consequences were immediate: calendar fragmentation, cognitive fatigue, and decision-making biased toward whoever happened to be awake in the headquarters' primary timezone.
          </p>
          <p>
            AsyncFlow was founded on a fundamental realization: <strong>writing is the operating system of distributed leverage</strong>. By providing organizations with structured SOP authoring, verified checklists, stage-gated pipelines, and live adoption analytics, we give teams the tools to coordinate thousands of people across dozens of time zones with surgical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">Focus Over Fragmentation</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-normal">
              Software designed to protect 4-hour deep work blocks rather than inundating contributors with constant pings.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
              <Users2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">Geographic Neutrality</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-normal">
              A contributor in Tokyo or London has identical voice and influence on product architecture as someone in San Francisco.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">Verifiable Compliance</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-normal">
              Operating standards only work when verified. Digital compliance signoffs and certified exams eliminate ambiguity.
            </p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
