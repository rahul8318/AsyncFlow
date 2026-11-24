import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Kanban, Plus, ArrowRight, CheckCircle2, Clock, Layers, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { Workflow } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const WorkflowsPage: React.FC = () => {
  const { currentMembership } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newWorkflow, setNewWorkflow] = useState({
    title: '',
    description: '',
    category: 'CUSTOM',
    priority: 'MEDIUM',
  });

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/workflows');
      setWorkflows(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res: any = await api.post('/workflows', newWorkflow);
      setShowCreateModal(false);
      setNewWorkflow({ title: '', description: '', category: 'CUSTOM', priority: 'MEDIUM' });
      await fetchWorkflows();
    } catch (err: any) {
      alert(err.message || 'Failed to create workflow');
    } finally {
      setCreating(false);
    }
  };

  const canCreate =
    currentMembership?.role === 'ORG_ADMIN' ||
    currentMembership?.role === 'TEAM_MANAGER' ||
    currentMembership?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Asynchronous Workflows & Operational Pipelines
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Repeatable stage-gated pipelines for remote onboarding, weekly reporting, and handoffs.
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Create Workflow
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={<Kanban className="h-10 w-10 text-slate-400" />}
          title="No active workflows"
          description="Create structured stage-gated workflows for team onboarding or handovers."
          actionLabel={canCreate ? 'Create First Workflow' : undefined}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((wf) => (
            <Link
              key={wf.id}
              to={`/app/workflows/${wf.id}`}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="primary" className="text-[10px]">
                    {wf.category.replace('_', ' ')}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    {wf._count?.tasks || 0} tasks
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {wf.title}
                </h3>

                <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {wf.description || 'Structured asynchronous operating workflow.'}
                </p>

                {/* Stages progress pill */}
                <div className="mt-5 flex items-center gap-1.5">
                  {wf.stages?.map((stage) => (
                    <div
                      key={stage.id}
                      className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden"
                      title={`${stage.name}: ${stage._count?.tasks || 0} tasks`}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: stage.color || '#3b82f6',
                          width: (stage._count?.tasks || 0) > 0 ? '100%' : '0%',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {wf.createdBy?.firstName} {wf.createdBy?.lastName}</span>
                <span className="flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  View Board <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Workflow Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Operational Workflow"
        description="Initialize a stage-gated Kanban pipeline for your team."
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input
            label="Workflow Title"
            value={newWorkflow.title}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, title: e.target.value })}
            placeholder="e.g. Weekly Async Engineering Retrospective"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={newWorkflow.category}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, category: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="ONBOARDING">Onboarding</option>
                <option value="REPORTING">Reporting</option>
                <option value="INCIDENT">Incident Escalation</option>
                <option value="HANDOVER">Project Handover</option>
                <option value="POLICY_APPROVAL">Policy Approval</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
              <select
                value={newWorkflow.priority}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Description"
            value={newWorkflow.description}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
            placeholder="Define the purpose and expected turnaround for this workflow..."
            rows={3}
          />

          <p className="text-[11px] text-slate-400">
            * Automatically initializes default Kanban stages: To Do, In Progress, In Review, and Completed.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creating}>
              Create Board
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
