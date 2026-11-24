import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { FileCheck2, Kanban, GraduationCap, BarChart3, Users, Clock, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

export const FeaturesPage: React.FC = () => {
  const modules = [
    {
      icon: FileCheck2,
      title: 'Module C: Asynchronous Communication SOP Builder',
      desc: 'The bedrock of remote alignment. Author rich SOPs with markdown, checklists, and revision histories.',
      details: [
        '10 Pre-loaded enterprise templates: Async Communication Policy, Remote Meeting Guidelines, Slack Standards, and more.',
        'Version control with automatic changelogs and document comparison.',
        'Verifiable digital employee acknowledgements with IP timestamping.',
        'Threaded comments for asynchronous RFC proposals and debates.',
      ],
    },
    {
      icon: Kanban,
      title: 'Module D: Workflow & Process Management',
      desc: 'A visual, stage-gated board designed specifically for asynchronous operational handoffs.',
      details: [
        'Visual kanban stages: To Do, In Progress, In Review, and Completed.',
        'Multi-level approval gates preventing premature deployment or policy signoff.',
        'Templates for Engineering Onboarding, Weekly Retrospectives, and Incident Escalations.',
        'Audit histories tracking who moved which ticket across global shifts.',
      ],
    },
    {
      icon: GraduationCap,
      title: 'Modules E & F: Learning Management & Assessment Engine',
      desc: 'Transform scattered company wikis into structured, verified employee training curricula.',
      details: [
        'Modular learning courses with video integration and reading checklists.',
        'Server-side graded certification exams (answers never leaked to browser client).',
        'Passing score enforcement, attempt tracking, and automated digital certificate generation.',
        'Personal learning portal for employees to track required compliance training.',
      ],
    },
    {
      icon: BarChart3,
      title: 'Module H: Executive Analytics & Adoption Reporting',
      desc: 'Real, calculated metrics queried directly from your PostgreSQL database — never simulated numbers.',
      details: [
        'Communication Effectiveness Score calculated from SOP coverage and training completions.',
        'Department-level comparison charts and filterable date ranges.',
        'Pending acknowledgement alerts to prevent operational bottlenecks.',
        'One-click downloadable CSV reports for executive leadership and compliance audits.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Enterprise Architecture Built for Asynchronous Excellence
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Every module in AsyncFlow is engineered to remove dependencies on synchronous meetings and eliminate communication ambiguity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <Card key={idx} className="border-slate-200/80 shadow-sm hover:shadow-md transition">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{m.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{m.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {m.details.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
