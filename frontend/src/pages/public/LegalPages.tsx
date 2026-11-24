import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 flex-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: November 24, 2026</p>

          <h2 className="text-lg font-bold text-slate-900 pt-4">1. Overview & Commitment to Data Privacy</h2>
          <p>
            AsyncFlow Technologies Inc. ("AsyncFlow", "we", "us", or "our") respects your privacy and is committed to protecting the personal and operational data of our customers and their employees. This Privacy Policy explains our collection, use, disclosure, and protection practices under GDPR, CCPA, and global data privacy standards.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-4">2. Multi-Tenant Data Isolation</h2>
          <p>
            AsyncFlow employs strict multi-tenant logical database isolation. Customer SOPs, workflows, assessment data, and activity logs are scoped strictly by organization ID and cannot be accessed across tenant boundaries.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-4">3. Security Standards & Audit Logging</h2>
          <p>
            All network communication is encrypted using TLS 1.3. Passwords and sensitive secrets are hashed using industry standard bcrypt/argon2 hashing algorithms. Audit logs capture IP addresses and user timestamps for compliance and security forensics.
          </p>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 flex-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
          <p className="text-xs text-slate-400">Last updated: November 24, 2026</p>

          <h2 className="text-lg font-bold text-slate-900 pt-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the AsyncFlow platform, API, or applications, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company, you represent that you have the authority to bind such entity.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-4">2. User Accounts & Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-4">3. Service Availability and SLAs</h2>
          <p>
            We strive to provide 99.99% uptime for all paying enterprise customers. Scheduled maintenance windows are communicated in advance.
          </p>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
