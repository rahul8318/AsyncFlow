import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$12',
      period: 'per user / month',
      description: 'Ideal for small distributed teams wanting to institute async policies and kill status meetings.',
      features: [
        'Up to 25 team members',
        'All 10 Core SOP Templates',
        'Visual Workflow Kanban boards',
        'Basic Training LMS',
        'Email & in-app notifications',
        'Standard community support',
      ],
      cta: 'Start Free 14-Day Trial',
      popular: false,
    },
    {
      name: 'Business',
      price: '$28',
      period: 'per user / month',
      description: 'For scaling companies operating across multiple departments and timezones.',
      features: [
        'Unlimited team members',
        'Custom SOP categories & version branching',
        'Multi-stage approval gates',
        'Custom quiz assessment builder',
        'Live Workshop & event calendar',
        'Department comparison analytics',
        'Priority 24/7 support',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$45',
      period: 'per user / month',
      description: 'Complete operational governance, SSO/SAML, custom SLAs, and dedicated remote transition architects.',
      features: [
        'Everything in Business plan',
        'SAML 2.0 & Okta / Azure AD SSO',
        'SOC2 Type II compliance audit reports',
        'Dedicated Async Operations Consultant',
        'Custom database integration & API webhooks',
        '99.99% Uptime SLA',
      ],
      cta: 'Contact Enterprise Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Predictable, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Investing in asynchronous operations pays for itself within 30 days by cutting calendar clutter by 60%.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-8 flex flex-col justify-between transition-shadow bg-white ${
                p.popular
                  ? 'border-blue-600 shadow-xl ring-2 ring-blue-600/20 relative'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{p.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                  <span className="text-xs text-slate-500">{p.period}</span>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
                    What's included:
                  </p>
                  <ul className="space-y-3 text-xs text-slate-600">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link to="/register">
                  <Button
                    variant={p.popular ? 'primary' : 'outline'}
                    className="w-full"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    {p.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
