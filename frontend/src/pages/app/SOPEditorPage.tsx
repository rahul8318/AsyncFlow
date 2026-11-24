import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  FileCheck,
  Eye,
  Edit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  History,
  Clock,
  FileText,
} from 'lucide-react';
import { api } from '../../lib/api';
import { SOPCategory, Priority, SOPStatus } from '../../types';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export const SOPEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    category: 'GENERAL' as SOPCategory,
    priority: 'MEDIUM' as Priority,
    status: 'PUBLISHED' as SOPStatus,
    content: '',
    changelog: '',
    createNewVersion: false,
  });

  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; required: boolean }>>([
    { id: '1', text: 'Document reviewed and verified by department lead.', required: true },
  ]);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      api.get(`/sops/${id}`)
        .then((res: any) => {
          setFormData({
            title: res.title,
            summary: res.summary,
            category: res.category,
            priority: res.priority,
            status: res.status,
            content: res.currentVersion?.content || '',
            changelog: '',
            createNewVersion: true,
          });
          if (res.currentVersion?.checklist && Array.isArray(res.currentVersion.checklist)) {
            setChecklist(res.currentVersion.checklist);
          }
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isEditing]);

  const addChecklistItem = () => {
    setChecklist([
      ...checklist,
      { id: Date.now().toString(), text: '', required: true },
    ]);
  };

  const removeChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const updateChecklistItem = (index: number, text: string) => {
    const updated = [...checklist];
    updated[index].text = text;
    setChecklist(updated);
  };

  const wordCount = useMemo(() => {
    return formData.content.trim().split(/\s+/).filter(Boolean).length;
  }, [formData.content]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 180));
  }, [wordCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      checklist: checklist.filter((item) => item.text.trim().length > 0),
    };

    try {
      if (isEditing) {
        await api.patch(`/sops/${id}`, payload);
        navigate(`/app/sops/${id}`);
      } else {
        const created: any = await api.post('/sops', payload);
        navigate(`/app/sops/${created.id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save SOP');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-zinc-500">
        Loading SOP editor configuration...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(isEditing ? `/app/sops/${id}` : '/app/sops')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Cancel
          </button>
          <span className="text-zinc-300">/</span>
          <h1 className="text-sm font-semibold text-zinc-900">
            {isEditing ? 'Revise Operating Procedure' : 'Author Operating Procedure'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-zinc-400">
            {wordCount} words • ~{readingTime} min read
          </span>

          <div className="flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'edit'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Eye className="h-3 w-3" /> Preview
            </button>
          </div>

          <Button
            onClick={handleSubmit}
            isLoading={loading}
            size="sm"
            leftIcon={<Save className="h-3.5 w-3.5" />}
          >
            {isEditing ? 'Publish Revision' : 'Publish SOP'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Metadata Form */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <Input
            label="SOP Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Asynchronous Code Review & Pull Request Merge Standards"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
              >
                <option value="POLICY">Policy</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="MEETING">Meeting</option>
                <option value="TOOLING">Tooling</option>
                <option value="ESCALATION">Escalation</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
              >
                <option value="PUBLISHED">Published (Active)</option>
                <option value="DRAFT">Draft</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Executive Summary"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="Brief 2-3 sentence overview explaining why this standard exists and required adherence..."
            rows={2}
            required
          />
        </div>

        {/* Content Canvas: Edit vs Preview */}
        {activeTab === 'edit' ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-700">
                Operating Protocol Body (Markdown Supported)
              </label>
              <span className="text-[11px] font-mono text-zinc-400">Headings, lists, code, and blockquotes allowed</span>
            </div>

            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="## 1. Objective&#10;Describe the policy context and scope...&#10;&#10;## 2. Step-by-Step Procedure&#10;1. Step one...&#10;2. Step two...&#10;&#10;## 3. SLA & Response Standards&#10;All team members must respond within 8 business hours."
              rows={16}
              className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 p-4 font-mono text-xs text-zinc-900 leading-relaxed focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Preview Mode</span>
              <h2 className="text-xl font-semibold text-zinc-900 mt-1">{formData.title || 'Untitled Procedure'}</h2>
              <p className="text-xs text-zinc-500 mt-1">{formData.summary || 'No summary provided.'}</p>
            </div>

            <div className="prose prose-zinc max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line text-zinc-800 font-normal">
              {formData.content || <span className="text-zinc-400 italic">No content written yet.</span>}
            </div>
          </div>
        )}

        {/* Version History Bump Card for Existing SOPs */}
        {isEditing && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-medium text-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.createNewVersion}
                onChange={(e) => setFormData({ ...formData, createNewVersion: e.target.checked })}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-0 focus:outline-none h-4 w-4"
              />
              <span>Issue New Revision Version (recommended for substantial policy modifications)</span>
            </label>

            {formData.createNewVersion && (
              <div className="pt-2">
                <Input
                  label="Revision Changelog Notes"
                  value={formData.changelog}
                  onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
                  placeholder="e.g. Tightened SLA review window from 12 hours to 8 hours"
                  required={formData.createNewVersion}
                />
              </div>
            )}
          </div>
        )}

        {/* Implementation Checklist Builder */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Verification Sign-off Checklist
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Specific requirements employees must confirm before their acknowledgement is validated.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addChecklistItem}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {checklist.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-zinc-400 w-5 text-right">{index + 1}.</span>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateChecklistItem(index, e.target.value)}
                  placeholder={`Verification criteria #${index + 1}`}
                  className="flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeChecklistItem(index)}
                  className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors rounded"
                  title="Remove requirement"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isEditing ? `/app/sops/${id}` : '/app/sops')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} leftIcon={<Save className="h-3.5 w-3.5" />}>
            {isEditing ? 'Save & Issue Revision' : 'Save & Publish SOP'}
          </Button>
        </div>
      </form>
    </div>
  );
};
