import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Edit3,
  Send,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  History,
  CheckSquare,
  Printer,
  Share2,
  Check,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import { SOP, SOPVersion } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/EmptyState';
import { formatDate, formatDateTime } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const SOPDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, currentMembership } = useAuth();

  const [sop, setSop] = useState<SOP | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<SOPVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchSOP = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res: any = await api.get(`/sops/${id}`);
      setSop(res);
      setSelectedVersion(res.currentVersion || res.versions?.[0] || null);
    } catch (err) {
      console.error('Failed to load SOP details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOP();
  }, [id]);

  const handleAcknowledge = async () => {
    if (!id) return;
    setAcknowledging(true);
    try {
      await api.post(`/sops/${id}/acknowledge`);
      await fetchSOP();
    } catch (err: any) {
      alert(err.message || 'Failed to acknowledge SOP');
    } finally {
      setAcknowledging(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/sops/${id}/comments`, { content: commentText.trim() });
      setCommentText('');
      await fetchSOP();
    } catch (err: any) {
      alert(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleChecklist = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const readingTime = useMemo(() => {
    const text = selectedVersion?.content || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 180));
  }, [selectedVersion]);

  const canEdit =
    currentMembership?.role === 'ORG_ADMIN' ||
    currentMembership?.role === 'TEAM_MANAGER' ||
    currentMembership?.role === 'SUPER_ADMIN';

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!sop) {
    return (
      <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl">
        <FileText className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
        <h2 className="text-base font-semibold text-zinc-900">Standard Operating Procedure not found</h2>
        <p className="text-xs text-zinc-500 mt-1">The requested procedure may have been archived or removed.</p>
        <Button onClick={() => navigate('/app/sops')} className="mt-4" size="sm">
          Return to SOP Library
        </Button>
      </div>
    );
  }

  const checklist = (selectedVersion?.checklist as any[]) || [];
  const checkedCount = checklist.filter((item) => checkedItems[item.id]).length;
  const isAllChecked = checklist.length > 0 && checkedCount === checklist.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/sops')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> SOP Library
          </button>
          <span className="text-zinc-300">/</span>
          <span className="text-xs font-mono text-zinc-500">SOP-{sop.id.slice(0, 8)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            leftIcon={copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
          >
            {copiedLink ? 'Copied' : 'Share'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            leftIcon={<Printer className="h-3.5 w-3.5" />}
          >
            Print
          </Button>

          {canEdit && (
            <Link to={`/app/sops/${sop.id}/edit`}>
              <Button size="sm" variant="secondary" leftIcon={<Edit3 className="h-3.5 w-3.5" />}>
                Edit Procedure
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Document Reading Canvas */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px] tracking-wide uppercase">
                  {sop.category}
                </Badge>
                <Badge
                  variant={sop.priority === 'URGENT' ? 'danger' : sop.priority === 'HIGH' ? 'warning' : 'secondary'}
                  dot
                >
                  {sop.priority}
                </Badge>
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                  <Clock className="h-3 w-3" />
                  {readingTime} min read
                </span>
              </div>

              {/* Version Selector Pill */}
              <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs">
                <History className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[11px] font-medium text-zinc-500">Revision:</span>
                <select
                  value={selectedVersion?.versionNumber || sop.currentVersionNumber}
                  onChange={(e) => {
                    const vNum = parseInt(e.target.value, 10);
                    const match = sop.versions?.find((v) => v.versionNumber === vNum);
                    if (match) setSelectedVersion(match);
                  }}
                  className="bg-transparent font-mono text-xs font-semibold text-zinc-900 focus:outline-none cursor-pointer"
                >
                  {sop.versions?.map((v) => (
                    <option key={v.id} value={v.versionNumber}>
                      v{v.versionNumber}.0 ({formatDate(v.createdAt)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 leading-tight">
                {sop.title}
              </h1>
              <p className="mt-2.5 text-sm text-zinc-600 leading-relaxed">
                {sop.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-zinc-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  {sop.createdBy?.firstName?.[0] || 'A'}
                </div>
                <span>
                  Author: <strong className="text-zinc-800 font-medium">{sop.createdBy?.firstName} {sop.createdBy?.lastName}</strong>
                </span>
              </div>
              <span className="text-zinc-300">•</span>
              <span>Published: <strong className="text-zinc-800 font-medium">{formatDate(sop.publishedAt || sop.createdAt)}</strong></span>
              {selectedVersion?.changelog && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-600 font-mono text-[11px]">
                    Note: {selectedVersion.changelog}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Full Markdown Protocol */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Standard Operating Protocol
            </div>

            <div className="prose prose-zinc max-w-none text-zinc-800 text-[13px] sm:text-sm leading-relaxed whitespace-pre-line font-normal selection:bg-zinc-100">
              {selectedVersion?.content}
            </div>

            {/* Implementation Checklist */}
            {checklist.length > 0 && (
              <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-zinc-700" />
                    Required Execution Checklist
                  </h4>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {checkedCount} / {checklist.length} Completed
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {checklist.map((item: any, idx: number) => {
                    const isChecked = !!checkedItems[item.id];
                    return (
                      <label
                        key={item.id || idx}
                        className={`flex items-start gap-3 p-2.5 rounded-md border transition-all cursor-pointer text-xs ${
                          isChecked
                            ? 'bg-emerald-50/40 border-emerald-200 text-zinc-500'
                            : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecklist(item.id)}
                          className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-0 focus:outline-none h-4 w-4 cursor-pointer"
                        />
                        <span className={`leading-relaxed ${isChecked ? 'line-through text-zinc-400' : 'font-medium'}`}>
                          {item.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Compliance Signoff Action Area */}
            <div className="mt-8 border-t border-zinc-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 -mx-6 -mb-6 p-6 sm:-mx-10 sm:-mb-10 sm:p-8 rounded-b-xl">
              <div>
                <h4 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-zinc-700" />
                  Compliance Verification Signature
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Certifies that you have read, understand, and agree to uphold this asynchronous policy.
                </p>
              </div>

              {sop.isAcknowledgedByMe ? (
                <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Signed by you on {formatDate(sop.myAcknowledgement?.acknowledgedAt)}</span>
                </div>
              ) : (
                <Button
                  onClick={handleAcknowledge}
                  isLoading={acknowledging}
                  size="sm"
                  rightIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                >
                  Sign & Acknowledge SOP
                </Button>
              )}
            </div>
          </div>

          {/* Asynchronous RFC Discussion Thread */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-zinc-500" />
                Asynchronous Discussion ({sop.comments?.length || 0})
              </h3>
              <span className="text-[11px] text-zinc-400">Post proposals, questions, or clarification requests</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Propose an edit or ask a clarification question..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
                required
              />
              <Button type="submit" size="sm" isLoading={submittingComment} rightIcon={<Send className="h-3 w-3" />}>
                Post
              </Button>
            </form>

            {/* Comment Feed */}
            <div className="divide-y divide-zinc-100">
              {sop.comments && sop.comments.length > 0 ? (
                sop.comments.map((comment) => (
                  <div key={comment.id} className="py-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 font-mono text-[9px] font-bold">
                          {comment.user.firstName[0]}
                        </div>
                        <span className="font-medium text-zinc-900">
                          {comment.user.firstName} {comment.user.lastName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-zinc-700 pl-7 leading-relaxed font-normal">{comment.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-zinc-400">
                  No comments yet. Asynchronous comments and proposals appear here.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Meta & Audit Trail */}
        <div className="lg:col-span-4 space-y-6">
          {/* Policy Compliance Overview */}
          <Card className="rounded-xl border-zinc-200 shadow-sm">
            <CardHeader className="p-4 border-b border-zinc-100">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center justify-between">
                <span>Compliance Signoffs</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {sop.acknowledgements?.length || 0} Signed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="text-xs text-zinc-600">
                Signoff status for active organization personnel assigned to this operating standard.
              </div>

              {sop.acknowledgements && sop.acknowledgements.length > 0 ? (
                <div className="space-y-2 pt-1 max-h-72 overflow-y-auto">
                  {sop.acknowledgements.map((ack) => (
                    <div
                      key={ack.id}
                      className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold">
                          {ack.user?.firstName?.[0] || 'U'}
                        </div>
                        <div className="truncate">
                          <p className="font-medium text-zinc-900 truncate">
                            {ack.user?.firstName} {ack.user?.lastName}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400">
                            {formatDateTime(ack.acknowledgedAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" className="text-[9px] px-1.5 py-0">Verified</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-lg">
                  No signoffs recorded yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Properties */}
          <Card className="rounded-xl border-zinc-200 shadow-sm">
            <CardHeader className="p-4 border-b border-zinc-100">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Document Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Document ID</span>
                <span className="font-mono text-zinc-800 font-medium">{sop.id.slice(0, 12)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Status</span>
                <Badge variant={sop.status === 'PUBLISHED' ? 'success' : 'secondary'} className="text-[10px]">
                  {sop.status}
                </Badge>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Category</span>
                <span className="font-medium text-zinc-800">{sop.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Active Revision</span>
                <span className="font-mono font-medium text-zinc-800">v{sop.currentVersionNumber}.0</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Signoff Requirement</span>
                <span className="font-medium text-zinc-800">Mandatory</span>
              </div>
            </CardContent>
          </Card>

          {/* Revision Changelog Card */}
          <Card className="rounded-xl border-zinc-200 shadow-sm">
            <CardHeader className="p-4 border-b border-zinc-100">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center justify-between">
                <span>Revision History</span>
                <History className="h-3.5 w-3.5 text-zinc-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-3">
                {sop.versions?.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVersion(v)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedVersion?.id === v.id
                        ? 'border-zinc-900 bg-zinc-50 font-medium'
                        : 'border-zinc-100 hover:border-zinc-200 bg-white text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-zinc-900">v{v.versionNumber}.0</span>
                      <span className="text-[10px] font-mono text-zinc-400">{formatDate(v.createdAt)}</span>
                    </div>
                    {v.changelog && (
                      <p className="mt-1 text-[11px] text-zinc-500 line-clamp-1">{v.changelog}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
