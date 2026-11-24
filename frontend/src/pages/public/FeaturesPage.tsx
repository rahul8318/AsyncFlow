import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { FileCheck2, Kanban, GraduationCap, BarChart3, Users, Clock, ShieldCheck, Zap, ArrowRight, Check } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const FeaturesPage: React.FC = () => {
  const modules = [
    {
      badge: 'MODULE C',
      icon: FileCheck2,
      title: 'Asynchronous SOP Management & Compliance',
      desc: 'The bedrock of remote alignment. Author rich operating standards with markdown, checklists, and revision histories.',
      details: [
        '10 Pre-loaded enterprise templates: Async Communication Policy, Remote Meeting Guidelines, Slack Standards, and more.',
        'Version control with automatic changelogs and revision history timeline.',
        'Cryptographic digital employee signoffs with timestamped verification audits.',
        'Threaded RFC discussion stream for asynchronous proposals and debates.',
      ],
    },
    {
      badge: 'MODULE D',
      icon: Kanban,
      title: 'Operational Workflows & Stage-Gated Pipelines',
      desc: 'A visual, stage-gated board designed specifically for asynchronous operational handoffs across global teams.',
      details: [
        'Visual kanban stages: To Do, In Progress, In Review, and Completed.',
        'Designated manager approval gates preventing premature deployment or policy signoff.',
        'Templates for Engineering Onboarding, Weekly Retrospectives, and Incident Escalations.',
        'Audit histories tracking who moved which ticket across global timezones.',
      ],
    },
    {
      badge: 'MODULES E & F',
      icon: GraduationCap,
      title: 'Continuous Learning LMS & Assessment Engine',
      desc: 'Transform scattered company wikis into structured, verified employee training curricula with certified exams.',
      details: [
        'Modular learning courses with reading checklists and estimated duration trackers.',
        'Server-side graded certification exams (answers never leaked to browser client).',
        'Passing score enforcement, attempt tracking, and automated digital certificate generation.',
        'Personal learning portal for employees to track required compliance training.',
      ],
    },
    {
      badge: 'MODULE H',
      icon: BarChart3,
      title: 'Executive Analytics & Adoption Velocity',
      desc: 'Real, calculated metrics queried directly from your PostgreSQL database — never simulated numbers.',
      details: [
        'Communication Effectiveness Score calculated from SOP coverage and training completions.',
        'Department-level comparison metrics and filterable date ranges.',
        'Pending acknowledgement alerts to prevent operational bottlenecks.',
        'One-click downloadable CSV reports for executive leadership and compliance audits.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <PublicNavbar />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 flex-1 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="font-mono text-[10px] tracking-wide uppercase">
            Architectural Capabilities
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-900 leading-tight">
            Engineered for Asynchronous Precision
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Every module in AsyncFlow is engineered to remove dependencies on synchronous meetings and eliminate communication ambiguity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm hover:border-zinc-300 transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {m.badge}
                    </Badge>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
                      {m.title}
                    </h2>
                    <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed font-normal">
                      {m.desc}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                    {m.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2.5 text-xs text-zinc-700">
                        <Check className="h-3.5 w-3.5 text-zinc-900 shrink-0 mt-0.5" />
                        <span className="leading-snug">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900 p-8 sm:p-10 text-white text-center space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Ready to transition your organization to async?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-normal">
            Join hundreds of forward-thinking engineering, product, and operations teams using AsyncFlow.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/register">
              <Button size="sm" className="bg-white text-zinc-900 hover:bg-zinc-100 border-none font-semibold">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="sm" variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
