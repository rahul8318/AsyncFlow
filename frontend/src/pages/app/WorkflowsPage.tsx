import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Kanban, Plus, ArrowRight, CheckCircle2, Clock, Layers, Users, Search, Filter } from 'lucide-react';
import { api } from '../../lib/api';
import { Workflow } from '../../types';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

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
      await api.post('/workflows', newWorkflow);
      setShowCreateModal(false);
      setNewWorkflow({ title: '', description: '', category: 'CUSTOM', priority: 'MEDIUM' });
      await fetchWorkflows();
    } catch (err: any) {
      alert(err.message || 'Failed to create workflow');
    } finally {
      setCreating(false);
    }
  };

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((wf) => {
      const matchesSearch =
        wf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wf.description && wf.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'ALL' || wf.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [workflows, searchQuery, categoryFilter]);

  const canCreate =
    currentMembership?.role === 'ORG_ADMIN' ||
    currentMembership?.role === 'TEAM_MANAGER' ||
    currentMembership?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Asynchronous Pipelines & Stage-Gated Boards
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Standardized operational pipelines for cross-functional handovers, onboarding, and approvals.
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)} size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            New Pipeline Board
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search pipelines by title or scope..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['ALL', 'ONBOARDING', 'REPORTING', 'INCIDENT', 'HANDOVER', 'CUSTOM'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
              }`}
            >
              {cat === 'ALL' ? 'All Pipelines' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <EmptyState
          icon={<Kanban className="h-8 w-8 text-zinc-400" />}
          title="No operational pipelines found"
          description={
            searchQuery
              ? 'No pipelines match your current search query.'
              : 'Create structured stage-gated pipelines to standardize asynchronous handovers.'
          }
          actionLabel={canCreate && !searchQuery ? 'Create First Pipeline' : undefined}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkflows.map((wf) => {
            const totalTasks = wf.stages?.reduce((acc, s) => acc + (s.tasks?.length || 0), 0) || wf._count?.tasks || 0;
            return (
              <Link
                key={wf.id}
                to={`/app/workflows/${wf.id}`}
                className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-900 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <Badge variant="outline" className="font-mono text-[10px] tracking-wide uppercase">
                      {wf.category.replace('_', ' ')}
                    </Badge>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-900 transition-colors">
                    {wf.title}
                  </h3>

                  <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {wf.description || 'Structured asynchronous operating workflow.'}
                  </p>

                  {/* Stage Progress Mini Pipeline */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>Pipeline Stages</span>
                      <span>{wf.stages?.length || 4} stages</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {wf.stages?.map((stage) => {
                        const count = stage.tasks?.length || stage._count?.tasks || 0;
                        return (
                          <div
                            key={stage.id}
                            className={`h-1.5 rounded-full transition-all ${
                              count > 0 ? 'bg-zinc-800' : 'bg-zinc-100'
                            }`}
                            title={`${stage.name}: ${count} tasks`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-zinc-100 pt-3 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="truncate">
                    Lead: <strong className="text-zinc-700 font-medium">{wf.createdBy?.firstName} {wf.createdBy?.lastName}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-zinc-900 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Open Board <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Workflow Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Initialize New Operational Pipeline"
        description="Creates a stage-gated board for asynchronous execution and verification."
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          <Input
            label="Pipeline Title"
            value={newWorkflow.title}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, title: e.target.value })}
            placeholder="e.g. Asynchronous Engineering Sprint Handoff"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Category</label>
              <select
                value={newWorkflow.category}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, category: e.target.value })}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
              >
                <option value="ONBOARDING">Onboarding</option>
                <option value="REPORTING">Weekly Reporting</option>
                <option value="INCIDENT">Incident Escalation</option>
                <option value="HANDOVER">Project Handover</option>
                <option value="POLICY_APPROVAL">Policy Approval</option>
                <option value="CUSTOM">Custom Pipeline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Priority</label>
              <select
                value={newWorkflow.priority}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, priority: e.target.value })}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Purpose & Governance Scope"
            value={newWorkflow.description}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
            placeholder="State the objective, responsible teams, and handoff criteria..."
            rows={3}
          />

          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-[11px] text-zinc-600 space-y-1">
            <span className="font-semibold text-zinc-900">Standard Stages Initialized:</span>
            <p className="text-zinc-500">1. To Do → 2. In Progress → 3. In Review (Approval Gates) → 4. Completed</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={creating}>
              Create Pipeline
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
