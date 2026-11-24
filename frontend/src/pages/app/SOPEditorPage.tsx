import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, FileCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { SOPCategory, Priority, SOPStatus } from '../../types';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

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
    { id: '1', text: 'Document reviewed by team lead.', required: true },
  ]);

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
            createNewVersion: true, // Default to creating a new version when updating
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
    return <div className="p-8 text-center text-sm text-slate-500">Loading SOP editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => navigate(isEditing ? `/app/sops/${id}` : '/app/sops')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel & Return
        </button>
        <h1 className="text-xl font-bold text-slate-900">
          {isEditing ? 'Update SOP & Issue Version' : 'Author New Operating Procedure'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-2xl border-slate-200 p-6 space-y-4">
          <Input
            label="SOP Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Asynchronous Code Review & Merge SLA"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            placeholder="Brief 2-3 sentence overview explaining why this policy exists and who must follow it..."
            rows={3}
            required
          />

          <Textarea
            label="Full Document Protocol (Markdown Supported)"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="## 1. Objective&#10;Explain the background and motivation...&#10;&#10;## 2. Step-by-Step Procedure&#10;1. Step one...&#10;2. Step two...&#10;&#10;## 3. SLA & Response Times"
            rows={12}
            required
          />

          {isEditing && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.createNewVersion}
                  onChange={(e) => setFormData({ ...formData, createNewVersion: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Bump version number & create new revision in document history</span>
              </label>
              {formData.createNewVersion && (
                <Input
                  label="Version Changelog Notes"
                  value={formData.changelog}
                  onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
                  placeholder="e.g. Updated response SLA from 12 hours to 8 hours for core squad"
                />
              )}
            </div>
          )}
        </Card>

        {/* Implementation Checklist Builder */}
        <Card className="rounded-2xl border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Digital Sign-off Checklist Items</h3>
              <p className="text-xs text-slate-500">Items that employees must confirm before acknowledging.</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={addChecklistItem} leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Add Checklist Item
            </Button>
          </div>

          <div className="space-y-2">
            {checklist.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateChecklistItem(index, e.target.value)}
                  placeholder={`Requirement #${index + 1}`}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeChecklistItem(index)}
                  className="p-1.5 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isEditing ? `/app/sops/${id}` : '/app/sops')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} leftIcon={<Save className="h-4 w-4" />}>
            {isEditing ? 'Save & Publish Revision' : 'Create & Publish SOP'}
          </Button>
        </div>
      </form>
    </div>
  );
};
