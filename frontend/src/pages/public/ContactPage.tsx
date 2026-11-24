import React, { useState } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, MessageSquare, Building2, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Connect With Our Solutions Team
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Have questions about deploying AsyncFlow across your enterprise? We'd love to speak with you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <Mail className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">Email Us</h3>
              <p className="text-xs text-slate-500 mt-1">support@asyncflow.io</p>
              <p className="text-xs text-slate-500">sales@asyncflow.io</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <Building2 className="h-6 w-6 text-indigo-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">Global Operations</h3>
              <p className="text-xs text-slate-500 mt-1">AsyncFlow Technologies Inc.</p>
              <p className="text-xs text-slate-500">Distributed-First / Delaware, USA</p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold text-slate-900">Thank you for reaching out!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Our enterprise operations architect will review your message and reply asynchronously within 4 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="First Name" placeholder="Sarah" required />
                  <Input label="Last Name" placeholder="Chen" required />
                </div>
                <Input label="Work Email" type="email" placeholder="sarah@yourcompany.com" required />
                <Input label="Company Name" placeholder="Acme Global Inc." required />
                <Textarea
                  label="How can we help your organization?"
                  placeholder="Tell us about your team size, remote distribution, and key communication challenges..."
                  required
                />
                <Button type="submit" isLoading={loading} className="w-full">
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
