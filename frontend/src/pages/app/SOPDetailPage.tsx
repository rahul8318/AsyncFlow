import React, { useEffect, useState } from 'react';
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
  Shield,
  UserCheck,
  History,
  CheckSquare,
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
      await api.post(`/sops/${id}/comments`, { content: commentText });
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

  const canEdit =
    currentMembership?.role === 'ORG_ADMIN' ||
    currentMembership?.role === 'TEAM_MANAGER' ||
    currentMembership?.role === 'SUPER_ADMIN';

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!sop) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800">SOP not found</h2>
        <Button onClick={() => navigate('/app/sops')} className="mt-4">
          Back to SOP Library
        </Button>
      </div>
    );
  }

  const checklist = (selectedVersion?.checklist as any[]) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/sops')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to SOP Library
        </button>

        {canEdit && (
          <Link to={`/app/sops/${sop.id}/edit`}>
            <Button size="sm" variant="outline" leftIcon={<Edit3 className="h-3.5 w-3.5" />}>
              Edit & New Version
            </Button>
          </Link>
        )}
      </div>

      {/* Header Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="primary">{sop.category}</Badge>
            <Badge variant={sop.priority === 'URGENT' ? 'danger' : 'secondary'}>
              {sop.priority} Priority
            </Badge>
          </div>

          {/* Version Selector */}
          <div className="flex items-center gap-2 text-xs">
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500">Version:</span>
            <select
              value={selectedVersion?.versionNumber || sop.currentVersionNumber}
              onChange={(e) => {
                const vNum = parseInt(e.target.value, 10);
                const match = sop.versions?.find((v) => v.versionNumber === vNum);
                if (match) setSelectedVersion(match);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {sop.versions?.map((v) => (
                <option key={v.id} value={v.versionNumber}>
                  v{v.versionNumber} ({formatDate(v.createdAt)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {sop.title}
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          {sop.summary}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
          <span>Author: <strong className="text-slate-700">{sop.createdBy?.firstName} {sop.createdBy?.lastName}</strong></span>
          <span>•</span>
          <span>Published: <strong className="text-slate-700">{formatDate(sop.publishedAt || sop.createdAt)}</strong></span>
          {selectedVersion?.changelog && (
            <>
              <span>•</span>
              <span className="text-blue-600 font-medium">Changelog: {selectedVersion.changelog}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Document Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
        <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line">
          {selectedVersion?.content}
        </div>

        {/* Verification Checklist */}
        {checklist.length > 0 && (
          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/40 p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              Required Implementation Checklist
            </h4>
            <div className="space-y-2 text-xs text-slate-700 pt-1">
              {checklist.map((item: any) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 cursor-pointer hover:text-slate-900 select-none"
                >
                  <input
                    type="checkbox"
                    checked={!!checkedItems[item.id]}
                    onChange={() => toggleChecklist(item.id)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className={checkedItems[item.id] ? 'line-through text-slate-400' : ''}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Digital Acknowledgement Action Banner */}
        <div className="mt-8 border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Digital Compliance Acknowledgement</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirms you have read, understood, and committed to upholding this operating policy.
            </p>
          </div>

          {sop.isAcknowledgedByMe ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Acknowledged by you on {formatDate(sop.myAcknowledgement?.acknowledgedAt)}</span>
            </div>
          ) : (
            <Button
              onClick={handleAcknowledge}
              isLoading={acknowledging}
              rightIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Confirm & Acknowledge SOP
            </Button>
          )}
        </div>
      </div>

      {/* Acknowledgement Audit Roster */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader className="p-5 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>Employee Signoff Roster</span>
            <Badge variant="secondary">
              {sop.acknowledgements?.length || 0} Signoffs Recorded
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {sop.acknowledgements && sop.acknowledgements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sop.acknowledgements.map((ack) => (
                <div
                  key={ack.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 flex items-center gap-3 text-xs"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                    {ack.user?.firstName?.[0] || 'U'}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-900 truncate">
                      {ack.user?.firstName} {ack.user?.lastName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatDateTime(ack.acknowledgedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">
              No employee acknowledgements recorded yet for this policy.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Threaded Discussion Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          Async Discussion & Feedback ({sop.comments?.length || 0})
        </h3>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="flex gap-3">
          <input
            type="text"
            placeholder="Write a suggestion, question, or clarification for this SOP..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            required
          />
          <Button type="submit" size="sm" isLoading={submittingComment} rightIcon={<Send className="h-3 w-3" />}>
            Post
          </Button>
        </form>

        {/* Comments Feed */}
        <div className="divide-y divide-slate-100">
          {sop.comments && sop.comments.length > 0 ? (
            sop.comments.map((comment) => (
              <div key={comment.id} className="py-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-[10px]">
                      {comment.user.firstName[0]}
                    </div>
                    <span className="font-semibold text-slate-900">
                      {comment.user.firstName} {comment.user.lastName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-slate-700 pl-8 leading-relaxed">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">
              No comments yet. Start the asynchronous debate above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
