import React, { useState } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Check, ArrowRight, Minus, HelpCircle, Shield, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      name: 'Starter',
      price: annualBilling ? '$10' : '$12',
      period: 'per user / month',
      billedNote: annualBilling ? 'Billed annually ($120/yr)' : 'Billed monthly',
      description: 'Essential operating standards and asynchronous SOPs for growing distributed teams.',
      features: [
        'Up to 25 team members',
        'All 10 Core SOP Templates',
        'Visual Workflow Kanban boards',
        'Asynchronous RFC Discussions',
        'Basic Training LMS access',
        'Email & in-app notification center',
        'Standard community support',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: false,
    },
    {
      name: 'Business',
      price: annualBilling ? '$22' : '$28',
      period: 'per user / month',
      billedNote: annualBilling ? 'Billed annually ($264/yr)' : 'Billed monthly',
      description: 'For multi-department distributed companies requiring stage-gated pipelines and LMS certifications.',
      features: [
        'Unlimited team members',
        'Custom SOP categories & version branching',
        'Multi-stage approval gates on Kanban tasks',
        'Server-graded quiz assessment engine',
        'Digital Certificate generation',
        'Interactive workshop clinics & feedback',
        'Department comparison adoption metrics',
        'One-click CSV audit export',
        'Priority 24/7 support response',
      ],
      cta: 'Deploy Business Tier',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: annualBilling ? '$38' : '$45',
      period: 'per user / month',
      billedNote: annualBilling ? 'Billed annually ($456/yr)' : 'Billed monthly',
      description: 'Comprehensive organizational governance, SAML/SSO, custom SLA, and dedicated transition advisory.',
      features: [
        'Everything in Business tier',
        'SAML 2.0 & Okta / Azure AD SSO',
        'Role-Based multi-tenant domain isolation',
        'SOC2 Type II compliance export packages',
        'Dedicated Async Operations Consultant',
        'Custom database integration & webhooks',
        '99.99% Uptime SLA commitment',
        'Custom contract & invoicing terms',
      ],
      cta: 'Contact Enterprise Advisory',
      popular: false,
    },
  ];

  const comparisonRows = [
    { feature: 'Core SOP Builder & 10 Templates', starter: true, business: true, enterprise: true },
    { feature: 'Document Version Control & Diffs', starter: true, business: true, enterprise: true },
    { feature: 'Cryptographic Compliance Signoffs', starter: true, business: true, enterprise: true },
    { feature: 'Kanban Workflow Boards', starter: 'Basic', business: 'Advanced', enterprise: 'Unlimited' },
    { feature: 'Manager Approval Gates', starter: false, business: true, enterprise: true },
    { feature: 'Server-Side Graded Quizzes', starter: false, business: true, enterprise: true },
    { feature: 'Digital Certificates of Competency', starter: false, business: true, enterprise: true },
    { feature: 'Workshop & Clinic Management', starter: false, business: true, enterprise: true },
    { feature: 'Adoption Trends & CSV Exports', starter: false, business: true, enterprise: true },
    { feature: 'SAML / SSO & Directory Sync', starter: false, business: false, enterprise: true },
    { feature: 'Dedicated Transition Architect', starter: false, business: false, enterprise: true },
    { feature: 'Uptime SLA Guarantee', starter: '99.5%', business: '99.9%', enterprise: '99.99%' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <PublicNavbar />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 flex-1 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="font-mono text-[10px] tracking-wide uppercase">
            Predictable SaaS Pricing
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-900 leading-tight">
            Invest in Asynchronous Leverage
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Eliminate calendar fragmentation. AsyncFlow pays for itself within 30 days by cutting unnecessary sync meetings by over 60%.
          </p>

          {/* Billing Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${!annualBilling ? 'text-zinc-900' : 'text-zinc-500'}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setAnnualBilling(!annualBilling)}
              className="relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-zinc-900 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                  annualBilling ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-medium ${annualBilling ? 'text-zinc-900' : 'text-zinc-500'} flex items-center gap-1.5`}>
              Annual <span className="rounded bg-zinc-100 border border-zinc-200 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-zinc-800">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-6 sm:p-7 flex flex-col justify-between transition-all ${
                p.popular
                  ? 'border-zinc-900 bg-white shadow-lg ring-1 ring-zinc-900'
                  : 'border-zinc-200 bg-white shadow-sm hover:border-zinc-300'
              }`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900">{p.name}</h3>
                  {p.popular && (
                    <Badge variant="primary" className="font-mono text-[9px] uppercase tracking-wider">
                      Most Popular
                    </Badge>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 font-mono">
                      {p.price}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">{p.period}</span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{p.billedNote}</p>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                  {p.description}
                </p>

                <div className="border-t border-zinc-100 pt-4 space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
                    What's included:
                  </span>
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-700">
                      <Check className="h-3.5 w-3.5 text-zinc-900 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-100">
                <Link to={p.name === 'Enterprise' ? '/contact' : '/register'}>
                  <Button
                    variant={p.popular ? 'primary' : 'outline'}
                    className="w-full text-xs"
                    size="sm"
                  >
                    {p.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
            <h3 className="text-sm font-semibold text-zinc-900">
              Complete Capability Comparison Matrix
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Detailed technical and operational breakdown across subscription tiers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-5">Platform Feature</th>
                  <th className="py-3 px-5 text-center">Starter</th>
                  <th className="py-3 px-5 text-center">Business</th>
                  <th className="py-3 px-5 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {comparisonRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-5 font-medium text-zinc-900">{row.feature}</td>

                    <td className="py-3 px-5 text-center">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <Check className="h-3.5 w-3.5 text-zinc-900 mx-auto" />
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-zinc-300 mx-auto" />
                        )
                      ) : (
                        <span className="font-mono text-[11px] font-semibold text-zinc-700">{row.starter}</span>
                      )}
                    </td>

                    <td className="py-3 px-5 text-center bg-zinc-50/30">
                      {typeof row.business === 'boolean' ? (
                        row.business ? (
                          <Check className="h-3.5 w-3.5 text-zinc-900 mx-auto" />
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-zinc-300 mx-auto" />
                        )
                      ) : (
                        <span className="font-mono text-[11px] font-semibold text-zinc-900">{row.business}</span>
                      )}
                    </td>

                    <td className="py-3 px-5 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <Check className="h-3.5 w-3.5 text-zinc-900 mx-auto" />
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-zinc-300 mx-auto" />
                        )
                      ) : (
                        <span className="font-mono text-[11px] font-semibold text-zinc-900">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
