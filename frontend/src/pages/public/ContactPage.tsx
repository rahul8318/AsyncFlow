import React, { useState } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <PublicNavbar />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 flex-1 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="outline" className="font-mono text-[10px] tracking-wide uppercase">
            Advisory & Inquiries
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-900 leading-tight">
            Connect with Our Solutions Architects
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            Discuss your organization's remote architecture, migration timeline, and custom compliance requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
              <Mail className="h-4 w-4 text-zinc-700" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Direct Inquiries</h3>
              <p className="text-xs font-mono text-zinc-500">advisory@asyncflow.io</p>
              <p className="text-xs font-mono text-zinc-500">enterprise@asyncflow.io</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
              <Building2 className="h-4 w-4 text-zinc-700" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Headquarters</h3>
              <p className="text-xs text-zinc-600">AsyncFlow Technologies Inc.</p>
              <p className="text-xs text-zinc-500">Distributed-First / Delaware, USA</p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-semibold text-zinc-900">Inquiry Received</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Our remote operations architect will review your submission and reply asynchronously within 4 business hours.
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
                  label="Tell us about your organization and remote structure"
                  placeholder="Number of team members, timezone spread, current tooling, and primary operational bottlenecks..."
                  rows={4}
                  required
                />
                <Button type="submit" isLoading={loading} className="w-full" size="sm">
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
